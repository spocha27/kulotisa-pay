import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../utils/db';
const router = Router();

router.get('/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id,full_name,status,kyc_status,credit_limit,available_limit,credit_score FROM users WHERE id=$1',
      [req.params.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success:false, message:'User not found' });
    const user = result.rows[0];
    // TRANSUNION: stub — in production call TransUnion API here
    const eligible = user.status === 'active' && user.kyc_status === 'approved' && user.available_limit > 0;
    return res.json({ success:true, data: {
      eligible, credit_limit: user.credit_limit, available_limit: user.available_limit,
      credit_score: user.credit_score,
      note: eligible ? 'Pre-approved' : 'Not eligible — complete KYC or contact support'
    }});
  } catch(e:any){ return res.status(500).json({ success:false, message:e.message }); }
});

export default router;
