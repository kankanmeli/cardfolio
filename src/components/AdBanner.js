'use client';

import { useEffect } from 'react';

export default function AdBanner({ slot = '', format = 'auto', style = {} }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // AdSense not loaded or blocked
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', margin: '24px 0', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
