'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Check for error in URL params
                const params = new URLSearchParams(window.location.search);
                const errorParam = params.get('error');
                const errorDescription = params.get('error_description');

                if (errorParam) {
                    setError(errorDescription || errorParam);
                    setTimeout(() => { window.location.href = '/login?error=auth_failed'; }, 3000);
                    return;
                }

                // Check for authorization code (PKCE flow)
                const code = params.get('code');

                if (code) {
                    // Exchange the code for a session
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) {
                        console.error('Code exchange error:', exchangeError);
                        setError(exchangeError.message);
                        setTimeout(() => { window.location.href = '/login?error=auth_failed'; }, 3000);
                        return;
                    }
                    window.location.href = '/dashboard';
                    return;
                }

                // Check for hash fragment (implicit flow)
                if (window.location.hash) {
                    // Supabase client auto-detects hash tokens via onAuthStateChange
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError || !session) {
                        // Wait a moment for Supabase to process the hash
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        const { data: { session: retrySession } } = await supabase.auth.getSession();
                        if (retrySession) {
                            window.location.href = '/dashboard';
                            return;
                        }
                        setError('Failed to complete sign in');
                        setTimeout(() => { window.location.href = '/login?error=auth_failed'; }, 3000);
                        return;
                    }
                    window.location.href = '/dashboard';
                    return;
                }

                // No code or hash — check if already authenticated
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    window.location.href = '/dashboard';
                    return;
                }

                // Nothing worked
                setError('No authentication data found');
                setTimeout(() => { window.location.href = '/login'; }, 3000);
            } catch (err) {
                console.error('Auth callback error:', err);
                setError('Something went wrong during sign in');
                setTimeout(() => { window.location.href = '/login?error=auth_failed'; }, 3000);
            }
        };

        handleCallback();
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
