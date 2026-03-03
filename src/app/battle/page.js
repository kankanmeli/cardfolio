'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import RankBadge from '@/components/RankBadge';
import { calculateProfilePoints, getRank } from '@/lib/points';
import Link from 'next/link';

const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

export default function CardBattlePage() {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playerA, setPlayerA] = useState(null);
    const [playerB, setPlayerB] = useState(null);
    const [searchA, setSearchA] = useState('');
    const [searchB, setSearchB] = useState('');
    const [battleData, setBattleData] = useState(null);
    const [battling, setBattling] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        const { data: profs } = await supabase
            .from('profiles')
            .select('id, display_name, slug, avatar_url, is_premium, is_banned, reddit_username, hide_name_on_profile')
            .eq('is_profile_public', true)
            .eq('is_banned', false);

        setProfiles(profs || []);
        setLoading(false);
    };

    const getDisplayName = (p) => (p.hide_name_on_profile && p.reddit_username)
        ? `u/${p.reddit_username}` : p.display_name;

    const loadPlayerData = async (profile) => {
        const { data: cards } = await supabase
            .from('user_cards')
            .select('*, master_cards (card_name, tier, category, banks (name))')
            .eq('user_id', profile.id);

        const enriched = (cards || []).map(c => ({
            ...c,
            tier: c.master_cards?.tier || 'entry',
            category: c.master_cards?.category || 'Rewards',
            bank_name: c.master_cards?.banks?.name || c.bank_name,
        }));

        const active = enriched.filter(c => c.is_active);
        const totalFees = active.reduce((s, c) => s + Number(c.annual_fee || 0), 0);
        const totalCashback = enriched.reduce((s, c) => s + Number(c.cashback_earned || 0), 0);
        const totalRP = enriched.reduce((s, c) => s + Number(c.reward_points_earned || 0), 0);
        const points = calculateProfilePoints(enriched);
        const rank = getRank(points);
        const rewardsCount = enriched.filter(c => c.category === 'Rewards').length;
        const cashbackCount = enriched.filter(c => c.category === 'Cashback').length;
        const banks = [...new Set(enriched.map(c => c.bank_name).filter(Boolean))];

        return {
            profile,
            displayName: getDisplayName(profile),
            cards: enriched,
            activeCards: active.length,
            closedCards: enriched.length - active.length,
            totalCards: enriched.length,
            totalFees, totalCashback, totalRP,
            points, rank,
            rewardsCount, cashbackCount,
            banks,
            ltfCount: enriched.filter(c => c.card_type === 'LTF').length,
            fyfCount: enriched.filter(c => c.card_type === 'FYF').length,
            paidCount: enriched.filter(c => c.card_type === 'Paid').length,
        };
    };

    const startBattle = async () => {
        if (!playerA || !playerB) return;
        setBattling(true);
        const [dataA, dataB] = await Promise.all([
            loadPlayerData(playerA),
            loadPlayerData(playerB),
        ]);
        setBattleData({ a: dataA, b: dataB });
        setBattling(false);
    };

    const filteredA = profiles.filter(p =>
        p.id !== playerB?.id &&
        (getDisplayName(p).toLowerCase().includes(searchA.toLowerCase()) || p.slug.toLowerCase().includes(searchA.toLowerCase()))
    );
    const filteredB = profiles.filter(p =>
        p.id !== playerA?.id &&
        (getDisplayName(p).toLowerCase().includes(searchB.toLowerCase()) || p.slug.toLowerCase().includes(searchB.toLowerCase()))
    );

    const StatRow = ({ label, valA, valB, format = 'number', higherWins = true }) => {
        const numA = typeof valA === 'number' ? valA : 0;
        const numB = typeof valB === 'number' ? valB : 0;
        const winA = higherWins ? numA > numB : numA < numB;
        const winB = higherWins ? numB > numA : numA > numB;
        const tie = numA === numB;

        const formatVal = (v) => {
            if (format === 'currency') return inrFormatter.format(v);
            if (format === 'locale') return v.toLocaleString('en-IN');
            return v;
        };

        return (
            <tr>
                <td style={{
                    textAlign: 'right', fontWeight: winA && !tie ? 700 : 400,
                    color: winA && !tie ? 'var(--accent-green)' : 'inherit',
                }}>
                    {winA && !tie && '🏆 '}{formatVal(valA)}
                </td>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>
                    {label}
                </td>
                <td style={{
                    fontWeight: winB && !tie ? 700 : 400,
                    color: winB && !tie ? 'var(--accent-green)' : 'inherit',
                }}>
                    {formatVal(valB)}{winB && !tie && ' 🏆'}
                </td>
            </tr>
        );
    };

    if (loading) {
        return (
            <>
                <Navbar user={user} />
                <div className="loading-container" style={{ minHeight: '80vh' }}>
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar user={user} />
            <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                <div className="page-header" style={{ paddingTop: '16px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚔️</div>
                    <h1>Card Battle</h1>
                    <p>Compare two portfolios head-to-head and see who has the superior collection.</p>
                </div>

                {/* Player Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'start', marginBottom: '24px' }}>
                    {/* Player A */}
                    <div className="glass-card" style={{ padding: '16px' }}>
                        <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Player 1</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search by name or slug..."
                            value={playerA ? getDisplayName(playerA) : searchA}
                            onChange={(e) => { setSearchA(e.target.value); setPlayerA(null); setBattleData(null); }}
                        />
                        {searchA && !playerA && (
                            <div style={{ maxHeight: '150px', overflow: 'auto', marginTop: '4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                {filteredA.slice(0, 6).map(p => (
                                    <div key={p.id} onClick={() => { setPlayerA(p); setSearchA(''); setBattleData(null); }}
                                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}
                                        onMouseEnter={e => e.target.style.background = 'var(--bg-card)'}
                                        onMouseLeave={e => e.target.style.background = 'transparent'}>
                                        {getDisplayName(p)} <span style={{ color: 'var(--text-muted)' }}>/{p.slug}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {playerA && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {playerA.avatar_url && !playerA.hide_name_on_profile && (
                                    <img src={playerA.avatar_url} alt="" referrerPolicy="no-referrer"
                                        style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                )}
                                <span style={{ fontWeight: 600 }}>{getDisplayName(playerA)}</span>
                                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}
                                    onClick={() => { setPlayerA(null); setBattleData(null); }}>✕</button>
                            </div>
                        )}
                    </div>

                    {/* VS */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '36px' }}>
                        <span style={{
                            fontWeight: 900, fontSize: '1.6rem', letterSpacing: '2px',
                            background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>VS</span>
                    </div>

                    {/* Player B */}
                    <div className="glass-card" style={{ padding: '16px' }}>
                        <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Player 2</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search by name or slug..."
                            value={playerB ? getDisplayName(playerB) : searchB}
                            onChange={(e) => { setSearchB(e.target.value); setPlayerB(null); setBattleData(null); }}
                        />
                        {searchB && !playerB && (
                            <div style={{ maxHeight: '150px', overflow: 'auto', marginTop: '4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                {filteredB.slice(0, 6).map(p => (
                                    <div key={p.id} onClick={() => { setPlayerB(p); setSearchB(''); setBattleData(null); }}
                                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}
                                        onMouseEnter={e => e.target.style.background = 'var(--bg-card)'}
                                        onMouseLeave={e => e.target.style.background = 'transparent'}>
                                        {getDisplayName(p)} <span style={{ color: 'var(--text-muted)' }}>/{p.slug}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {playerB && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {playerB.avatar_url && !playerB.hide_name_on_profile && (
                                    <img src={playerB.avatar_url} alt="" referrerPolicy="no-referrer"
                                        style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                )}
                                <span style={{ fontWeight: 600 }}>{getDisplayName(playerB)}</span>
                                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}
                                    onClick={() => { setPlayerB(null); setBattleData(null); }}>✕</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Battle Button */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '12px 48px', fontSize: '1rem', background: 'var(--gradient-accent)' }}
                        disabled={!playerA || !playerB || battling}
                        onClick={startBattle}
                    >
                        {battling ? '⚡ Loading...' : '⚔️ Battle!'}
                    </button>
                </div>

                {/* Battle Results */}
                {battleData && (
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Header with names + ranks */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                            padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
                            background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(59,130,246,0.04))',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <Link href={`/u/${battleData.a.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{battleData.a.displayName}</div>
                                </Link>
                                {battleData.a.profile.is_premium && <RankBadge points={battleData.a.points} size="sm" />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-muted)' }}>⚔️</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Link href={`/u/${battleData.b.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{battleData.b.displayName}</div>
                                </Link>
                                {battleData.b.profile.is_premium && <RankBadge points={battleData.b.points} size="sm" />}
                            </div>
                        </div>

                        {/* Stats Table */}
                        <table className="data-table" style={{ margin: 0 }}>
                            <tbody>
                                <StatRow label="Total Cards" valA={battleData.a.totalCards} valB={battleData.b.totalCards} />
                                <StatRow label="Active Cards" valA={battleData.a.activeCards} valB={battleData.b.activeCards} />
                                <StatRow label="Profile Points" valA={battleData.a.points} valB={battleData.b.points} format="locale" />
                                <StatRow label="Total Fees/yr" valA={battleData.a.totalFees} valB={battleData.b.totalFees} format="currency" />
                                <StatRow label="Cashback Earned" valA={battleData.a.totalCashback} valB={battleData.b.totalCashback} format="currency" />
                                <StatRow label="Reward Points" valA={battleData.a.totalRP} valB={battleData.b.totalRP} format="locale" />
                                <StatRow label="Rewards Cards" valA={battleData.a.rewardsCount} valB={battleData.b.rewardsCount} />
                                <StatRow label="Cashback Cards" valA={battleData.a.cashbackCount} valB={battleData.b.cashbackCount} />
                                <StatRow label="LTF Cards" valA={battleData.a.ltfCount} valB={battleData.b.ltfCount} />
                                <StatRow label="FYF Cards" valA={battleData.a.fyfCount} valB={battleData.b.fyfCount} />
                                <StatRow label="Paid Cards" valA={battleData.a.paidCount} valB={battleData.b.paidCount} />
                                <StatRow label="Banks" valA={battleData.a.banks.length} valB={battleData.b.banks.length} />
                            </tbody>
                        </table>

                        {/* Winner */}
                        {(() => {
                            let winsA = 0, winsB = 0;
                            const metrics = [
                                [battleData.a.totalCards, battleData.b.totalCards],
                                [battleData.a.points, battleData.b.points],
                                [battleData.a.totalCashback, battleData.b.totalCashback],
                                [battleData.a.totalRP, battleData.b.totalRP],
                                [battleData.a.banks.length, battleData.b.banks.length],
                            ];
                            metrics.forEach(([a, b]) => { if (a > b) winsA++; if (b > a) winsB++; });

                            const winner = winsA > winsB ? battleData.a : winsB > winsA ? battleData.b : null;
                            return (
                                <div style={{
                                    padding: '16px 24px', textAlign: 'center',
                                    borderTop: '1px solid var(--border-color)',
                                    background: winner ? 'rgba(34,197,94,0.06)' : 'rgba(168,85,247,0.06)',
                                }}>
                                    {winner ? (
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            🏆 {winner.displayName} wins the battle! ({Math.max(winsA, winsB)}/{metrics.length} categories)
                                        </span>
                                    ) : (
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            🤝 It&apos;s a tie! Both portfolios are evenly matched.
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {!battleData && !battling && (
                    <div className="empty-state" style={{ marginTop: '24px' }}>
                        <div className="empty-state-icon">⚔️</div>
                        <h3>Select two profiles to battle</h3>
                        <p>Pick two portfolios above and hit Battle to see who has the better collection!</p>
                    </div>
                )}
            </div>
        </>
    );
}
