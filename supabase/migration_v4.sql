-- ============================================
-- CardFolio Migration: Round 4 (Codex improvements)
-- Run this in your Supabase SQL Editor AFTER the initial schema
-- ============================================

-- 1. Add profile privacy and anonymous display columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reddit_username TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hide_name_on_profile BOOLEAN NOT NULL DEFAULT false;

-- 2. Add default fees to master_cards catalog
ALTER TABLE master_cards
  ADD COLUMN IF NOT EXISTS default_joining_fee NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_annual_fee NUMERIC(10,2) DEFAULT NULL;

-- 3. Update profiles RLS to allow users to update their own privacy settings
-- (Already covered by existing "Users can update own profile" policy)
