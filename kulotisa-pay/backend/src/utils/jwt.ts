import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
const SECRET = process.env.JWT_SECRET || 'dev_secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
export const signToken = (payload: JWTPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);
export const verifyToken = (token: string): JWTPayload =>
  jwt.verify(token, SECRET) as JWTPayload;
