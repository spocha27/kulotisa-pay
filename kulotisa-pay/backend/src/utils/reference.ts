import { query } from './db';
export const generateReference = async (): Promise<string> => {
  const res = await query(`SELECT COUNT(*) FROM transactions`);
  const count = parseInt(res.rows[0].count, 10) + 1;
  return `KLP-${new Date().getFullYear()}-${String(count).padStart(5,'0')}`;
};
