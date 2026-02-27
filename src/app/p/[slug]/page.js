import { redirect } from 'next/navigation';

export default async function ShortProfilePage({ params }) {
    const { slug } = await params;
    redirect(`/u/${slug}`);
}
