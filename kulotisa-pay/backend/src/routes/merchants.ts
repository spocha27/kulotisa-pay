import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { query } from '../utils/db';
import { auditLog } from '../utils/audit';
const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { business_name, registration_number, contact_name, contact_phone, contact_email, password } = req.body;
    if (!business_name||!contact_name||!contact_phone||!contact_email||!password)
      return res.status(400).json({ success:false, message:'All fields required' });
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO merchants (business_name,registration_number,contact_name,contact_phone,contact_email,password_hash)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,business_name,contact_email,status`,
      [business_name,registration_number||null,contact_name,contact_phone,contact_email,hash]
    );
    return res.status(201).json({ success:true, data: result.rows[0], message:'Application submitted, pending review' });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id/dashboard', authenticate, requireRole('merchant','admin'), async (req: AuthRequest, res: Response) => {
  try {
    const merchant_id = req.params.id;
    const [txRes, payoutRes, overviewRes] = await Promise.all([
      query(`SELECT t.*,u.full_name,u.phone FROM transactions t JOIN users u ON t.user_id=u.id
             WHERE t.merchant_id=$1 ORDER BY t.created_at DESC LIMIT 20`, [merchant_id]),
      query(`SELECT * FROM payouts WHERE merchant_id=$1 ORDER BY created_at DESC LIMIT 10`, [merchant_id]),
      query(`SELECT
               COUNT(*) FILTER (WHERE status='active') as active_orders,
               COUNT(*) FILTER (WHERE status='completed') as completed_orders,
               COALESCE(SUM(amount) FILTER (WHERE status IN ('active','completed')),0) as total_gmv,
               COALESCE(SUM(merchant_fee) FILTER (WHERE status IN ('active','completed')),0) as total_fees
             FROM transactions WHERE merchant_id=$1`, [merchant_id])
    ]);
    return res.json({ success:true, data: {
      overview: overviewRes.rows[0],
      recent_transactions: txRes.rows,
      payouts: payoutRes.rows
    }});
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

export default router;
