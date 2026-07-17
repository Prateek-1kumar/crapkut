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
  { label: 'iPhone 16 Pro 256GB Natural Titanium', mode: 'query' as const },
  { label: 'Baggy Fit Black Streetwear Jeans', mode: 'query' as const },
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
      <header className="w-full py-12 sm:py-20 px-6 sm:px-12 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="max-w-5xl w-full mx-auto flex flex-col items-center text-center animate-fade-in">
          {/* Subtle Studio Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-black/10 backdrop-blur-md shadow-2xs mb-6 text-xs font-medium text-text-secondary">
            <FiCompass className="text-amber-600" size={14} />
            <span className="tracking-wide">Autonomous Price & Parity Intelligence Studio v2.4</span>
          </div>

          {/* Majestic, Perfectly-Proportioned Center Frances Title */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-text-primary leading-[1.08] mb-5">
            Real-Time Specification Parity & Market Valuation Engine
          </h1>

          <p className="text-sm sm:text-lg text-text-secondary max-w-2xl text-center font-normal leading-relaxed mb-10">
            We X-ray product listings across India&apos;s top marketplaces to expose hidden condition trade-offs, accessory spam, and exact price deviations instantly.
          </p>

          {/* Mode Selector Soft Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-4 py-1.5 rounded-full border transition-all duration-300 ease-out cursor-pointer ${
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
              className={`px-4 py-1.5 rounded-full border transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                mode === 'query'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-xs'
                  : 'bg-white/70 backdrop-blur-md border-black/10 text-text-secondary hover:bg-white hover:border-black/25'
              }`}
            >
              <FiSearch size={13} />
              Product Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-4 py-1.5 rounded-full border transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 ${
                mode === 'url'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-xs'
                  : 'bg-white/70 backdrop-blur-md border-black/10 text-text-secondary hover:bg-white hover:border-black/25'
              }`}
            >
              <FiLink size={13} />
              Direct Store Link
            </button>
          </div>

          {/* Center Elevated Floating Glass Search Capsule */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl relative flex items-center backdrop-blur-2xl bg-white/85 border border-black/15 hover:border-black/30 focus-within:border-black/50 focus-within:bg-white rounded-full shadow-[0_20px_60px_rgb(0,0,0,0.06)] transition-all duration-500 p-2 sm:p-2.5 group"
          >
            <div className="pl-4 text-text-muted pointer-events-none group-focus-within:text-text-primary transition-colors">
              {mode === 'url' ? <FiLink size={20} /> : <FiSearch size={20} />}
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
              className="w-full bg-transparent text-text-primary px-3.5 py-3 sm:py-3.5 text-base sm:text-lg placeholder:text-text-muted/75 focus:outline-none transition-all font-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 sm:px-8 py-3 bg-[#1A1918] hover:bg-black disabled:bg-black/10 disabled:text-black/30 text-[#F9F8F6] font-medium rounded-full text-xs sm:text-sm transition-all duration-300 ease-out flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs hover:scale-[1.01] active:scale-95"
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

          {/* Quick Query Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-text-secondary">
            <span className="text-text-muted font-medium">Try evaluating:</span>
            {FEATURED_QUERIES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuery(item.label)}
                disabled={isLoading}
                className="px-3 py-1 rounded-full bg-white/60 hover:bg-white border border-black/[0.08] hover:border-black/25 text-text-primary transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Status feedback during synthesis */}
          {isLoading && (
            <div className="mt-8 flex items-center justify-center gap-2.5 text-xs text-text-secondary animate-pulse font-medium bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-black/10 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>{statusMessage || 'Synthesizing specification parity & live store valuation...'}</span>
            </div>
          )}

          {/* ==========================================
              VERIFIED RETAIL NETWORKS SHOWCASE
          ========================================== */}
          <div className="mt-16 sm:mt-20 w-full pt-8 border-t border-black/[0.06] flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted mb-5">
              Live Connected Retail Networks & Market Adapters
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 max-w-4xl">
              {SUPPORTED_VENDORS.map((vendor) => (
                <StoreBrandBadge key={vendor} vendor={vendor} size="md" />
              ))}
            </div>
          </div>

          {/* ==========================================
              HOW THE PARITY ENGINE WORKS (3-CARD GRID)
          ========================================== */}
          <div className="mt-14 sm:mt-18 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="backdrop-blur-xl bg-white/60 border border-black/[0.06] rounded-3xl p-6 sm:p-7 shadow-[0_12px_35px_rgb(0,0,0,0.03)] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1918] text-[#F9F8F6] flex items-center justify-center shadow-xs">
                <FiLayers size={18} />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary tracking-tight">
                100% Spec Parity X-Ray
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                Unlike dumb price scrapers that compare mismatched storage variants or refurbished models, our Groq AI engine verifies condition, colorway, and manufacturer warranty.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-black/[0.06] rounded-3xl p-6 sm:p-7 shadow-[0_12px_35px_rgb(0,0,0,0.03)] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1918] text-[#F9F8F6] flex items-center justify-center shadow-xs">
                <FiShield size={18} />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary tracking-tight">
                Accessory & Case Spam Shield
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                Searching for a smartphone or headphone instantly filters out ₹299 silicone cases, replacement earpads, and charger bundles so you only evaluate true product candidates.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-black/[0.06] rounded-3xl p-6 sm:p-7 shadow-[0_12px_35px_rgb(0,0,0,0.03)] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1918] text-[#F9F8F6] flex items-center justify-center shadow-xs">
                <FiCheckCircle size={18} />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary tracking-tight">
                Precision Destination Links
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
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
    <header className="w-full border-b border-black/[0.06] bg-surface-elevated/85 backdrop-blur-2xl py-3.5 px-6 sm:px-12 sticky top-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Compact Editorial Brand Title */}
        <div className="flex items-baseline gap-2.5 shrink-0">
          <h1 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-text-primary">
            Price Intelligence Dossier
          </h1>
          <span className="text-xs uppercase tracking-widest text-text-muted font-mono hidden lg:inline-block">
            Universal Parity Studio
          </span>
        </div>

        {/* Compact Right Search Bar & Mode Selector */}
        <div className="flex-1 max-w-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs font-medium shrink-0">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`px-3 py-1 rounded-full border transition-all duration-300 cursor-pointer ${
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
              className={`px-3 py-1 rounded-full border transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                mode === 'query'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-2xs'
                  : 'bg-white/60 border-black/10 text-text-secondary hover:bg-white'
              }`}
            >
              <FiSearch size={11} />
              Name
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-3 py-1 rounded-full border transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                mode === 'url'
                  ? 'bg-[#1A1918] text-[#F9F8F6] border-[#1A1918] font-semibold shadow-2xs'
                  : 'bg-white/60 border-black/10 text-text-secondary hover:bg-white'
              }`}
            >
              <FiLink size={11} />
              Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 relative flex items-center bg-white/85 border border-black/10 focus-within:border-black/30 focus-within:bg-white rounded-full p-1 transition-all duration-300 shadow-2xs">
            <div className="pl-3 text-text-muted pointer-events-none">
              {mode === 'url' ? <FiLink size={15} /> : <FiSearch size={15} />}
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
              className="w-full bg-transparent text-text-primary px-3 py-1.5 text-xs sm:text-sm placeholder:text-text-muted/75 focus:outline-none transition-all font-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-1.5 bg-[#1A1918] hover:bg-black disabled:bg-black/10 disabled:text-black/30 text-[#F9F8F6] font-medium rounded-full text-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs"
            >
              {isLoading ? (
                <span>Synthesizing...</span>
              ) : (
                <>
                  <span>Analyze</span>
                  <FiArrowRight size={12} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Status feedback in compact mode */}
      {isLoading && (
        <div className="max-w-6xl mx-auto flex items-center justify-between border-t border-black/[0.06] pt-2.5 mt-2.5 text-xs text-text-secondary animate-pulse">
          <span className="font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            {statusMessage || 'Connecting to universal store adapters and normalizing specification parity...'}
          </span>
          <span className="font-mono text-text-muted tracking-wide">Evaluating candidates</span>
        </div>
      )}
    </header>
  );
}
