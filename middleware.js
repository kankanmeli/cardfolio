import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request) {
    const pathname = request.nextUrl.pathname;

    // Get session token from cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next();
    }

    // Extract the access token from Supabase auth cookies
    const accessToken = request.cookies.get('sb-access-token')?.value
        || request.cookies.getAll().find(c => c.name.includes('-auth-token'))?.value;

    let user = null;
    let profile = null;

    if (accessToken) {
        try {
            // Parse the cookie - Supabase stores it as a JSON array for chunked cookies
            let token = accessToken;

            // Try to parse as base64 JSON array (chunked Supabase cookie format)
            try {
                // Collect all auth token chunks
                const authCookies = request.cookies.getAll()
                    .filter(c => c.name.includes('-auth-token'))
                    .sort((a, b) => a.name.localeCompare(b.name));

                if (authCookies.length > 0) {
                    const combined = authCookies.map(c => c.value).join('');
                    const parsed = JSON.parse(decodeURIComponent(combined));
                    if (Array.isArray(parsed) && parsed[0]) {
                        token = parsed[0];
                    } else if (parsed.access_token) {
                        token = parsed.access_token;
                    }
                }
            } catch {
                // Not JSON, use as-is
            }

            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: `Bearer ${token}` } },
                auth: { persistSession: false },
            });

            const { data: { user: authUser } } = await supabase.auth.getUser(token);

            if (authUser) {
                user = authUser;
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role, is_banned')
                    .eq('id', authUser.id)
                    .single();
                profile = profileData;
            }
        } catch {
            // Auth failed, treat as unauthenticated
        }
    }

    // Admin routes (except login page)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!profile || profile.role !== 'admin') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Admin login — redirect to admin panel if already logged in as admin
    if (pathname === '/admin/login' && profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Dashboard route — require authenticated user
    if (pathname.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (profile?.is_banned) {
            return NextResponse.redirect(new URL('/banned', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
