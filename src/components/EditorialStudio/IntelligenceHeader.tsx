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
  // LANDING PAGE SHOWCASE MODE (!isCompact) - SPACIOUS, AIRY & BREATHABLE
  // ==========================================
  if (!isCompact) {
    return (
      <header className="w-full min-h-[calc(100vh-110px)] py-10 sm:py-16 px-6 sm:px-12 flex flex-col justify-between items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-6xl mx-auto">
        {/* Top Hero Command Deck */}
        <div className="w-full flex flex-col items-center text-center animate-fade-in my-auto">
          {/* Studio Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-xs mb-6 text-xs font-medium text-text-secondary transition-colors duration-500 hover:border-black/20 dark:hover:border-white/20">
            <FiCompass className="text-amber-600 dark:text-amber-400 shrink-0 animate-spin-slow" size={14} />
            <span className="tracking-wide">Autonomous Price & Parity Intelligence Studio v2.4</span>
          </div>

          {/* Majestic Center Frances Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-text-primary leading-[1.08] max-w-4xl mb-5 transition-colors duration-500 text-balance">
            Real-Time Specification Parity & Market Valuation Engine
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-2xl text-center font-normal leading-relaxed mb-10 transition-colors duration-500">
            We X-ray product listings across India&apos;s top marketplaces to expose hidden condition trade-offs, accessory spam, and exact price deviations instantly.
          </p>

          {/* Interactive Command Center: Sleek Mode Tabs + High-Impact Search Capsule */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            {/* Mode Selector Pill Bar */}
            <div className="inline-flex p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 backdrop-blur-xl gap-1 text-xs font-medium transition-all duration-300">
              <button
                type="button"
                onClick={() => setMode('auto')}
                className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-300 ease-out cursor-pointer ${
                  mode === 'auto'
                    ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] font-semibold shadow-xs'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-white'
                }`}
              >
                Universal Auto-Detect
              </button>
              <button
                type="button"
                onClick={() => setMode('query')}
                className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                  mode === 'query'
                    ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] font-semibold shadow-xs'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-white'
                }`}
              >
                <FiSearch size={13} />
                <span>Product Name</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                  mode === 'url'
                    ? 'bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] font-semibold shadow-xs'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-white'
                }`}
              >
                <FiLink size={13} />
                <span>Direct Store Link</span>
              </button>
            </div>

            {/* Elevated Floating Glass Search Capsule */}
            <form
              onSubmit={handleSubmit}
              className="w-full relative flex items-center backdrop-blur-3xl bg-white/95 dark:bg-white/[0.08] border border-black/15 dark:border-white/20 hover:border-black/35 dark:hover:border-white/30 focus-within:border-black/60 focus-within:dark:border-white/50 focus-within:bg-white focus-within:dark:bg-white/[0.12] rounded-full shadow-[0_16px_50px_rgb(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.45)] transition-all duration-500 p-2 sm:p-2.5 group"
            >
              <div className="pl-3 sm:pl-4 text-text-muted pointer-events-none group-focus-within:text-text-primary transition-colors">
                {mode === 'url' ? <FiLink size={18} /> : <FiSearch size={18} />}
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'url'
                    ? 'Paste store product URL (e.g. https://www.amazon.in/dp/B0CX...).'
                    : 'Enter exact product name (e.g. Sony WH-1000XM5, iPhone 16 Pro, Baggy Fit Jeans)...'
                }
                disabled={isLoading}
                className="w-full bg-transparent text-text-primary px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base placeholder:text-text-muted/75 focus:outline-none transition-all font-normal"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#1A1918] dark:bg-[#F9F8F6] hover:bg-black dark:hover:bg-white disabled:bg-black/10 disabled:dark:bg-white/10 disabled:text-black/30 disabled:dark:text-white/30 text-[#F9F8F6] dark:text-[#1A1918] font-semibold rounded-full text-xs sm:text-sm transition-all duration-300 ease-out flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-md hover:scale-[1.02] active:scale-95"
              >
                {isLoading ? (
                  <span>Synthesizing...</span>
                ) : (
                  <>
                    <span>Analyze</span>
                    <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Query Suggestion Chips - Airy & Open */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-text-secondary">
              <span className="text-text-muted font-medium mr-1">Try evaluating:</span>
              {FEATURED_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickQuery(item.label)}
                  disabled={isLoading}
                  className="px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-text-primary transition-all duration-300 cursor-pointer disabled:opacity-50 shadow-2xs font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status feedback during synthesis */}
          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-2.5 text-xs text-text-secondary animate-pulse font-medium bg-white/90 dark:bg-white/[0.1] backdrop-blur-xl px-5 py-2.5 rounded-full border border-black/15 dark:border-white/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>{statusMessage || 'Synthesizing specification parity & live store valuation...'}</span>
            </div>
          )}
        </div>

        {/* ==========================================
            HOW THE PARITY ENGINE WORKS (3-CARD LUXURY GRID - SPACIOUS)
        ========================================== */}
        <div className="mt-14 sm:mt-20 max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left animate-fade-in">
          <div className="backdrop-blur-3xl bg-white/75 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/12 rounded-3xl p-6 sm:p-7 shadow-[0_10px_35px_rgb(0,0,0,0.04)] dark:shadow-[0_14px_45px_rgb(0,0,0,0.35)] hover:bg-white dark:hover:bg-white/[0.09] hover:border-black/20 dark:hover:border-white/25 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
              <FiLayers size={16} />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-normal text-text-primary tracking-tight">
              100% Spec Parity X-Ray
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
              Unlike price scrapers that compare mismatched storage variants or refurbished models, our neural verification engine confirms condition, colorway, and warranty.
            </p>
          </div>

          <div className="backdrop-blur-3xl bg-white/75 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/12 rounded-3xl p-6 sm:p-7 shadow-[0_10px_35px_rgb(0,0,0,0.04)] dark:shadow-[0_14px_45px_rgb(0,0,0,0.35)] hover:bg-white dark:hover:bg-white/[0.09] hover:border-black/20 dark:hover:border-white/25 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
              <FiShield size={16} />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-normal text-text-primary tracking-tight">
              Accessory & Case Spam Shield
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
              Searching for a smartphone or headphone instantly filters out ₹299 silicone cases, replacement earpads, and charger bundles so you only evaluate true candidates.
            </p>
          </div>

          <div className="backdrop-blur-3xl bg-white/75 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/12 rounded-3xl p-6 sm:p-7 shadow-[0_10px_35px_rgb(0,0,0,0.04)] dark:shadow-[0_14px_45px_rgb(0,0,0,0.35)] hover:bg-white dark:hover:bg-white/[0.09] hover:border-black/20 dark:hover:border-white/25 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1A1918] dark:bg-[#F9F8F6] text-[#F9F8F6] dark:text-[#1A1918] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
              <FiCheckCircle size={16} />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-normal text-text-primary tracking-tight">
              Precision Destination Links
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
              Clicking any Dossier Link routes straight to the live marketplace item or exact-match query on Amazon, Flipkart, Myntra, or Tata CLiQ without broken links.
            </p>
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
