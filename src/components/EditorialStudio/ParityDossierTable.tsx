'use client';

import type { ComparisonMatrixRow, Vendor } from '@/lib/engine/types';
import StoreBrandBadge from './StoreBrandBadge';
import { FiArrowUpRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface ParityDossierTableProps {
  matrix: ComparisonMatrixRow[];
  bestDealId?: string;
}

export default function ParityDossierTable({ matrix, bestDealId }: ParityDossierTableProps) {
  if (matrix.length === 0) return null;

  return (
    <section className="my-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-black/[0.06] dark:border-white/10 pb-5 mb-8 gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-4xl text-text-primary font-normal tracking-tight">
            Marketplace Valuation & Parity Matrix
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 font-normal">
            All listings evaluated, categorized, and normalized for specification deviations by our Autonomous Parity Engine.
          </p>
        </div>
        <div className="text-[11px] text-text-muted font-mono tracking-widest uppercase shrink-0">
          Sorted by Normalized Price (Low → High)
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        {matrix.map((row) => {
          const isBest = row.candidate.raw.id === bestDealId;
          const vendor = row.candidate.raw.vendor;

          const isExact = row.candidate.classification === 'exact_match';
          const isVariant = row.candidate.classification === 'variant_deal';
          const isTradeoff = row.candidate.classification === 'spec_tradeoff';

          const condition = row.candidate.specs.condition.replace('_', ' ');

          return (
            <div
              key={row.candidate.raw.id}
              className={`group relative backdrop-blur-3xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                isBest
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/40 dark:border-emerald-400/30 ring-1 ring-emerald-500/20 dark:ring-emerald-400/20 shadow-[0_12px_40px_rgb(16,185,129,0.06)] dark:shadow-[0_16px_50px_rgb(16,185,129,0.15)] hover:border-emerald-500/60'
                  : 'bg-white/85 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 shadow-[0_6px_24px_rgb(0,0,0,0.02)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.35)]'
              }`}
            >
              {/* Left Column: Brand Identity, Product Title & Minimalist Specs Line */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Brand & Status Strip (Ultra-Clean Single Row) */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <StoreBrandBadge vendor={vendor} size="sm" />

                  {isBest && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-400/30 tracking-tight transition-colors">
                      <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0" size={13} />
                      <span>#1 Lowest Verified Market Price</span>
                    </span>
                  )}

                  {!isBest && isExact && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-text-secondary border border-black/[0.06] dark:border-white/10">
                      100% Spec Match
                    </span>
                  )}

                  {!isBest && isVariant && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-text-secondary border border-black/[0.06] dark:border-white/10">
                      Variant ({row.similarity.finalScore}%)
                    </span>
                  )}

                  {!isBest && isTradeoff && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                      <FiAlertCircle size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Condition Tradeoff ({row.similarity.finalScore}%)</span>
                    </span>
                  )}
                </div>

                {/* Product Title Linked Directly to Store */}
                <a
                  href={row.candidate.raw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans font-semibold text-base sm:text-lg text-text-primary tracking-tight leading-snug hover:underline cursor-pointer transition-colors block mt-0.5"
                >
                  {row.candidate.normalizedTitle}
                </a>

                {/* Minimalist Specs Line (No Blocky Pill Clutter) */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mt-0.5">
                  <span className="font-medium text-text-muted">Verified Specs:</span>
                  <span className="text-text-primary">
                    Condition: <strong className="capitalize font-semibold">{condition}</strong>
                  </span>
                  {row.candidate.specs.color && (
                    <>
                      <span className="text-text-muted/40">•</span>
                      <span className="text-text-primary">
                        Color: <strong className="font-semibold">{row.candidate.specs.color}</strong>
                      </span>
                    </>
                  )}
                  {row.candidate.specs.storageOrSize && (
                    <>
                      <span className="text-text-muted/40">•</span>
                      <span className="text-text-primary">
                        Variant: <strong className="font-semibold">{row.candidate.specs.storageOrSize}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Consolidated Spec Deviations Callout (If Any) */}
                {row.gaps.specTradeoffs.length > 0 && (
                  <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-medium mt-1 w-fit">
                    <FiAlertCircle size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                      Deviations detected:{' '}
                      {row.gaps.specTradeoffs
                        .map((gap) => `${gap.attribute} (${String(gap.candidateValue)} vs ${String(gap.baselineValue)})`)
                        .join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Clean Valuation & Sleek Action Button */}
              <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 sm:gap-4 border-t lg:border-t-0 pt-3.5 lg:pt-0 border-black/[0.06] dark:border-white/10 shrink-0">
                <div className="text-left lg:text-right">
                  <div className="flex items-baseline gap-1 justify-start lg:justify-end">
                    <span className="font-serif text-2xl sm:text-3xl font-normal text-text-primary tracking-tight">
                      ₹{row.candidate.normalizedPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {row.candidate.raw.rawOriginalPrice && (
                    <span className="text-xs text-text-muted line-through block mt-0.5 font-sans">
                      MRP ₹{row.candidate.raw.rawOriginalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <a
                  href={row.candidate.raw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ease-out flex items-center justify-center gap-2 shadow-sm group-hover:scale-[1.02] active:scale-95 shrink-0 ${
                    isBest
                      ? 'bg-[#1A1918] dark:bg-white text-[#F9F8F6] dark:text-[#1A1918] hover:bg-black dark:hover:bg-white/90 hover:shadow-md'
                      : 'bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/10 dark:border-white/15 text-text-primary hover:border-black/25 dark:hover:border-white/25'
                  }`}
                >
                  <span>View Store</span>
                  <FiArrowUpRight size={15} className="opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
