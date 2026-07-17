import type { ComparisonMatrixRow, CompetitorGap, EvaluatedCandidate, SimilarityEvaluation } from './types';

/**
 * Weighted Similarity & Spec Parity Scorer.
 * Evaluates candidate listings against baseline/reference query to generate precise comparison matrix rows.
 */
export function scoreSimilarityAndGaps(
  baselineQuery: string,
  candidates: EvaluatedCandidate[],
  referenceCandidate?: EvaluatedCandidate
): ComparisonMatrixRow[] {
  if (candidates.length === 0) return [];

  // Determine baseline price (from reference candidate or median/lowest of exact matches)
  const exactMatches = candidates.filter((c) => c.classification === 'exact_match');
  const baselinePrice =
    referenceCandidate?.normalizedPrice ||
    (exactMatches.length > 0
      ? Math.min(...exactMatches.map((c) => c.normalizedPrice))
      : Math.min(...candidates.map((c) => c.normalizedPrice)));

  const baselineSpecs = referenceCandidate?.specs || {
    brand: extractBaseBrand(baselineQuery),
    modelNumber: null,
    color: null,
    storageOrSize: null,
    condition: 'new' as const,
    warrantyIncluded: true,
    keyFeatures: {},
  };

  return candidates.map((candidate) => {
    const similarity = evaluateCandidateSimilarity(baselineQuery, baselineSpecs, candidate);
    const gaps = computeCompetitorGaps(baselinePrice, baselineSpecs, candidate);

    return {
      candidate,
      similarity,
      gaps,
    };
  });
}

function evaluateCandidateSimilarity(
  query: string,
  baselineSpecs: EvaluatedCandidate['specs'],
  candidate: EvaluatedCandidate
): SimilarityEvaluation {
  const breakdown: Record<string, { score: number; weight: number }> = {};
  const penalties: string[] = [];

  // Title similarity (Weight 25%)
  const titleWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const candWords = new Set(
    candidate.normalizedTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  const matchedTitleWords = titleWords.filter((w) => candWords.has(w));
  const titleScore =
    titleWords.length > 0
      ? Math.round((matchedTitleWords.length / titleWords.length) * 100)
      : 80;
  breakdown.title = { score: Math.min(100, titleScore), weight: 0.25 };

  // Brand match (Weight 20%)
  const candBrand = (candidate.specs.brand || '').toLowerCase();
  const baseBrand = (baselineSpecs.brand || '').toLowerCase();
  let brandScore = 70;
  if (baseBrand && candBrand && baseBrand !== 'generic' && candBrand !== 'generic') {
    brandScore = baseBrand === candBrand ? 100 : 20;
    if (baseBrand !== candBrand) penalties.push(`Brand mismatch: ${candidate.specs.brand} vs ${baselineSpecs.brand}`);
  } else if (titleWords.some((w) => candBrand.includes(w))) {
    brandScore = 100;
  }
  breakdown.brand = { score: brandScore, weight: 0.2 };

  // Attributes/Specs match (Weight 35%)
  let attrScore = 95;
  if (candidate.classification === 'variant_deal') {
    attrScore = 82;
    penalties.push('Variant deviation in color, storage, or bundled accessory');
  } else if (candidate.classification === 'spec_tradeoff') {
    attrScore = 65;
  }
  breakdown.attributes = { score: attrScore, weight: 0.35 };

  // Condition/Warranty match (Weight 20%)
  let conditionScore = 100;
  if (candidate.specs.condition !== 'new') {
    conditionScore = 50;
    penalties.push(`Condition is ${candidate.specs.condition.replace('_', ' ')} instead of new retail`);
  }
  if (candidate.specs.warrantyIncluded === false) {
    conditionScore -= 30;
    penalties.push('Manufacturer retail warranty not included or unverified');
  }
  breakdown.condition = { score: Math.max(0, conditionScore), weight: 0.2 };

  const weightedSum = Object.values(breakdown).reduce(
    (acc, item) => acc + item.score * item.weight,
    0
  );
  const finalScore = Math.round(weightedSum);

  return {
    finalScore,
    breakdown,
    penalties,
    explanation:
      penalties.length > 0
        ? `Parity score ${finalScore}% due to: ${penalties.join('; ')}`
        : `High spec parity (${finalScore}%) matching target requirements`,
  };
}

function computeCompetitorGaps(
  baselinePrice: number,
  baselineSpecs: EvaluatedCandidate['specs'],
  candidate: EvaluatedCandidate
): CompetitorGap {
  const priceDifferential = candidate.normalizedPrice - baselinePrice;
  const percentageDifference =
    baselinePrice > 0 ? Math.round((priceDifferential / baselinePrice) * 1000) / 10 : 0;

  const specTradeoffs: CompetitorGap['specTradeoffs'] = [];

  if (candidate.specs.condition !== baselineSpecs.condition) {
    specTradeoffs.push({
      attribute: 'Condition',
      baselineValue: baselineSpecs.condition,
      candidateValue: candidate.specs.condition,
    });
  }

  if (candidate.specs.warrantyIncluded !== baselineSpecs.warrantyIncluded) {
    specTradeoffs.push({
      attribute: 'Manufacturer Warranty',
      baselineValue: baselineSpecs.warrantyIncluded ?? true,
      candidateValue: candidate.specs.warrantyIncluded ?? false,
    });
  }

  if (candidate.specs.color && baselineSpecs.color && candidate.specs.color !== baselineSpecs.color) {
    specTradeoffs.push({
      attribute: 'Color Option',
      baselineValue: baselineSpecs.color,
      candidateValue: candidate.specs.color,
    });
  }

  if (candidate.specs.storageOrSize && baselineSpecs.storageOrSize && candidate.specs.storageOrSize !== baselineSpecs.storageOrSize) {
    specTradeoffs.push({
      attribute: 'Storage / Variant Size',
      baselineValue: baselineSpecs.storageOrSize,
      candidateValue: candidate.specs.storageOrSize,
    });
  }

  return {
    priceDifferential,
    percentageDifference,
    specTradeoffs,
  };
}

function extractBaseBrand(query: string): string {
  const brands = ['Apple', 'Sony', 'Samsung', 'Nike', 'Adidas', 'Dell', 'HP', 'Lenovo', 'Asus', 'Bose'];
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(query)) return b;
  }
  return 'Generic';
}
