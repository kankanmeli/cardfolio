// ============================================
// CardFolio Points & Ranking System
// ============================================

// Tier base points
const TIER_POINTS = {
    super_premium: 50,
    premium: 30,
    mid: 15,
    entry: 5,
};

// Card type multipliers
const TYPE_MULTIPLIER = {
    Paid: 1.5,
    FYF: 1.2,
    LTF: 1.0,
};

// Fee bonus: annual_fee × 0.02, capped at 500
const FEE_MULTIPLIER = 0.02;
const FEE_BONUS_CAP = 500;

// Holding duration bonus: 2 pts per month held
const HOLDING_PTS_PER_MONTH = 2;

/**
 * Calculate points for a single card.
 * Card must have: tier, card_type, annual_fee, holding_since, is_active
 */
export function calculateCardPoints(card) {
    // Only active cards contribute full points; closed cards get 0
    if (!card.is_active) return 0;

    const tier = card.tier || card.master_cards?.tier || 'entry';
    const basePoints = TIER_POINTS[tier] || TIER_POINTS.entry;
    const typeMultiplier = TYPE_MULTIPLIER[card.card_type] || 1.0;

    // Fee bonus
    const annualFee = Number(card.annual_fee || 0);
    const feeBonus = Math.min(annualFee * FEE_MULTIPLIER, FEE_BONUS_CAP);

    // Holding duration bonus
    let holdingBonus = 0;
    if (card.holding_since) {
        const start = new Date(card.holding_since);
        const now = new Date();
        const months = Math.max(0,
            (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
        );
        holdingBonus = months * HOLDING_PTS_PER_MONTH;
    }

    return Math.round(basePoints * typeMultiplier + feeBonus + holdingBonus);
}

/**
 * Calculate total profile points from all cards.
 */
export function calculateProfilePoints(cards) {
    return cards.reduce((total, card) => total + calculateCardPoints(card), 0);
}

/**
 * Rank tiers based on total points.
 */
const RANKS = [
    { min: 2000, title: 'Centurion', emoji: '👑', color: '#ffd700' },
    { min: 1001, title: 'Diamond', emoji: '💎', color: '#b9f2ff' },
    { min: 501, title: 'Gold', emoji: '🥇', color: '#ffc107' },
    { min: 201, title: 'Silver', emoji: '🥈', color: '#c0c0c0' },
    { min: 0, title: 'Bronze', emoji: '🥉', color: '#cd7f32' },
];

/**
 * Get rank info for a given total points.
 */
export function getRank(totalPoints) {
    for (const rank of RANKS) {
        if (totalPoints >= rank.min) {
            return { ...rank, points: totalPoints };
        }
    }
    return { ...RANKS[RANKS.length - 1], points: totalPoints };
}

/**
 * Get the next rank target.
 */
export function getNextRank(totalPoints) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (RANKS[i].min > totalPoints) {
            return RANKS[i];
        }
    }
    return null; // Already at max rank
}

export { RANKS, TIER_POINTS, TYPE_MULTIPLIER };
