'use client';

import Navbar from '@/components/Navbar';

export default function BannedPage() {
    return (
        <>
            <Navbar user={null} />
            <div className="login-page">
                <div className="login-card" style={{
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.05)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚫</div>
                    <h1 style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Account Restricted
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Your account has been banned. You no longer have access to portfolio editing.
                        If you believe this is a mistake, please contact the site administrator.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <a href="/" className="btn btn-secondary">Go Home</a>
                        <button
                            onClick={async () => {
                                const { supabase } = await import('@/lib/supabase');
                                await supabase.auth.signOut();
                                window.location.href = '/';
                            }}
                            className="btn btn-danger"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
