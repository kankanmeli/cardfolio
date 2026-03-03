-- ============================================
-- CardFolio Migration: Round 5 (Monetization)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add premium tier flag to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;
