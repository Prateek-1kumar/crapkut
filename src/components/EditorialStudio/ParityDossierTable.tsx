'use client';

import type { ComparisonMatrixRow, Vendor } from '@/lib/engine/types';
import StoreBrandBadge from './StoreBrandBadge';
import { FiExternalLink, FiTag, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface ParityDossierTableProps {
  matrix: ComparisonMatrixRow[];
  bestDealId?: string;
}

const VENDOR_BORDER_MAP: Record<Vendor, string> = {
  amazon: 'border-l-[#FF9900]',
  flipkart: 'border-l-[#2874F0]',
  myntra: 'border-l-[#FF3F6C]',
  tatacliq: 'border-l-[#800020]',
  croma: 'border-l-[#00B4AA]',
  nykaa: 'border-l-[#FC2779]',
  ebay: 'border-l-[#0064D2]',
};

export default function ParityDossierTable({ matrix, bestDealId }: ParityDossierTableProps) {
  if (matrix.length === 0) return null;

  return (
    <section className="my-10 animate-fade-in">
      <div className="flex items-baseline justify-between border-b border-black/[0.06] pb-4 mb-8">
        <div>
          <h2 className="font-serif text-2xl sm:text-4xl text-text-primary font-normal tracking-tight">
            Marketplace Valuation & Parity Matrix
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 font-normal">
            All listings evaluated, categorized, and normalized for specification deviations by Groq AI.
          </p>
        </div>
        <div className="text-xs text-text-muted font-mono hidden sm:block tracking-widest uppercase">
          Sorted by Normalized Price (Low → High)
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {matrix.map((row) => {
          const isBest = row.candidate.raw.id === bestDealId;
          const vendor = row.candidate.raw.vendor;
          const leftBorderClass = VENDOR_BORDER_MAP[vendor] || 'border-l-text-primary';

          const isExact = row.candidate.classification === 'exact_match';
          const isVariant = row.candidate.classification === 'variant_deal';
          const isTradeoff = row.candidate.classification === 'spec_tradeoff';

          return (
            <div
              key={row.candidate.raw.id}
              className={`group backdrop-blur-2xl bg-surface-elevated/75 dark:bg-surface-elevated/85 border border-black/[0.06] dark:border-white/10 border-l-4 ${leftBorderClass} rounded-2xl p-5 sm:p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-2xl dark:hover:shadow-[0_24px_70px_rgb(0,0,0,0.5)] hover:border-black/20 dark:hover:border-white/25 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                isBest ? 'ring-2 ring-emerald-500/30 dark:ring-emerald-400/40' : ''
              }`}
            >
              {/* Left Column: Authentic Brand Badge & Listing Identity */}
              <div className="flex-1 max-w-2xl flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StoreBrandBadge vendor={vendor} size="sm" />

                  {isBest && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 shadow-2xs tracking-tight transition-colors duration-500">
                      <FiCheck className="text-emerald-600 dark:text-emerald-400" size={12} />
                      #1 Lowest Verified Market Price
                    </span>
                  )}

                  {isExact && !isBest && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-text-secondary border border-black/[0.06] dark:border-white/10 transition-colors duration-500">
                      100% Spec Parity
                    </span>
                  )}
                  {isVariant && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/80 transition-colors duration-500">
                      Variant Deal ({row.similarity.finalScore}%)
                    </span>
                  )}
                  {isTradeoff && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/80 flex items-center gap-1 transition-colors duration-500">
                      <FiAlertCircle size={11} className="text-amber-600 dark:text-amber-400" />
                      Condition Tradeoff ({row.similarity.finalScore}%)
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-medium text-text-primary/95 leading-snug tracking-tight font-sans transition-colors duration-500">
                  {row.candidate.normalizedTitle}
                </h3>

                {/* Tradeoffs / Specs Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-text-secondary transition-colors duration-500">
                  <span className="font-medium text-text-muted">Verified Specs:</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/10 text-text-primary">
                    Condition: <strong className="capitalize font-semibold">{row.candidate.specs.condition.replace('_', ' ')}</strong>
                  </span>
                  {row.candidate.specs.color && (
                    <span className="px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/10 text-text-primary">
                      Color: <strong className="font-semibold">{row.candidate.specs.color}</strong>
                    </span>
                  )}
                  {row.candidate.specs.storageOrSize && (
                    <span className="px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/10 text-text-primary">
                      Variant: <strong className="font-semibold">{row.candidate.specs.storageOrSize}</strong>
                    </span>
                  )}

                  {row.gaps.specTradeoffs.map((gap, gIdx) => (
                    <span
                      key={gIdx}
                      className="px-2 py-0.5 rounded-full bg-amber-50/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/80 font-medium flex items-center gap-1 transition-colors duration-500"
                    >
                      <FiTag size={10} className="text-amber-600 dark:text-amber-400" />
                      {gap.attribute}: {String(gap.candidateValue)} vs {String(gap.baselineValue)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Architectural Valuation & Tactile Action Pill */}
              <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-black/[0.06] dark:border-white/10 transition-colors duration-500">
                <div className="text-left lg:text-right">
                  <div className="flex items-baseline gap-1 justify-start lg:justify-end">
                    <span className="font-serif text-xl sm:text-2xl font-normal text-text-primary tracking-tight">
                      ₹{row.candidate.normalizedPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {row.candidate.raw.rawOriginalPrice && (
                    <span className="text-[11px] text-text-muted line-through block mt-0.5">
                      MRP ₹{row.candidate.raw.rawOriginalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <a
                  href={row.candidate.raw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-6 py-3 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 ease-out flex items-center justify-center gap-2.5 shadow-sm group-hover:scale-[1.02] active:scale-95 ${
                    isBest
                      ? 'bg-[#1A1918] dark:bg-white text-[#F9F8F6] dark:text-[#1A1918] hover:bg-black dark:hover:bg-white/90 hover:shadow-md'
                      : 'bg-white/80 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.15] border border-black/10 dark:border-white/15 text-text-primary hover:border-black/25 dark:hover:border-white/25'
                  }`}
                >
                  <span>Dossier Link</span>
                  <FiExternalLink size={14} className="opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
