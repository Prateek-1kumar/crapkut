'use client';

import { useState, type FormEvent } from 'react';
import { FiSearch, FiLink, FiArrowRight } from 'react-icons/fi';

interface IntelligenceHeaderProps {
  onAnalyze: (input: string, mode: 'auto' | 'query' | 'url') => void;
  isLoading: boolean;
  statusMessage?: string;
  isCompact?: boolean;
}

export default function IntelligenceHeader({
  onAnalyze,
  isLoading,
  statusMessage,
  isCompact = false,
}: IntelligenceHeaderProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'auto' | 'query' | 'url'>('auto');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onAnalyze(input.trim(), mode);
    }
  };

  if (!isCompact) {
    return (
      <header className="w-full min-h-[78vh] flex flex-col items-center justify-center px-6 sm:px-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center text-center">
          {/* Subtle Mono Studio Tag */}
          <span className="text-xs uppercase tracking-[0.2em] text-text-muted font-mono mb-6">
            Universal Parity Studio v2.4
          </span>

          {/* Majestic Center Frances Title */}
          <h1 className="font-serif text-5xl sm:text-7xl font-normal tracking-tight text-text-primary leading-[1.08] mb-5">
            Price Intelligence Dossier
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-xl text-center font-normal leading-relaxed mb-10">
            Real-time specification parity, condition X-ray, and multi-store market valuation across verified retail destinations.
          </p>

          {/* Mode Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
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
              className={`px-4 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'query'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold shadow-xs'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              <FiSearch size={13} />
              Product Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-4 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'url'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold shadow-xs'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              <FiLink size={13} />
              Direct Store Link
            </button>
          </div>

          {/* Center Elevated Search Container */}
          <form
            onSubmit={handleSubmit}
            className="w-full relative flex items-center bg-surface-elevated border-2 border-border-subtle hover:border-border-strong focus-within:border-text-primary rounded-2xl shadow-xl transition-all duration-300 p-2"
          >
            <div className="pl-4 text-text-muted pointer-events-none">
              {mode === 'url' ? <FiLink size={20} /> : <FiSearch size={20} />}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'url'
                  ? 'Paste store product URL (e.g. https://www.amazon.in/dp/B0CX...).'
                  : 'Enter exact product name or query (e.g. Sony WH-1000XM5, iPhone 16 Pro 256GB)...'
              }
              disabled={isLoading}
              className="w-full bg-transparent text-text-primary px-4 py-3 sm:py-4 text-base sm:text-lg placeholder:text-text-muted/70 focus:outline-none transition-all font-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 sm:px-8 py-3 sm:py-3.5 bg-text-primary hover:bg-accent disabled:bg-border-subtle text-surface-elevated font-medium rounded-xl text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
            >
              {isLoading ? (
                <span>Synthesizing...</span>
              ) : (
                <>
                  <span>Analyze</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Status feedback in center mode if loading begins */}
          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-3 text-xs text-text-secondary animate-pulse">
              <span className="font-medium">{statusMessage || 'Synthesizing specification parity...'}</span>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Compact Sticky Top Command Bar Mode (When search is active / results are shown)
  return (
    <header className="w-full border-b border-border-subtle bg-surface-elevated/95 backdrop-blur-md py-5 px-6 sm:px-12 sticky top-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Compact Editorial Brand Title */}
        <div className="flex items-baseline gap-3 shrink-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-text-primary">
            Price Intelligence Dossier
          </h1>
          <span className="text-xs uppercase tracking-widest text-text-muted font-mono hidden lg:inline-block">
            Universal Parity Studio
          </span>
        </div>

        {/* Compact Right Search Bar & Mode Selector */}
        <div className="flex-1 max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                mode === 'auto'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setMode('query')}
              className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                mode === 'query'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              <FiSearch size={11} />
              Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                mode === 'url'
                  ? 'bg-text-primary text-surface-elevated border-text-primary font-semibold'
                  : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong'
              }`}
            >
              <FiLink size={11} />
              Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 relative flex items-center bg-surface border border-border-subtle focus-within:border-text-primary focus-within:bg-surface-elevated rounded-xl p-1.5 transition-all">
            <div className="pl-3 text-text-muted pointer-events-none">
              {mode === 'url' ? <FiLink size={16} /> : <FiSearch size={16} />}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'url'
                  ? 'Paste store product URL...'
                  : 'Enter product name (e.g. Sony WH-1000XM5)...'
              }
              disabled={isLoading}
              className="w-full bg-transparent text-text-primary px-3 py-1.5 text-sm placeholder:text-text-muted/70 focus:outline-none transition-all font-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-1.5 bg-text-primary hover:bg-accent disabled:bg-border-subtle text-surface-elevated font-medium rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <span>Synthesizing...</span>
              ) : (
                <>
                  <span>Analyze</span>
                  <FiArrowRight size={13} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Status feedback in compact mode */}
      {isLoading && (
        <div className="max-w-6xl mx-auto flex items-center justify-between border-t border-border-subtle pt-2.5 mt-3 text-xs text-text-secondary">
          <span className="font-medium animate-pulse">
            {statusMessage || 'Connecting to universal store adapters and normalizing specification parity...'}
          </span>
          <span className="font-mono text-text-muted">Evaluating candidates</span>
        </div>
      )}
    </header>
  );
}
