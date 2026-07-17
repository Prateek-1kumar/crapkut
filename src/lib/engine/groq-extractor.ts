import Groq from 'groq-sdk';
import type { EvaluatedCandidate, ParityClassification, RawCandidate } from './types';

/**
 * Groq AI Extractor & Spam Verification Engine.
 * Evaluates raw candidate listings against target keywords/URL to normalize specs and filter accessory spam.
 */
export async function extractAndVerifyCandidates(
  targetQuery: string,
  rawCandidates: RawCandidate[],
  includeSpam = false
): Promise<{ verified: EvaluatedCandidate[]; rejected: EvaluatedCandidate[] }> {
  if (rawCandidates.length === 0) {
    return { verified: [], rejected: [] };
  }

  // If Groq API key is present, batch evaluate via Groq LLM
  if (process.env.GROQ_API_KEY) {
    try {
      return await batchEvaluateWithGroq(targetQuery, rawCandidates, includeSpam);
    } catch (err) {
      console.warn('[GroqExtractor] Groq evaluation failed, falling back to deterministic evaluator:', err);
    }
  }

  // Deterministic fallback evaluator
  return evaluateDeterministicBatch(targetQuery, rawCandidates, includeSpam);
}

async function batchEvaluateWithGroq(
  targetQuery: string,
  candidates: RawCandidate[],
  includeSpam: boolean
): Promise<{ verified: EvaluatedCandidate[]; rejected: EvaluatedCandidate[] }> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const batchSize = 10;
  const verified: EvaluatedCandidate[] = [];
  const rejected: EvaluatedCandidate[] = [];

  for (let i = 0; i < candidates.length; i += batchSize) {
    const chunk = candidates.slice(i, i + batchSize);
    const simplifiedList = chunk.map((c) => ({
      id: c.id,
      vendor: c.vendor,
      title: c.rawTitle,
      price: c.rawPrice,
    }));

    const prompt = `You are an expert e-commerce catalog taxonomist and parity verifier.
Target Reference Product / Query: "${targetQuery}"

Evaluate the following candidate product listings:
${JSON.stringify(simplifiedList, null, 2)}

For EACH item by ID, classify its parity against the Target Reference Product and normalize its specs.
Classifications:
- "exact_match": exact same model and core configuration.
- "variant_deal": same core model but different color, storage size, or bundled charger/accessory.
- "spec_tradeoff": same model but refurbished, open-box, or lacking official warranty.
- "accessory_spam": ear pads, cases, screen protectors, cables, replacement parts (REJECT).
- "mismatch": totally different model or brand (REJECT).

Return exactly valid JSON matching:
{
  "evaluations": [
    {
      "id": "item-id",
      "classification": "exact_match" | "variant_deal" | "spec_tradeoff" | "accessory_spam" | "mismatch",
      "confidenceScore": number between 0 and 100,
      "normalizedTitle": "Clean standardized product title without promotional spam",
      "specs": {
        "brand": "Brand name",
        "modelNumber": "Model number or null",
        "color": "Color or null",
        "storageOrSize": "Storage/size or null",
        "condition": "new" | "refurbished" | "open_box" | "unknown",
        "warrantyIncluded": true or false or null,
        "keyFeatures": { "feature1": "value1" }
      },
      "reason": "Short explanation of classification"
    }
  ]
}`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1800,
      });

      const rawJson = response.choices[0]?.message?.content;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        const evalsMap = new Map<string, any>();
        if (Array.isArray(parsed.evaluations)) {
          parsed.evaluations.forEach((item: any) => evalsMap.set(item.id, item));
        }

        for (const raw of chunk) {
          const evalItem = evalsMap.get(raw.id);
          if (evalItem) {
            const classification: ParityClassification = [
              'exact_match',
              'variant_deal',
              'spec_tradeoff',
              'accessory_spam',
              'mismatch',
            ].includes(evalItem.classification)
              ? evalItem.classification
              : 'exact_match';

            const evaluated: EvaluatedCandidate = {
              raw,
              classification,
              confidenceScore: typeof evalItem.confidenceScore === 'number' ? evalItem.confidenceScore : 90,
              normalizedTitle: evalItem.normalizedTitle || raw.rawTitle,
              normalizedPrice: raw.rawPrice,
              normalizedCurrency: 'INR',
              specs: {
                brand: evalItem.specs?.brand || 'Unknown',
                modelNumber: evalItem.specs?.modelNumber || null,
                color: evalItem.specs?.color || null,
                storageOrSize: evalItem.specs?.storageOrSize || null,
                condition: evalItem.specs?.condition || 'new',
                warrantyIncluded: evalItem.specs?.warrantyIncluded ?? true,
                keyFeatures: evalItem.specs?.keyFeatures || {},
              },
              classificationReason: evalItem.reason || 'Verified via Groq LLM',
            };

            if (
              classification === 'accessory_spam' ||
              classification === 'mismatch'
            ) {
              if (includeSpam) verified.push(evaluated);
              else rejected.push(evaluated);
            } else {
              verified.push(evaluated);
            }
          } else {
            // Fallback for missing ID in batch
            const det = evaluateSingleDeterministic(targetQuery, raw);
            if (det.classification === 'accessory_spam' || det.classification === 'mismatch') {
              if (includeSpam) verified.push(det);
              else rejected.push(det);
            } else {
              verified.push(det);
            }
          }
        }
      }
    } catch (batchErr) {
      console.warn('[GroqExtractor] Batch failed, falling back to deterministic:', batchErr);
      const detBatch = evaluateDeterministicBatch(targetQuery, chunk, includeSpam);
      verified.push(...detBatch.verified);
      rejected.push(...detBatch.rejected);
    }
  }

  return { verified, rejected };
}

function evaluateDeterministicBatch(
  targetQuery: string,
  candidates: RawCandidate[],
  includeSpam: boolean
): { verified: EvaluatedCandidate[]; rejected: EvaluatedCandidate[] } {
  const verified: EvaluatedCandidate[] = [];
  const rejected: EvaluatedCandidate[] = [];

  for (const raw of candidates) {
    const evaluated = evaluateSingleDeterministic(targetQuery, raw);
    if (
      evaluated.classification === 'accessory_spam' ||
      evaluated.classification === 'mismatch'
    ) {
      if (includeSpam) verified.push(evaluated);
      else rejected.push(evaluated);
    } else {
      verified.push(evaluated);
    }
  }

  return { verified, rejected };
}

function evaluateSingleDeterministic(targetQuery: string, raw: RawCandidate): EvaluatedCandidate {
  const lowerTitle = raw.rawTitle.toLowerCase();
  const lowerQuery = targetQuery.toLowerCase();

  let classification: ParityClassification = 'exact_match';
  let confidence = 92;
  let reason = 'Exact or close keyword match';
  let condition: 'new' | 'refurbished' | 'open_box' | 'unknown' = 'new';
  let warrantyIncluded: boolean | null = true;

  if (/\b(case|cover|cushion|earpad|cable|adapter|charger|protector|strap|band|replacement)\b/i.test(lowerTitle)) {
    // If target query itself wasn't searching for a case/charger
    if (!/\b(case|cover|cushion|earpad|cable|adapter|charger|protector|strap|band|replacement)\b/i.test(lowerQuery)) {
      classification = 'accessory_spam';
      confidence = 98;
      reason = 'Detected accessory/replacement keywords not present in reference query';
    }
  } else if (/\b(refurbished|renewed|open[\s-]box|used)\b/i.test(lowerTitle)) {
    classification = 'spec_tradeoff';
    confidence = 94;
    condition = 'refurbished';
    warrantyIncluded = false;
    reason = 'Listing specifies seller refurbished or open-box condition';
  } else if (/\b(silver|black|blue|white|gold|128gb|256gb|512gb|1tb)\b/i.test(lowerTitle)) {
    classification = 'variant_deal';
    confidence = 91;
    reason = 'Color or storage variant of reference model';
  }

  return {
    raw,
    classification,
    confidenceScore: confidence,
    normalizedTitle: raw.rawTitle.replace(/\s+/g, ' ').trim(),
    normalizedPrice: raw.rawPrice,
    normalizedCurrency: 'INR',
    specs: {
      brand: extractBrand(raw.rawTitle),
      modelNumber: null,
      color: extractColor(raw.rawTitle),
      storageOrSize: extractStorage(raw.rawTitle),
      condition,
      warrantyIncluded,
      keyFeatures: {},
    },
    classificationReason: reason,
  };
}

function extractBrand(title: string): string {
  const brands = ['Apple', 'Sony', 'Samsung', 'Nike', 'Adidas', 'Dell', 'HP', 'Lenovo', 'Asus', 'Bose', 'Sennheiser'];
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) return b;
  }
  return 'Generic';
}

function extractColor(title: string): string | null {
  const match = title.match(/\b(Black|Silver|White|Blue|Gold|Grey|Red|Green)\b/i);
  return match ? match[1] : null;
}

function extractStorage(title: string): string | null {
  const match = title.match(/\b(\d+(?:GB|TB|mm|cm|ml|L))\b/i);
  return match ? match[1].toUpperCase() : null;
}
