'use client';

import { useState, type FormEvent } from 'react';
import { FiSearch, FiLink, FiArrowRight } from 'react-icons/fi';

interface IntelligenceHeaderProps {
  onAnalyze: (input: string, mode: 'auto' | 'query' | 'url') => void;
  isLoading: boolean;
  statusMessage?: string;
}

export default function IntelligenceHeader({
  onAnalyze,
  isLoading,
  statusMessage,
}: IntelligenceHeaderProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'auto' | 'query' | 'url'>('auto');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onAnalyze(input.trim(), mode);
    }
  };

  return (
    <header className="w-full border-b border-border-subtle bg-surface-elevated pb-8 pt-10 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Editorial Brand Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-subtle pb-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-text-primary">
              Price Intelligence Dossier
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Universal Specification Parity & Multi-Store Market Valuation
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs uppercase tracking-widest text-text-muted font-mono">
              Editorial Studio v2.4
            </span>
          </div>
        </div>

        {/* Input & Mode Selector */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
            <span>Query Mode:</span>
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                mode === 'auto'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold shadow-xs'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              Universal Auto-Detect
            </button>
            <button
              type="button"
              onClick={() => setMode('query')}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'query'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold shadow-xs'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              <FiSearch size={12} />
              Product Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'url'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold shadow-xs'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              <FiLink size={12} />
              Direct Store Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="absolute left-4 text-text-muted pointer-events-none">
              {mode === 'url' ? <FiLink size={18} /> : <FiSearch size={18} />}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'url'
                  ? 'Paste store product URL (e.g. https://www.amazon.in/dp/B0CX...).'
                  : 'Enter exact product name or catalog query (e.g. Sony WH-1000XM5, iPhone 16 Pro 256GB)...'
              }
              disabled={isLoading}
              className="w-full bg-surface-elevated border border-border-subtle text-text-primary pl-12 pr-40 py-4 rounded-xl text-base placeholder:text-text-muted/70 focus:outline-none focus:border-text-primary focus:ring-2 focus:ring-text-primary/10 transition-all"
            />
            <div className="absolute right-2 flex items-center">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-2.5 bg-text-primary hover:bg-accent disabled:bg-border-subtle text-surface-elevated font-medium rounded-lg text-sm transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Synthesizing...</span>
                ) : (
                  <>
                    Analyze Dossier
                    <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Calm Editorial Status Line (No AI Pulse) */}
        {isLoading && (
          <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-text-secondary">
            <span className="font-medium animate-pulse">
              {statusMessage || 'Connecting to universal store adapters and normalizing specification parity...'}
            </span>
            <span className="font-mono text-text-muted">Evaluating candidates</span>
          </div>
        )}
      </div>
    </header>
  );
}
