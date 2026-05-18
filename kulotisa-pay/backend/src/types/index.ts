export interface User {
  id: string; phone: string; email?: string; full_name: string;
  national_id?: string; status: string; credit_limit: number;
  available_limit: number; kyc_status: string; created_at: Date;
}
export interface Merchant {
  id: string; business_name: string; contact_email: string;
  status: string; fee_rate: number; created_at: Date;
}
export interface Transaction {
  id: string; user_id: string; merchant_id: string; reference: string;
  amount: number; merchant_fee: number; net_to_merchant: number;
  num_instalments: number; instalment_interval: string;
  status: string; created_at: Date;
}
export interface Instalment {
  id: string; transaction_id: string; instalment_number: number;
  amount: number; due_date: Date; paid_at?: Date;
  paid_amount?: number; status: string; late_fee: number;
}
export interface JWTPayload {
  id: string; role: 'user' | 'merchant' | 'admin'; email?: string; phone?: string;
}
export interface ApiResponse<T = any> {
  success: boolean; data?: T; message?: string; errors?: string[];
}
