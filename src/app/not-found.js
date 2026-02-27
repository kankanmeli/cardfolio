import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="login-page">
            <div className="login-card">
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h1>Page Not Found</h1>
                <p style={{ marginBottom: '24px' }}>
                    This page or profile doesn&apos;t exist. Check the URL and try again.
                </p>
                <Link href="/" className="btn btn-primary">Back to Home</Link>
            </div>
        </div>
    );
}
