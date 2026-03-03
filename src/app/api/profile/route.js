import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Extract access token from Supabase auth cookies (handles chunked format)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    let token = null;

    try {
        const authCookies = allCookies
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
        // Not JSON, try raw value
        const raw = allCookies.find(c => c.name.includes('-auth-token'));
        if (raw) token = raw.value;
    }

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
    });

    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { is_profile_public, reddit_username, hide_name_on_profile } = body;

    // Validate
    if (typeof is_profile_public !== 'boolean' || typeof hide_name_on_profile !== 'boolean') {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if (hide_name_on_profile && (!reddit_username || !reddit_username.trim())) {
        return NextResponse.json({ error: 'Reddit username required when hiding name' }, { status: 400 });
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            is_profile_public,
            reddit_username: reddit_username ? reddit_username.trim() : null,
            hide_name_on_profile,
        })
        .eq('id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
