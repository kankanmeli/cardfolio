'use client';

import { useState } from 'react';

const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

export default function DownloadSummary({ profileName, slug, cards }) {
    const [generating, setGenerating] = useState(false);

    const stats = {
        total: cards.length,
        active: cards.filter(c => c.is_active).length,
        closed: cards.filter(c => !c.is_active).length,
        ltf: cards.filter(c => c.card_type === 'LTF').length,
        fyf: cards.filter(c => c.card_type === 'FYF').length,
        paid: cards.filter(c => c.card_type === 'Paid').length,
        totalAnnualFee: cards.reduce((s, c) => s + Number(c.annual_fee || 0), 0),
        totalCashback: cards.reduce((s, c) => s + Number(c.cashback_earned || 0), 0),
        totalRP: cards.reduce((s, c) => s + Number(c.reward_points_earned || 0), 0),
    };

    const drawRow = (ctx, label, value, y, w) => {
        ctx.fillStyle = '#a0a0b8';
        ctx.font = '28px sans-serif';
        ctx.fillText(label, 80, y);
        ctx.fillStyle = '#f0f0f5';
        ctx.font = 'bold 32px sans-serif';
        const tw = ctx.measureText(value).width;
        ctx.fillText(value, w - 80 - tw, y);
    };

    const handleDownload = () => {
        setGenerating(true);
        try {
            const w = 1400, h = 900;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');

            // Dark gradient background
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#0a0a0f');
            grad.addColorStop(0.5, '#12121a');
            grad.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Purple accent glow
            ctx.beginPath();
            ctx.arc(200, 150, 300, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
            ctx.fill();

            // Title
            ctx.fillStyle = '#f0f0f5';
            ctx.font = 'bold 56px sans-serif';
            ctx.fillText('CardFolio Summary', 80, 110);

            // Profile info
            ctx.fillStyle = '#a0a0b8';
            ctx.font = '30px sans-serif';
            ctx.fillText(profileName, 80, 165);
            ctx.fillText(`/p/${slug}`, 80, 205);

            // Divider
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(80, 245);
            ctx.lineTo(w - 80, 245);
            ctx.stroke();

            // Stats
            drawRow(ctx, 'Total Cards', String(stats.total), 310, w);
            drawRow(ctx, 'Active', String(stats.active), 365, w);
            drawRow(ctx, 'Closed', String(stats.closed), 420, w);
            drawRow(ctx, 'LTF / FYF / Paid', `${stats.ltf} / ${stats.fyf} / ${stats.paid}`, 475, w);
            drawRow(ctx, 'Total Annual Fee', inrFormatter.format(stats.totalAnnualFee), 530, w);
            drawRow(ctx, 'Total Cashback', inrFormatter.format(stats.totalCashback), 585, w);
            drawRow(ctx, 'Reward Points', stats.totalRP.toLocaleString('en-IN'), 640, w);

            // Footer
            ctx.fillStyle = '#6b6b80';
            ctx.font = '22px sans-serif';
            ctx.fillText('No sensitive card details are stored on CardFolio.', 80, h - 80);



            // Download
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', 0.92);
            link.download = `${slug}-portfolio-summary.jpg`;
            link.click();
        } catch {
            // silent fail
        } finally {
            setGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={generating}
            className="btn btn-secondary btn-sm"
        >
            {generating ? 'Generating...' : '📥 Download Summary'}
        </button>
    );
}
