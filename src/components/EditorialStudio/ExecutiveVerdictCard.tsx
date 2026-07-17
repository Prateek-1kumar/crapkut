'use client';

import type { ExecutiveComparisonReport } from '@/lib/engine/types';
import { FiCheckCircle, FiTrendingDown, FiShield } from 'react-icons/fi';

interface ExecutiveVerdictCardProps {
  report: ExecutiveComparisonReport;
}

export default function ExecutiveVerdictCard({ report }: ExecutiveVerdictCardProps) {
  const { bestDeal, groqExecutiveVerdict, priceDistribution, targetInput, totalVerifiedMatches } =
    report;

  if (!bestDeal) {
    return (
      <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-8 my-6 shadow-xs">
        <h3 className="font-serif text-xl text-text-primary mb-2">Dossier Note</h3>
        <p className="text-text-secondary text-sm">
          {groqExecutiveVerdict ||
            `No verified retail candidates matched exactly for "${targetInput}". Try refining the product name or using auto mode.`}
        </p>
      </div>
    );
  }

  const savingsAmount =
    priceDistribution.highest > bestDeal.candidate.normalizedPrice
      ? priceDistribution.highest - bestDeal.candidate.normalizedPrice
      : 0;

  const savingsPercent =
    priceDistribution.highest > 0 && savingsAmount > 0
      ? Math.round((savingsAmount / priceDistribution.highest) * 1000) / 10
      : 0;

  return (
    <section className="my-8">
      <div className="bg-surface-elevated border border-border-subtle rounded-2xl overflow-hidden shadow-xs transition-all hover:border-border-strong">
        {/* Top Architectural Metadata Strip */}
        <div className="bg-surface border-b border-border-subtle px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-success" size={15} />
            <span>
              Verified Parity Matrix —{' '}
              <strong className="text-text-primary">{totalVerifiedMatches} listings analyzed</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-text-muted">
            <span>
              Category: <strong className="text-text-primary uppercase">{report.routedPlan.category}</strong>
            </span>
            <span>•</span>
            <span className="font-mono">
              Engine Time: {(report.executionTimingMs.total / 1000).toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Main Editorial Body */}
        <div className="p-6 sm:p-10 flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          {/* Left: Target Query & AI Recommendation Quote */}
          <div className="flex-1 max-w-3xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <FiShield size={14} />
              <span>Executive Buying Recommendation</span>
            </div>
            
            <blockquote className="font-serif text-xl sm:text-2xl leading-relaxed text-text-primary font-normal italic">
              &ldquo;{groqExecutiveVerdict}&rdquo;
            </blockquote>

            {bestDeal.candidate.classificationReason && (
              <p className="text-sm text-text-secondary border-l-2 border-border-strong pl-4 mt-1">
                <span className="font-medium text-text-primary">Parity Note:</span>{' '}
                {bestDeal.candidate.classificationReason}
              </p>
            )}
          </div>

          {/* Right: Architectural Price Valuation Box */}
          <div className="bg-surface rounded-xl border border-border-subtle p-6 min-w-[280px] flex flex-col gap-4">
            <div>
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider block">
                Lowest Verified Valuation
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-3xl sm:text-4xl font-semibold text-text-primary">
                  ₹{bestDeal.candidate.normalizedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium uppercase text-text-muted">
                  @ {bestDeal.candidate.raw.vendor}
                </span>
              </div>
            </div>

            {savingsAmount > 0 && (
              <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-success font-medium">
                  <FiTrendingDown size={14} />
                  <span>Max Market Variance</span>
                </div>
                <span className="font-mono font-semibold text-success">
                  ₹{savingsAmount.toLocaleString('en-IN')} ({savingsPercent}%)
                </span>
              </div>
            )}

            <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-xs text-text-secondary">
              <span>Market Average:</span>
              <span className="font-mono text-text-primary font-medium">
                ₹{priceDistribution.average.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
