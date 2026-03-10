'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { validate, createBankSchema, createCardCatalogSchema, renameUserSchema, moderationSchema, updatePremiumSchema } from '@/lib/validation';

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('cards');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Bank management state
    const [banks, setBanks] = useState([]);
    const [newBankName, setNewBankName] = useState('');
    const [savingBank, setSavingBank] = useState(false);

    // Card management state
    const [masterCards, setMasterCards] = useState([]);
    const [showCardModal, setShowCardModal] = useState(false);
    const [editingMasterCard, setEditingMasterCard] = useState(null);
    const [cardForm, setCardForm] = useState({ bank_id: '', card_name: '', image_url: '', default_joining_fee: '', default_annual_fee: '', tier: 'entry', category: 'Rewards' });
    const [cardImageFile, setCardImageFile] = useState(null);
    const [savingCard, setSavingCard] = useState(false);
    const [cardSearch, setCardSearch] = useState('');
    const [csvImporting, setCsvImporting] = useState(false);
    const csvFileRef = useState(null);

    // User management state
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editUserName, setEditUserName] = useState('');
    const [editingPremiumUser, setEditingPremiumUser] = useState(null);
    const [premiumForm, setPremiumForm] = useState({ isPremium: false, expiresAt: '' });
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/admin/login';
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            window.location.href = '/admin/login';
            return;
        }

        setUser(user);
        await Promise.all([fetchBanks(), fetchMasterCards(), fetchUsers()]);
        setLoading(false);
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ============================================
    // BANK MANAGEMENT
    // ============================================
    const fetchBanks = async () => {
        const { data } = await supabase
            .from('banks')
            .select('*')
            .order('name', { ascending: true });
        if (data) setBanks(data);
    };

    const handleAddBank = async () => {
        const { error, data } = validate(createBankSchema, { name: newBankName });
        if (error) {
            showToast(error, 'error');
            return;
        }

        setSavingBank(true);
        const { error: dbError } = await supabase
            .from('banks')
            .insert({ name: data.name.trim() });

        if (dbError) {
            if (dbError.code === '23505') {
                showToast('This bank already exists', 'error');
            } else {
                showToast('Error: ' + dbError.message, 'error');
            }
        } else {
            showToast('Bank added!');
            setNewBankName('');
            await fetchBanks();
        }
        setSavingBank(false);
    };

    const handleDeleteBank = async (bank) => {
        const { error } = await supabase.from('banks').delete().eq('id', bank.id);
        if (error) {
            showToast('Cannot delete: bank has cards associated', 'error');
        } else {
            showToast('Bank deleted');
            await fetchBanks();
        }
        setConfirmAction(null);
    };

    // ============================================
    // CARD MANAGEMENT
    // ============================================
    const fetchMasterCards = async () => {
        const { data } = await supabase
            .from('master_cards')
            .select('*, banks(name)')
            .order('card_name', { ascending: true });
        if (data) {
            setMasterCards(data.map(c => ({
                ...c,
                bank_name: c.banks?.name || '',
            })));
        }
    };

    const handleCardImageUpload = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error } = await supabase.storage
            .from('card-images')
            .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('card-images')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    };

    const handleSaveCard = async () => {
        const { error: validationError, data: validData } = validate(createCardCatalogSchema, {
            bank_id: cardForm.bank_id,
            card_name: cardForm.card_name,
            image_url: cardForm.image_url,
            default_joining_fee: cardForm.default_joining_fee || null,
            default_annual_fee: cardForm.default_annual_fee || null,
        });

        if (validationError) {
            showToast(validationError, 'error');
            return;
        }

        setSavingCard(true);
        let imageUrl = validData.image_url;

        try {
            if (cardImageFile) {
                imageUrl = await handleCardImageUpload(cardImageFile);
            }

            if (editingMasterCard) {
                const { error } = await supabase
                    .from('master_cards')
                    .update({
                        bank_id: validData.bank_id,
                        card_name: validData.card_name.trim(),
                        image_url: imageUrl,
                        default_joining_fee: validData.default_joining_fee,
                        default_annual_fee: validData.default_annual_fee,
                        tier: cardForm.tier || 'entry',
                        category: cardForm.category || 'Rewards',
                    })
                    .eq('id', editingMasterCard.id);

                if (error) throw error;
                showToast('Card updated!');
            } else {
                const { error } = await supabase
                    .from('master_cards')
                    .insert({
                        bank_id: validData.bank_id,
                        card_name: validData.card_name.trim(),
                        image_url: imageUrl,
                        default_joining_fee: validData.default_joining_fee,
                        default_annual_fee: validData.default_annual_fee,
                        tier: cardForm.tier || 'entry',
                        category: cardForm.category || 'Rewards',
                    });

                if (error) {
                    if (error.code === '23505') {
                        showToast('This card already exists for this bank', 'error');
                    } else {
                        throw error;
                    }
                    setSavingCard(false);
                    return;
                }
                showToast('Card added to database!');
            }

            setShowCardModal(false);
            setEditingMasterCard(null);
            setCardForm({ bank_id: '', card_name: '', image_url: '', default_joining_fee: '', default_annual_fee: '', tier: 'entry', category: 'Rewards' });
            setCardImageFile(null);
            await fetchMasterCards();
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        }

        setSavingCard(false);
    };

    const handleDeleteMasterCard = async (card) => {
        const { error } = await supabase.from('master_cards').delete().eq('id', card.id);
        if (error) {
            showToast('Cannot delete: card may be in user portfolios', 'error');
        } else {
            showToast('Card deleted');
            await fetchMasterCards();
        }
        setConfirmAction(null);
    };

    const filteredCards = masterCards.filter(c =>
        `${c.bank_name} ${c.card_name}`.toLowerCase().includes(cardSearch.toLowerCase())
    );

    // CSV Bulk Import
    const handleCsvImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = ''; // reset file input

        setCsvImporting(true);
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length < 2) { showToast('CSV must have a header row and at least one data row', 'error'); setCsvImporting(false); return; }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const bankIdx = headers.findIndex(h => h === 'bank' || h === 'bank_name');
            const cardIdx = headers.findIndex(h => h === 'card' || h === 'card_name');
            const joinFeeIdx = headers.findIndex(h => h.includes('joining') || h === 'joining_fee');
            const annualFeeIdx = headers.findIndex(h => h.includes('annual') || h === 'annual_fee');
            const tierIdx = headers.findIndex(h => h === 'tier');
            const categoryIdx = headers.findIndex(h => h === 'category');

            if (bankIdx === -1 || cardIdx === -1) {
                showToast('CSV must have "bank" and "card" columns', 'error');
                setCsvImporting(false);
                return;
            }

            let added = 0, skipped = 0, errors = 0;

            for (let i = 1; i < lines.length; i++) {
                // Simple CSV parsing (handles basic cases)
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                const bankName = cols[bankIdx];
                const cardName = cols[cardIdx];
                if (!bankName || !cardName) { skipped++; continue; }

                // Find or create bank
                let bank = banks.find(b => b.name.toLowerCase() === bankName.toLowerCase());
                if (!bank) {
                    const { data: newBank, error: bankErr } = await supabase
                        .from('banks')
                        .insert({ name: bankName })
                        .select()
                        .single();
                    if (bankErr) {
                        if (bankErr.code === '23505') {
                            const { data: existing } = await supabase.from('banks').select('*').eq('name', bankName).single();
                            bank = existing;
                        } else { errors++; continue; }
                    } else {
                        bank = newBank;
                        setBanks(prev => [...prev, newBank]);
                    }
                }

                const insertData = {
                    bank_id: bank.id,
                    card_name: cardName,
                    default_joining_fee: joinFeeIdx >= 0 ? Number(cols[joinFeeIdx]) || 0 : 0,
                    default_annual_fee: annualFeeIdx >= 0 ? Number(cols[annualFeeIdx]) || 0 : 0,
                    tier: tierIdx >= 0 && ['entry', 'mid-range', 'premium', 'super-premium'].includes(cols[tierIdx]) ? cols[tierIdx] : 'entry',
                    category: categoryIdx >= 0 && cols[categoryIdx] ? cols[categoryIdx] : 'Rewards',
                };

                const { error: cardErr } = await supabase.from('master_cards').insert(insertData);
                if (cardErr) {
                    if (cardErr.code === '23505') skipped++;
                    else errors++;
                } else {
                    added++;
                }
            }

            showToast(`Import done! ${added} added, ${skipped} skipped (duplicates), ${errors} errors`);
            await Promise.all([fetchBanks(), fetchMasterCards()]);
        } catch (err) {
            showToast('Failed to parse CSV: ' + err.message, 'error');
        }
        setCsvImporting(false);
    };

    // ============================================
    // USER MANAGEMENT
    // ============================================
    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) {
            // Fetch card counts for each user
            const { data: counts } = await supabase
                .from('user_cards')
                .select('user_id');
            const countMap = {};
            (counts || []).forEach(c => {
                countMap[c.user_id] = (countMap[c.user_id] || 0) + 1;
            });
            setUsers(data.map(u => ({ ...u, card_count: countMap[u.id] || 0 })));
        }
    };

    const handleBanUser = async (userId, ban) => {
        const { error: validationError } = validate(moderationSchema, { userId });
        if (validationError) { showToast(validationError, 'error'); return; }

        const { error } = await supabase
            .from('profiles')
            .update({ is_banned: ban })
            .eq('id', userId);

        if (error) {
            showToast('Failed to update user', 'error');
        } else {
            showToast(ban ? 'User banned' : 'User unbanned');
            await fetchUsers();
        }
        setConfirmAction(null);
    };

    const handleSavePremium = async () => {
        const { error: validationError, data: validData } = validate(updatePremiumSchema, {
            userId: editingPremiumUser.id,
            isPremium: premiumForm.isPremium,
            expiresAt: premiumForm.expiresAt || null,
        });

        if (validationError) { showToast(validationError, 'error'); return; }

        const { error } = await supabase
            .from('profiles')
            .update({
                is_premium: validData.isPremium,
                premium_expires_at: validData.expiresAt ? new Date(validData.expiresAt).toISOString() : null
            })
            .eq('id', validData.userId);

        if (error) {
            showToast('Failed to update premium status', 'error');
        } else {
            showToast('Premium status updated');
            setEditingPremiumUser(null);
            await fetchUsers();
        }
    };

    const handleDeleteUser = async (userId) => {
        const { error: validationError } = validate(moderationSchema, { userId });
        if (validationError) { showToast(validationError, 'error'); return; }

        // Ban-before-delete guard
        const targetUser = users.find(u => u.id === userId);
        if (targetUser && !targetUser.is_banned) {
            showToast('Ban the user first before permanent deletion', 'error');
            setConfirmAction(null);
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            showToast('Failed to delete user: ' + error.message, 'error');
        } else {
            showToast('User deleted permanently');
            await fetchUsers();
        }
        setConfirmAction(null);
    };

    const handleRenameUser = async () => {
        const { error: validationError } = validate(renameUserSchema, {
            userId: editingUser.id,
            newName: editUserName,
        });
        if (validationError) { showToast(validationError, 'error'); return; }

        const { error } = await supabase
            .from('profiles')
            .update({ display_name: editUserName.trim() })
            .eq('id', editingUser.id);

        if (error) {
            showToast('Failed to rename user', 'error');
        } else {
            showToast('User renamed');
            setEditingUser(null);
            await fetchUsers();
        }
    };

    const filteredUsers = users.filter(u =>
        u.display_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.slug.toLowerCase().includes(userSearch.toLowerCase())
    );

    const totalUsersCount = users.filter(u => u.role !== 'admin').length;

    if (loading) {
        return (
            <>
                <Navbar user={null} />
                <div className="loading-container" style={{ minHeight: '80vh' }}>
                    <div className="spinner"></div>
                    <p>Loading admin panel...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar user={user} />

            <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.8rem' }}>Admin Panel</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Manage card database and users
                    </p>
                </div>

                {/* Admin Stats */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div className="stat-value">{banks.length}</div>
                        <div className="stat-label">Banks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{masterCards.length}</div>
                        <div className="stat-label">Cards in DB</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalUsersCount}</div>
                        <div className="stat-label">Users</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'banks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('banks')}
                    >
                        🏦 Banks ({banks.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                    >
                        📋 Cards ({masterCards.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Users ({totalUsersCount})
                    </button>
                </div>

                {/* Bank Management Tab */}
                {activeTab === 'banks' && (
                    <>
                        <div className="section-toolbar">
                            <h2>Bank Management</h2>
                        </div>

                        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="input-label">Add New Bank</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. HDFC, ICICI, Axis..."
                                        value={newBankName}
                                        onChange={(e) => setNewBankName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddBank()}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddBank}
                                    disabled={savingBank}
                                >
                                    {savingBank ? 'Adding...' : '+ Add Bank'}
                                </button>
                            </div>
                        </div>

                        {banks.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🏦</div>
                                <h3>No banks yet</h3>
                                <p>Add your first bank to get started.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {banks.map(bank => (
                                    <div key={bank.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 500 }}>{bank.name}</span>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => setConfirmAction({ type: 'deleteBank', bank })}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Card Management Tab */}
                {activeTab === 'cards' && (
                    <>
                        <div className="section-toolbar">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search cards..."
                                value={cardSearch}
                                onChange={(e) => setCardSearch(e.target.value)}
                                style={{ maxWidth: '300px' }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setEditingMasterCard(null);
                                    setCardForm({ bank_id: '', card_name: '', image_url: '', default_joining_fee: '', default_annual_fee: '', tier: 'entry', category: 'Rewards' });
                                    setCardImageFile(null);
                                    setShowCardModal(true);
                                }}
                            >
                                + Add Card to DB
                            </button>
                            <label className={`btn btn-secondary ${csvImporting ? 'btn-disabled' : ''}`} style={{ cursor: csvImporting ? 'wait' : 'pointer' }}>
                                {csvImporting ? '⏳ Importing...' : '📄 Import CSV'}
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCsvImport}
                                    disabled={csvImporting}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {filteredCards.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3>No cards in database</h3>
                                <p>Add banks first, then add cards.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Bank</th>
                                        <th>Card Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCards.map(card => (
                                        <tr key={card.id}>
                                            <td>
                                                {card.image_url ? (
                                                    <img
                                                        src={card.image_url}
                                                        alt={card.card_name}
                                                        style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>No image</span>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{card.bank_name}</td>
                                            <td>{card.card_name}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => {
                                                            setEditingMasterCard(card);
                                                            setCardForm({
                                                                bank_id: card.bank_id,
                                                                card_name: card.card_name,
                                                                image_url: card.image_url || '',
                                                                default_joining_fee: card.default_joining_fee || '',
                                                                default_annual_fee: card.default_annual_fee || '',
                                                                tier: card.tier || 'entry',
                                                                category: card.category || 'Rewards',
                                                            });
                                                            setCardImageFile(null);
                                                            setShowCardModal(true);
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => setConfirmAction({ type: 'deleteCard', card })}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <>
                        <div className="section-toolbar">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                style={{ maxWidth: '300px' }}
                            />
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">👥</div>
                                <h3>No users found</h3>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Slug</th>
                                        <th>Cards</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 500 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {u.avatar_url ? (
                                                        <img
                                                            src={u.avatar_url}
                                                            alt=""
                                                            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : null}
                                                    {u.display_name}
                                                </div>
                                            </td>
                                            <td>
                                                <a href={`/u/${u.slug}`} target="_blank" rel="noopener" style={{ fontSize: '0.85rem' }}>
                                                    /u/{u.slug}
                                                </a>
                                            </td>
                                            <td>
                                                <span className="badge badge-fyf">{u.card_count}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-fyf'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.is_banned ? 'badge-inactive' : 'badge-active'}`}>
                                                    {u.is_banned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {new Date(u.created_at).toLocaleDateString('en-IN')}
                                            </td>
                                            <td>
                                                {u.role !== 'admin' && (
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => {
                                                                setEditingUser(u);
                                                                setEditUserName(u.display_name);
                                                            }}
                                                        >
                                                            ✏️ Rename
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${u.is_premium ? 'btn-secondary' : 'btn-primary'}`}
                                                            style={u.is_premium ? {} : { background: 'var(--accent-purple)' }}
                                                            onClick={() => {
                                                                setEditingPremiumUser(u);
                                                                setPremiumForm({
                                                                    isPremium: u.is_premium,
                                                                    expiresAt: u.premium_expires_at ? new Date(u.premium_expires_at).toISOString().split('T')[0] : ''
                                                                });
                                                            }}
                                                        >
                                                            {u.is_premium ? '⭐ Manage Premium' : '⭐ Make Premium'}
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${u.is_banned ? 'btn-secondary' : 'btn-danger'}`}
                                                            onClick={() => setConfirmAction({
                                                                type: u.is_banned ? 'unban' : 'ban',
                                                                userId: u.id,
                                                                name: u.display_name,
                                                            })}
                                                        >
                                                            {u.is_banned ? '✅ Unban' : '🚫 Ban'}
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => setConfirmAction({
                                                                type: 'deleteUser',
                                                                userId: u.id,
                                                                name: u.display_name,
                                                            })}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Card Modal */}
            {showCardModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCardModal(false); }}>
                    <div className="modal">
                        <h2>{editingMasterCard ? 'Edit Card' : 'Add Card to Database'}</h2>

                        <div className="input-group">
                            <label className="input-label">Bank</label>
                            <select
                                className="input-field"
                                value={cardForm.bank_id}
                                onChange={(e) => setCardForm(prev => ({ ...prev, bank_id: e.target.value }))}
                            >
                                <option value="">Select a bank...</option>
                                {banks.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Card Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Regalia, Infinia, Vistara..."
                                value={cardForm.card_name}
                                onChange={(e) => setCardForm(prev => ({ ...prev, card_name: e.target.value }))}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Card Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="input-field"
                                onChange={(e) => setCardImageFile(e.target.files?.[0] || null)}
                                style={{ padding: '8px' }}
                            />
                            {cardForm.image_url && !cardImageFile && (
                                <div style={{ marginTop: '8px' }}>
                                    <img
                                        src={cardForm.image_url}
                                        alt="Current"
                                        style={{ maxWidth: '200px', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Or paste image URL</label>
                            <input
                                type="url"
                                className="input-field"
                                placeholder="https://..."
                                value={cardForm.image_url}
                                onChange={(e) => {
                                    setCardForm(prev => ({ ...prev, image_url: e.target.value }));
                                    setCardImageFile(null);
                                }}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Card Tier (for ranking)</label>
                            <select
                                className="input-field"
                                value={cardForm.tier}
                                onChange={(e) => setCardForm(prev => ({ ...prev, tier: e.target.value }))}
                            >
                                <option value="entry">Entry</option>
                                <option value="mid">Mid-level</option>
                                <option value="premium">Premium</option>
                                <option value="super_premium">Super Premium</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Card Category</label>
                            <select
                                className="input-field"
                                value={cardForm.category}
                                onChange={(e) => setCardForm(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="Rewards">Rewards</option>
                                <option value="Cashback">Cashback</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="input-group">
                                <label className="input-label">Default Joining Fee (₹)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Optional"
                                    min="0"
                                    value={cardForm.default_joining_fee}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, default_joining_fee: e.target.value }))}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Default Annual Fee (₹)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Optional"
                                    min="0"
                                    value={cardForm.default_annual_fee}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, default_annual_fee: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowCardModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveCard} disabled={savingCard}>
                                {savingCard ? 'Saving...' : (editingMasterCard ? 'Update' : 'Add Card')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename User Modal */}
            {editingUser && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingUser(null); }}>
                    <div className="modal">
                        <h2>Rename User</h2>
                        <div className="input-group">
                            <label className="input-label">Display Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleRenameUser}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Premium Modal */}
            {editingPremiumUser && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingPremiumUser(null); }}>
                    <div className="modal">
                        <h2>Manage Premium for {editingPremiumUser.display_name}</h2>
                        
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <input
                                type="checkbox"
                                id="isPremiumCheck"
                                checked={premiumForm.isPremium}
                                onChange={(e) => setPremiumForm(prev => ({ ...prev, isPremium: e.target.checked }))}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="isPremiumCheck" style={{ fontSize: '1.1rem', cursor: 'pointer' }}>
                                Active Premium Status ⭐
                            </label>
                        </div>

                        {premiumForm.isPremium && (
                            <div className="input-group">
                                <label className="input-label">Expires At (Optional)</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={premiumForm.expiresAt}
                                    onChange={(e) => setPremiumForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                                />
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Leave blank for lifetime premium.
                                </p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-ghost" 
                                        onClick={() => {
                                            const d = new Date(); d.setMonth(d.getMonth() + 1);
                                            setPremiumForm(prev => ({ ...prev, expiresAt: d.toISOString().split('T')[0] }));
                                        }}
                                    >+1 Month</button>
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => {
                                            const d = new Date(); d.setFullYear(d.getFullYear() + 1);
                                            setPremiumForm(prev => ({ ...prev, expiresAt: d.toISOString().split('T')[0] }));
                                        }}
                                    >+1 Year</button>
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => setPremiumForm(prev => ({ ...prev, expiresAt: '' }))}
                                    >Lifetime</button>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditingPremiumUser(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSavePremium}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Action Dialog */}
            {confirmAction && (
                <div className="confirm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmAction(null); }}>
                    <div className="confirm-dialog">
                        <h3>
                            {confirmAction.type === 'ban' && 'Ban User?'}
                            {confirmAction.type === 'unban' && 'Unban User?'}
                            {confirmAction.type === 'deleteUser' && 'Delete User?'}
                            {confirmAction.type === 'deleteCard' && 'Delete Card?'}
                            {confirmAction.type === 'deleteBank' && 'Delete Bank?'}
                        </h3>
                        <p>
                            {confirmAction.type === 'ban' && `Ban ${confirmAction.name}? They won't be able to log in.`}
                            {confirmAction.type === 'unban' && `Unban ${confirmAction.name}?`}
                            {confirmAction.type === 'deleteUser' && `Permanently delete ${confirmAction.name}? This removes all their cards.`}
                            {confirmAction.type === 'deleteCard' && `Delete ${confirmAction.card.bank_name} ${confirmAction.card.card_name}?`}
                            {confirmAction.type === 'deleteBank' && `Delete ${confirmAction.bank.name}? This will also delete all cards under this bank.`}
                        </p>
                        <div className="confirm-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
                            <button
                                className={`btn ${confirmAction.type === 'unban' ? 'btn-primary' : 'btn-danger'}`}
                                onClick={() => {
                                    if (confirmAction.type === 'ban') handleBanUser(confirmAction.userId, true);
                                    if (confirmAction.type === 'unban') handleBanUser(confirmAction.userId, false);
                                    if (confirmAction.type === 'deleteUser') handleDeleteUser(confirmAction.userId);
                                    if (confirmAction.type === 'deleteCard') handleDeleteMasterCard(confirmAction.card);
                                    if (confirmAction.type === 'deleteBank') handleDeleteBank(confirmAction.bank);
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.message}
                </div>
            )}
        </>
    );
}
