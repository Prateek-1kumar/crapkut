'use client';

import { useState } from 'react';
import type { ExecutiveComparisonReport } from '@/lib/engine/types';
import IntelligenceHeader from '@/components/EditorialStudio/IntelligenceHeader';
import ExecutiveVerdictCard from '@/components/EditorialStudio/ExecutiveVerdictCard';
import ParityDossierTable from '@/components/EditorialStudio/ParityDossierTable';
import SpecTradeoffXRay from '@/components/EditorialStudio/SpecTradeoffXRay';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function Home() {
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
        setStatusMessage('Step 3/3: Groq LLM normalizing spec parity & filtering accessory spam...');
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
    <main className="min-h-screen flex flex-col justify-between bg-canvas text-text-primary">
      <div className="flex-1 flex flex-col">
        {/* Dynamic Header: Centered & Heroic initially, Sticky Top bar when analyzing/viewing dossier */}
        <IntelligenceHeader
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          statusMessage={statusMessage}
          isCompact={hasActiveState}
        />

        <div className="max-w-5xl mx-auto px-6 sm:px-12 pb-16 w-full">
          {/* Error Banner */}
          {errorMessage && (
            <div className="my-8 p-6 rounded-2xl bg-warning-bg border border-warning/30 text-warning flex items-start gap-4">
              <FiAlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-serif text-lg font-medium">Evaluation Interrupted</h3>
                <p className="text-sm mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-1.5 rounded-lg bg-warning text-surface-elevated text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* Active Dossier State */}
          {report && !isLoading && (
            <div className="animate-fade-in mt-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs text-text-secondary">
                <span>
                  Showing verified parity dossier for: <strong className="text-text-primary">&ldquo;{report.targetInput}&rdquo;</strong>
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-text-primary hover:text-accent font-medium transition-colors cursor-pointer"
                >
                  <FiRefreshCw size={12} />
                  New Research Dossier
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
      <footer className="border-t border-border-subtle bg-surface/50 py-6 px-6 sm:px-12 mt-auto shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2 font-serif text-sm text-text-primary">
            <span>Price Intelligence Dossier</span>
            <span>•</span>
            <span className="font-sans font-normal text-text-secondary">Universal Parity Studio</span>
          </div>
          <div>
            Powered by Universal Link Discovery & Groq LLM Parity Verification
          </div>
        </div>
      </footer>
    </main>
  );
}
