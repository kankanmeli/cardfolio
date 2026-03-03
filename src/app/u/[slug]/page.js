'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import CreditCard from '@/components/CreditCard';
import StatsBar from '@/components/StatsBar';
import AdBanner from '@/components/AdBanner';
import RankBadge from '@/components/RankBadge';
import { calculateProfilePoints } from '@/lib/points';

export default function PortfolioPage() {
    const params = useParams();
    const slug = params.slug;
    const [profile, setProfile] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [profileIsPremium, setProfileIsPremium] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUser(data?.user || null));
        fetchPortfolio();
    }, [slug]);

    const fetchPortfolio = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, slug, avatar_url, created_at, is_profile_public, reddit_username, hide_name_on_profile, is_premium')
            .eq('slug', slug)
            .single();

        if (profileError || !profileData) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        // Privacy check: only owner and admins can view private profiles
        if (!profileData.is_profile_public) {
            const isOwner = authUser?.id === profileData.id;
            let isAdmin = false;
            if (authUser) {
                const { data: viewerProfile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authUser.id)
                    .single();
                isAdmin = viewerProfile?.role === 'admin';
            }
            if (!isOwner && !isAdmin) {
                setIsPrivate(true);
                setProfile(profileData);
                setLoading(false);
                return;
            }
        }

        setProfile(profileData);
        setProfileIsPremium(profileData.is_premium === true);

        const { data: cardsData } = await supabase
            .from('user_cards')
            .select(`
        *,
        master_cards (
          bank_id,
          card_name,
          image_url,
          tier,
          banks (name)
        )
      `)
            .eq('user_id', profileData.id);

        if (cardsData) {
            const sorted = cardsData
                .map(card => ({
                    ...card,
                    bank_name: card.master_cards?.banks?.name || '',
                    card_name: card.master_cards?.card_name || '',
                    image_url: card.master_cards?.image_url || '',
                }))
                .sort((a, b) => {
                    const nameA = `${a.bank_name} ${a.card_name}`.toLowerCase();
                    const nameB = `${b.bank_name} ${b.card_name}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
            setCards(sorted);
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <>
                <Navbar user={currentUser} />
                <div className="loading-container" style={{ minHeight: '80vh' }}>
                    <div className="spinner"></div>
                    <p>Loading portfolio...</p>
                </div>
            </>
        );
    }

    if (notFound) {
        return (
            <>
                <Navbar user={currentUser} />
                <div className="empty-state" style={{ paddingTop: '120px' }}>
                    <div className="empty-state-icon">🔍</div>
                    <h3>Portfolio Not Found</h3>
                    <p>This profile doesn&apos;t exist or may have been removed.</p>
                    <a href="/" className="btn btn-primary">Go Home</a>
                </div>
            </>
        );
    }

    if (isPrivate) {
        return (
            <>
                <Navbar user={currentUser} />
                <div className="empty-state" style={{ paddingTop: '120px' }}>
                    <div className="empty-state-icon">🔒</div>
                    <h3>Private Portfolio</h3>
                    <p>This user has set their portfolio to private.</p>
                    <a href="/explore" className="btn btn-primary">Explore Other Portfolios</a>
                </div>
            </>
        );
    }

    // Display name logic: honor hideNameOnProfile setting
    const displayName = (profile.hide_name_on_profile && profile.reddit_username)
        ? `u/${profile.reddit_username}`
        : profile.display_name;

    const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    const activeCards = cards.filter(c => c.is_active);
    const closedCards = cards.filter(c => !c.is_active);
    const profilePoints = calculateProfilePoints(
        cards.map(c => ({ ...c, tier: c.master_cards?.tier || 'entry' }))
    );

    return (
        <>
            <Navbar user={currentUser} />

            <div className="container" style={{ paddingBottom: '48px' }}>
                {/* Profile Header */}
                <div className="profile-header">
                    {profile.avatar_url && !profile.hide_name_on_profile ? (
                        <img
                            src={profile.avatar_url}
                            alt={displayName}
                            className="profile-avatar"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="profile-avatar-placeholder">
                            {displayName.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                    <div className="profile-info">
                        <h1>
                            {displayName}
                            {profileIsPremium && cards.length > 0 && (
                                <span style={{ marginLeft: '12px', verticalAlign: 'middle' }}>
                                    <RankBadge points={profilePoints} size="sm" />
                                </span>
                            )}
                        </h1>
                        <p>
                            Member since {memberSince} · {cards.length} card{cards.length !== 1 ? 's' : ''}
                            {profile.reddit_username && !profile.hide_name_on_profile && (
                                <> · <span style={{ color: 'var(--accent-purple)' }}>u/{profile.reddit_username}</span></>
                            )}
                        </p>
                    </div>
                </div>

                {/* CTA for non-logged-in visitors */}
                {!currentUser && (
                    <div className="glass-card" style={{
                        padding: '20px 24px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Want to create your own portfolio?</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                Sign in with Google to start building your credit card showcase.
                            </p>
                        </div>
                        <a href="/login" className="btn btn-primary">Create Your Portfolio</a>
                    </div>
                )}

                {/* Privacy Banner */}
                <div className="privacy-banner">
                    <span>🔒</span>
                    <span>No sensitive card details (card numbers, CVVs, expiry dates) are stored on this platform.</span>
                </div>

                {/* Stats */}
                <StatsBar cards={cards} />

                <AdBanner slot="portfolio-top" />

                {/* Active Cards */}
                {activeCards.length > 0 && (
                    <section style={{ marginBottom: '40px' }}>
                        <h2 className="section-heading">
                            Active Cards
                            <span className="section-heading-count">{activeCards.length}</span>
                        </h2>
                        <div className="cards-grid">
                            {activeCards.map((card) => (
                                <CreditCard key={card.id} card={card} showActions={false} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Closed Cards */}
                {closedCards.length > 0 && (
                    <section style={{ marginBottom: '40px' }}>
                        <h2 className="section-heading">
                            Closed Cards
                            <span className="section-heading-count">{closedCards.length}</span>
                        </h2>
                        <div className="cards-grid">
                            {closedCards.map((card) => (
                                <CreditCard key={card.id} card={card} showActions={false} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {cards.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">💳</div>
                        <h3>No cards yet</h3>
                        <p>This user hasn&apos;t added any cards to their portfolio yet.</p>
                    </div>
                )}
            </div>

            {!currentUser && <AdBanner slot="portfolio-bottom" />}

            <footer className="footer">
                <p>CardFolio — No sensitive card details are stored on this platform.</p>
            </footer>
        </>
    );
}
