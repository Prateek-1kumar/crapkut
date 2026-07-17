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
      <div className="backdrop-blur-2xl bg-surface-elevated/75 border border-black/[0.06] rounded-3xl overflow-hidden shadow-[0_16px_50px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_60px_rgb(0,0,0,0.06)] hover:border-black/15">
        {/* Header Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-7 sm:px-9 py-6 flex items-center justify-between gap-5 text-left hover:bg-black/[0.02] transition-colors duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/80 border border-black/[0.06] shadow-2xs text-text-primary">
              <FiLayers size={20} className="text-text-primary" />
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
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] border border-black/[0.05] text-xs font-semibold text-text-primary hover:bg-black/[0.06] transition-colors">
            <span>{isExpanded ? 'Hide X-Ray Matrix' : 'Expand X-Ray Matrix'}</span>
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        </button>

        {/* Expandable Matrix Table */}
        {isExpanded && (
          <div className="border-t border-black/[0.06] overflow-x-auto animate-fade-in">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.05] bg-black/[0.015] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="py-5 px-7 w-52 text-text-muted">Specification Attribute</th>
                  {topListings.map((row, idx) => (
                    <th key={idx} className="py-5 px-7 min-w-[220px]">
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
              <tbody className="divide-y divide-black/[0.04]">
                <tr className="hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-7 font-medium text-text-secondary">Parity Classification</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-7">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          row.candidate.classification === 'exact_match'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {row.candidate.classification.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-7 font-medium text-text-secondary">Normalized Parity Score</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-7 font-mono font-medium text-text-primary">
                      {row.similarity.finalScore}% Parity
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-7 font-medium text-text-secondary">Listing Condition</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-7">
                      <span
                        className={`capitalize font-semibold ${
                          row.candidate.specs.condition === 'new'
                            ? 'text-text-primary'
                            : 'text-amber-800'
                        }`}
                      >
                        {row.candidate.specs.condition.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-7 font-medium text-text-secondary">Manufacturer Warranty</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-7">
                      {row.candidate.specs.warrantyIncluded ? (
                        <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          Included / Verified
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          Unverified / Seller Only
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-7 font-medium text-text-secondary">Brand & Colorway</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-7 text-text-primary font-medium">
                      {row.candidate.specs.brand} — {row.candidate.specs.color || 'Standard'}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-7 font-medium text-text-secondary">Variant / Fit / Size</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-7 text-text-primary font-medium">
                      {row.candidate.specs.storageOrSize || 'N/A'}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-7 font-medium text-text-secondary">Specification Tradeoffs</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-4 px-7 text-xs text-text-secondary leading-relaxed">
                      {row.gaps.specTradeoffs.length > 0
                        ? row.gaps.specTradeoffs
                            .map((t) => `${t.attribute}: ${t.candidateValue}`)
                            .join('; ')
                        : 'Exact target specification match'}
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
