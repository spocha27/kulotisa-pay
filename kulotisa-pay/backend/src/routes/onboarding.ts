import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../utils/db';
import { auditLog } from '../utils/audit';
const router = Router();

router.post('/kyc', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { national_id, date_of_birth, document_keys } = req.body;
    const user_id = req.user!.id;
    await query(
      `UPDATE users SET national_id=$1,date_of_birth=$2,kyc_status='submitted',kyc_submitted_at=NOW(),status='kyc_submitted',updated_at=NOW() WHERE id=$3`,
      [national_id, date_of_birth, user_id]
    );
    // Store document references (KYC_PROVIDER: in prod, call KYC provider here)
    if (document_keys && Array.isArray(document_keys)) {
      for (const doc of document_keys) {
        await query(
          `INSERT INTO kyc_documents (user_id,document_type,storage_key) VALUES ($1,$2,$3)`,
          [user_id, doc.type, doc.key]
        );
      }
    }
    await auditLog('user', user_id, 'kyc_submit', user_id);
    return res.json({ success:true, message:'KYC submitted, under review (1-2 business days)' });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT status,kyc_status,kyc_submitted_at,credit_limit,available_limit FROM users WHERE id=$1',
      [req.user!.id]
    );
    return res.json({ success:true, data: result.rows[0] });
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

export default router;
