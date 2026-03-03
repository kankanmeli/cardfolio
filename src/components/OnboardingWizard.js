'use client';

import { useState } from 'react';

export default function OnboardingWizard({ onDismiss }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            emoji: '👋',
            title: 'Welcome to CardFolio!',
            desc: 'Build your credit card portfolio and showcase your collection. No sensitive card details are stored.',
        },
        {
            emoji: '💳',
            title: 'Add Your Cards',
            desc: 'Click "+ Add Card" to start adding credit cards. Choose from our catalog of bank cards, set your fees, and track cashback.',
        },
        {
            emoji: '🔗',
            title: 'Share Your Portfolio',
            desc: 'Copy your unique profile link and share it with friends, or on Reddit & Twitter. Explore other portfolios too!',
        },
    ];

    return (
        <div className="glass-card" style={{
            padding: '28px 24px', marginBottom: '24px',
            border: '1px solid var(--accent-purple)',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(59,130,246,0.04))',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ fontSize: '2.5rem' }}>{steps[step].emoji}</div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '6px' }}>{steps[step].title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                        {steps[step].desc}
                    </p>
                </div>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {steps.map((_, i) => (
                        <div key={i} style={{
                            width: i === step ? '24px' : '8px', height: '8px',
                            borderRadius: '4px', transition: 'all 0.3s ease',
                            background: i === step ? 'var(--accent-purple)' : 'var(--bg-card)',
                        }} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {step > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>
                            ← Back
                        </button>
                    )}
                    {step < steps.length - 1 ? (
                        <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>
                            Next →
                        </button>
                    ) : (
                        <button className="btn btn-primary btn-sm" style={{ background: 'var(--accent-purple)' }} onClick={onDismiss}>
                            Get Started! 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
