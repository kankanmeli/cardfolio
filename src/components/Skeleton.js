'use client';

export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-shimmer skeleton-image" />
            <div style={{ padding: '16px' }}>
                <div className="skeleton-shimmer skeleton-line" style={{ width: '70%', marginBottom: '12px' }} />
                <div className="skeleton-shimmer skeleton-line" style={{ width: '50%', marginBottom: '8px' }} />
                <div className="skeleton-shimmer skeleton-line" style={{ width: '60%' }} />
            </div>
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="stats-grid">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="stat-card">
                    <div className="skeleton-shimmer skeleton-line" style={{ width: '40%', height: '24px', marginBottom: '8px' }} />
                    <div className="skeleton-shimmer skeleton-line" style={{ width: '60%', height: '14px' }} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonProfile() {
    return (
        <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton-shimmer skeleton-line" style={{ width: '50%', marginBottom: '6px' }} />
                    <div className="skeleton-shimmer skeleton-line" style={{ width: '30%', height: '12px' }} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-shimmer" style={{ height: '44px', borderRadius: 'var(--radius-sm)' }} />
                ))}
            </div>
            <div className="skeleton-shimmer" style={{ height: '32px', borderRadius: 'var(--radius-sm)' }} />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} style={{
                    display: 'flex', gap: '16px', padding: '14px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                }}>
                    <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton-shimmer skeleton-line" style={{ width: '40%', marginBottom: '6px' }} />
                        <div className="skeleton-shimmer skeleton-line" style={{ width: '25%', height: '12px' }} />
                    </div>
                    <div className="skeleton-shimmer skeleton-line" style={{ width: '60px', height: '20px' }} />
                </div>
            ))}
        </div>
    );
}
