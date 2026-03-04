'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

export default function Navbar({ user }) {
    const [profile, setProfile] = useState(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (user) {
            supabase
                .from('profiles')
                .select('display_name, slug, role, avatar_url')
                .eq('id', user.id)
                .single()
                .then(({ data }) => setProfile(data));
        }
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-brand">CardFolio</Link>
                <div className="navbar-actions">
                    <Link href="/explore" className="btn btn-ghost btn-sm">
                        🔍 Explore
                    </Link>
                    <Link href="/leaderboard" className="btn btn-ghost btn-sm">
                        🏆 Ranks
                    </Link>
                    <Link href="/battle" className="btn btn-ghost btn-sm">
                        ⚔️ Battle
                    </Link>
                    <Link href="/catalog" className="btn btn-ghost btn-sm">
                        📖 Catalog
                    </Link>
                    <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    {user && profile ? (
                        <>
                            {profile.role === 'admin' && (
                                <Link href="/admin" className="btn btn-ghost btn-sm">
                                    Admin
                                </Link>
                            )}
                            <Link href="/dashboard" className="btn btn-ghost btn-sm">
                                Dashboard
                            </Link>
                            <Link href={`/u/${profile.slug}`} className="btn btn-ghost btn-sm">
                                My Portfolio
                            </Link>
                            <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="btn btn-primary btn-sm">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
