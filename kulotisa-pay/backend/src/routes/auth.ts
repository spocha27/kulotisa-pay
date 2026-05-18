import { Router } from 'express';
import { registerUser, loginUser, loginMerchant, loginAdmin } from '../controllers/auth.controller';
const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/merchant/login', loginMerchant);
router.post('/admin/login', loginAdmin);
export default router;
