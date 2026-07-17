import Groq from 'groq-sdk';
import type { Category, RoutedPlan, Vendor } from './types';

const CATEGORY_VENDOR_MAP: Record<Category, Vendor[]> = {
  electronics: ['amazon', 'flipkart', 'croma', 'tatacliq', 'ebay'],
  fashion: ['myntra', 'amazon', 'flipkart', 'tatacliq'],
  beauty: ['nykaa', 'amazon', 'flipkart', 'myntra'],
  home_general: ['amazon', 'flipkart', 'tatacliq', 'ebay'],
};

/**
 * Smart Category & Store Router.
 * Determines product category, cleans search terms, and selects appropriate marketplaces.
 */
export async function routeInput(
  input: string,
  mode: 'auto' | 'query' | 'url' = 'auto',
  userRequestedVendors?: Vendor[]
): Promise<RoutedPlan> {
  const isUrl =
    mode === 'url' || (mode === 'auto' && /^https?:\/\//i.test(input.trim()));

  let searchKeywords = input.trim();
  let sourceDomain: string | undefined;

  if (isUrl) {
    try {
      const parsedUrl = new URL(input.trim());
      sourceDomain = parsedUrl.hostname.replace(/^www\./i, '');
      // Extract clean keywords from URL pathname
      const pathSegments = parsedUrl.pathname
        .split('/')
        .filter((s) => s.length > 2 && !['dp', 'p', 'product', 'item'].includes(s.toLowerCase()));

      if (pathSegments.length > 0) {
        // Take the longest segment or first meaningful one
        const longestSegment = pathSegments.reduce((a, b) => (a.length > b.length ? a : b));
        searchKeywords = longestSegment
          .replace(/[-_+/]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        searchKeywords = input.trim();
      }
    } catch {
      searchKeywords = input.trim();
    }
  }

  // Try Groq router if API key is present
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = `You are an e-commerce routing engine. Analyze the product query or URL keywords: "${searchKeywords}".
Return a JSON object matching exactly:
{
  "category": "electronics" | "fashion" | "beauty" | "home_general",
  "confidence": number between 0 and 100,
  "cleanKeywords": "standardized search query string without noise or stop words",
  "reason": "short explanation of classification"
}`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 250,
      });

      const rawContent = response.choices[0]?.message?.content;
      if (rawContent) {
        const parsed = JSON.parse(rawContent);
        const category: Category =
          ['electronics', 'fashion', 'beauty', 'home_general'].includes(parsed.category)
            ? (parsed.category as Category)
            : 'electronics';

        const targetVendors =
          userRequestedVendors && userRequestedVendors.length > 0
            ? userRequestedVendors
            : CATEGORY_VENDOR_MAP[category];

        return {
          category,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 90,
          targetVendors,
          searchKeywords: parsed.cleanKeywords || searchKeywords,
          isDirectUrl: isUrl,
          sourceDomain,
          routingReason: parsed.reason || `AI classified query into ${category}`,
        };
      }
    } catch (err) {
      console.warn('[Router] Groq classification failed, falling back to heuristic classification:', err);
    }
  }

  // Deterministic Fast-Path / Fallback Classification
  return heuristicRoute(searchKeywords, isUrl, sourceDomain, userRequestedVendors);
}

function heuristicRoute(
  keywords: string,
  isDirectUrl: boolean,
  sourceDomain?: string,
  userRequestedVendors?: Vendor[]
): RoutedPlan {
  const lower = keywords.toLowerCase();

  let category: Category = 'home_general';
  let reason = 'General merchandise query';

  if (
    /\b(phone|iphone|samsung|galaxy|sony|headphone|earbud|airpod|laptop|macbook|ipad|tablet|tv|monitor|camera|watch|gpu|rtx|playstation|xbox|nintendo|intel|amd)\b/i.test(
      lower
    )
  ) {
    category = 'electronics';
    reason = 'Matched electronics/gadget keyword heuristics';
  } else if (
    /\b(shirt|tshirt|jeans|dress|shoe|sneaker|nike|adidas|puma|kurta|saree|jacket|hoodie|trouser|handbag|watch)\b/i.test(
      lower
    )
  ) {
    category = 'fashion';
    reason = 'Matched fashion/apparel keyword heuristics';
  } else if (
    /\b(lipstick|serum|lotion|shampoo|perfume|cologne|makeup|moisturizer|sunscreen|mascara|eyeliner|foundation)\b/i.test(
      lower
    )
  ) {
    category = 'beauty';
    reason = 'Matched beauty/cosmetics keyword heuristics';
  }

  const targetVendors =
    userRequestedVendors && userRequestedVendors.length > 0
      ? userRequestedVendors
      : CATEGORY_VENDOR_MAP[category];

  return {
    category,
    confidence: 85,
    targetVendors,
    searchKeywords: keywords,
    isDirectUrl,
    sourceDomain,
    routingReason: reason,
  };
}
