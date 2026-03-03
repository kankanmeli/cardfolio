'use client';

import { getRank, getNextRank } from '@/lib/points';

export default function RankBadge({ points, size = 'md', showProgress = false }) {
    const rank = getRank(points);
    const nextRank = getNextRank(points);

    const sizes = {
        sm: { fontSize: '0.75rem', padding: '2px 8px', gap: '4px' },
        md: { fontSize: '0.85rem', padding: '4px 12px', gap: '6px' },
        lg: { fontSize: '1rem', padding: '6px 16px', gap: '8px' },
    };

    const s = sizes[size] || sizes.md;

    return (
        <div>
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: s.gap,
                padding: s.padding,
                borderRadius: '20px',
                fontSize: s.fontSize,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${rank.color}22, ${rank.color}11)`,
                border: `1px solid ${rank.color}44`,
                color: rank.color,
                whiteSpace: 'nowrap',
            }}>
                <span>{rank.emoji}</span>
                <span>{rank.title}</span>
                <span style={{ opacity: 0.7, fontWeight: 500 }}>
                    {points.toLocaleString('en-IN')} pts
                </span>
            </span>

            {showProgress && nextRank && (
                <div style={{ marginTop: '8px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                    }}>
                        <span>{rank.emoji} {rank.title}</span>
                        <span>{nextRank.emoji} {nextRank.title} ({nextRank.min} pts)</span>
                    </div>
                    <div style={{
                        height: '6px',
                        background: 'var(--bg-card)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.min(100, (points / nextRank.min) * 100)}%`,
                            background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})`,
                            borderRadius: '3px',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}
