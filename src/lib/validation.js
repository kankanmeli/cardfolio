import { z } from 'zod';

export const MAX_CARDS_FREE = 5;
export const MAX_CARDS_PREMIUM = 50;
export const MAX_PORTFOLIO_CARDS = MAX_CARDS_FREE; // default for backward compat

// User card validation
export const userCardSchema = z.object({
    master_card_id: z.string().min(1, 'Please select a card'),
    joining_fee: z.coerce.number().min(0, 'Joining fee cannot be negative').default(0),
    annual_fee: z.coerce.number().min(0, 'Annual fee cannot be negative').default(0),
    card_type: z.enum(['LTF', 'FYF', 'Paid'], { message: 'Invalid card type' }),
    holding_since: z.string().optional().default(''),
    cashback_earned: z.coerce.number().min(0, 'Cashback cannot be negative').default(0),
    reward_points_earned: z.coerce.number().int().min(0, 'RPs cannot be negative').default(0),
    is_active: z.boolean().default(true),
    closure_month_year: z.string().optional().nullable().default(null),
});

// Admin: create bank
export const createBankSchema = z.object({
    name: z.string().min(2, 'Bank name must be at least 2 characters').max(80),
});

// Admin: create card catalog entry (with optional default fees)
export const createCardCatalogSchema = z.object({
    bank_id: z.string().min(1, 'Please select a bank'),
    card_name: z.string().min(2, 'Card name must be at least 2 characters').max(120),
    image_url: z.string().optional().default(''),
    default_joining_fee: z.coerce.number().min(0).optional().nullable().default(null),
    default_annual_fee: z.coerce.number().min(0).optional().nullable().default(null),
});

// Admin: rename user
export const renameUserSchema = z.object({
    userId: z.string().min(1),
    newName: z.string().min(2, 'Name must be at least 2 characters').max(60),
});

// Admin: moderation
export const moderationSchema = z.object({
    userId: z.string().min(1),
});

// Admin: update premium
export const updatePremiumSchema = z.object({
    userId: z.string().min(1),
    isPremium: z.boolean(),
    expiresAt: z.string().nullable().optional(),
});

// Admin login
export const adminLoginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Profile preferences
export const profilePreferencesSchema = z.object({
    is_profile_public: z.boolean(),
    reddit_username: z.string().trim().nullable().optional(),
    hide_name_on_profile: z.boolean(),
});

// Validate and return errors or parsed data
export function validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const firstError = result.error.issues[0]?.message || 'Invalid input';
        return { error: firstError, data: null };
    }
    return { error: null, data: result.data };
}
