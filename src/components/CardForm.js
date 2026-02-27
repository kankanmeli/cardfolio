'use client';

import { useState } from 'react';
import SearchSelect from '@/components/SearchSelect';
import { validate, userCardSchema } from '@/lib/validation';

export default function CardForm({ banks, masterCards, initialData, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        master_card_id: initialData?.master_card_id || '',
        joining_fee: initialData?.joining_fee || '',
        annual_fee: initialData?.annual_fee || '',
        card_type: initialData?.card_type || 'Paid',
        holding_since: initialData?.holding_since || '',
        cashback_earned: initialData?.cashback_earned || '',
        reward_points_earned: initialData?.reward_points_earned || '',
        is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
        closure_month_year: initialData?.closure_month_year || '',
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Selected card's bank
    const selectedCard = masterCards.find(c => c.id === formData.master_card_id);
    const selectedBankId = selectedCard?.bank_id || '';

    // Bank filter
    const [bankFilter, setBankFilter] = useState(selectedBankId);

    // Filter cards by selected bank
    const filteredCards = bankFilter
        ? masterCards.filter(c => c.bank_id === bankFilter)
        : masterCards;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate with Zod
        const { error, data } = validate(userCardSchema, {
            ...formData,
            closure_month_year: !formData.is_active ? formData.closure_month_year || null : null,
        });

        if (error) {
            setFormError(error);
            return;
        }

        setSaving(true);
        await onSubmit(data);
        setSaving(false);
    };

    // Generate month/year options for closure picker
    const generateMonthYearOptions = () => {
        const options = [];
        const now = new Date();
        for (let y = now.getFullYear(); y >= 2010; y--) {
            const maxMonth = y === now.getFullYear() ? now.getMonth() + 1 : 12;
            for (let m = maxMonth; m >= 1; m--) {
                const label = `${String(m).padStart(2, '0')}/${y}`;
                options.push({ value: label, label });
            }
        }
        return options;
    };

    // Build bank options from the banks table
    const bankOptions = banks.map(b => ({ value: b.id, label: b.name }));

    return (
        <form onSubmit={handleSubmit}>
            {formError && (
                <div style={{
                    color: 'var(--accent-red)',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    padding: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 'var(--radius-sm)'
                }}>
                    {formError}
                </div>
            )}

            {/* Bank selection */}
            <SearchSelect
                label="Bank Name"
                placeholder="Search bank..."
                options={bankOptions}
                value={bankFilter}
                onChange={(val) => {
                    setBankFilter(val);
                    handleChange('master_card_id', '');
                }}
            />

            {/* Card selection */}
            <SearchSelect
                label="Card Name"
                placeholder={bankFilter ? 'Search card...' : 'Select a bank first'}
                options={filteredCards.map(c => {
                    const bankName = banks.find(b => b.id === c.bank_id)?.name || '';
                    return { value: c.id, label: `${bankName} ${c.card_name}` };
                })}
                value={formData.master_card_id}
                onChange={(val) => handleChange('master_card_id', val)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                    <label className="input-label">Joining Fee (₹)</label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={formData.joining_fee}
                        onChange={(e) => handleChange('joining_fee', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Annual Fee (₹)</label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={formData.annual_fee}
                        onChange={(e) => handleChange('annual_fee', e.target.value)}
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Card Type</label>
                <select
                    className="input-field"
                    value={formData.card_type}
                    onChange={(e) => handleChange('card_type', e.target.value)}
                >
                    <option value="LTF">LTF (Lifetime Free)</option>
                    <option value="FYF">FYF (First Year Free)</option>
                    <option value="Paid">Paid</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                    <label className="input-label">Holding Since</label>
                    <input
                        type="date"
                        className="input-field"
                        value={formData.holding_since}
                        onChange={(e) => handleChange('holding_since', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Cashback Earned (₹)</label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={formData.cashback_earned}
                        onChange={(e) => handleChange('cashback_earned', e.target.value)}
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Reward Points Earned</label>
                <input
                    type="number"
                    className="input-field"
                    placeholder="0"
                    value={formData.reward_points_earned}
                    onChange={(e) => handleChange('reward_points_earned', e.target.value)}
                />
            </div>

            {/* Active/Inactive toggle */}
            <div className="input-group">
                <label className="input-label">Card Status</label>
                <div className="toggle-container">
                    <div
                        className={`toggle ${formData.is_active ? 'active' : ''}`}
                        onClick={() => handleChange('is_active', !formData.is_active)}
                    ></div>
                    <span className="toggle-label">
                        {formData.is_active ? 'Active' : 'Inactive / Closed'}
                    </span>
                </div>
            </div>

            {/* Closure date (only shown if inactive) */}
            {!formData.is_active && (
                <div className="input-group" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <label className="input-label">Closure Month/Year (optional)</label>
                    <SearchSelect
                        placeholder="Select month/year..."
                        options={generateMonthYearOptions()}
                        value={formData.closure_month_year}
                        onChange={(val) => handleChange('closure_month_year', val)}
                    />
                </div>
            )}

            <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving || !formData.master_card_id}
                >
                    {saving ? 'Saving...' : (initialData ? 'Update Card' : 'Add Card')}
                </button>
            </div>
        </form>
    );
}
