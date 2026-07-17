'use client';

import type { ComparisonMatrixRow, Vendor } from '@/lib/engine/types';
import { FiExternalLink, FiTag, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface ParityDossierTableProps {
  matrix: ComparisonMatrixRow[];
  bestDealId?: string;
}

const VENDOR_DISPLAY_MAP: Record<Vendor, { name: string; tag: string }> = {
  amazon: { name: 'Amazon India', tag: 'AMZN' },
  flipkart: { name: 'Flipkart', tag: 'FKRT' },
  myntra: { name: 'Myntra Fashion', tag: 'MYNT' },
  croma: { name: 'Croma Electronics', tag: 'CRMA' },
  nykaa: { name: 'Nykaa Beauty', tag: 'NYKA' },
  tatacliq: { name: 'Tata CLiQ Luxury', tag: 'TATA' },
  ebay: { name: 'eBay Global Marketplace', tag: 'EBAY' },
};

export default function ParityDossierTable({ matrix, bestDealId }: ParityDossierTableProps) {
  if (matrix.length === 0) return null;

  return (
    <section className="my-10">
      <div className="flex items-baseline justify-between border-b border-border-subtle pb-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-text-primary font-normal">
            Marketplace Valuation & Parity Matrix
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            All listings evaluated and normalized for specification deviations by Groq AI.
          </p>
        </div>
        <div className="text-xs text-text-muted font-mono hidden sm:block">
          Sorted by Normalized Price (Low → High)
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {matrix.map((row) => {
          const isBest = row.candidate.raw.id === bestDealId;
          const vendorInfo = VENDOR_DISPLAY_MAP[row.candidate.raw.vendor] || {
            name: row.candidate.raw.vendor,
            tag: row.candidate.raw.vendor.toUpperCase(),
          };

          const isExact = row.candidate.classification === 'exact_match';
          const isVariant = row.candidate.classification === 'variant_deal';
          const isTradeoff = row.candidate.classification === 'spec_tradeoff';

          return (
            <div
              key={row.candidate.raw.id}
              className={`bg-surface-elevated border rounded-2xl p-6 sm:p-8 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                isBest
                  ? 'border-text-primary shadow-sm bg-canvas'
                  : 'border-border-subtle hover:border-border-strong'
              }`}
            >
              {/* Left Column: Vendor Tag & Listing Identity */}
              <div className="flex-1 max-w-2xl flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-surface text-text-primary border border-border-subtle">
                    {vendorInfo.name}
                  </span>

                  {isBest && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-bg text-success border border-success/20">
                      <FiCheck size={13} />
                      Lowest Verified Market Price
                    </span>
                  )}

                  {isExact && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-bg text-success">
                      100% Spec Parity
                    </span>
                  )}
                  {isVariant && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-bg text-warning">
                      Variant Deal ({row.similarity.finalScore}%)
                    </span>
                  )}
                  {isTradeoff && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-bg text-warning flex items-center gap-1">
                      <FiAlertCircle size={12} />
                      Condition Tradeoff ({row.similarity.finalScore}%)
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-medium text-text-primary leading-snug">
                  {row.candidate.normalizedTitle}
                </h3>

                {/* Tradeoffs / Specs Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-secondary">
                  <span className="font-medium text-text-muted">Verified Specs:</span>
                  <span className="px-2 py-0.5 rounded bg-surface border border-border-subtle">
                    Condition: <strong className="text-text-primary capitalize">{row.candidate.specs.condition.replace('_', ' ')}</strong>
                  </span>
                  {row.candidate.specs.color && (
                    <span className="px-2 py-0.5 rounded bg-surface border border-border-subtle">
                      Color: <strong className="text-text-primary">{row.candidate.specs.color}</strong>
                    </span>
                  )}
                  {row.candidate.specs.storageOrSize && (
                    <span className="px-2 py-0.5 rounded bg-surface border border-border-subtle">
                      Variant: <strong className="text-text-primary">{row.candidate.specs.storageOrSize}</strong>
                    </span>
                  )}

                  {row.gaps.specTradeoffs.map((gap, gIdx) => (
                    <span
                      key={gIdx}
                      className="px-2 py-0.5 rounded bg-warning-bg text-warning font-medium flex items-center gap-1"
                    >
                      <FiTag size={11} />
                      {gap.attribute}: {String(gap.candidateValue)} vs {String(gap.baselineValue)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Architectural Valuation & Action Button */}
              <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-border-subtle">
                <div className="text-left lg:text-right">
                  <div className="flex items-baseline gap-1.5 justify-start lg:justify-end">
                    <span className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary">
                      ₹{row.candidate.normalizedPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {row.candidate.raw.rawOriginalPrice && (
                    <span className="text-xs text-text-muted line-through block mt-0.5">
                      MRP ₹{row.candidate.raw.rawOriginalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <a
                  href={row.candidate.raw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    isBest
                      ? 'bg-text-primary text-surface-elevated hover:bg-accent'
                      : 'bg-surface border border-border-subtle text-text-primary hover:border-border-strong'
                  }`}
                >
                  <span>Dossier Link</span>
                  <FiExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
