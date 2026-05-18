-- KulotisaPay Database Schema
-- PostgreSQL 15
-- AGWANE Capital Inc.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE user_status AS ENUM ('pending_kyc', 'kyc_submitted', 'active', 'suspended', 'blocked');
CREATE TYPE kyc_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');
CREATE TYPE merchant_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE transaction_status AS ENUM ('pending', 'active', 'completed', 'defaulted', 'refunded', 'cancelled');
CREATE TYPE instalment_status AS ENUM ('pending', 'due', 'paid', 'late', 'waived');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'transferred', 'failed');
CREATE TYPE review_decision AS ENUM ('approved', 'rejected', 'escalated');

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(50) UNIQUE,
  date_of_birth DATE,
  password_hash TEXT NOT NULL,
  status user_status DEFAULT 'pending_kyc',
  credit_limit NUMERIC(12,2) DEFAULT 0,
  available_limit NUMERIC(12,2) DEFAULT 0,
  kyc_status kyc_status DEFAULT 'pending',
  kyc_submitted_at TIMESTAMPTZ,
  kyc_approved_at TIMESTAMPTZ,
  -- COMPLIANCE: TransUnion score cached here, refresh every 30 days
  credit_score INTEGER,
  credit_score_updated_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC DOCUMENTS
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'national_id_front', 'national_id_back', 'selfie', 'proof_of_address'
  -- COMPLIANCE: store encrypted S3 key, never raw file
  storage_key TEXT NOT NULL,
  verification_status kyc_status DEFAULT 'pending',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MERCHANTS
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status merchant_status DEFAULT 'pending',
  fee_rate NUMERIC(5,4) DEFAULT 0.0300, -- 3% default
  settlement_account VARCHAR(255), -- bank account or mobile money number
  loi_document_key TEXT, -- S3 key for signed LOI
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS (BNPL loans)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  reference VARCHAR(50) UNIQUE NOT NULL, -- human-readable e.g. KLP-2025-00001
  amount NUMERIC(12,2) NOT NULL,
  merchant_fee NUMERIC(12,2) NOT NULL,
  net_to_merchant NUMERIC(12,2) NOT NULL,
  num_instalments INTEGER NOT NULL DEFAULT 4,
  instalment_interval VARCHAR(20) DEFAULT 'monthly', -- 'weekly','biweekly','monthly'
  status transaction_status DEFAULT 'pending',
  qr_code TEXT, -- QR payload for POS
  description TEXT,
  -- COMPLIANCE: audit fields
  underwriting_decision VARCHAR(20), -- 'auto_approved','manual_approved','auto_rejected'
  underwriting_score NUMERIC(5,2),
  approved_by UUID REFERENCES users(id), -- admin user if manual
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSTALMENTS
CREATE TABLE instalments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  instalment_number INTEGER NOT NULL, -- 1,2,3,4
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  paid_amount NUMERIC(12,2),
  status instalment_status DEFAULT 'pending',
  late_fee NUMERIC(12,2) DEFAULT 0,
  payment_reference VARCHAR(255), -- mobile money or card reference
  -- COMPLIANCE: NBFIRA requires disclosure of each payment
  disclosure_shown_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYOUTS (merchant settlements)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  amount NUMERIC(12,2) NOT NULL,
  fee_collected NUMERIC(12,2) NOT NULL,
  num_transactions INTEGER NOT NULL,
  status payout_status DEFAULT 'pending',
  payment_reference VARCHAR(255),
  -- COMPLIANCE: Orange Money / bank transfer reference
  paid_at TIMESTAMPTZ,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYOUT LINE ITEMS
CREATE TABLE payout_transactions (
  payout_id UUID NOT NULL REFERENCES payouts(id),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  PRIMARY KEY (payout_id, transaction_id)
);

-- MANUAL REVIEW QUEUE
CREATE TABLE review_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending','reviewed'
  reviewed_by UUID REFERENCES users(id),
  decision review_decision,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- AUDIT LOG (COMPLIANCE: every material action logged)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- 'user','transaction','instalment','merchant'
  entity_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  performed_by UUID,
  ip_address INET,
  user_agent TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  merchant_id UUID REFERENCES merchants(id),
  type VARCHAR(50) NOT NULL, -- 'instalment_due','instalment_paid','kyc_approved','limit_updated'
  channel VARCHAR(20) NOT NULL, -- 'sms','push','email'
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN USERS
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) DEFAULT 'ops', -- 'super_admin','ops','compliance','finance'
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_national_id ON users(national_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_instalments_transaction ON instalments(transaction_id);
CREATE INDEX idx_instalments_due_date ON instalments(due_date);
CREATE INDEX idx_instalments_status ON instalments(status);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER instalments_updated_at BEFORE UPDATE ON instalments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

