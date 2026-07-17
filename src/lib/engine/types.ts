import { z } from 'zod';

/**
 * Core stateless service types and schemas for the Price Intelligence & Comparison Engine.
 */

export const VendorSchema = z.enum([
  'amazon',
  'flipkart',
  'myntra',
  'croma',
  'nykaa',
  'tatacliq',
  'ebay',
]);

export type Vendor = z.infer<typeof VendorSchema>;

export const CategorySchema = z.enum([
  'electronics',
  'fashion',
  'beauty',
  'home_general',
]);

export type Category = z.infer<typeof CategorySchema>;

export const CompareRequestSchema = z.object({
  input: z.string().min(1, 'Input must not be empty').max(500, 'Input too long'),
  mode: z.enum(['auto', 'query', 'url']).default('auto'),
  targetVendors: z.array(VendorSchema).optional(),
  options: z
    .object({
      maxCandidatesPerStore: z.number().int().min(1).max(20).default(8),
      timeoutMs: z.number().int().min(3000).max(30000).default(12000),
      includeSpam: z.boolean().default(false),
    })
    .default({
      maxCandidatesPerStore: 8,
      timeoutMs: 12000,
      includeSpam: false,
    }),
});

export type CompareRequest = z.infer<typeof CompareRequestSchema>;

export interface RoutedPlan {
  category: Category;
  confidence: number;
  targetVendors: Vendor[];
  searchKeywords: string;
  isDirectUrl: boolean;
  sourceDomain?: string;
  routingReason: string;
}

export type ExtractionTier = 'static_html' | 'jsonld_microdata' | 'playwright_browser';

export interface RawCandidate {
  id: string;
  vendor: Vendor;
  url: string;
  rawTitle: string;
  rawPrice: number;
  rawOriginalPrice?: number;
  rawImage?: string;
  rawRating?: number;
  rawReviewsCount?: number;
  sourceTier: ExtractionTier;
  rawMetadata?: Record<string, unknown>;
}

export type ParityClassification =
  | 'exact_match'
  | 'variant_deal'
  | 'spec_tradeoff'
  | 'accessory_spam'
  | 'mismatch';

export interface NormalizedSpecSet {
  brand: string;
  modelNumber: string | null;
  color: string | null;
  storageOrSize: string | null;
  condition: 'new' | 'refurbished' | 'open_box' | 'unknown';
  warrantyIncluded: boolean | null;
  keyFeatures: Record<string, string | number | boolean>;
}

export interface EvaluatedCandidate {
  raw: RawCandidate;
  classification: ParityClassification;
  confidenceScore: number;
  normalizedTitle: string;
  normalizedPrice: number;
  normalizedCurrency: string;
  specs: NormalizedSpecSet;
  classificationReason: string;
}

export interface SimilarityBreakdownItem {
  score: number;
  weight: number;
}

export interface SimilarityEvaluation {
  finalScore: number;
  breakdown: Record<string, SimilarityBreakdownItem>;
  penalties: string[];
  explanation: string;
}

export interface CompetitorGap {
  priceDifferential: number; // candidatePrice - baselinePrice
  percentageDifference: number;
  specTradeoffs: Array<{
    attribute: string;
    baselineValue: string | number | boolean | null;
    candidateValue: string | number | boolean | null;
  }>;
}

export interface ComparisonMatrixRow {
  candidate: EvaluatedCandidate;
  similarity: SimilarityEvaluation;
  gaps: CompetitorGap;
}

export interface ExecutionTimingMs {
  router: number;
  fetchers: number;
  groqExtractor: number;
  similarityScorer: number;
  synthesis: number;
  total: number;
}

export interface ExecutiveComparisonReport {
  success: boolean;
  targetInput: string;
  routedPlan: RoutedPlan;
  totalRawCandidatesFound: number;
  totalVerifiedMatches: number;
  bestDeal: ComparisonMatrixRow | null;
  matrix: ComparisonMatrixRow[];
  spamOrRejected: EvaluatedCandidate[];
  groqExecutiveVerdict: string;
  priceDistribution: {
    lowest: number;
    highest: number;
    average: number;
    currency: string;
  };
  executionTimingMs: ExecutionTimingMs;
  timestamp: string;
}
