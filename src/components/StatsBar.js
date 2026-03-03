'use client';

const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

function formatCurrency(val) {
    return inrFormatter.format(val);
}

export default function StatsBar({ cards }) {
    const totalCards = cards.length;
    const activeCards = cards.filter(c => c.is_active).length;
    const closedCards = totalCards - activeCards;
    const ltfCards = cards.filter(c => c.card_type === 'LTF').length;
    const fyfCards = cards.filter(c => c.card_type === 'FYF').length;
    const paidCards = cards.filter(c => c.card_type === 'Paid').length;
    const freeCards = ltfCards + fyfCards;

    const totalAnnualFee = cards.reduce((sum, c) => sum + Number(c.annual_fee || 0), 0);
    const totalCashback = cards.reduce((sum, c) => sum + Number(c.cashback_earned || 0), 0);
    const totalRP = cards.reduce((sum, c) => sum + Number(c.reward_points_earned || 0), 0);

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-value">{totalCards}</div>
                <div className="stat-label">Total Cards</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{activeCards}</div>
                <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{closedCards}</div>
                <div className="stat-label">Closed</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{freeCards}</div>
                <div className="stat-label">Free Cards</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{ltfCards}</div>
                <div className="stat-label">LTF</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{fyfCards}</div>
                <div className="stat-label">FYF</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{paidCards}</div>
                <div className="stat-label">Paid</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{formatCurrency(totalAnnualFee)}</div>
                <div className="stat-label">Total Annual Fee</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{formatCurrency(totalCashback)}</div>
                <div className="stat-label">Total Cashback</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{totalRP.toLocaleString('en-IN')}</div>
                <div className="stat-label">Reward Points</div>
            </div>
        </div>
    );
}
