'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        // If already logged in as admin, redirect
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile?.role === 'admin') {
                    window.location.href = '/admin';
                    return;
                }
            }
            setCheckingAuth(false);
        };
        check();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError('Invalid email or password');
            setLoading(false);
            return;
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profile?.role !== 'admin') {
            await supabase.auth.signOut();
            setError('Access denied. Admin privileges required.');
            setLoading(false);
            return;
        }

        window.location.href = '/admin';
    };

    if (checkingAuth) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Admin Login</h1>
                <p>Enter your admin credentials to access the panel</p>

                {error && (
                    <div style={{
                        color: 'var(--accent-red)',
                        marginBottom: '16px',
                        fontSize: '0.85rem',
                        padding: '10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label" style={{ textAlign: 'left' }}>Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@cardfolio.app"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" style={{ textAlign: 'left' }}>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px' }}>
                    <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Back to home</a>
                </div>
            </div>
        </div>
    );
}
