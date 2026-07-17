'use client';

import type { ExecutiveComparisonReport } from '@/lib/engine/types';
import StoreBrandBadge from './StoreBrandBadge';
import { FiCheckCircle, FiTrendingDown, FiShield, FiArrowUpRight } from 'react-icons/fi';

interface ExecutiveVerdictCardProps {
  report: ExecutiveComparisonReport;
}

export default function ExecutiveVerdictCard({ report }: ExecutiveVerdictCardProps) {
  const { bestDeal, groqExecutiveVerdict, priceDistribution, targetInput, totalVerifiedMatches } =
    report;

  if (!bestDeal) {
    return (
      <div className="backdrop-blur-3xl bg-white/85 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 my-6 shadow-sm animate-fade-in">
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
      <div className="backdrop-blur-3xl bg-white/85 dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_12px_45px_rgb(0,0,0,0.03)] dark:shadow-[0_16px_50px_rgb(0,0,0,0.35)] transition-all duration-500 hover:border-black/15 dark:hover:border-white/15">
        {/* Top Architectural Metadata Strip */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.06] px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0" size={15} />
            <span>
              Verified Parity Matrix —{' '}
              <strong className="text-text-primary font-semibold">{totalVerifiedMatches} store listings analyzed</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-text-muted">
            <span>
              Category: <strong className="text-text-primary uppercase tracking-wider font-mono">{report.routedPlan.category}</strong>
            </span>
            <span>•</span>
            <span className="font-mono text-text-secondary">
              Engine Time: {(report.executionTimingMs.total / 1000).toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Main Executive Body - Clean, Modern & Spacious */}
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:items-center justify-between">
          {/* Left: Recommendation Summary */}
          <div className="flex-1 max-w-3xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              <FiShield size={14} className="shrink-0" />
              <span>Executive Buying Recommendation</span>
            </div>

            <p className="font-sans text-sm sm:text-base leading-relaxed text-text-primary/95 font-normal text-balance">
              {groqExecutiveVerdict}
            </p>

            {bestDeal.candidate.classificationReason && (
              <div className="text-xs text-text-secondary border-l-2 border-black/15 dark:border-white/20 pl-3.5 mt-1 leading-relaxed font-sans">
                <span className="font-semibold text-text-primary">Parity Verification:</span>{' '}
                {bestDeal.candidate.classificationReason}
              </div>
            )}
          </div>

          {/* Right: Valuation Bento Box */}
          <div className="backdrop-blur-xl bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.06] dark:border-white/10 p-5 sm:p-6 min-w-[280px] flex flex-col gap-3.5 shrink-0 transition-colors duration-500">
            <div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest block">
                #1 Verified Lowest Valuation
              </span>
              <div className="flex flex-wrap items-center justify-between gap-3 mt-1.5">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-text-primary tracking-tight">
                  ₹{bestDeal.candidate.normalizedPrice.toLocaleString('en-IN')}
                </span>
                <StoreBrandBadge vendor={bestDeal.candidate.raw.vendor} size="sm" />
              </div>
            </div>

            {savingsAmount > 0 && (
              <div className="border-t border-black/[0.06] dark:border-white/10 pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                  <FiTrendingDown size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Market Variance</span>
                </div>
                <span className="font-mono font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Save ₹{savingsAmount.toLocaleString('en-IN')} ({savingsPercent}%)
                </span>
              </div>
            )}

            <div className="border-t border-black/[0.06] dark:border-white/10 pt-3 flex items-center justify-between text-xs text-text-secondary">
              <span>Benchmark Average:</span>
              <span className="font-mono text-text-primary font-semibold">
                ₹{priceDistribution.average.toLocaleString('en-IN')}
              </span>
            </div>

            <a
              href={bestDeal.candidate.raw.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full py-2.5 px-4 rounded-full bg-[#1A1918] dark:bg-white text-[#F9F8F6] dark:text-[#1A1918] font-semibold text-xs sm:text-sm hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>View Best Deal Store</span>
              <FiArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
