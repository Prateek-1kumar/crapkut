'use client';

import type { ComparisonMatrixRow } from '@/lib/engine/types';
import StoreBrandBadge from './StoreBrandBadge';
import { FiArrowUpRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface ParityDossierTableProps {
  matrix: ComparisonMatrixRow[];
  bestDealId?: string;
}

export default function ParityDossierTable({ matrix, bestDealId }: ParityDossierTableProps) {
  if (matrix.length === 0) return null;

  return (
    <section className="my-8 sm:my-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-black/[0.06] dark:border-white/10 pb-4 mb-6 gap-2 sm:gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-text-primary font-normal tracking-tight">
            Live Marketplace Feed & Valuation Matrix
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 font-normal">
            Real-time multi-store listings audited, normalized, and ranked by verified specification parity.
          </p>
        </div>
        <div className="text-[10px] sm:text-[11px] text-text-muted font-mono tracking-widest uppercase shrink-0">
          Ranked by Normalized Price (Low → High)
        </div>
      </div>

      {/* High-Density Pro Market Ledger Grid (2 or 3 Columns Edge-to-Edge) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
              className={`group relative backdrop-blur-3xl rounded-2xl p-4 sm:p-5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 flex flex-col justify-between gap-3 ${
                isBest
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-2 border-emerald-500/50 dark:border-emerald-400/40 shadow-[0_8px_30px_rgb(16,185,129,0.08)] dark:shadow-[0_12px_40px_rgb(16,185,129,0.18)]'
                  : 'bg-white/90 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-white/25 shadow-xs dark:shadow-[0_6px_25px_rgb(0,0,0,0.3)]'
              }`}
            >
              <div>
                {/* Top Row: Store Identity + Precision Status Ticker */}
                <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <StoreBrandBadge vendor={vendor} size="sm" />
                    <span className="font-mono text-[10px] uppercase text-text-muted font-medium tracking-wider truncate">
                      {vendor}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isBest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 tracking-tight">
                        <FiCheckCircle size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>#1 Best Valuation</span>
                      </span>
                    )}

                    {!isBest && isExact && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium uppercase bg-black/5 dark:bg-white/10 text-text-secondary">
                        ✓ 100% Exact Match
                      </span>
                    )}

                    {!isBest && isVariant && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium uppercase bg-black/5 dark:bg-white/10 text-text-secondary">
                        Variant ({row.similarity.finalScore}%)
                      </span>
                    )}

                    {!isBest && isTradeoff && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        <FiAlertCircle size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Spec Tradeoff ({row.similarity.finalScore}%)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Title Linked Directly to Store */}
                <a
                  href={row.candidate.raw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans font-semibold text-sm sm:text-base text-text-primary tracking-tight leading-snug hover:underline cursor-pointer transition-colors block mt-2.5 line-clamp-2"
                >
                  {row.candidate.normalizedTitle}
                </a>

                {/* High-Precision Specs Line */}
                <div className="font-mono text-[11px] text-text-secondary mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-text-primary font-semibold capitalize">[{condition}]</span>
                  {row.candidate.specs.color && (
                    <>
                      <span className="text-text-muted/40">·</span>
                      <span className="text-text-primary truncate max-w-[140px]">
                        Color: <strong className="font-medium">{row.candidate.specs.color}</strong>
                      </span>
                    </>
                  )}
                  {row.candidate.specs.storageOrSize && (
                    <>
                      <span className="text-text-muted/40">·</span>
                      <span className="text-text-primary">
                        Size: <strong className="font-medium">{row.candidate.specs.storageOrSize}</strong>
                      </span>
                    </>
                  )}
                  {row.candidate.specs.warrantyIncluded && (
                    <>
                      <span className="text-text-muted/40">·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">✓ Warranty</span>
                    </>
                  )}
                </div>

                {/* Consolidated Spec Deviations Callout (If Any) */}
                {row.gaps.specTradeoffs.length > 0 && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border-l-2 border-amber-500 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 font-mono leading-tight">
                    <span>
                      <strong>Gaps:</strong>{' '}
                      {row.gaps.specTradeoffs
                        .map((gap) => `${gap.attribute} (${String(gap.candidateValue)} vs ${String(gap.baselineValue)})`)
                        .join(' · ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Valuation & Action Footer Block */}
              <div className="border-t border-black/[0.06] dark:border-white/10 pt-3 mt-1 flex items-end justify-between gap-3">
                <div>
                  <div className="font-serif text-xl sm:text-2xl font-semibold text-text-primary tracking-tight leading-none">
                    ₹{row.candidate.normalizedPrice.toLocaleString('en-IN')}
                  </div>
                  {row.candidate.raw.rawOriginalPrice && (
                    <div className="text-[11px] font-mono text-text-muted line-through mt-1">
                      MRP ₹{row.candidate.raw.rawOriginalPrice.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                <a
                  href={row.candidate.raw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all duration-300 ease-out flex items-center gap-1.5 shrink-0 shadow-2xs hover:scale-105 active:scale-95 ${
                    isBest
                      ? 'bg-[#1A1918] dark:bg-white text-[#F9F8F6] dark:text-[#1A1918] hover:bg-black dark:hover:bg-white/90 shadow-sm'
                      : 'bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.15] text-text-primary border border-black/10 dark:border-white/15'
                  }`}
                >
                  <span>Open Store</span>
                  <FiArrowUpRight size={14} className="opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
