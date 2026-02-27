'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  return (
    <>
      <Navbar user={user} />

      <section className="hero">
        <h1>Showcase Your Cards</h1>
        <p>
          Build a beautiful portfolio of your credit cards. Track fees, rewards, and share your collection with the world.
        </p>
        <div className="hero-actions">
          {user ? (
            <a href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</a>
          ) : (
            <a href="/login" className="btn btn-primary btn-lg">
              Get Started Free
            </a>
          )}
          <a href="/explore" className="btn btn-secondary btn-lg">Explore Portfolios</a>
        </div>
      </section>

      <section id="features" className="container">
        <div className="privacy-banner">
          <span>🔒</span>
          <span>We never store sensitive card details — no card numbers, CVVs, or expiry dates. Your data is safe.</span>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon">💳</div>
            <h3>Card Portfolio</h3>
            <p>Add your credit cards with details like fees, cashback, reward points, and holding duration.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Shareable Profile</h3>
            <p>Get a unique profile link to share your card collection publicly with anyone.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon">📊</div>
            <h3>Portfolio Stats</h3>
            <p>See a beautiful summary of your total cards, LTF/FYF breakdown, total cashback & rewards.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Elegant Design</h3>
            <p>A stunning, modern interface with card images, animations, and a premium dark theme.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure & Private</h3>
            <p>Sign in with Google. Your email is never shown to others. No sensitive card data stored.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon">📱</div>
            <h3>Fully Responsive</h3>
            <p>Looks amazing on desktop, tablet, and mobile devices.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>CardFolio — No sensitive card details are stored on this platform.</p>
      </footer>
    </>
  );
}
