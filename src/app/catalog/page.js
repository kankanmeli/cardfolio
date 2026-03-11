'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { SkeletonCard } from '@/components/Skeleton';
import BankLogo from '@/components/BankLogo';

const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

export default function CatalogPage() {
    const [user, setUser] = useState(null);
    const [cards, setCards] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedBank, setSelectedBank] = useState('all');
    const [holderCounts, setHolderCounts] = useState({});
    const [userCardIds, setUserCardIds] = useState(new Set());
    const [adding, setAdding] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        const [{ data: masterCards }, { data: banksData }, { data: allUserCards }] = await Promise.all([
            supabase.from('master_cards').select('*, banks(name)').order('card_name', { ascending: true }),
            supabase.from('banks').select('*').order('name', { ascending: true }),
            supabase.from('user_cards').select('master_card_id, user_id'),
        ]);

        setCards(masterCards || []);
        setBanks(banksData || []);

        // Count holders per card
        const counts = {};
        (allUserCards || []).forEach(c => {
            counts[c.master_card_id] = (counts[c.master_card_id] || 0) + 1;
        });
        setHolderCounts(counts);

        // Track user's own cards
        if (authUser) {
            const owned = new Set(
                (allUserCards || []).filter(c => c.user_id === authUser.id).map(c => c.master_card_id)
            );
            setUserCardIds(owned);
        }

        setLoading(false);
    };

    const handleQuickAdd = async (masterCard) => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        setAdding(masterCard.id);
        try {
            const { error } = await supabase
                .from('user_cards')
                .insert({
                    user_id: user.id,
                    master_card_id: masterCard.id,
                    joining_fee: masterCard.default_joining_fee || 0,
                    annual_fee: masterCard.default_annual_fee || 0,
                    card_type: 'Paid',
                    is_active: true,
                });

            if (error) {
                if (error.code === '23505') {
                    showToast('You already have this card', 'error');
                } else {
                    showToast('Failed: ' + error.message, 'error');
                }
            } else {
                setUserCardIds(prev => new Set([...prev, masterCard.id]));
                showToast(`${masterCard.banks?.name} ${masterCard.card_name} added! Edit details in your Dashboard.`);
            }
        } finally {
            setAdding(null);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filtered = cards.filter(c => {
        const matchesBank = selectedBank === 'all' || c.bank_id === selectedBank;
        const matchesSearch = search.trim() === '' ||
            c.card_name.toLowerCase().includes(search.toLowerCase()) ||
            (c.banks?.name || '').toLowerCase().includes(search.toLowerCase());
        return matchesBank && matchesSearch;
    });

    // Group by bank
    const grouped = {};
    filtered.forEach(c => {
        const bankName = c.banks?.name || 'Unknown';
        if (!grouped[bankName]) grouped[bankName] = [];
        grouped[bankName].push(c);
    });
    const sortedGroups = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));

    if (loading) {
        return (
            <>
                <Navbar user={user} />
                <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                    <div className="page-header" style={{ paddingTop: '16px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📖</div>
                        <h1>Card Catalog</h1>
                        <p>Browse all available credit cards and add them to your portfolio.</p>
                    </div>
                    <div className="cards-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar user={user} />
            <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                <div className="page-header" style={{ paddingTop: '16px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📖</div>
                    <h1>Card Catalog</h1>
                    <p>Browse all {cards.length} credit cards and add them to your portfolio.</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by card or bank name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1, minWidth: '200px' }}
                    />
                    <select
                        className="input-field"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        style={{ width: 'auto', minWidth: '180px' }}
                    >
                        <option value="all">All Banks ({banks.length})</option>
                        {banks.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {/* Results count */}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    Showing {filtered.length} card{filtered.length !== 1 ? 's' : ''} across {sortedGroups.length} bank{sortedGroups.length !== 1 ? 's' : ''}
                </p>

                {/* Grouped Cards */}
                {sortedGroups.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No cards found</h3>
                        <p>Try adjusting your search or filter.</p>
                    </div>
                ) : (
                    sortedGroups.map(([bankName, bankCards]) => (
                        <section key={bankName} style={{ marginBottom: '32px' }}>
                            <h2 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BankLogo bankName={bankName} size={28} /> {bankName}
                                <span className="section-heading-count">{bankCards.length}</span>
                            </h2>
                            <div className="cards-grid">
                                {bankCards.map(card => {
                                    const owned = userCardIds.has(card.id);
                                    return (
                                        <div key={card.id} className="credit-card">
                                            <div className="credit-card-image-wrapper">
                                                {card.image_url ? (
                                                    <img src={card.image_url} alt={card.card_name} loading="lazy" />
                                                ) : (
                                                    <div className="credit-card-image-placeholder">
                                                        <div>{bankName}</div>
                                                        <div style={{ fontSize: '0.85rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                                                            {card.card_name}
                                                        </div>
                                                    </div>
                                                )}
                                                {card.tier && card.tier !== 'entry' && (
                                                    <span className="credit-card-status-badge badge-active" style={{ fontSize: '0.65rem' }}>
                                                        {card.tier.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="credit-card-body">
                                                <div style={{ marginBottom: '8px' }}>
                                                    <span className="credit-card-name">{card.card_name}</span>
                                                </div>
                                                {holderCounts[card.id] > 0 && (
                                                    <div className="popularity-badge" style={{ marginBottom: '8px' }}>
                                                        👥 {holderCounts[card.id]} user{holderCounts[card.id] !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                                <div className="credit-card-details" style={{ marginBottom: '12px' }}>
                                                    {card.default_joining_fee != null && (
                                                        <div className="credit-card-detail">
                                                            <span className="credit-card-detail-label">Joining</span>
                                                            <span className="credit-card-detail-value">{inrFormatter.format(card.default_joining_fee)}</span>
                                                        </div>
                                                    )}
                                                    {card.default_annual_fee != null && (
                                                        <div className="credit-card-detail">
                                                            <span className="credit-card-detail-label">Annual</span>
                                                            <span className="credit-card-detail-value">{inrFormatter.format(card.default_annual_fee)}</span>
                                                        </div>
                                                    )}
                                                    {card.category && (
                                                        <div className="credit-card-detail">
                                                            <span className="credit-card-detail-label">Category</span>
                                                            <span className="credit-card-detail-value">{card.category}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {owned ? (
                                                    <button className="btn btn-secondary btn-sm" disabled style={{ width: '100%' }}>
                                                        ✓ In Your Portfolio
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        style={{ width: '100%' }}
                                                        disabled={adding === card.id}
                                                        onClick={() => handleQuickAdd(card)}
                                                    >
                                                        {adding === card.id ? 'Adding...' : '➕ Add to Portfolio'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))
                )}
            </div>

            {toast && (
                <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>{toast.message}</div>
            )}

            <footer className="footer"><p>CardFolio — No sensitive card details are stored on this platform.</p></footer>
        </>
    );
}
