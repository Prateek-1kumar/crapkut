'use client';

import { useState } from 'react';
import type { ExecutiveComparisonReport } from '@/lib/engine/types';
import IntelligenceHeader from '@/components/EditorialStudio/IntelligenceHeader';
import ExecutiveVerdictCard from '@/components/EditorialStudio/ExecutiveVerdictCard';
import ParityDossierTable from '@/components/EditorialStudio/ParityDossierTable';
import SpecTradeoffXRay from '@/components/EditorialStudio/SpecTradeoffXRay';
import Threads from '@/components/ui/Threads';
import { useTheme } from '@/components/ui/ThemeProvider';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function Home() {
  const { theme } = useTheme();
  const [report, setReport] = useState<ExecutiveComparisonReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleAnalyze = async (input: string, mode: 'auto' | 'query' | 'url') => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Step 1/3: Disconnecting noise & routing product identity across marketplaces...');

    try {
      // Simulate calm editorial progress updates while waiting for the stateless API
      const timer1 = setTimeout(() => {
        setStatusMessage('Step 2/3: Fetching store listings and analyzing structured metadata endpoints...');
      }, 1200);

      const timer2 = setTimeout(() => {
        setStatusMessage('Step 3/3: Neural verification engine normalizing spec parity & filtering accessory spam...');
      }, 2600);

      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          mode,
          options: {
            includeSpam: false,
            timeoutMs: 12000,
            maxCandidatesPerStore: 8,
          },
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize comparison dossier.');
      }

      setReport(data as ExecutiveComparisonReport);
    } catch (err) {
      console.error('[Page] Analysis failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while evaluating store listings.'
      );
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    setReport(null);
    setErrorMessage(null);
  };

  const hasActiveState = Boolean(report || isLoading || errorMessage);

  return (
    <main className="min-h-screen flex flex-col justify-between bg-canvas text-text-primary relative overflow-hidden transition-colors duration-500">
      {/* Interactive WebGL Threads Background - Dynamic Dark & Light Mode Colors */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${theme === 'dark' ? 'opacity-75' : 'opacity-45'}`}>
        <Threads
          color={theme === 'dark' ? [0.95, 0.95, 0.96] : [0.18, 0.17, 0.16]}
          amplitude={1.8}
          distance={0.3}
          enableMouseInteraction={true}
        />
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        {/* Dynamic Header: Centered & Heroic initially, Sticky Top bar when analyzing/viewing dossier */}
        <IntelligenceHeader
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          statusMessage={statusMessage}
          isCompact={hasActiveState}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-10 pb-16 w-full">
          {/* Error Banner */}
          {errorMessage && (
            <div className="my-8 p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex items-start gap-4 shadow-sm animate-fade-in">
              <FiAlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={22} />
              <div className="flex-1">
                <h3 className="font-serif text-xl font-normal">Evaluation Interrupted</h3>
                <p className="text-sm mt-1 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 rounded-full bg-amber-900 text-[#F9F8F6] text-xs font-semibold hover:bg-black transition-all duration-300 cursor-pointer shadow-2xs"
              >
                Reset
              </button>
            </div>
          )}

          {/* Active Dossier State */}
          {report && !isLoading && (
            <div className="animate-fade-in mt-4 sm:mt-6">
              <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/10 text-xs text-text-secondary gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span>
                    Showing verified parity dossier for: <strong className="text-text-primary font-semibold text-sm">&ldquo;{report.targetInput}&rdquo;</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-black/10 dark:border-white/12 text-text-primary font-medium transition-all duration-300 cursor-pointer shadow-2xs"
                >
                  <FiRefreshCw size={13} className="text-text-secondary" />
                  <span>New Research Dossier</span>
                </button>
              </div>

              {/* 1. Executive Verdict Card */}
              <ExecutiveVerdictCard report={report} />

              {/* 2. Parity-Graded Store Comparison Dossier */}
              <ParityDossierTable
                matrix={report.matrix}
                bestDealId={report.bestDeal?.candidate.raw.id}
              />

              {/* 3. Side-by-Side Spec X-Ray */}
              <SpecTradeoffXRay matrix={report.matrix} />
            </div>
          )}
        </div>
      </div>

      {/* Architectural Studio Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/10 bg-surface/50 dark:bg-surface/30 backdrop-blur-md py-6 px-4 sm:px-8 md:px-10 mt-auto shrink-0 transition-colors duration-500 z-20 relative">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2 font-serif text-sm text-text-primary">
            <span>Price Intelligence Dossier</span>
            <span>•</span>
            <span className="font-sans font-normal text-text-secondary">Universal Parity Studio</span>
          </div>
          <div>
            Powered by Universal Link Discovery & Neural Parity Verification
          </div>
        </div>
      </footer>
    </main>
  );
}
