import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
    // 1. Authenticate the request using the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the user is an admin
    const supabaseUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser(token);
    
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseUserClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 3. Use Service Role Key to bypass RLS and fetch all profiles and counts
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: profiles, error: fetchErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (fetchErr) {
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    // Fetch card counts
    const { data: userCards } = await supabaseAdmin
        .from('user_cards')
        .select('user_id');

    const countMap = {};
    if (userCards) {
        userCards.forEach(c => {
            countMap[c.user_id] = (countMap[c.user_id] || 0) + 1;
        });
    }

    const usersWithCounts = profiles.map(p => ({
        ...p,
        card_count: countMap[p.id] || 0
    }));

    return NextResponse.json({ users: usersWithCounts });
}
