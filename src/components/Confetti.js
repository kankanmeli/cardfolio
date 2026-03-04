'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#a855f7', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#ffd700'];

export default function Confetti({ active, duration = 3000 }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!active) { setParticles([]); return; }

        const newParticles = Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            delay: Math.random() * 0.5,
            drift: (Math.random() - 0.5) * 200,
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 720,
            duration: Math.random() * 1.5 + 1.5,
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => setParticles([]), duration);
        return () => clearTimeout(timer);
    }, [active, duration]);

    if (particles.length === 0) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden',
        }}>
            {particles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: '-10px',
                        width: `${p.size}px`,
                        height: `${p.size * 0.6}px`,
                        background: p.color,
                        borderRadius: '2px',
                        animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
                        '--drift': `${p.drift}px`,
                        '--rotation': `${p.rotation}deg`,
                    }}
                />
            ))}
        </div>
    );
}
