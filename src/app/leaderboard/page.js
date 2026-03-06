'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import RankBadge from '@/components/RankBadge';
import AdBanner from '@/components/AdBanner';
import { SkeletonTable } from '@/components/Skeleton';
import { calculateProfilePoints, getRank } from '@/lib/points';
import Link from 'next/link';

export default function LeaderboardPage() {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState(null);
    const [myPoints, setMyPoints] = useState(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        if (authUser) {
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
            setUserProfile(prof);
        }

        // Fetch all premium users with their cards
        const { data: premiumUsers } = await supabase
            .from('profiles')
            .select('id, display_name, slug, avatar_url, is_premium, premium_expires_at, is_banned, reddit_username, hide_name_on_profile')
            .eq('is_premium', true)
            .eq('is_banned', false)
            .eq('is_profile_public', true);

        if (!premiumUsers || premiumUsers.length === 0) {
            setLeaderboard([]);
            setLoading(false);
            return;
        }

        // Filter out expired premium
        const activePremiumUsers = premiumUsers.filter(u => !u.premium_expires_at || new Date(u.premium_expires_at) > new Date());

        if (activePremiumUsers.length === 0) {
            setLeaderboard([]);
            setLoading(false);
            return;
        }

        // Fetch all cards for premium users with tier info
        const userIds = activePremiumUsers.map(u => u.id);
        const { data: allCards } = await supabase
            .from('user_cards')
            .select(`
                *,
                master_cards (tier, card_name, banks (name))
            `)
            .in('user_id', userIds);

        // Calculate points per user
        const entries = activePremiumUsers.map(u => {
            const userCards = (allCards || [])
                .filter(c => c.user_id === u.id)
                .map(c => ({ ...c, tier: c.master_cards?.tier || 'entry' }));
            const points = calculateProfilePoints(userCards);
            const rank = getRank(points);
            const displayName = (u.hide_name_on_profile && u.reddit_username)
                ? `u/${u.reddit_username}` : u.display_name;
            const activeCards = userCards.filter(c => c.is_active).length;
            const totalCards = userCards.length;

            return { ...u, displayName, points, rank, activeCards, totalCards };
        });

        // Sort by points descending
        entries.sort((a, b) => b.points - a.points);

        // Find current user's rank
        if (authUser) {
            const idx = entries.findIndex(e => e.id === authUser.id);
            if (idx >= 0) {
                setMyRank(idx + 1);
                setMyPoints(entries[idx].points);
            }
        }

        setLeaderboard(entries.slice(0, 50));
        setLoading(false);
    };

    const isPremium = userProfile?.is_premium === true && (!userProfile?.premium_expires_at || new Date(userProfile.premium_expires_at) > new Date());

    if (loading) {
        return (
            <>
                <Navbar user={user} />
                <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                    <div className="page-header" style={{ paddingTop: '16px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                        <h1>Leaderboard</h1>
                        <p>Top credit card portfolios ranked by profile points.</p>
                    </div>
                    <SkeletonTable rows={8} />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar user={user} />
            <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                <div className="page-header" style={{ paddingTop: '16px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                    <h1>Leaderboard</h1>
                    <p>Top credit card portfolios ranked by profile points.</p>
                </div>

                {/* Current user rank card */}
                {isPremium && myRank && (
                    <div className="glass-card" style={{
                        padding: '20px 24px', marginBottom: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '12px',
                        border: '1px solid var(--accent-purple)',
                        background: 'rgba(168,85,247,0.06)',
                    }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Your Position</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                                #{myRank} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>of {leaderboard.length}</span>
                            </div>
                        </div>
                        <RankBadge points={myPoints} size="lg" />
                    </div>
                )}

                {/* Non-premium CTA */}
                {user && !isPremium && (
                    <div className="glass-card" style={{
                        padding: '20px 24px', marginBottom: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '12px',
                        border: '1px solid var(--accent-purple)',
                        background: 'rgba(168,85,247,0.06)',
                    }}>
                        <div>
                            <strong>Want to rank on the leaderboard?</strong>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                                Upgrade to Premium to get ranked and compete with other collectors.
                            </p>
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ background: 'var(--accent-purple)', whiteSpace: 'nowrap' }}>
                            ⭐ Upgrade to Premium
                        </button>
                    </div>
                )}

                <AdBanner slot="leaderboard-top" />

                {/* Leaderboard Table */}
                {leaderboard.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏆</div>
                        <h3>No ranked profiles yet</h3>
                        <p>Be the first Premium member to claim the top spot!</p>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                                    <th>Profile</th>
                                    <th style={{ textAlign: 'center' }}>Cards</th>
                                    <th>Rank</th>
                                    <th style={{ textAlign: 'right' }}>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, i) => {
                                    const posStyle = i === 0 ? { color: '#ffd700', fontWeight: 800, fontSize: '1.2rem' }
                                        : i === 1 ? { color: '#c0c0c0', fontWeight: 700, fontSize: '1.1rem' }
                                            : i === 2 ? { color: '#cd7f32', fontWeight: 700, fontSize: '1.05rem' }
                                                : { color: 'var(--text-muted)' };

                                    const isMe = user?.id === entry.id;

                                    return (
                                        <tr key={entry.id} style={isMe ? { background: 'rgba(168,85,247,0.08)' } : {}}>
                                            <td style={{ textAlign: 'center', ...posStyle }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                            </td>
                                            <td>
                                                <Link href={`/u/${entry.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                                    {entry.avatar_url && !entry.hide_name_on_profile ? (
                                                        <img
                                                            src={entry.avatar_url}
                                                            alt=""
                                                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${entry.rank.color}` }}
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: `linear-gradient(135deg, ${entry.rank.color}44, ${entry.rank.color}22)`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, color: entry.rank.color, fontSize: '0.85rem',
                                                        }}>
                                                            {entry.displayName?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>
                                                            {entry.displayName}
                                                            {isMe && <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginLeft: '6px' }}>(you)</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/u/{entry.slug}</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ fontWeight: 600 }}>{entry.activeCards}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/{entry.totalCards}</span>
                                            </td>
                                            <td>
                                                <RankBadge points={entry.points} size="sm" />
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                                {entry.points.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Points explanation */}
                <div className="glass-card" style={{ padding: '20px 24px', marginTop: '24px' }}>
                    <h3 style={{ marginBottom: '12px' }}>How points work</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Card Tier</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Super Premium: 50 pts<br />
                                Premium: 30 pts<br />
                                Mid-level: 15 pts<br />
                                Entry: 5 pts
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Type Multiplier</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Paid: ×1.5<br />
                                FYF: ×1.2<br />
                                LTF: ×1.0
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Bonuses</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Annual fee × 0.02 (max 500)<br />
                                +2 pts per month held<br />
                                Only active cards count
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
