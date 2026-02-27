-- ============================================
-- CardFolio Database Schema (v2 - with Bank normalization)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_slug ON profiles(slug);

-- ============================================
-- BANKS TABLE (Normalized bank entity)
-- ============================================
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_banks_name ON banks(name);

-- ============================================
-- MASTER CARDS TABLE (references banks)
-- ============================================
CREATE TABLE master_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bank_id, card_name)
);

CREATE INDEX idx_master_cards_bank_id ON master_cards(bank_id);
CREATE INDEX idx_master_cards_card ON master_cards(card_name);

-- ============================================
-- USER CARDS TABLE (User portfolio entries)
-- ============================================
CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  master_card_id UUID NOT NULL REFERENCES master_cards(id) ON DELETE CASCADE,
  joining_fee NUMERIC(10,2) DEFAULT 0,
  annual_fee NUMERIC(10,2) DEFAULT 0,
  card_type TEXT NOT NULL DEFAULT 'Paid' CHECK (card_type IN ('LTF', 'FYF', 'Paid')),
  holding_since DATE,
  cashback_earned NUMERIC(12,2) DEFAULT 0,
  reward_points_earned NUMERIC(12,0) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  closure_month_year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, master_card_id)
);

CREATE INDEX idx_user_cards_user ON user_cards(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Banks
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banks are viewable by everyone"
  ON banks FOR SELECT USING (true);

CREATE POLICY "Only admins can insert banks"
  ON banks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update banks"
  ON banks FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete banks"
  ON banks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Master Cards
ALTER TABLE master_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master cards are viewable by everyone"
  ON master_cards FOR SELECT USING (true);

CREATE POLICY "Only admins can insert master cards"
  ON master_cards FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update master cards"
  ON master_cards FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete master cards"
  ON master_cards FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User Cards
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User cards are viewable by everyone"
  ON user_cards FOR SELECT USING (true);

CREATE POLICY "Users can insert own cards"
  ON user_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON user_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON user_cards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_slug TEXT;
  base_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    '[^a-z0-9]+', '-', 'g'
  ));
  
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  new_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, display_name, slug, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    new_slug,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE: Card images bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public card images" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Admins can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'card-images' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update card images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'card-images' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete card images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'card-images' 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- ADMIN ACCOUNT SETUP
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Create User" with email: admin@cardfolio.app, password: CardFolio@Admin2026!
-- 3. Then run: UPDATE profiles SET role = 'admin' WHERE slug = 'admin';
-- ============================================
