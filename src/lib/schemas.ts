import { z } from 'zod';

/**
 * Zod schemas for runtime validation of scraped data
 */

export const VendorSchema = z.enum([
    'amazon',
    'flipkart',
    'ebay',
    'snapdeal',
    'meesho',
    'jiomart',
    'croma',
    'reliance-digital',
    'vijay-sales',
    'myntra',
    'ajio',
    'tatacliq',
    'nykaa',
    'aliexpress',
]);

export const ScrapeResultSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    currency: z.string().default('INR'),
    vendor: VendorSchema,
    url: z.string().url(),
    image: z.string().url().optional(),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.number().int().min(0).optional(),
    discount: z.string().optional(),
    inStock: z.boolean().optional(),
});

export const SearchRequestSchema = z.object({
    query: z.string().min(1).max(200),
    vendors: z.array(VendorSchema).optional(),
    maxResultsPerVendor: z.number().int().min(1).max(50).optional(),
    timeout: z.number().int().min(5000).max(60000).optional(),
});

export const VendorErrorSchema = z.object({
    vendor: VendorSchema,
    message: z.string(),
    code: z.string().optional(),
});

export const VendorTimingSchema = z.object({
    vendor: VendorSchema,
    durationMs: z.number(),
    resultCount: z.number().int(),
});

export const SearchResponseSchema = z.object({
    success: z.boolean(),
    query: z.string(),
    totalResults: z.number().int(),
    results: z.array(ScrapeResultSchema),
    errors: z.array(VendorErrorSchema),
    timing: z.object({
        totalMs: z.number(),
        perVendor: z.array(VendorTimingSchema),
    }),
    cached: z.boolean(),
    timestamp: z.string().datetime(),
});

// Type exports derived from schemas
export type ValidatedScrapeResult = z.infer<typeof ScrapeResultSchema>;
export type ValidatedSearchRequest = z.infer<typeof SearchRequestSchema>;
export type ValidatedSearchResponse = z.infer<typeof SearchResponseSchema>;

/**
 * Helper to safely parse scraped data
 */
export function validateScrapeResult(data: unknown): ValidatedScrapeResult | null {
    const result = ScrapeResultSchema.safeParse(data);
    return result.success ? result.data : null;
}

/**
 * Helper to validate search query
 */
export function validateSearchRequest(data: unknown): ValidatedSearchRequest | null {
    const result = SearchRequestSchema.safeParse(data);
    return result.success ? result.data : null;
}
