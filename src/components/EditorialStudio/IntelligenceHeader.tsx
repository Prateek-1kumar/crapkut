'use client';

import { useState, type FormEvent } from 'react';
import { FiSearch, FiLink, FiArrowRight, FiCompass, FiLayers, FiShield, FiCheckCircle } from 'react-icons/fi';
import StoreBrandBadge from './StoreBrandBadge';
import type { Vendor } from '@/lib/engine/types';

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

const SUPPORTED_VENDORS: Vendor[] = [
  'amazon',
  'flipkart',
  'myntra',
  'tatacliq',
  'croma',
  'nykaa',
  'ebay',
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
  // LANDING PAGE SHOWCASE MODE (!isCompact)
  // ==========================================
  if (!isCompact) {
    return (
      <header className="w-full py-10 sm:py-16 px-6 sm:px-12 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center animate-fade-in">
          {/* Subtle Studio Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 border border-black/10 backdrop-blur-md shadow-2xs mb-5 text-[11px] font-medium text-text-secondary">
            <FiCompass className="text-amber-600" size={13} />
            <span className="tracking-wide">Autonomous Price & Parity Intelligence Studio v2.4</span>
          </div>

          {/* Refined, Compact Center Frances Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-text-primary leading-[1.1] mb-4">
            Real-Time Specification Parity & Market Valuation Engine
          </h1>

          <p className="text-xs sm:text-sm text-text-secondary max-w-xl text-center font-normal leading-relaxed mb-8">
            We X-ray product listings across India&apos;s top marketplaces to expose hidden condition trade-offs, accessory spam, and exact price deviations instantly.
          </p>

          {/* Mode Selector Soft Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3 text-[11px] sm:text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-3.5 py-1.5 rounded-full border transition-all duration-300 ease-out cursor-pointer ${
                mode === 'auto'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-xs'
                  : 'bg-white/70 backdrop-blur-md border-black/10 text-text-secondary hover:bg-white hover:border-black/25'
              }`}
            >
              Universal Auto-Detect
            </button>
            <button
              type="button"
              onClick={() => setMode('query')}
              className={`px-3.5 py-1.5 rounded-full border transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                mode === 'query'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-xs'
                  : 'bg-white/70 backdrop-blur-md border-black/10 text-text-secondary hover:bg-white hover:border-black/25'
              }`}
            >
              <FiSearch size={12} />
              Product Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-3.5 py-1.5 rounded-full border transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                mode === 'url'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-xs'
                  : 'bg-white/70 backdrop-blur-md border-black/10 text-text-secondary hover:bg-white hover:border-black/25'
              }`}
            >
              <FiLink size={12} />
              Direct Store Link
            </button>
          </div>

          {/* Center Elevated Floating Glass Search Capsule (Sleek & Low-Profile) */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl relative flex items-center backdrop-blur-2xl bg-white/90 border border-black/15 hover:border-black/30 focus-within:border-black/50 focus-within:bg-white rounded-full shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-500 p-1.5 sm:p-2 group"
          >
            <div className="pl-3.5 text-text-muted pointer-events-none group-focus-within:text-text-primary transition-colors">
              {mode === 'url' ? <FiLink size={16} /> : <FiSearch size={16} />}
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
              className="w-full bg-transparent text-text-primary px-3 py-2 sm:py-2.5 text-xs sm:text-sm placeholder:text-text-muted/75 focus:outline-none transition-all font-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#1A1918] hover:bg-black disabled:bg-black/10 disabled:text-black/30 text-[#F9F8F6] font-medium rounded-full text-xs sm:text-sm transition-all duration-300 ease-out flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs hover:scale-[1.01] active:scale-95"
            >
              {isLoading ? (
                <span>Synthesizing...</span>
              ) : (
                <>
                  <span>Analyze</span>
                  <FiArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Query Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] text-text-secondary">
            <span className="text-text-muted font-medium">Try evaluating:</span>
            {FEATURED_QUERIES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuery(item.label)}
                disabled={isLoading}
                className="px-2.5 py-0.5 rounded-full bg-white/60 hover:bg-white border border-black/[0.08] hover:border-black/25 text-text-primary transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Status feedback during synthesis */}
          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary animate-pulse font-medium bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/10 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>{statusMessage || 'Synthesizing specification parity & live store valuation...'}</span>
            </div>
          )}

          {/* ==========================================
              VERIFIED RETAIL NETWORKS SHOWCASE (REAL LOGOS)
          ========================================== */}
          <div className="mt-12 sm:mt-16 w-full pt-6 border-t border-black/[0.06] flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-4">
              Live Connected Retail Networks & Market Adapters
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl">
              {SUPPORTED_VENDORS.map((vendor) => (
                <StoreBrandBadge key={vendor} vendor={vendor} size="sm" />
              ))}
            </div>
          </div>

          {/* ==========================================
              HOW THE PARITY ENGINE WORKS (3-CARD GRID)
          ========================================== */}
          <div className="mt-12 sm:mt-14 w-full grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="backdrop-blur-xl bg-white/60 border border-black/[0.06] rounded-2xl p-5 sm:p-6 shadow-[0_8px_25px_rgb(0,0,0,0.03)] flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1A1918] text-[#F9F8F6] flex items-center justify-center shadow-xs">
                <FiLayers size={16} />
              </div>
              <h3 className="font-serif text-base font-normal text-text-primary tracking-tight">
                100% Spec Parity X-Ray
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-normal">
                Unlike dumb price scrapers that compare mismatched storage variants or refurbished models, our Groq AI engine verifies condition, colorway, and manufacturer warranty.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-black/[0.06] rounded-2xl p-5 sm:p-6 shadow-[0_8px_25px_rgb(0,0,0,0.03)] flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1A1918] text-[#F9F8F6] flex items-center justify-center shadow-xs">
                <FiShield size={16} />
              </div>
              <h3 className="font-serif text-base font-normal text-text-primary tracking-tight">
                Accessory & Case Spam Shield
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-normal">
                Searching for a smartphone or headphone instantly filters out ₹299 silicone cases, replacement earpads, and charger bundles so you only evaluate true product candidates.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-black/[0.06] rounded-2xl p-5 sm:p-6 shadow-[0_8px_25px_rgb(0,0,0,0.03)] flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1A1918] text-[#F9F8F6] flex items-center justify-center shadow-xs">
                <FiCheckCircle size={16} />
              </div>
              <h3 className="font-serif text-base font-normal text-text-primary tracking-tight">
                Precision Destination Links
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-normal">
                Clicking any Dossier Link routes straight to the live marketplace item or exact-match query on Amazon, Flipkart, Myntra, or Tata CLiQ without syntax errors or broken links.
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
    <header className="w-full border-b border-black/[0.06] bg-surface-elevated/90 backdrop-blur-2xl py-2.5 px-6 sm:px-12 sticky top-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs">
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
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-2xs'
                  : 'bg-white/60 border-black/10 text-text-secondary hover:bg-white'
              }`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setMode('query')}
              className={`px-2.5 py-1 rounded-full border transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                mode === 'query'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-2xs'
                  : 'bg-white/60 border-black/10 text-text-secondary hover:bg-white'
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
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-2xs'
                  : 'bg-white/60 border-black/10 text-text-secondary hover:bg-white'
              }`}
            >
              <FiLink size={10} />
              Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 relative flex items-center bg-white/90 border border-black/10 focus-within:border-black/30 focus-within:bg-white rounded-full p-0.5 transition-all duration-300 shadow-2xs">
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
              className="px-3.5 py-1 bg-[#1A1918] hover:bg-black disabled:bg-black/10 disabled:text-black/30 text-[#F9F8F6] font-medium rounded-full text-[11px] transition-all duration-300 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs"
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
        <div className="max-w-6xl mx-auto flex items-center justify-between border-t border-black/[0.06] pt-2 mt-2 text-[11px] text-text-secondary animate-pulse">
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
