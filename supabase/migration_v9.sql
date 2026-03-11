-- ============================================
-- CardFolio Migration: Round 9 (Card Category on User Cards)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Allow users to classify their cards as Rewards or Cashback
ALTER TABLE user_cards
  ADD COLUMN IF NOT EXISTS card_category TEXT NOT NULL DEFAULT 'Rewards'
  CHECK (card_category IN ('Rewards', 'Cashback'));
