-- ============================================
-- CardFolio Migration: Round 9 (Expanded Categories)
-- Run this in your Supabase SQL Editor BEFORE seed_cards.sql
-- ============================================

-- Drop the old constraint that only allows 'Rewards' and 'Cashback'
ALTER TABLE master_cards DROP CONSTRAINT IF EXISTS master_cards_category_check;

-- Add new constraint with all categories
ALTER TABLE master_cards ADD CONSTRAINT master_cards_category_check
  CHECK (category IN ('Rewards', 'Cashback', 'Travel', 'Fuel', 'Lifestyle', 'Business'));
