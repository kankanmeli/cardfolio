-- ============================================
-- CardFolio Migration: Round 7 (Features)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add card category to master_cards
ALTER TABLE master_cards
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Rewards'
  CHECK (category IN ('Rewards', 'Cashback'));
