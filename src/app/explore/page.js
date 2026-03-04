'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { SkeletonProfile } from '@/components/Skeleton';
import AdBanner from '@/components/AdBanner';
import Link from 'next/link';

export default function ExplorePage() {
    const [user, setUser] = useState(null);
    const [query, setQuery] = useState('');
    const [slugInput, setSlugInput] = useState('');
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
        searchProfiles('');
    }, []);

    const searchProfiles = async (searchTerm) => {
        setLoading(true);
        let q = supabase
            .from('profiles')
            .select('id, display_name, slug, avatar_url, reddit_username, hide_name_on_profile, created_at')
            .eq('is_profile_public', true)
            .eq('is_banned', false)
            .neq('role', 'admin')
            .order('created_at', { ascending: false })
            .limit(40);

        if (searchTerm.trim()) {
            q = q.or(`display_name.ilike.%${searchTerm.trim()}%,slug.ilike.%${searchTerm.trim()}%`);
        }

        const { data: profilesData } = await q;

        if (profilesData) {
            // Fetch card counts for each profile
            const userIds = profilesData.map(p => p.id);
            const { data: cardCounts } = await supabase
                .from('user_cards')
                .select('user_id, card_type, is_active, master_cards (category)')
                .in('user_id', userIds);

            const countMap = {};
            const catMap = {};
            (cardCounts || []).forEach(c => {
                if (!userIds.includes(c.user_id)) return;
                if (!countMap[c.user_id]) countMap[c.user_id] = { total: 0, active: 0, closed: 0 };
                countMap[c.user_id].total += 1;
                if (c.is_active) countMap[c.user_id].active += 1;
                else countMap[c.user_id].closed += 1;
                // Category tracking
                const cat = c.master_cards?.category || 'Rewards';
                if (!catMap[c.user_id]) catMap[c.user_id] = {};
                catMap[c.user_id][cat] = (catMap[c.user_id][cat] || 0) + 1;
            });

            setProfiles(profilesData.map(p => {
                const cats = catMap[p.id] || {};
                const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
                return {
                    ...p,
                    displayName: (p.hide_name_on_profile && p.reddit_username)
                        ? `u/${p.reddit_username}`
                        : p.display_name,
                    stats: countMap[p.id] || { total: 0, active: 0, closed: 0 },
                    topCategory: topCat ? topCat[0] : null,
                };
            }));
        }

        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchProfiles(query);
    };

    return (
        <>
            <Navbar user={user} />
            <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                <div className="page-header" style={{ paddingTop: '16px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔍</div>
                    <h1>Explore Portfolios</h1>
                    <p>Discover public credit card collections or jump to a specific profile.</p>
                </div>

                {/* Search + Slug Lookup */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px', maxWidth: '720px', margin: '0 auto 32px' }}>
                    <form onSubmit={handleSearch} className="glass-card" style={{ padding: '16px' }}>
                        <label className="input-label">Search by name or slug</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. akank, john..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary btn-sm">Search</button>
                        </div>
                    </form>

                    <div className="glass-card" style={{ padding: '16px' }}>
                        <label className="input-label">Open profile by slug</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. john-doe"
                                value={slugInput}
                                onChange={(e) => setSlugInput(e.target.value.trim().toLowerCase())}
                                style={{ flex: 1 }}
                            />
                            <Link
                                href={slugInput ? `/u/${encodeURIComponent(slugInput)}` : '#'}
                                className={`btn btn-secondary btn-sm ${!slugInput ? 'btn:disabled' : ''}`}
                                style={{ pointerEvents: slugInput ? 'auto' : 'none', opacity: slugInput ? 1 : 0.5 }}
                            >
                                View
                            </Link>
                        </div>
                    </div>
                </div>

                <AdBanner slot="explore-top" />

                {/* Profile Grid */}
                {loading ? (
                    <div className="cards-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonProfile key={i} />)}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No public profiles found</h3>
                        <p>Try a different search term or check back later.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {profiles.map((p) => (
                            <div key={p.id} className="glass-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    {p.avatar_url && !p.hide_name_on_profile ? (
                                        <img
                                            src={p.avatar_url}
                                            alt=""
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border-accent)' }}
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: 'var(--gradient-accent)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, color: 'white', fontSize: '1rem'
                                        }}>
                                            {p.displayName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{p.displayName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/u/{p.slug}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.stats.total}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{p.stats.active}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{p.stats.closed}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Closed</div>
                                    </div>
                                </div>

                                {p.topCategory && p.stats.total > 0 && (
                                    <div style={{
                                        fontSize: '0.75rem', color: 'var(--text-muted)',
                                        marginBottom: '10px', textAlign: 'center',
                                    }}>
                                        {p.topCategory === 'Cashback' ? '💰' : '🎁'} Mostly {p.topCategory} cards
                                    </div>
                                )}

                                <Link
                                    href={`/u/${p.slug}`}
                                    className="btn btn-primary btn-sm"
                                    style={{ width: '100%' }}
                                >
                                    View Portfolio
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
