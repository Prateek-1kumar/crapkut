'use client';

import { useState, useCallback, FormEvent } from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed && !isLoading) {
            onSearch(trimmed);
        }
    }, [query, isLoading, onSearch]);

    return (
        <div className="search-card">
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <FiSearch
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '0.875rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }}
                        />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for products... e.g. iPhone 15, Nike shoes, headphones"
                            disabled={isLoading}
                            className="input"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!query.trim() || isLoading}
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {isLoading ? 'Searching...' : 'Compare Prices'}
                    </button>
                </div>
            </form>
            <p style={{
                marginTop: '0.75rem',
                fontSize: '0.813rem',
                color: 'var(--color-text-muted)'
            }}>
                Comparing prices across Flipkart, eBay, Snapdeal and more
            </p>
        </div>
    );
}
