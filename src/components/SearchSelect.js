'use client';

import { useState, useRef, useEffect } from 'react';

export default function SearchSelect({ options, value, onChange, placeholder, label, renderOption }) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <div className="search-select" ref={wrapperRef}>
                <input
                    type="text"
                    className="search-select-input"
                    placeholder={selectedOption ? selectedOption.label : placeholder}
                    value={isOpen ? search : (selectedOption ? selectedOption.label : '')}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setSearch('');
                    }}
                />
                {isOpen && (
                    <div className="search-select-dropdown">
                        {filtered.length === 0 ? (
                            <div className="search-select-empty">No results found</div>
                        ) : (
                            filtered.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`search-select-option ${value === opt.value ? 'selected' : ''}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    {renderOption ? renderOption(opt) : opt.label}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
