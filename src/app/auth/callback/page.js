'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error('Auth callback error:', error);
                window.location.href = '/login?error=auth_failed';
                return;
            }
            window.location.href = '/dashboard';
        };
        handleCallback();
    }, []);

    return (
        <div className="loading-container" style={{ minHeight: '100vh' }}>
            <div className="spinner"></div>
            <p>Signing you in...</p>
        </div>
    );
}
