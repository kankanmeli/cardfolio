'use client';

import { useState } from 'react';

export default function ProfileSettings({ profile, onSave }) {
    const [isPublic, setIsPublic] = useState(profile?.is_profile_public ?? true);
    const [redditUsername, setRedditUsername] = useState(profile?.reddit_username || '');
    const [hideName, setHideName] = useState(profile?.hide_name_on_profile ?? false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSave = async () => {
        if (hideName && !redditUsername.trim()) {
            setStatus({ type: 'error', message: 'Add a Reddit username before hiding your real name.' });
            return;
        }

        setSaving(true);
        setStatus(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_profile_public: isPublic,
                    reddit_username: redditUsername.trim().replace(/^u\//i, '').replace(/^@/, '') || null,
                    hide_name_on_profile: hideName,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            setStatus({ type: 'success', message: 'Settings saved!' });
            onSave?.();
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '4px' }}>Profile Settings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Control your public visibility and display identity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Profile Visibility</label>
                    <select
                        className="input-field"
                        value={isPublic ? 'public' : 'private'}
                        onChange={(e) => setIsPublic(e.target.value === 'public')}
                    >
                        <option value="public">Public (anyone with link)</option>
                        <option value="private">Private (only you & admin)</option>
                    </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Reddit Username (optional)</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. akankanmeli"
                        value={redditUsername}
                        onChange={(e) => setRedditUsername(e.target.value)}
                    />
                </div>
            </div>

            <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
            }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                        type="checkbox"
                        checked={hideName}
                        onChange={(e) => setHideName(e.target.checked)}
                        style={{ accentColor: 'var(--accent-purple)' }}
                    />
                    Hide my real name on public profile (show Reddit username instead)
                </label>
            </div>

            {status && (
                <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: status.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                    color: status.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)',
                }}>
                    {status.message}
                </div>
            )}

            <div style={{ marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
