import './globals.css';

export const metadata = {
  title: 'CardFolio — Showcase Your Credit Card Collection',
  description: 'Build and share a stunning portfolio of your credit cards. Track fees, cashback, reward points, and more.',
  keywords: 'credit card, portfolio, showcase, collection, cashback, reward points',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
