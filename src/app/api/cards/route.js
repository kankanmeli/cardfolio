import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const bank = searchParams.get('bank') || '';
    const card = searchParams.get('card') || '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
        .from('master_cards')
        .select('id, bank_id, card_name, image_url, banks(name)')
        .order('card_name', { ascending: true });

    // If bank filter provided, first find matching bank IDs
    if (bank) {
        const { data: bankResults } = await supabase
            .from('banks')
            .select('id')
            .ilike('name', `%${bank}%`);

        if (bankResults && bankResults.length > 0) {
            const bankIds = bankResults.map(b => b.id);
            query = query.in('bank_id', bankIds);
        } else {
            return NextResponse.json([]);
        }
    }

    // If card name filter provided
    if (card) {
        query = query.ilike('card_name', `%${card}%`);
    }

    const { data, error } = await query.limit(100);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format response
    const formatted = (data || []).map(c => ({
        id: c.id,
        bank_id: c.bank_id,
        card_name: c.card_name,
        bank_name: c.banks?.name || '',
        image_url: c.image_url || '',
    }));

    return NextResponse.json(formatted);
}
