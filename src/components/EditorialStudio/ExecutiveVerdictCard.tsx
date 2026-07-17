'use client';

import type { ExecutiveComparisonReport } from '@/lib/engine/types';
import StoreBrandBadge from './StoreBrandBadge';
import { FiCheckCircle, FiTrendingDown, FiShield } from 'react-icons/fi';

interface ExecutiveVerdictCardProps {
  report: ExecutiveComparisonReport;
}

export default function ExecutiveVerdictCard({ report }: ExecutiveVerdictCardProps) {
  const { bestDeal, groqExecutiveVerdict, priceDistribution, targetInput, totalVerifiedMatches } =
    report;

  if (!bestDeal) {
    return (
      <div className="backdrop-blur-xl bg-surface-elevated/80 border border-black/[0.06] rounded-3xl p-6 sm:p-8 my-6 shadow-xs animate-fade-in">
        <h3 className="font-serif text-xl text-text-primary mb-2 font-normal">Dossier Note</h3>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
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
    <section className="my-6 animate-fade-in">
      <div className="backdrop-blur-2xl bg-surface-elevated/80 border border-black/[0.06] rounded-3xl overflow-hidden shadow-[0_16px_50px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_60px_rgb(0,0,0,0.06)] hover:border-black/15">
        {/* Top Architectural Metadata Strip */}
        <div className="bg-black/[0.02] border-b border-black/[0.05] px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-emerald-600 shrink-0" size={15} />
            <span>
              Verified Parity Matrix —{' '}
              <strong className="text-text-primary font-semibold">{totalVerifiedMatches} store listings analyzed</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-text-muted">
            <span>
              Category: <strong className="text-text-primary uppercase tracking-wider">{report.routedPlan.category}</strong>
            </span>
            <span>•</span>
            <span className="font-mono text-text-secondary">
              Engine Time: {(report.executionTimingMs.total / 1000).toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Main Executive Body - Balanced, Compact & Sleek */}
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          {/* Left: AI Recommendation Analysis (Refined, Modern Font Size) */}
          <div className="flex-1 max-w-3xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-primary/70">
              <FiShield size={14} className="text-amber-600 shrink-0" />
              <span>Executive Buying Recommendation</span>
            </div>
            
            <p className="font-sans text-sm sm:text-base leading-relaxed text-text-primary/95 font-normal">
              {groqExecutiveVerdict}
            </p>

            {bestDeal.candidate.classificationReason && (
              <div className="text-xs sm:text-sm text-text-secondary border-l-2 border-black/15 pl-3.5 mt-1 leading-relaxed">
                <span className="font-semibold text-text-primary">Parity Verification:</span>{' '}
                {bestDeal.candidate.classificationReason}
              </div>
            )}
          </div>

          {/* Right: Architectural Price Valuation Box */}
          <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-black/[0.06] p-6 min-w-[280px] flex flex-col gap-3.5 shadow-xs shrink-0">
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Lowest Verified Valuation
              </span>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-text-primary tracking-tight">
                  ₹{bestDeal.candidate.normalizedPrice.toLocaleString('en-IN')}
                </span>
                <StoreBrandBadge vendor={bestDeal.candidate.raw.vendor} size="sm" />
              </div>
            </div>

            {savingsAmount > 0 && (
              <div className="border-t border-black/[0.06] pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <FiTrendingDown size={14} className="text-emerald-600" />
                  <span>Max Market Variance</span>
                </div>
                <span className="font-mono font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Save ₹{savingsAmount.toLocaleString('en-IN')} ({savingsPercent}%)
                </span>
              </div>
            )}

            <div className="border-t border-black/[0.06] pt-3 flex items-center justify-between text-xs text-text-secondary">
              <span>Market Benchmark Average:</span>
              <span className="font-mono text-text-primary font-semibold">
                ₹{priceDistribution.average.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
