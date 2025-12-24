'use client';

import { useState, useCallback, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLoader } from 'react-icons/fi';

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
    className?: string;
}

export default function SearchBar({ onSearch, isLoading = false, className = '' }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed && !isLoading) {
            onSearch(trimmed);
        }
    }, [query, isLoading, onSearch]);

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`w-full max-w-3xl mx-auto ${className}`}
        >
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

                <div className="relative flex items-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20 transition-all duration-300">
                    <div className="pl-5 pr-2">
                        {isLoading ? (
                            <FiLoader className="w-5 h-5 text-[var(--color-text-muted)] animate-spin" />
                        ) : (
                            <FiSearch className="w-5 h-5 text-[var(--color-text-muted)]" />
                        )}
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for any product... iPhone, shoes, headphones"
                        disabled={isLoading}
                        className="flex-1 py-4 px-3 bg-transparent text-[var(--color-text-primary)] text-lg placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
                    />

                    <motion.button
                        type="submit"
                        disabled={!query.trim() || isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="m-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                    >
                        {isLoading ? 'Searching...' : 'Compare Prices'}
                    </motion.button>
                </div>
            </div>

            <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
                Searching across Amazon, Flipkart, eBay, Myntra, Croma & more
            </p>
        </motion.form>
    );
}
