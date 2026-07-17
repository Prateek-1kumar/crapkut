import { fetchCandidatesAcrossStores } from './fetcher';
import { extractAndVerifyCandidates } from './groq-extractor';
import { synthesizeComparisonReport } from './report';
import { routeInput } from './router';
import { scoreSimilarityAndGaps } from './similarity';
import {
  CompareRequestSchema,
  type CompareRequest,
  type ExecutiveComparisonReport,
} from './types';

/**
 * Universal Price Intelligence & Comparison Engine.
 * Stateless entry point executing category routing, multi-store fetching,
 * Groq AI spec normalization, parity scoring, and verdict generation.
 */
export async function runPriceIntelligenceEngine(
  rawInput: unknown
): Promise<ExecutiveComparisonReport> {
  const validated = CompareRequestSchema.parse(rawInput);
  const { input, mode, targetVendors, options } = validated;

  // 1. Smart Category & Store Routing
  const routerStart = Date.now();
  const routedPlan = await routeInput(input, mode, targetVendors);
  const routerTiming = Date.now() - routerStart;

  // 2. Parallel Multi-Store Fetching
  const fetchStart = Date.now();
  const rawCandidates = await fetchCandidatesAcrossStores(
    routedPlan.searchKeywords,
    routedPlan.targetVendors,
    options.maxCandidatesPerStore,
    options.timeoutMs
  );
  const fetchTiming = Date.now() - fetchStart;

  // 3. Groq AI Spec Extraction & Accessory Spam Verification
  const extractStart = Date.now();
  const { verified, rejected } = await extractAndVerifyCandidates(
    routedPlan.searchKeywords,
    rawCandidates,
    options.includeSpam
  );
  const extractTiming = Date.now() - extractStart;

  // 4. Weighted Similarity & Spec Parity Scoring
  const scoreStart = Date.now();
  // Find top exact match reference candidate if available
  const referenceCandidate = verified.find((c) => c.classification === 'exact_match');
  const matrixRows = scoreSimilarityAndGaps(
    routedPlan.searchKeywords,
    verified,
    referenceCandidate
  );
  const scoreTiming = Date.now() - scoreStart;

  // 5. Executive Report Synthesis & Verdict Generation
  const report = await synthesizeComparisonReport(
    input,
    routedPlan,
    rawCandidates.length,
    matrixRows,
    rejected,
    {
      router: routerTiming,
      fetchers: fetchTiming,
      groqExtractor: extractTiming,
      similarityScorer: scoreTiming,
    }
  );

  return report;
}

export * from './types';
export { routeInput } from './router';
export { fetchCandidatesAcrossStores } from './fetcher';
export { extractAndVerifyCandidates } from './groq-extractor';
export { scoreSimilarityAndGaps } from './similarity';
export { synthesizeComparisonReport } from './report';
