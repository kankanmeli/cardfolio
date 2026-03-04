'use client';

import { useState, useEffect, useRef } from 'react';

const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

function AnimatedNumber({ value, format = 'number', duration = 1000 }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                const start = Date.now();
                const numVal = Number(value) || 0;
                const animate = () => {
                    const elapsed = Date.now() - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease-out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setDisplay(Math.round(numVal * eased));
                    if (progress < 1) requestAnimationFrame(animate);
                };
                animate();
            }
        }, { threshold: 0.3 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, duration]);

    const formatted = format === 'currency'
        ? inrFormatter.format(display)
        : display.toLocaleString('en-IN');

    return <span ref={ref}>{formatted}</span>;
}

export default function StatsBar({ cards }) {
    const active = cards.filter(c => c.is_active);
    const closed = cards.filter(c => !c.is_active);

    const totalJoiningFees = active.reduce((s, c) => s + Number(c.joining_fee || 0), 0);
    const totalAnnualFees = active.reduce((s, c) => s + Number(c.annual_fee || 0), 0);
    const totalCashback = cards.reduce((s, c) => s + Number(c.cashback_earned || 0), 0);
    const totalRewardPoints = cards.reduce((s, c) => s + Number(c.reward_points_earned || 0), 0);

    const ltf = cards.filter(c => c.card_type === 'LTF').length;
    const fyf = cards.filter(c => c.card_type === 'FYF').length;
    const paid = cards.filter(c => c.card_type === 'Paid').length;

    const stats = [
        { label: 'Total Cards', value: cards.length, format: 'number' },
        { label: 'Active', value: active.length, format: 'number' },
        { label: 'Closed', value: closed.length, format: 'number' },
        { label: 'LTF', value: ltf, format: 'number' },
        { label: 'FYF', value: fyf, format: 'number' },
        { label: 'Paid', value: paid, format: 'number' },
        { label: 'Joining Fees', value: totalJoiningFees, format: 'currency' },
        { label: 'Annual Fees', value: totalAnnualFees, format: 'currency' },
        { label: 'Cashback', value: totalCashback, format: 'currency' },
        { label: 'Reward Points', value: totalRewardPoints, format: 'number' },
    ];

    return (
        <div className="stats-grid">
            {stats.map(s => (
                <div key={s.label} className="stat-card">
                    <div className="stat-value">
                        <AnimatedNumber value={s.value} format={s.format} />
                    </div>
                    <div className="stat-label">{s.label}</div>
                </div>
            ))}
        </div>
    );
}
