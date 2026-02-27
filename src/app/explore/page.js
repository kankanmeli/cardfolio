'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ExplorePage() {
    const [slug, setSlug] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = slug.trim().toLowerCase();
        if (trimmed) {
            router.push(`/u/${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <>
            <Navbar user={null} />
            <div className="container" style={{ paddingTop: '80px', paddingBottom: '48px' }}>
                <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                    <h1 style={{ marginBottom: '8px' }}>Explore Portfolios</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        Enter a portfolio slug from a shared link to view someone&apos;s credit card collection.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. john-doe"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.trim().toLowerCase())}
                            style={{ flex: 1, textAlign: 'center', fontSize: '1.1rem' }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!slug.trim()}
                            style={{ minWidth: '100px' }}
                        >
                            View
                        </button>
                    </form>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '24px' }}>
                        Shared links look like: <code style={{ color: 'var(--text-secondary)' }}>cardfolio.app/u/portfolio-slug</code>
                        {' '}or{' '}
                        <code style={{ color: 'var(--text-secondary)' }}>cardfolio.app/p/portfolio-slug</code>
                    </p>
                </div>
            </div>
        </>
    );
}
