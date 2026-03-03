-- ============================================
-- CardFolio Migration: Round 6 (Gamification)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add card tier to master_cards
-- Tiers: super_premium, premium, mid, entry
ALTER TABLE master_cards
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'entry'
  CHECK (tier IN ('super_premium', 'premium', 'mid', 'entry'));
