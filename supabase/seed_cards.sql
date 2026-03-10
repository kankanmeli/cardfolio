-- ============================================
-- CardFolio Seed Data: Indian Credit Card Catalog
-- Run this in your Supabase SQL Editor AFTER schema + all migrations
-- ============================================

-- ============================================
-- STEP 1: INSERT BANKS
-- ============================================
INSERT INTO banks (name) VALUES
  ('HDFC Bank'),
  ('ICICI Bank'),
  ('SBI Card'),
  ('Axis Bank'),
  ('American Express'),
  ('Kotak Mahindra Bank'),
  ('Yes Bank'),
  ('RBL Bank'),
  ('IndusInd Bank'),
  ('IDFC First Bank'),
  ('AU Small Finance Bank'),
  ('Standard Chartered'),
  ('Citibank'),
  ('HSBC'),
  ('Bank of Baroda'),
  ('Federal Bank'),
  ('OneCard'),
  ('Fi Money'),
  ('Bajaj Finserv')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 2: INSERT MASTER CARDS
-- ============================================

-- ---- HDFC Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Infinia', 12500, 12500, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Diners Club Black', 10000, 10000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Regalia Gold', 2500, 2500, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Regalia', 2500, 2500, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Millennia', 1000, 1000, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'MoneyBack+', 500, 500, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Swiggy Credit Card', 500, 500, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Marriott Bonvoy', 3000, 3000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'IndianOil Credit Card', 500, 500, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Tata Neu Infinity', 1499, 1499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Tata Neu Plus', 499, 499, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Shoppers Stop', 500, 500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Freedom', 500, 500, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Diners Club Privilege', 2500, 2500, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Diners Club Miles', 1000, 1000, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'Pixel Credit Card', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), '6E Rewards XL', 3000, 3000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), '6E Rewards', 1500, 1500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'UPI RuPay Credit Card', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'HDFC Bank'), 'BIZ Black', 10000, 10000, 'super_premium', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- ICICI Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Emeralde', 12000, 12000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Sapphiro', 6500, 3500, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Rubyx', 3000, 2000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Coral', 500, 500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Platinum Chip', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Amazon Pay Credit Card', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'MakeMyTrip Credit Card', 500, 500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'HPCL Super Saver', 500, 500, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Manchester United', 499, 499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Expressions', 199, 199, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Times Black', 20000, 20000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Emeralde Private', 0, 0, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Coral RuPay', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'ICICI Bank'), 'Sapphiro HTX', 3000, 3000, 'premium', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- SBI Card ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'SBI Card Elite', 4999, 4999, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'SBI Card PRIME', 2999, 2999, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'SimplyCLICK', 499, 499, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'SimplySAVE', 499, 499, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'Cashback SBI Card', 0, 999, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'BPCL Octane', 1499, 1499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'BPCL SBI Card', 499, 499, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'Yatra SBI Card', 1499, 1499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'IRCTC SBI Platinum', 1500, 1500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'IRCTC SBI Premier', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'Pulse', 1499, 1499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'Aurum', 4999, 4999, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'Miles Elite', 4999, 4999, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'SBI Card'), 'Vistara SBI Card PRIME', 2999, 2999, 'premium', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Axis Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Magnus', 12500, 12500, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Atlas', 5000, 5000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Select', 3000, 3000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Privilege', 1500, 1500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Rewards', 1000, 1000, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'ACE', 499, 499, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Flipkart Axis Bank', 500, 500, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Neo', 250, 250, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'IndianOil Axis Bank', 500, 500, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'MY Zone', 500, 500, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Samsung Axis Bank', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Vistara Axis Bank', 1500, 1500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Vistara Infinite', 10000, 10000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Burgundy Private', 0, 0, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Axis Bank'), 'Reserve', 50000, 50000, 'super_premium', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- American Express ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'American Express'), 'Platinum Card', 60000, 66000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'American Express'), 'Platinum Reserve', 10000, 10000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'American Express'), 'Gold Card', 5000, 5000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'American Express'), 'Membership Rewards', 1000, 4500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'American Express'), 'SmartEarn', 495, 495, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'American Express'), 'Platinum Travel', 5000, 5000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'American Express'), 'Marriott Bonvoy Amex', 5000, 5000, 'premium', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Kotak Mahindra Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'White Reserve', 10000, 10000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'Kotak Infinite', 3500, 3500, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'Kotak Signature', 2000, 2000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'Privy League Signature', 999, 999, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'Myntra Kotak', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'Kotak 811 Dream', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'League Platinum', 500, 500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'Essentia Platinum', 750, 750, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Kotak Mahindra Bank'), 'Solitaire', 15000, 15000, 'super_premium', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Yes Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes RESERVE', 2499, 2499, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes SELECT', 599, 599, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes First Business', 999, 999, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes ACE', 499, 499, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes Prosperity Business', 499, 499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes FinBooster', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes KLICK', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes RuPay', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'Yes Wellness', 499, 499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Yes Bank'), 'BYOC', 49, 49, 'entry', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- RBL Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'Lumière', 50000, 50000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'Nova', 12500, 12500, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'Icon', 5000, 5000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'World Safari', 3000, 3000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'World Safari Lite', 1000, 1000, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'Platinum Maxima Plus', 2500, 2500, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'Platinum Maxima', 2000, 2000, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'Insignia', 7000, 7000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'iGlobe', 3000, 3000, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'ShopRite', 500, 500, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'RBL Bank'), 'Bajaj Finserv RBL SuperCard', 799, 799, 'mid', 'Cashback')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- IndusInd Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Pinnacle', 14999, 14999, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Pioneer Heritage', 10000, 10000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Legend', 9999, 9999, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Iconia', 3500, 3500, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Platinum Aura', 500, 500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'IndusInd Tiger', 599, 599, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Nexxt', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Platinum RuPay', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'EazyDiner Platinum', 1499, 1499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IndusInd Bank'), 'Club Vistara Explorer', 1500, 1500, 'mid', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- IDFC First Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'FIRST Private', 50000, 50000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'Ashva', 0, 0, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'Mayura', 0, 0, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'FIRST Select', 0, 0, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'FIRST Classic', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'FIRST Wealth', 0, 0, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'FIRST Millennia', 0, 0, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'FIRST WOW', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'Club Vistara IDFC', 1500, 1500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'IDFC First Bank'), 'FIRST Power+', 0, 0, 'entry', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- AU Small Finance Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'Zenith', 7999, 7999, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'Zenith+', 4999, 4999, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'Vetta', 2999, 2999, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'Altura+', 499, 499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'Altura', 199, 199, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'LIT', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'ixigo AU', 0, 0, 'entry', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'NOMO', 199, 199, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'AU Small Finance Bank'), 'SwipeUp Xcite', 0, 0, 'entry', 'Cashback')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Standard Chartered ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Standard Chartered'), 'Ultimate', 5000, 5000, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Standard Chartered'), 'Smart', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Standard Chartered'), 'Platinum Rewards', 750, 750, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Standard Chartered'), 'Super Value Titanium', 750, 750, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Standard Chartered'), 'EaseMyTrip', 0, 0, 'mid', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- HSBC ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'HSBC'), 'Premier', 0, 0, 'super_premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HSBC'), 'Cashback', 750, 750, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'HSBC'), 'Smart Value', 0, 0, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'HSBC'), 'Visa Platinum', 1500, 1500, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'HSBC'), 'TravelOne', 3500, 3500, 'premium', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Bank of Baroda ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Bank of Baroda'), 'Select', 2499, 2499, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Bank of Baroda'), 'Premier', 1499, 1499, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Bank of Baroda'), 'Easy', 499, 499, 'entry', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Bank of Baroda'), 'IRCTC BoB', 500, 500, 'entry', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Federal Bank ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Federal Bank'), 'Scapia', 0, 0, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Federal Bank'), 'Celesta', 2999, 2999, 'premium', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Federal Bank'), 'Federal Signet', 999, 999, 'mid', 'Rewards'),
  ((SELECT id FROM banks WHERE name = 'Federal Bank'), 'OneCard (Federal)', 0, 0, 'mid', 'Cashback')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- OneCard ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'OneCard'), 'OneCard Metal', 0, 0, 'premium', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'OneCard'), 'OneCard FD', 0, 0, 'entry', 'Cashback')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Fi Money ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Fi Money'), 'Amplifi', 0, 499, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Fi Money'), 'Fi-Federal', 0, 0, 'entry', 'Cashback')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ---- Bajaj Finserv ----
INSERT INTO master_cards (bank_id, card_name, default_joining_fee, default_annual_fee, tier, category) VALUES
  ((SELECT id FROM banks WHERE name = 'Bajaj Finserv'), 'SuperCard', 799, 799, 'mid', 'Cashback'),
  ((SELECT id FROM banks WHERE name = 'Bajaj Finserv'), 'DBS Bajaj Prime', 499, 499, 'mid', 'Rewards')
ON CONFLICT (bank_id, card_name) DO NOTHING;

-- ============================================
-- DONE! Check counts:
-- ============================================
SELECT 
  (SELECT COUNT(*) FROM banks) AS total_banks,
  (SELECT COUNT(*) FROM master_cards) AS total_cards;
