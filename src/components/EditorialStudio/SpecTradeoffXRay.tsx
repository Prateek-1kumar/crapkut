'use client';

import type { ComparisonMatrixRow } from '@/lib/engine/types';
import { useState } from 'react';
import StoreBrandBadge from './StoreBrandBadge';
import { FiChevronDown, FiChevronUp, FiLayers } from 'react-icons/fi';

interface SpecTradeoffXRayProps {
  matrix: ComparisonMatrixRow[];
}

export default function SpecTradeoffXRay({ matrix }: SpecTradeoffXRayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (matrix.length < 2) return null;

  const topListings = matrix.slice(0, 4);

  return (
    <section className="my-10 animate-fade-in">
      <div className="backdrop-blur-3xl bg-white/85 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm transition-all duration-500 hover:border-black/15 dark:hover:border-white/15">
        {/* Header Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 sm:px-8 py-6 flex items-center justify-between gap-5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-text-primary shrink-0">
              <FiLayers size={18} />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-text-primary tracking-tight">
                Side-by-Side Specification & Tradeoff X-Ray
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 font-normal leading-relaxed">
                Inspect condition, warranty status, and exact attribute deviations across the top {topListings.length} marketplace options.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-xs font-semibold text-text-primary hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors shrink-0">
            <span>{isExpanded ? 'Hide X-Ray' : 'Expand X-Ray'}</span>
            {isExpanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
          </div>
        </button>

        {/* Expandable Matrix Table */}
        {isExpanded && (
          <div className="border-t border-black/[0.06] dark:border-white/10 overflow-x-auto animate-fade-in">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="py-5 px-6 sm:px-8 w-52 text-text-muted font-sans">Specification Attribute</th>
                  {topListings.map((row, idx) => (
                    <th key={idx} className="py-5 px-6 sm:px-8 min-w-[220px]">
                      <div className="mb-2.5">
                        <StoreBrandBadge vendor={row.candidate.raw.vendor} size="sm" />
                      </div>
                      <div className="font-serif text-xl font-normal text-text-primary tracking-tight">
                        ₹{row.candidate.normalizedPrice.toLocaleString('en-IN')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 sm:px-8 font-medium text-text-secondary">Parity Classification</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-6 sm:px-8">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          row.candidate.classification === 'exact_match'
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {row.candidate.classification.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 sm:px-8 font-medium text-text-secondary">Parity Score</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-6 sm:px-8 font-mono font-medium text-text-primary">
                      {row.similarity.finalScore}% Match
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 sm:px-8 font-medium text-text-secondary">Listing Condition</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-6 sm:px-8">
                      <span
                        className={`capitalize font-semibold ${
                          row.candidate.specs.condition === 'new'
                            ? 'text-text-primary'
                            : 'text-amber-600 dark:text-amber-400 font-medium'
                        }`}
                      >
                        {row.candidate.specs.condition.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 sm:px-8 font-medium text-text-secondary">Manufacturer Warranty</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-6 sm:px-8">
                      <span
                        className={`font-semibold ${
                          row.candidate.specs.warrantyIncluded
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {row.candidate.specs.warrantyIncluded ? 'Yes — Verified' : 'No / Seller Only'}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 sm:px-8 font-medium text-text-secondary">Colorway</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-6 sm:px-8 text-text-primary">
                      {row.candidate.specs.color || <span className="text-text-muted italic">Unspecified</span>}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 sm:px-8 font-medium text-text-secondary">Size / Variant</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-6 sm:px-8 font-mono text-text-primary">
                      {row.candidate.specs.storageOrSize || <span className="text-text-muted italic">Base</span>}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 sm:px-8 font-medium text-text-secondary">Specification Gaps</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-6 sm:px-8">
                      {row.gaps.specTradeoffs.length === 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                          ✓ 100% Exact Match
                        </span>
                      ) : (
                        <ul className="space-y-1">
                          {row.gaps.specTradeoffs.map((gap, gIdx) => (
                            <li
                              key={gIdx}
                              className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 w-fit"
                            >
                              <strong>{gap.attribute}:</strong> {String(gap.candidateValue)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
