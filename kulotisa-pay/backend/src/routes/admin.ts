import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { query } from '../utils/db';
import { auditLog } from '../utils/audit';
const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/queue', async (_req, res) => {
  try {
    const result = await query(
      `SELECT rq.*,t.reference,t.amount,u.full_name,u.phone
       FROM review_queue rq
       JOIN transactions t ON rq.transaction_id=t.id
       JOIN users u ON rq.user_id=u.id
       WHERE rq.status='pending' ORDER BY rq.created_at ASC`
    );
    return res.json({ success:true, data: result.rows });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/queue/:id/decide', async (req: AuthRequest, res: Response) => {
  try {
    const { decision, notes } = req.body;
    const admin_id = req.user!.id;
    const queueItem = await query('SELECT * FROM review_queue WHERE id=$1', [req.params.id]);
    if (!queueItem.rows.length) return res.status(404).json({ success:false, message:'Not found' });
    const item = queueItem.rows[0];
    await query(
      `UPDATE review_queue SET status='reviewed',decision=$1,notes=$2,reviewed_by=$3,reviewed_at=NOW() WHERE id=$4`,
      [decision, notes||null, admin_id, req.params.id]
    );
    if (decision === 'approved') {
      await query(`UPDATE transactions SET status='active',underwriting_decision='manual_approved',approved_by=$1,approved_at=NOW() WHERE id=$2`,
        [admin_id, item.transaction_id]);
    } else if (decision === 'rejected') {
      const tx = await query('SELECT user_id,amount FROM transactions WHERE id=$1', [item.transaction_id]);
      if (tx.rows.length) {
        await query('UPDATE users SET available_limit=available_limit+$1 WHERE id=$2', [tx.rows[0].amount, tx.rows[0].user_id]);
      }
      await query(`UPDATE transactions SET status='cancelled' WHERE id=$1`, [item.transaction_id]);
    }
    await auditLog('transaction', item.transaction_id, `admin_${decision}`, admin_id);
    return res.json({ success:true, message:`Transaction ${decision}` });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/users', async (_req, res) => {
  try {
    const result = await query('SELECT id,phone,email,full_name,status,kyc_status,credit_limit,available_limit,created_at FROM users ORDER BY created_at DESC');
    return res.json({ success:true, data: result.rows });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/users/:id/kyc-approve', async (req: AuthRequest, res: Response) => {
  try {
    const { credit_limit } = req.body;
    await query(
      `UPDATE users SET kyc_status='approved',status='active',credit_limit=$1,available_limit=$1,kyc_approved_at=NOW() WHERE id=$2`,
      [credit_limit||2000, req.params.id]
    );
    await auditLog('user', req.params.id, 'kyc_approved', req.user!.id, null, { credit_limit });
    return res.json({ success:true, message:'KYC approved, limit set' });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/stats', async (_req, res) => {
  try {
    const result = await query(`SELECT
      (SELECT COUNT(*) FROM users WHERE status='active') as active_users,
      (SELECT COUNT(*) FROM users WHERE kyc_status='submitted') as pending_kyc,
      (SELECT COUNT(*) FROM merchants WHERE status='active') as active_merchants,
      (SELECT COUNT(*) FROM transactions WHERE status='active') as active_transactions,
      (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE status IN ('active','completed')) as total_gmv,
      (SELECT COUNT(*) FROM review_queue WHERE status='pending') as pending_reviews,
      (SELECT COUNT(*) FROM instalments WHERE status='late') as overdue_instalments
    `);
    return res.json({ success:true, data: result.rows[0] });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/audit', async (req, res) => {
  try {
    const { entity_type, limit=50 } = req.query;
    const result = await query(
      `SELECT * FROM audit_log ${entity_type ? 'WHERE entity_type=$1' : ''} ORDER BY created_at DESC LIMIT $${entity_type?2:1}`,
      entity_type ? [entity_type, limit] : [limit]
    );
    return res.json({ success:true, data: result.rows });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

export default router;
