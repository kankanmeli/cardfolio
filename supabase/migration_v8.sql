-- ============================================
-- CardFolio Migration: Round 8 (Premium Expiry)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add premium expiry tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ NULL;
