'use client';

import type { ComparisonMatrixRow } from '@/lib/engine/types';
import { useState } from 'react';
import StoreBrandBadge from './StoreBrandBadge';
import { FiChevronDown, FiChevronUp, FiLayers, FiArrowUpRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface SpecTradeoffXRayProps {
  matrix: ComparisonMatrixRow[];
}

export default function SpecTradeoffXRay({ matrix }: SpecTradeoffXRayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (matrix.length < 2) return null;

  const topListings = matrix.slice(0, 4);

  return (
    <section className="my-10 animate-fade-in">
      <div className="backdrop-blur-3xl bg-white/85 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm transition-all duration-500">
        {/* Header Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 sm:px-7 py-5 flex items-center justify-between gap-4 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-300 cursor-pointer border-b border-black/[0.06] dark:border-white/[0.08]"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-text-primary shrink-0">
              <FiLayers size={18} />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-text-primary tracking-tight">
                Modular Side-by-Side Spec & Parity X-Ray
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5 font-normal">
                Direct column-by-column hardware audit across the top {topListings.length} marketplace options (zero horizontal scroll).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-xs font-semibold text-text-primary hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors shrink-0">
            <span>{isExpanded ? 'Hide X-Ray' : 'Expand X-Ray'}</span>
            {isExpanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
          </div>
        </button>

        {/* Modular Side-by-Side Comparison Grid (Replaces old HTML table completely) */}
        {isExpanded && (
          <div className="p-4 sm:p-6 bg-black/[0.015] dark:bg-white/[0.015] animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topListings.map((row, idx) => {
                const isExact = row.candidate.classification === 'exact_match';
                const isTradeoff = row.candidate.classification === 'spec_tradeoff';
                const isVariant = row.candidate.classification === 'variant_deal';
                const isBest = idx === 0;

                const condition = row.candidate.specs.condition.replace('_', ' ');

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all duration-400 ${
                      isBest
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-500/50 dark:border-emerald-400/40 shadow-[0_8px_30px_rgb(16,185,129,0.08)]'
                        : 'bg-white/95 dark:bg-[#161615]/90 border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 shadow-2xs'
                    }`}
                  >
                    {/* Top Column Identity & Price */}
                    <div className="border-b border-black/5 dark:border-white/5 pb-3 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <StoreBrandBadge vendor={row.candidate.raw.vendor} size="sm" />
                        <span className="font-mono text-[10px] uppercase text-text-muted font-medium tracking-wider truncate">
                          {row.candidate.raw.vendor}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 pt-1">
                        <span className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-none">
                          ₹{row.candidate.normalizedPrice.toLocaleString('en-IN')}
                        </span>
                        {isBest ? (
                          <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                            ★ #1 Best Deal
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] font-medium text-text-secondary uppercase bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                            {isExact ? '100% Parity' : isVariant ? 'Variant' : isTradeoff ? 'Tradeoff' : 'Audited'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vertical Key-Value Spec Ledger */}
                    <div className="flex flex-col text-xs font-mono divide-y divide-black/5 dark:divide-white/5 flex-1">
                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-text-muted font-sans font-medium">Parity Score</span>
                        <span className="font-semibold text-text-primary">{row.similarity.finalScore}% Match</span>
                      </div>

                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-text-muted font-sans font-medium">Condition</span>
                        <span
                          className={`capitalize font-semibold ${
                            row.candidate.specs.condition === 'new'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {condition}
                        </span>
                      </div>

                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-text-muted font-sans font-medium">Warranty</span>
                        <span
                          className={`font-semibold ${
                            row.candidate.specs.warrantyIncluded
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {row.candidate.specs.warrantyIncluded ? '✓ Verified Included' : '⚠ No / Seller Only'}
                        </span>
                      </div>

                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-text-muted font-sans font-medium">Colorway</span>
                        <span className="text-text-primary truncate max-w-[130px]" title={row.candidate.specs.color ?? undefined}>
                          {row.candidate.specs.color || <span className="text-text-muted italic">Unspecified</span>}
                        </span>
                      </div>

                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="text-text-muted font-sans font-medium">Storage / Size</span>
                        <span className="text-text-primary truncate max-w-[130px]" title={row.candidate.specs.storageOrSize ?? undefined}>
                          {row.candidate.specs.storageOrSize || <span className="text-text-muted italic">Base</span>}
                        </span>
                      </div>

                      {/* Deviations Audit Box */}
                      <div className="pt-3 pb-1">
                        {row.gaps.specTradeoffs.length === 0 ? (
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-sans text-xs font-semibold flex items-center gap-1.5 justify-center">
                            <FiCheckCircle size={13} className="shrink-0" />
                            <span>Zero Deviations — Exact Match</span>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 font-mono text-[11px] leading-relaxed">
                            <div className="font-sans font-semibold text-xs flex items-center gap-1 mb-1 text-amber-800 dark:text-amber-300">
                              <FiAlertCircle size={13} className="shrink-0" />
                              <span>Audit Gaps Detected:</span>
                            </div>
                            {row.gaps.specTradeoffs.map((gap, gIdx) => (
                              <div key={gIdx} className="truncate">
                                · {gap.attribute}: <strong>{String(gap.candidateValue)}</strong> vs {String(gap.baselineValue)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Action Button */}
                    <a
                      href={row.candidate.raw.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 mt-2 ${
                        isBest
                          ? 'bg-[#1A1918] dark:bg-white text-[#F9F8F6] dark:text-[#1A1918] hover:bg-black dark:hover:bg-white/90 shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] text-text-primary border border-black/10 dark:border-white/15'
                      }`}
                    >
                      <span>Open Listing</span>
                      <FiArrowUpRight size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
