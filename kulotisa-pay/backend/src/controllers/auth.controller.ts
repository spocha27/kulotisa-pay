import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../utils/db';
import { signToken } from '../utils/jwt';
import { auditLog } from '../utils/audit';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { phone, full_name, password, email } = req.body;
    if (!phone || !full_name || !password)
      return res.status(400).json({ success: false, message: 'phone, full_name, password required' });
    const exists = await query('SELECT id FROM users WHERE phone=$1', [phone]);
    if (exists.rows.length) return res.status(409).json({ success: false, message: 'Phone already registered' });
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (phone,full_name,password_hash,email) VALUES ($1,$2,$3,$4) RETURNING id,phone,full_name,status,kyc_status,created_at`,
      [phone, full_name, hash, email||null]
    );
    const user = result.rows[0];
    await auditLog('user', user.id, 'register', user.id);
    const token = signToken({ id: user.id, role: 'user', phone });
    return res.status(201).json({ success: true, data: { user, token } });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    const result = await query('SELECT * FROM users WHERE phone=$1', [phone]);
    if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.status === 'blocked') return res.status(403).json({ success: false, message: 'Account blocked' });
    await auditLog('user', user.id, 'login', user.id, null, null, req.ip);
    const token = signToken({ id: user.id, role: 'user', phone });
    return res.json({ success: true, data: { token, user: { id:user.id, phone:user.phone, full_name:user.full_name, status:user.status, kyc_status:user.kyc_status, credit_limit:user.credit_limit, available_limit:user.available_limit } } });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};

export const loginMerchant = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM merchants WHERE contact_email=$1', [email]);
    if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const merchant = result.rows[0];
    const valid = await bcrypt.compare(password, merchant.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = signToken({ id: merchant.id, role: 'merchant', email });
    return res.json({ success: true, data: { token, merchant: { id:merchant.id, business_name:merchant.business_name, status:merchant.status, fee_rate:merchant.fee_rate } } });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM admin_users WHERE email=$1 AND is_active=true', [email]);
    if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    await query('UPDATE admin_users SET last_login_at=NOW() WHERE id=$1', [admin.id]);
    const token = signToken({ id: admin.id, role: 'admin', email });
    return res.json({ success: true, data: { token, admin: { id:admin.id, email:admin.email, full_name:admin.full_name, role:admin.role } } });
  } catch(e: any) { return res.status(500).json({ success: false, message: e.message }); }
};
