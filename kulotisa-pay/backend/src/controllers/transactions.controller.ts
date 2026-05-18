import { Request, Response } from 'express';
import { query } from '../utils/db';
import { generateReference } from '../utils/reference';
import { auditLog } from '../utils/audit';
import { addDays, addMonths, addWeeks } from 'date-fns';
import { AuthRequest } from '../middleware/auth';

const getNextDate = (from: Date, interval: string) => {
  if (interval === 'weekly') return addWeeks(from, 1);
  if (interval === 'biweekly') return addWeeks(from, 2);
  return addMonths(from, 1);
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { merchant_id, amount, num_instalments = 4, instalment_interval = 'monthly', description } = req.body;
    const user_id = req.user!.id;

    if (!merchant_id || !amount) return res.status(400).json({ success: false, message: 'merchant_id and amount required' });
    if (amount < 50) return res.status(400).json({ success: false, message: 'Minimum order is P50' });
    if (amount > 15000) return res.status(400).json({ success: false, message: 'Maximum order is P15,000' });

    // Check user limit
    const userRes = await query('SELECT available_limit, status FROM users WHERE id=$1', [user_id]);
    if (!userRes.rows.length || userRes.rows[0].status !== 'active')
      return res.status(403).json({ success: false, message: 'User not eligible' });
    if (userRes.rows[0].available_limit < amount)
      return res.status(400).json({ success: false, message: 'Insufficient credit limit' });

    // Get merchant fee
    const merchantRes = await query('SELECT fee_rate, status FROM merchants WHERE id=$1', [merchant_id]);
    if (!merchantRes.rows.length || merchantRes.rows[0].status !== 'active')
      return res.status(404).json({ success: false, message: 'Merchant not found or inactive' });

    const fee_rate = parseFloat(merchantRes.rows[0].fee_rate);
    const merchant_fee = parseFloat((amount * fee_rate).toFixed(2));
    const net_to_merchant = parseFloat((amount - merchant_fee).toFixed(2));
    const reference = await generateReference();

    // COMPLIANCE: flag for manual review if amount > P5000
    const needsReview = amount > 5000;
    const status = needsReview ? 'pending' : 'active';
    const underwriting_decision = needsReview ? 'manual_review' : 'auto_approved';

    const txRes = await query(
      `INSERT INTO transactions (user_id,merchant_id,reference,amount,merchant_fee,net_to_merchant,
       num_instalments,instalment_interval,status,description,underwriting_decision,approved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [user_id, merchant_id, reference, amount, merchant_fee, net_to_merchant,
       num_instalments, instalment_interval, status, description||null, underwriting_decision,
       needsReview ? null : new Date()]
    );
    const tx = txRes.rows[0];

    // Generate instalments
    const instalment_amount = parseFloat((amount / num_instalments).toFixed(2));
    const instalments = [];
    let due = new Date();

    for (let i = 1; i <= num_instalments; i++) {
      const instalment_status = i === 1 ? 'due' : 'pending';
      const iRes = await query(
        `INSERT INTO instalments (transaction_id,instalment_number,amount,due_date,status)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [tx.id, i, instalment_amount, due, instalment_status]
      );
      instalments.push(iRes.rows[0]);
      due = getNextDate(due, instalment_interval);
    }

    // Deduct from available limit
    await query('UPDATE users SET available_limit=available_limit-$1 WHERE id=$2', [amount, user_id]);

    // Add to review queue if needed
    if (needsReview) {
      await query(
        `INSERT INTO review_queue (transaction_id,user_id,reason) VALUES ($1,$2,$3)`,
        [tx.id, user_id, `Amount P${amount} exceeds auto-approve threshold`]
      );
    }

    await auditLog('transaction', tx.id, 'create', user_id, null, { reference, amount, status });

    return res.status(201).json({ success: true, data: { transaction: tx, instalments } });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};

export const getTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const txRes = await query('SELECT * FROM transactions WHERE id=$1', [id]);
    if (!txRes.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    const instRes = await query('SELECT * FROM instalments WHERE transaction_id=$1 ORDER BY instalment_number', [id]);
    return res.json({ success: true, data: { transaction: txRes.rows[0], instalments: instRes.rows } });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};

export const getUserTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user!.id;
    const result = await query(
      `SELECT t.*, m.business_name FROM transactions t
       JOIN merchants m ON t.merchant_id=m.id
       WHERE t.user_id=$1 ORDER BY t.created_at DESC`,
      [user_id]
    );
    return res.json({ success: true, data: result.rows });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};

export const payInstalment = async (req: AuthRequest, res: Response) => {
  try {
    const { instalment_id } = req.params;
    const { payment_reference } = req.body;
    const instalment = await query('SELECT * FROM instalments WHERE id=$1', [instalment_id]);
    if (!instalment.rows.length) return res.status(404).json({ success: false, message: 'Instalment not found' });
    const inst = instalment.rows[0];
    if (inst.status === 'paid') return res.status(400).json({ success: false, message: 'Already paid' });

    // COMPLIANCE: NBFIRA — record payment with reference
    await query(
      `UPDATE instalments SET status='paid',paid_at=NOW(),paid_amount=$1,payment_reference=$2,updated_at=NOW() WHERE id=$3`,
      [inst.amount + inst.late_fee, payment_reference||null, instalment_id]
    );

    // Check if all instalments paid — complete transaction
    const remaining = await query(
      `SELECT COUNT(*) FROM instalments WHERE transaction_id=$1 AND status != 'paid'`,
      [inst.transaction_id]
    );
    if (parseInt(remaining.rows[0].count) === 0) {
      const txData = await query('SELECT amount,user_id FROM transactions WHERE id=$1', [inst.transaction_id]);
      if (txData.rows.length) {
        await query(`UPDATE transactions SET status='completed',updated_at=NOW() WHERE id=$1`, [inst.transaction_id]);
        await query('UPDATE users SET available_limit=available_limit+$1 WHERE id=$2',
          [txData.rows[0].amount, txData.rows[0].user_id]);
      }
    }

    await auditLog('instalment', instalment_id, 'pay', req.user!.id);
    return res.json({ success: true, message: 'Payment recorded' });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};
