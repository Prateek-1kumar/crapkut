'use client';

import { useState, type FormEvent } from 'react';
import { FiSearch, FiLink, FiArrowRight, FiCompass, FiLayers, FiShield, FiCheckCircle } from 'react-icons/fi';

interface IntelligenceHeaderProps {
  onAnalyze: (input: string, mode: 'auto' | 'query' | 'url') => void;
  isLoading: boolean;
  statusMessage?: string;
  isCompact?: boolean;
}

const FEATURED_QUERIES = [
  { label: 'Sony WH-1000XM5 Headphones', mode: 'query' as const },
  { label: 'iPhone 16 Pro 256GB Titanium', mode: 'query' as const },
  { label: 'Baggy Fit Black Street Jeans', mode: 'query' as const },
  { label: 'MacBook Air M3 16GB RAM', mode: 'query' as const },
];

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

  const handleQuickQuery = (queryText: string) => {
    if (isLoading) return;
    setInput(queryText);
    setMode('query');
    onAnalyze(queryText, 'query');
  };

  // ==========================================
  // LANDING PAGE SHOWCASE MODE (!isCompact) - ULTRA COMPACT SINGLE-SCREEN
  // ==========================================
  if (!isCompact) {
    return (
      <header className="w-full py-6 sm:py-8 px-6 sm:px-12 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center animate-fade-in">
          {/* Subtle Studio Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/[0.05] border border-black/10 dark:border-white/10 backdrop-blur-md shadow-2xs mb-3 text-[11px] font-medium text-text-secondary transition-colors duration-500">
            <FiCompass className="text-amber-600 dark:text-amber-400" size={13} />
            <span className="tracking-wide">Autonomous Price & Parity Intelligence Studio v2.4</span>
          </div>

          {/* Refined, Compact Center Frances Title */}
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-text-primary leading-[1.1] mb-2.5 transition-colors duration-500">
            Real-Time Specification Parity & Market Valuation Engine
          </h1>

          <p className="text-xs text-text-secondary max-w-lg text-center font-normal leading-relaxed mb-5 transition-colors duration-500">
            We X-ray product listings across India&apos;s top marketplaces to expose hidden condition trade-offs, accessory spam, and exact price deviations instantly.
          </p>

          {/* Mode Selector Soft Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-3 py-1 rounded-full border transition-all duration-300 ease-out cursor-pointer ${
                mode === 'auto'
                  ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] border-[#1A1918] dark:border-[#F9F8F6] font-semibold shadow-xs'
                  : 'bg-white/70 dark:bg-white/[0.05] backdrop-blur-md border-black/10 dark:border-white/10 text-text-secondary hover:bg-white dark:hover:bg-white/[0.1] hover:border-black/25 dark:hover:border-white/20'
              }`}
            >
              Universal Auto-Detect
            </button>
            <button
              type="button"
              onClick={() => setMode('query')}
              className={`px-3 py-1 rounded-full border transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                mode === 'query'
                  ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] border-[#1A1918] dark:border-[#F9F8F6] font-semibold shadow-xs'
                  : 'bg-white/70 dark:bg-white/[0.05] backdrop-blur-md border-black/10 dark:border-white/10 text-text-secondary hover:bg-white dark:hover:bg-white/[0.1] hover:border-black/25 dark:hover:border-white/20'
              }`}
            >
              <FiSearch size={12} />
              Product Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-3 py-1 rounded-full border transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                mode === 'url'
                  ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] border-[#1A1918] dark:border-[#F9F8F6] font-semibold shadow-xs'
                  : 'bg-white/70 dark:bg-white/[0.05] backdrop-blur-md border-black/10 dark:border-white/10 text-text-secondary hover:bg-white dark:hover:bg-white/[0.1] hover:border-black/25 dark:hover:border-white/20'
              }`}
            >
              <FiLink size={12} />
              Direct Store Link
            </button>
          </div>

          {/* Center Elevated Floating Glass Search Capsule (Sleek & Low-Profile) */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl relative flex items-center backdrop-blur-2xl bg-white/90 dark:bg-white/[0.06] border border-black/15 dark:border-white/15 hover:border-black/30 dark:hover:border-white/25 focus-within:border-black/50 focus-within:dark:border-white/40 focus-within:bg-white focus-within:dark:bg-white/[0.1] rounded-full shadow-[0_12px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)] transition-all duration-500 p-1 sm:p-1.5 group"
          >
            <div className="pl-3 text-text-muted pointer-events-none group-focus-within:text-text-primary transition-colors">
              {mode === 'url' ? <FiLink size={15} /> : <FiSearch size={15} />}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'url'
                  ? 'Paste store product URL (e.g. https://www.amazon.in/dp/B0CX...).'
                  : 'Enter product name (e.g. Sony WH-1000XM5, iPhone 16 Pro, Baggy Fit Jeans)...'
              }
              disabled={isLoading}
              className="w-full bg-transparent text-text-primary px-3 py-1.5 sm:py-2 text-xs sm:text-sm placeholder:text-text-muted/75 focus:outline-none transition-all font-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#1A1918] dark:bg-[#F9F8F6] hover:bg-black dark:hover:bg-white disabled:bg-black/10 disabled:dark:bg-white/10 disabled:text-black/30 disabled:dark:text-white/30 text-[#F9F8F6] dark:text-[#1A1918] font-medium rounded-full text-xs transition-all duration-300 ease-out flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs hover:scale-[1.01] active:scale-95"
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

          {/* Quick Query Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-[11px] text-text-secondary">
            <span className="text-text-muted font-medium">Try evaluating:</span>
            {FEATURED_QUERIES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuery(item.label)}
                disabled={isLoading}
                className="px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 text-text-primary transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Status feedback during synthesis */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary animate-pulse font-medium bg-white/80 dark:bg-white/[0.08] backdrop-blur-md px-4 py-1.5 rounded-full border border-black/10 dark:border-white/15 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>{statusMessage || 'Synthesizing specification parity & live store valuation...'}</span>
            </div>
          )}

          {/* ==========================================
              HOW THE PARITY ENGINE WORKS (3-CARD GRID - COMPACT & NO SCROLL)
          ========================================== */}
          <div className="mt-6 sm:mt-8 w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 rounded-2xl p-4 shadow-[0_8px_25px_rgb(0,0,0,0.03)] dark:shadow-[0_12px_35px_rgb(0,0,0,0.3)] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all duration-500 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] flex items-center justify-center shadow-xs transition-colors duration-500">
                <FiLayers size={14} />
              </div>
              <h3 className="font-serif text-sm font-medium text-text-primary tracking-tight">
                100% Spec Parity X-Ray
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed font-normal">
                Unlike price scrapers that compare mismatched storage variants or refurbished models, our neural verification engine confirms condition, colorway, and warranty.
              </p>
            </div>

            <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 rounded-2xl p-4 shadow-[0_8px_25px_rgb(0,0,0,0.03)] dark:shadow-[0_12px_35px_rgb(0,0,0,0.3)] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all duration-500 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] flex items-center justify-center shadow-xs transition-colors duration-500">
                <FiShield size={14} />
              </div>
              <h3 className="font-serif text-sm font-medium text-text-primary tracking-tight">
                Accessory & Case Spam Shield
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed font-normal">
                Searching for a smartphone or headphone instantly filters out ₹299 silicone cases, replacement earpads, and charger bundles so you only evaluate true candidates.
              </p>
            </div>

            <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 rounded-2xl p-4 shadow-[0_8px_25px_rgb(0,0,0,0.03)] dark:shadow-[0_12px_35px_rgb(0,0,0,0.3)] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all duration-500 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] flex items-center justify-center shadow-xs transition-colors duration-500">
                <FiCheckCircle size={14} />
              </div>
              <h3 className="font-serif text-sm font-medium text-text-primary tracking-tight">
                Precision Destination Links
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed font-normal">
                Clicking any Dossier Link routes straight to the live marketplace item or exact-match query on Amazon, Flipkart, Myntra, or Tata CLiQ without broken links.
              </p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ==========================================
  // COMPACT STICKY TOP COMMAND BAR (isCompact === true)
  // ==========================================
  return (
    <header className="w-full border-b border-black/[0.06] dark:border-white/[0.08] bg-surface-elevated/90 backdrop-blur-2xl py-2.5 px-6 sm:px-12 sticky top-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Compact Editorial Brand Title */}
        <div className="flex items-baseline gap-2 shrink-0">
          <h1 className="font-serif text-lg sm:text-xl font-normal tracking-tight text-text-primary">
            Price Intelligence Dossier
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono hidden lg:inline-block">
            Universal Parity Studio
          </span>
        </div>

        {/* Compact Right Search Bar & Mode Selector (Sleek Toolbar Height) */}
        <div className="flex-1 max-w-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-medium shrink-0">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-2.5 py-1 rounded-full border transition-all duration-300 cursor-pointer ${
                mode === 'auto'
                  ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] border-[#1A1918] dark:border-[#F9F8F6] font-semibold shadow-2xs'
                  : 'bg-white/60 dark:bg-white/[0.05] border-black/10 dark:border-white/10 text-text-secondary hover:bg-white dark:hover:bg-white/[0.1]'
              }`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setMode('query')}
              className={`px-2.5 py-1 rounded-full border transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                mode === 'query'
                  ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] border-[#1A1918] dark:border-[#F9F8F6] font-semibold shadow-2xs'
                  : 'bg-white/60 dark:bg-white/[0.05] border-black/10 dark:border-white/10 text-text-secondary hover:bg-white dark:hover:bg-white/[0.1]'
              }`}
            >
              <FiSearch size={10} />
              Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-2.5 py-1 rounded-full border transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                mode === 'url'
                  ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] border-[#1A1918] dark:border-[#F9F8F6] font-semibold shadow-2xs'
                  : 'bg-white/60 dark:bg-white/[0.05] border-black/10 dark:border-white/10 text-text-secondary hover:bg-white dark:hover:bg-white/[0.1]'
              }`}
            >
              <FiLink size={10} />
              Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 relative flex items-center bg-white/90 dark:bg-white/[0.06] border border-black/10 dark:border-white/15 focus-within:border-black/30 focus-within:dark:border-white/30 focus-within:bg-white focus-within:dark:bg-white/[0.1] rounded-full p-0.5 transition-all duration-300 shadow-2xs">
            <div className="pl-2.5 text-text-muted pointer-events-none">
              {mode === 'url' ? <FiLink size={13} /> : <FiSearch size={13} />}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'url'
                  ? 'Paste product URL...'
                  : 'Search exact product name (e.g. Sony WH-1000XM5)...'
              }
              disabled={isLoading}
              className="w-full bg-transparent text-text-primary px-2.5 py-1 text-xs placeholder:text-text-muted/75 focus:outline-none transition-all font-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3.5 py-1 bg-[#1A1918] dark:bg-[#F9F8F6] hover:bg-black dark:hover:bg-white disabled:bg-black/10 disabled:dark:bg-white/10 disabled:text-black/30 disabled:dark:text-white/30 text-[#F9F8F6] dark:text-[#1A1918] font-medium rounded-full text-[11px] transition-all duration-300 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs"
            >
              {isLoading ? (
                <span>Synthesizing...</span>
              ) : (
                <>
                  <span>Analyze</span>
                  <FiArrowRight size={11} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Status feedback in compact mode */}
      {isLoading && (
        <div className="max-w-6xl mx-auto flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.08] pt-2 mt-2 text-[11px] text-text-secondary animate-pulse">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            {statusMessage || 'Connecting to universal store adapters and normalizing specification parity...'}
          </span>
          <span className="font-mono text-text-muted tracking-wide">Evaluating candidates</span>
        </div>
      )}
    </header>
  );
}
