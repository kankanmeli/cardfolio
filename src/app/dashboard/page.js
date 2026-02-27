'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import CreditCard from '@/components/CreditCard';
import StatsBar from '@/components/StatsBar';
import CardForm from '@/components/CardForm';

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
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        checkUser();
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
            window.location.href = '/banned';
            return;
        }

        setProfile(profileData);
        await Promise.all([fetchCards(user.id), fetchBanks(), fetchMasterCards()]);
        setLoading(false);
    };

    const sortCards = (cardList) => {
        return [...cardList].sort((a, b) => {
            const nameA = `${a.bank_name} ${a.card_name}`.toLowerCase();
            const nameB = `${b.bank_name} ${b.card_name}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    };

    const processCard = (card) => ({
        ...card,
        bank_name: card.master_cards?.banks?.name || '',
        card_name: card.master_cards?.card_name || '',
        image_url: card.master_cards?.image_url || '',
    });

    const fetchCards = async (userId) => {
        const { data } = await supabase
            .from('user_cards')
            .select(`
        *,
        master_cards (
          bank_id,
          card_name,
          image_url,
          banks (name)
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (data) {
            setCards(sortCards(data.map(processCard)));
        }
    };

    const fetchBanks = async () => {
        const { data } = await supabase
            .from('banks')
            .select('*')
            .order('name', { ascending: true });
        if (data) setBanks(data);
    };

    const fetchMasterCards = async () => {
        const { data } = await supabase
            .from('master_cards')
            .select('*, banks(name)')
            .order('card_name', { ascending: true });
        if (data) setMasterCards(data);
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddCard = async (formData) => {
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
            .select(`
        *,
        master_cards (
          bank_id,
          card_name,
          image_url,
          banks (name)
        )
      `)
            .single();

        if (error) {
            if (error.code === '23505') {
                showToast('You already have this card in your portfolio', 'error');
            } else {
                showToast('Failed to add card: ' + error.message, 'error');
            }
            return;
        }

        // Optimistic update: add the new card to state immediately
        const newCard = processCard(data);
        setCards(prev => sortCards([...prev, newCard]));
        showToast('Card added successfully!');
        setShowModal(false);
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
            .select(`
        *,
        master_cards (
          bank_id,
          card_name,
          image_url,
          banks (name)
        )
      `)
            .single();

        if (error) {
            showToast('Failed to update card: ' + error.message, 'error');
            return;
        }

        // Optimistic update: replace card in state
        const updatedCard = processCard(data);
        setCards(prev => sortCards(prev.map(c => c.id === editingCard.id ? updatedCard : c)));
        showToast('Card updated successfully!');
        setEditingCard(null);
        setShowModal(false);
    };

    const handleDeleteCard = async (card) => {
        // Optimistic: remove card immediately
        setCards(prev => prev.filter(c => c.id !== card.id));
        setConfirmDelete(null);
        showToast('Card removed from portfolio');

        const { error } = await supabase
            .from('user_cards')
            .delete()
            .eq('id', card.id);

        if (error) {
            // Rollback on error
            showToast('Failed to delete card: ' + error.message, 'error');
            await fetchCards(user.id);
        }
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
                <div className="loading-container" style={{ minHeight: '80vh' }}>
                    <div className="spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </>
        );
    }

    const activeCards = cards.filter(c => c.is_active);
    const closedCards = cards.filter(c => !c.is_active);

    return (
        <>
            <Navbar user={user} />

            <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem' }}>My Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Welcome, {profile?.display_name}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={copyProfileLink} className="copy-btn">
                            {copied ? '✓ Copied!' : '🔗 Copy Profile Link'}
                        </button>
                        <a href={`/u/${profile?.slug}`} className="btn btn-secondary btn-sm" target="_blank" rel="noopener">
                            View Public Page
                        </a>
                        <button
                            onClick={() => { setEditingCard(null); setShowModal(true); }}
                            className="btn btn-primary"
                        >
                            + Add Card
                        </button>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Stats */}
                <StatsBar cards={cards} />

                {/* Active Cards Section */}
                {activeCards.length > 0 && (
                    <section style={{ marginBottom: '40px' }}>
                        <h2 className="section-heading">
                            Active Cards
                            <span className="section-heading-count">{activeCards.length}</span>
                        </h2>
                        <div className="cards-grid">
                            {activeCards.map((card) => (
                                <CreditCard
                                    key={card.id}
                                    card={card}
                                    showActions={true}
                                    onEdit={(c) => {
                                        setEditingCard(c);
                                        setShowModal(true);
                                    }}
                                    onDelete={(c) => setConfirmDelete(c)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Closed Cards Section */}
                {closedCards.length > 0 && (
                    <section style={{ marginBottom: '40px' }}>
                        <h2 className="section-heading">
                            Closed Cards
                            <span className="section-heading-count">{closedCards.length}</span>
                        </h2>
                        <div className="cards-grid">
                            {closedCards.map((card) => (
                                <CreditCard
                                    key={card.id}
                                    card={card}
                                    showActions={true}
                                    onEdit={(c) => {
                                        setEditingCard(c);
                                        setShowModal(true);
                                    }}
                                    onDelete={(c) => setConfirmDelete(c)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {cards.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">💳</div>
                        <h3>No cards yet</h3>
                        <p>Start building your portfolio by adding your first credit card.</p>
                        <button
                            onClick={() => { setEditingCard(null); setShowModal(true); }}
                            className="btn btn-primary"
                        >
                            + Add Your First Card
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setEditingCard(null); } }}>
                    <div className="modal">
                        <h2>{editingCard ? 'Edit Card' : 'Add Card to Portfolio'}</h2>
                        <CardForm
                            banks={banks}
                            masterCards={masterCards}
                            initialData={editingCard}
                            onSubmit={editingCard ? handleEditCard : handleAddCard}
                            onCancel={() => { setShowModal(false); setEditingCard(null); }}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="confirm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
                    <div className="confirm-dialog">
                        <h3>Remove Card?</h3>
                        <p>Are you sure you want to remove {confirmDelete.bank_name} {confirmDelete.card_name} from your portfolio?</p>
                        <div className="confirm-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteCard(confirmDelete)}>Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.message}
                </div>
            )}

            <footer className="footer">
                <p>CardFolio — No sensitive card details are stored on this platform.</p>
            </footer>
        </>
    );
}
