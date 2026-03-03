'use client';

const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

function formatCurrency(val) {
    return inrFormatter.format(val);
}

export default function CreditCard({ card, showActions, onEdit, onDelete }) {
    const cardName = `${card.bank_name} ${card.card_name}`;
    const typeBadgeClass = card.card_type === 'LTF' ? 'badge-ltf' : card.card_type === 'FYF' ? 'badge-fyf' : 'badge-paid';

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    };

    const getHoldingDuration = (since) => {
        if (!since) return '—';
        const start = new Date(since);
        const now = new Date();
        const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (months < 0) return '0mo';
        if (months < 12) return `${months}mo`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
    };

    return (
        <div className={`credit-card ${!card.is_active ? 'inactive' : ''}`}>
            <div className="credit-card-image-wrapper">
                {card.image_url ? (
                    <img src={card.image_url} alt={cardName} loading="lazy" />
                ) : (
                    <div className="credit-card-image-placeholder">
                        <div>{card.bank_name}</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                            {card.card_name}
                        </div>
                    </div>
                )}
                <span className={`credit-card-status-badge ${card.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {card.is_active ? 'Active' : 'Closed'}
                </span>
            </div>

            <div className="credit-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="credit-card-name" style={{ flex: 1 }}>{cardName}</span>
                    <span className={`badge ${typeBadgeClass}`}>{card.card_type}</span>
                </div>

                <div className="credit-card-details">
                    <div className="credit-card-detail">
                        <span className="credit-card-detail-label">Joining Fee</span>
                        <span className="credit-card-detail-value">{formatCurrency(card.joining_fee || 0)}</span>
                    </div>
                    <div className="credit-card-detail">
                        <span className="credit-card-detail-label">Annual Fee</span>
                        <span className="credit-card-detail-value">{formatCurrency(card.annual_fee || 0)}</span>
                    </div>
                    <div className="credit-card-detail">
                        <span className="credit-card-detail-label">Holding Since</span>
                        <span className="credit-card-detail-value">{formatDate(card.holding_since)}</span>
                    </div>
                    <div className="credit-card-detail">
                        <span className="credit-card-detail-label">Duration</span>
                        <span className="credit-card-detail-value">{getHoldingDuration(card.holding_since)}</span>
                    </div>
                    <div className="credit-card-detail">
                        <span className="credit-card-detail-label">Cashback</span>
                        <span className="credit-card-detail-value">{formatCurrency(card.cashback_earned || 0)}</span>
                    </div>
                    <div className="credit-card-detail">
                        <span className="credit-card-detail-label">Reward Points</span>
                        <span className="credit-card-detail-value">{Number(card.reward_points_earned || 0).toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {!card.is_active && card.closure_month_year && (
                    <div style={{
                        marginTop: '12px',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        padding: '6px 10px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        Closed: {card.closure_month_year}
                    </div>
                )}
            </div>

            {showActions && (
                <div className="credit-card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit?.(card)}>
                        ✏️ Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(card)}>
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
}
