import './globals.css';
import Script from 'next/script';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'CardFolio — Showcase Your Credit Card Collection',
  description: 'Build and share a stunning portfolio of your credit cards. Track fees, cashback, reward points, and more.',
  keywords: 'credit card, portfolio, showcase, collection, cashback, reward points',
};

export default function RootLayout({ children }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

