'use client';

import type { ComparisonMatrixRow } from '@/lib/engine/types';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiLayers } from 'react-icons/fi';

interface SpecTradeoffXRayProps {
  matrix: ComparisonMatrixRow[];
}

export default function SpecTradeoffXRay({ matrix }: SpecTradeoffXRayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (matrix.length < 2) return null;

  const topListings = matrix.slice(0, 4);

  return (
    <section className="my-10">
      <div className="bg-surface-elevated border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        {/* Header Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 sm:px-8 py-5 flex items-center justify-between gap-4 text-left hover:bg-surface transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface border border-border-subtle text-text-primary">
              <FiLayers size={18} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-normal text-text-primary">
                Side-by-Side Specification & Tradeoff X-Ray
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Inspect condition, warranty status, and exact attribute deviations across the top {topListings.length} stores.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <span>{isExpanded ? 'Hide X-Ray' : 'Expand X-Ray'}</span>
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        </button>

        {/* Expandable Matrix Table */}
        {isExpanded && (
          <div className="border-t border-border-subtle overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface/50 text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <th className="py-4 px-6 w-48">Specification</th>
                  {topListings.map((row, idx) => (
                    <th key={idx} className="py-4 px-6 min-w-[200px]">
                      <div className="font-semibold text-text-primary uppercase">
                        {row.candidate.raw.vendor}
                      </div>
                      <div className="font-serif text-lg font-normal text-text-primary mt-0.5">
                        ₹{row.candidate.normalizedPrice.toLocaleString('en-IN')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr>
                  <td className="py-3.5 px-6 font-medium text-text-secondary">Classification</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.candidate.classification === 'exact_match'
                            ? 'bg-success-bg text-success'
                            : 'bg-warning-bg text-warning'
                        }`}
                      >
                        {row.candidate.classification.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-text-secondary">Parity Score</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-3.5 px-6 font-mono font-medium text-text-primary">
                      {row.similarity.finalScore}% Parity
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-text-secondary">Condition</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-3.5 px-6">
                      <span
                        className={`capitalize font-medium ${
                          row.candidate.specs.condition === 'new'
                            ? 'text-text-primary'
                            : 'text-warning font-semibold'
                        }`}
                      >
                        {row.candidate.specs.condition.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-text-secondary">Manufacturer Warranty</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-3.5 px-6">
                      {row.candidate.specs.warrantyIncluded ? (
                        <span className="text-success font-medium">Included / Verified</span>
                      ) : (
                        <span className="text-warning font-medium">Unverified / Seller Only</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-text-secondary">Brand & Color</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-3.5 px-6 text-text-primary">
                      {row.candidate.specs.brand} — {row.candidate.specs.color || 'Standard'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-text-secondary">Storage / Size</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-3.5 px-6 text-text-primary">
                      {row.candidate.specs.storageOrSize || 'N/A'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-text-secondary">Tradeoff Summary</td>
                  {topListings.map((row, idx) => (
                    <td key={idx} className="py-3.5 px-6 text-xs text-text-secondary">
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
