'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const [error, setError] = useState('');
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        // Listen for auth state changes — Supabase auto-detects hash fragments
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (processed) return;

                if (event === 'SIGNED_IN' && session) {
                    setProcessed(true);
                    // Use replace to avoid back-button issues
                    window.location.replace('/dashboard');
                }
            }
        );

        // Fallback: if onAuthStateChange doesn't fire within 5 seconds, 
        // manually check for a session
        const fallbackTimer = setTimeout(async () => {
            if (processed) return;

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setProcessed(true);
                window.location.replace('/dashboard');
            } else {
                setError('Sign in timed out. Please try again.');
                setTimeout(() => window.location.replace('/login'), 3000);
            }
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, []);

    return (
        <div className="loading-container" style={{ minHeight: '100vh' }}>
            {error ? (
                <>
                    <p style={{ color: 'var(--accent-red)', marginBottom: '8px' }}>⚠️ {error}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Redirecting to login...</p>
                </>
            ) : (
                <>
                    <div className="spinner"></div>
                    <p>Signing you in...</p>
                </>
            )}
        </div>
    );
}
