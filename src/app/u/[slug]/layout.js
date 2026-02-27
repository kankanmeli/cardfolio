import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('slug', slug)
        .single();

    if (!profile) {
        return { title: 'Portfolio Not Found — CardFolio' };
    }

    return {
        title: `${profile.display_name}'s Card Portfolio — CardFolio`,
        description: `Check out ${profile.display_name}'s credit card collection on CardFolio.`,
    };
}

export default async function PortfolioLayout({ children }) {
    return <>{children}</>;
}
