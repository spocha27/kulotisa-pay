-- KulotisaPay Seed Data
-- 3 merchants, 5 users, sample transactions

-- ADMIN USER (password: Admin@1234)
INSERT INTO admin_users (email, full_name, password_hash, role) VALUES
('admin@kulotisapay.co.bw', 'System Admin', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'super_admin'),
('ops@kulotisapay.co.bw', 'Ops Team', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'ops');

-- MERCHANTS (password: Merchant@1234)
INSERT INTO merchants (id, business_name, registration_number, contact_name, contact_phone, contact_email, password_hash, status, fee_rate) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TechHub Gaborone', 'BW2019-004521', 'Kabo Seleke', '71234567', 'kabo@techhub.co.bw', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'active', 0.0300),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'MediCare Pharmacy', 'BW2021-008732', 'Neo Mothibi', '72345678', 'neo@medicare.co.bw', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'active', 0.0250),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Homebase Furniture', 'BW2018-001144', 'Mpho Gaolape', '73456789', 'mpho@homebase.co.bw', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'pending', 0.0300);

-- USERS (password: User@1234)
INSERT INTO users (id, phone, email, full_name, national_id, password_hash, status, kyc_status, credit_limit, available_limit, credit_score) VALUES
('d4e5f6a7-b8c9-0123-defa-234567890123', '71111111', 'thabo@gmail.com', 'Thabo Molefe', '983456789', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'active', 'approved', 8000.00, 4800.00, 720),
('e5f6a7b8-c9d0-1234-efab-345678901234', '72222222', 'kefilwe@gmail.com', 'Kefilwe Ditsheko', '876543210', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'active', 'approved', 5000.00, 500.00, 650),
('f6a7b8c9-d0e1-2345-fabc-456789012345', '73333333', 'mpho@gmail.com', 'Mpho Sithole', '765432109', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'active', 'approved', 10000.00, 10000.00, 780),
('a7b8c9d0-e1f2-3456-abcd-567890123456', '74444444', 'onkemetse@gmail.com', 'Onkemetse Tau', '654321098', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'active', 'approved', 6000.00, 2000.00, 690),
('b8c9d0e1-f2a3-4567-bcde-678901234567', '75555555', 'boitumelo@gmail.com', 'Boitumelo Moyo', '543210987', '$2b$10$rQnK8Z1mX9vL2pW4tY6uOeJ3hF7cN5bM0aK2dI4gE6fH8jL1nP3qR', 'kyc_submitted', 'submitted', 0.00, 0.00, NULL);

-- TRANSACTIONS
INSERT INTO transactions (id, user_id, merchant_id, reference, amount, merchant_fee, net_to_merchant, num_instalments, instalment_interval, status, underwriting_decision, approved_at) VALUES
('t1000001-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'KLP-2025-00001', 3200.00, 96.00, 3104.00, 4, 'monthly', 'active', 'auto_approved', NOW() - INTERVAL '45 days'),
('t1000001-0000-0000-0000-000000000002', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'KLP-2025-00002', 4500.00, 135.00, 4365.00, 4, 'monthly', 'active', 'auto_approved', NOW() - INTERVAL '35 days'),
('t1000001-0000-0000-0000-000000000003', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'KLP-2025-00003', 5800.00, 174.00, 5626.00, 4, 'monthly', 'completed', 'auto_approved', NOW() - INTERVAL '120 days');

-- INSTALMENTS for transaction 1 (Thabo — active, 2 paid, 2 pending)
INSERT INTO instalments (transaction_id, instalment_number, amount, due_date, status, paid_at, paid_amount) VALUES
('t1000001-0000-0000-0000-000000000001', 1, 800.00, CURRENT_DATE - INTERVAL '45 days', 'paid', NOW() - INTERVAL '45 days', 800.00),
('t1000001-0000-0000-0000-000000000001', 2, 800.00, CURRENT_DATE - INTERVAL '15 days', 'paid', NOW() - INTERVAL '15 days', 800.00),
('t1000001-0000-0000-0000-000000000001', 3, 800.00, CURRENT_DATE + INTERVAL '15 days', 'due', NULL, NULL),
('t1000001-0000-0000-0000-000000000001', 4, 800.00, CURRENT_DATE + INTERVAL '45 days', 'pending', NULL, NULL);

-- INSTALMENTS for transaction 2 (Kefilwe — 1 paid, 1 late, 2 pending)
INSERT INTO instalments (transaction_id, instalment_number, amount, due_date, status, paid_at, paid_amount, late_fee) VALUES
('t1000001-0000-0000-0000-000000000002', 1, 1125.00, CURRENT_DATE - INTERVAL '35 days', 'paid', NOW() - INTERVAL '35 days', 1125.00, 0),
('t1000001-0000-0000-0000-000000000002', 2, 1125.00, CURRENT_DATE - INTERVAL '5 days', 'late', NULL, NULL, 50.00),
('t1000001-0000-0000-0000-000000000002', 3, 1125.00, CURRENT_DATE + INTERVAL '25 days', 'pending', NULL, NULL, 0),
('t1000001-0000-0000-0000-000000000002', 4, 1125.00, CURRENT_DATE + INTERVAL '55 days', 'pending', NULL, NULL, 0);

-- INSTALMENTS for transaction 3 (Mpho — all paid/completed)
INSERT INTO instalments (transaction_id, instalment_number, amount, due_date, status, paid_at, paid_amount) VALUES
('t1000001-0000-0000-0000-000000000003', 1, 1450.00, CURRENT_DATE - INTERVAL '120 days', 'paid', NOW() - INTERVAL '120 days', 1450.00),
('t1000001-0000-0000-0000-000000000003', 2, 1450.00, CURRENT_DATE - INTERVAL '90 days', 'paid', NOW() - INTERVAL '90 days', 1450.00),
('t1000001-0000-0000-0000-000000000003', 3, 1450.00, CURRENT_DATE - INTERVAL '60 days', 'paid', NOW() - INTERVAL '60 days', 1450.00),
('t1000001-0000-0000-0000-000000000003', 4, 1450.00, CURRENT_DATE - INTERVAL '30 days', 'paid', NOW() - INTERVAL '30 days', 1450.00);

