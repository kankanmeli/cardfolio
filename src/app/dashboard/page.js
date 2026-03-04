'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import CreditCard from '@/components/CreditCard';
import StatsBar from '@/components/StatsBar';
import CardForm from '@/components/CardForm';
import ProfileSettings from '@/components/ProfileSettings';
import DownloadSummary from '@/components/DownloadSummary';
import RankBadge from '@/components/RankBadge';
import OnboardingWizard from '@/components/OnboardingWizard';
import ExportPortfolio from '@/components/ExportPortfolio';
import Confetti from '@/components/Confetti';
import { SkeletonCard, SkeletonStats } from '@/components/Skeleton';
import { MAX_CARDS_FREE, MAX_CARDS_PREMIUM } from '@/lib/validation';
import { calculateProfilePoints, getRank } from '@/lib/points';

const SORT_OPTIONS = [
    { value: 'alpha', label: 'A → Z (Name)' },
    { value: 'fee-high', label: 'Annual Fee ↓' },
    { value: 'fee-low', label: 'Annual Fee ↑' },
    { value: 'cashback', label: 'Cashback ↓' },
    { value: 'holding', label: 'Holding Duration ↓' },
    { value: 'added', label: 'Recently Added' },
];

const MILESTONES = [5, 10, 25, 50];

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [cards, setCards] = useState([]);
    const [banks, setBanks] = useState([]);
    const [masterCards, setMasterCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [toast, setToast] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [sortBy, setSortBy] = useState('alpha');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [viewMode, setViewMode] = useState('flat');
    const [holderCounts, setHolderCounts] = useState({});

    // Undo delete state
    const [undoDelete, setUndoDelete] = useState(null);
    const undoTimerRef = useRef(null);

    const isPremium = profile?.is_premium === true;
    const maxCards = isPremium ? MAX_CARDS_PREMIUM : MAX_CARDS_FREE;

    useEffect(() => {
        checkUser();
        return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); };
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }
        setUser(user);

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileData?.is_banned) {
            await supabase.auth.signOut();
            window.location.href = '/banned';
            return;
        }

        setProfile(profileData);
        await Promise.all([fetchCards(user.id), fetchBanks(), fetchMasterCards(), fetchHolderCounts()]);
        setLoading(false);
        if (typeof window !== 'undefined' && !localStorage.getItem('cardfolio_onboarded')) {
            setShowOnboarding(true);
        }
    };

    const processCard = (card) => ({
        ...card,
        bank_name: card.master_cards?.banks?.name || '',
        card_name: card.master_cards?.card_name || '',
        image_url: card.master_cards?.image_url || '',
    });

    const sortCards = (list, method) => {
        return [...list].sort((a, b) => {
            switch (method) {
                case 'fee-high':
                    return Number(b.annual_fee || 0) - Number(a.annual_fee || 0);
                case 'fee-low':
                    return Number(a.annual_fee || 0) - Number(b.annual_fee || 0);
                case 'cashback':
                    return Number(b.cashback_earned || 0) - Number(a.cashback_earned || 0);
                case 'holding': {
                    const dateA = a.holding_since ? new Date(a.holding_since).getTime() : Infinity;
                    const dateB = b.holding_since ? new Date(b.holding_since).getTime() : Infinity;
                    return dateA - dateB;
                }
                case 'added':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return `${a.bank_name} ${a.card_name}`.toLowerCase()
                        .localeCompare(`${b.bank_name} ${b.card_name}`.toLowerCase());
            }
        });
    };

    const sortedCards = useMemo(() => sortCards(cards, sortBy), [cards, sortBy]);
    const activeCards = sortedCards.filter(c => c.is_active);
    const closedCards = sortedCards.filter(c => !c.is_active);
    const profilePoints = useMemo(() => calculateProfilePoints(
        cards.map(c => ({ ...c, tier: c.master_cards?.tier || c.tier || 'entry' }))
    ), [cards]);

    const bankGroups = useMemo(() => {
        const groups = {};
        sortedCards.forEach(c => {
            const bank = c.bank_name || 'Unknown';
            if (!groups[bank]) groups[bank] = [];
            groups[bank].push(c);
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [sortedCards]);

    const fetchCards = async (userId) => {
        const { data } = await supabase
            .from('user_cards')
            .select(`
                *,
                master_cards (
                bank_id, card_name, image_url, default_joining_fee, default_annual_fee, tier, category,
                    banks (name)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        if (data) setCards(data.map(processCard));
    };

    const fetchBanks = async () => {
        const { data } = await supabase.from('banks').select('*').order('name', { ascending: true });
        if (data) setBanks(data);
    };

    const fetchMasterCards = async () => {
        const { data } = await supabase.from('master_cards').select('*, banks(name)').order('card_name', { ascending: true });
        if (data) setMasterCards(data);
    };

    const fetchHolderCounts = async () => {
        const { data } = await supabase
            .from('user_cards')
            .select('master_card_id');
        if (data) {
            const counts = {};
            data.forEach(c => { counts[c.master_card_id] = (counts[c.master_card_id] || 0) + 1; });
            setHolderCounts(counts);
        }
    };

    const showToastMsg = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const checkMilestone = useCallback((prevCount, newCount) => {
        const hitMilestone = MILESTONES.some(m => prevCount < m && newCount >= m);
        if (hitMilestone) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 100);
        }
    }, []);

    const handleAddCard = async (formData) => {
        if (cards.length >= maxCards) {
            showToastMsg(isPremium
                ? `You've reached the limit of ${MAX_CARDS_PREMIUM} cards.`
                : `Free tier allows ${MAX_CARDS_FREE} cards. Upgrade to Premium for up to ${MAX_CARDS_PREMIUM}!`,
                'error');
            return;
        }

        const prevCount = cards.length;

        const { data, error } = await supabase
            .from('user_cards')
            .insert({
                user_id: user.id,
                master_card_id: formData.master_card_id,
                joining_fee: formData.joining_fee || 0,
                annual_fee: formData.annual_fee || 0,
                card_type: formData.card_type,
                holding_since: formData.holding_since || null,
                cashback_earned: formData.cashback_earned || 0,
                reward_points_earned: formData.reward_points_earned || 0,
                is_active: formData.is_active,
                closure_month_year: !formData.is_active ? formData.closure_month_year || null : null,
            })
            .select(`*, master_cards (bank_id, card_name, image_url, default_joining_fee, default_annual_fee, banks (name))`)
            .single();

        if (error) {
            if (error.code === '23505') showToastMsg('You already have this card in your portfolio', 'error');
            else showToastMsg('Failed to add card: ' + error.message, 'error');
            return;
        }

        const newCard = processCard(data);
        setCards(prev => [...prev, newCard]);
        showToastMsg('Card added successfully!');
        setShowModal(false);

        // Milestone confetti
        checkMilestone(prevCount, prevCount + 1);
    };

    const handleEditCard = async (formData) => {
        const { data, error } = await supabase
            .from('user_cards')
            .update({
                master_card_id: formData.master_card_id,
                joining_fee: formData.joining_fee || 0,
                annual_fee: formData.annual_fee || 0,
                card_type: formData.card_type,
                holding_since: formData.holding_since || null,
                cashback_earned: formData.cashback_earned || 0,
                reward_points_earned: formData.reward_points_earned || 0,
                is_active: formData.is_active,
                closure_month_year: !formData.is_active ? formData.closure_month_year || null : null,
            })
            .eq('id', editingCard.id)
            .select(`*, master_cards (bank_id, card_name, image_url, default_joining_fee, default_annual_fee, banks (name))`)
            .single();

        if (error) { showToastMsg('Failed to update card: ' + error.message, 'error'); return; }
        setCards(prev => prev.map(c => c.id === editingCard.id ? processCard(data) : c));
        showToastMsg('Card updated successfully!');
        setEditingCard(null);
        setShowModal(false);
    };

    // Undo delete: hide card immediately, delete after 10s, allow undo
    const handleDeleteCard = (card) => {
        // Cancel any pending delete
        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
        }

        // Hide the card immediately
        setCards(prev => prev.filter(c => c.id !== card.id));
        setUndoDelete(card);

        // Set timer to actually delete after 10s
        undoTimerRef.current = setTimeout(async () => {
            setUndoDelete(null);
            const { error } = await supabase.from('user_cards').delete().eq('id', card.id);
            if (error) {
                showToastMsg('Failed to delete card: ' + error.message, 'error');
                if (user) await fetchCards(user.id);
            }
        }, 10000);
    };

    const handleUndo = () => {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        if (undoDelete) {
            setCards(prev => [...prev, undoDelete]);
            showToastMsg('Card restored!');
        }
        setUndoDelete(null);
    };

    const copyProfileLink = () => {
        if (profile?.slug) {
            navigator.clipboard.writeText(`${window.location.origin}/p/${profile.slug}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar user={null} />
                <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <div className="skeleton-shimmer skeleton-line" style={{ width: '200px', height: '28px', marginBottom: '8px' }} />
                            <div className="skeleton-shimmer skeleton-line" style={{ width: '150px', height: '14px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div className="skeleton-shimmer" style={{ width: '80px', height: '34px', borderRadius: 'var(--radius-sm)' }} />
                            <div className="skeleton-shimmer" style={{ width: '100px', height: '34px', borderRadius: 'var(--radius-sm)' }} />
                        </div>
                    </div>
                    <SkeletonStats />
                    <div className="cards-grid" style={{ marginTop: '24px' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Confetti active={showConfetti} />
            <Navbar user={user} />
            <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem' }}>
                            My Dashboard
                            {isPremium && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'var(--gradient-accent)', padding: '3px 10px', borderRadius: '20px', color: 'white', verticalAlign: 'middle' }}>⭐ PREMIUM</span>}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Welcome, {profile?.display_name} · {cards.length}/{maxCards} cards
                            {!isPremium && <span style={{ color: 'var(--accent-purple)', marginLeft: '8px' }}>(Free tier)</span>}
                        </p>
                        {isPremium && cards.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <RankBadge points={profilePoints} size="md" showProgress={true} />
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={copyProfileLink} className="copy-btn">
                            {copied ? '✓ Copied!' : '🔗 Copy Link'}
                        </button>
                        <DownloadSummary profileName={profile?.display_name} slug={profile?.slug} cards={cards} isPremium={isPremium} />
                        <ExportPortfolio cards={cards} isPremium={isPremium} />
                        <button onClick={() => setShowSettings(!showSettings)} className="btn btn-secondary btn-sm">⚙️ Settings</button>
                        <button
                            onClick={() => { setEditingCard(null); setShowModal(true); }}
                            className="btn btn-primary"
                            disabled={cards.length >= maxCards}
                        >
                            + Add Card
                        </button>
                    </div>
                </div>

                {/* Onboarding for first-time users */}
                {cards.length === 0 && showOnboarding && (
                    <OnboardingWizard onDismiss={() => {
                        localStorage.setItem('cardfolio_onboarded', '1');
                        setShowOnboarding(false);
                    }} />
                )}

                {/* Free tier upgrade nudge */}
                {!isPremium && cards.length >= MAX_CARDS_FREE && (
                    <div className="glass-card" style={{
                        padding: '16px 20px', marginBottom: '20px', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
                        border: '1px solid var(--accent-purple)', background: 'rgba(168,85,247,0.06)'
                    }}>
                        <div>
                            <strong>You&apos;ve reached the free tier limit ({MAX_CARDS_FREE} cards)</strong>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                                Upgrade to Premium for up to {MAX_CARDS_PREMIUM} cards, custom sorting, and watermark-free exports.
                            </p>
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ background: 'var(--accent-purple)', whiteSpace: 'nowrap' }}>
                            ⭐ Upgrade to Premium
                        </button>
                    </div>
                )}

                <div className="divider"></div>

                {showSettings && <ProfileSettings profile={profile} onSave={() => checkUser()} />}

                <StatsBar cards={cards} />

                {/* Sort Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 24px', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</label>
                    <select
                        className="input-field"
                        value={sortBy}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'alpha' && !isPremium) {
                                showToastMsg('Custom sorting is a Premium feature ⭐', 'error');
                                return;
                            }
                            setSortBy(val);
                        }}
                        style={{ width: 'auto', minWidth: '180px', padding: '6px 12px' }}
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label} {opt.value !== 'alpha' && !isPremium ? '🔒' : ''}
                            </option>
                        ))}
                    </select>
                    {!isPremium && sortBy === 'alpha' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ⭐ Unlock custom sorting with Premium
                        </span>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        <button className={`btn btn-sm ${viewMode === 'flat' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('flat')} title="Flat view">
                            ▤ List
                        </button>
                        <button className={`btn btn-sm ${viewMode === 'bank' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('bank')} title="Group by bank">
                            🏦 Bank
                        </button>
                    </div>
                </div>

                {/* Cards */}
                {viewMode === 'bank' ? (
                    bankGroups.length > 0 ? bankGroups.map(([bankName, bankCards]) => (
                        <section key={bankName} style={{ marginBottom: '32px' }}>
                            <h2 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🏦 {bankName}
                                <span className="section-heading-count">{bankCards.length}</span>
                            </h2>
                            <div className="cards-grid">
                                {bankCards.map(card => (
                                    <CreditCard key={card.id} card={card} showActions={true}
                                        holdersCount={holderCounts[card.master_card_id]}
                                        onEdit={(c) => { setEditingCard(c); setShowModal(true); }}
                                        onDelete={handleDeleteCard} />
                                ))}
                            </div>
                        </section>
                    )) : null
                ) : (
                    <>
                        {activeCards.length > 0 && (
                            <section style={{ marginBottom: '40px' }}>
                                <h2 className="section-heading">Active Cards <span className="section-heading-count">{activeCards.length}</span></h2>
                                <div className="cards-grid">
                                    {activeCards.map(card => (
                                        <CreditCard key={card.id} card={card} showActions={true}
                                            holdersCount={holderCounts[card.master_card_id]}
                                            onEdit={(c) => { setEditingCard(c); setShowModal(true); }}
                                            onDelete={handleDeleteCard} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {closedCards.length > 0 && (
                            <section style={{ marginBottom: '40px' }}>
                                <h2 className="section-heading">Closed Cards <span className="section-heading-count">{closedCards.length}</span></h2>
                                <div className="cards-grid">
                                    {closedCards.map(card => (
                                        <CreditCard key={card.id} card={card} showActions={true}
                                            holdersCount={holderCounts[card.master_card_id]}
                                            onEdit={(c) => { setEditingCard(c); setShowModal(true); }}
                                            onDelete={handleDeleteCard} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {cards.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">💳</div>
                                <h3>No cards yet</h3>
                                <p>Start building your portfolio by adding your first credit card.</p>
                                <button onClick={() => { setEditingCard(null); setShowModal(true); }} className="btn btn-primary">+ Add Your First Card</button>
                            </div>
                        )}
                    </>
                )}

            </div>

            {showModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setEditingCard(null); } }}>
                    <div className="modal">
                        <h2>{editingCard ? 'Edit Card' : 'Add Card to Portfolio'}</h2>
                        <CardForm banks={banks} masterCards={masterCards} initialData={editingCard}
                            onSubmit={editingCard ? handleEditCard : handleAddCard}
                            onCancel={() => { setShowModal(false); setEditingCard(null); }} />
                    </div>
                </div>
            )}

            {/* Undo delete toast */}
            {undoDelete && (
                <div className="toast-undo">
                    <span>🗑️ {undoDelete.bank_name} {undoDelete.card_name} removed</span>
                    <button className="btn btn-primary btn-sm" onClick={handleUndo}>
                        Undo
                    </button>
                    <div className="toast-undo-progress" />
                </div>
            )}

            {toast && (
                <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>{toast.message}</div>
            )}

            <footer className="footer"><p>CardFolio — No sensitive card details are stored on this platform.</p></footer>
        </>
    );
}
