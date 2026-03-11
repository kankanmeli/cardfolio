'use client';

import { useState } from 'react';

const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

export default function ExportPortfolio({ cards }) {
    const [exporting, setExporting] = useState(false);

    const exportCSV = () => {

        setExporting(true);
        try {
            const headers = ['Bank Name', 'Card Name', 'Card Type', 'Category', 'Joining Fee', 'Annual Fee', 'Holding Since', 'Duration', 'Cashback Earned', 'Reward Points', 'Status', 'Closed Date'];
            const rows = cards.map(c => {
                const duration = getDuration(c.holding_since);
                return [
                    c.bank_name,
                    c.card_name,
                    c.card_type || '',
                    c.master_cards?.category || '',
                    c.joining_fee || 0,
                    c.annual_fee || 0,
                    c.holding_since || '',
                    duration,
                    c.cashback_earned || 0,
                    c.reward_points_earned || 0,
                    c.is_active ? 'Active' : 'Closed',
                    c.closure_month_year || '',
                ];
            });

            const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
            downloadFile(csv, 'portfolio-export.csv', 'text/csv');
        } finally {
            setExporting(false);
        }
    };

    const exportJSON = () => {

        setExporting(true);
        try {
            const data = cards.map(c => ({
                bank_name: c.bank_name,
                card_name: c.card_name,
                card_type: c.card_type,
                category: c.master_cards?.category || '',
                joining_fee: c.joining_fee || 0,
                annual_fee: c.annual_fee || 0,
                holding_since: c.holding_since || null,
                duration: getDuration(c.holding_since),
                cashback_earned: c.cashback_earned || 0,
                reward_points_earned: c.reward_points_earned || 0,
                is_active: c.is_active,
                closure_month_year: c.closure_month_year || null,
            }));
            downloadFile(JSON.stringify(data, null, 2), 'portfolio-export.json', 'application/json');
        } finally {
            setExporting(false);
        }
    };

    const getDuration = (since) => {
        if (!since) return '';
        const start = new Date(since);
        const now = new Date();
        const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (months < 12) return `${Math.max(0, months)}mo`;
        const y = Math.floor(months / 12);
        const m = months % 12;
        return m > 0 ? `${y}y ${m}mo` : `${y}y`;
    };

    const downloadFile = (content, filename, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={exporting}>
                📋 CSV
            </button>
            <button className="btn btn-ghost btn-sm" onClick={exportJSON} disabled={exporting}>
                📋 JSON
            </button>
        </div>
    );
}
