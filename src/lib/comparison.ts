import type { ScrapeResult } from './types';

/**
 * Group similar products together for comparison
 * Uses simple word matching to find similar products
 */
export function groupSimilarProducts(products: ScrapeResult[]): ProductGroup[] {
    if (products.length === 0) return [];

    const groups: ProductGroup[] = [];
    const used = new Set<string>();

    // Sort by title length (shorter titles are usually more generic)
    const sorted = [...products].sort((a, b) => a.title.length - b.title.length);

    for (const product of sorted) {
        if (used.has(product.id)) continue;

        // Find similar products
        const similar = products.filter(p => {
            if (used.has(p.id)) return false;
            if (p.id === product.id) return true;
            return isSimilar(product.title, p.title);
        });

        if (similar.length > 0) {
            // Sort by price within group
            similar.sort((a, b) => a.price - b.price);

            // Mark all as used
            similar.forEach(p => used.add(p.id));

            // Get unique vendors in this group
            const vendors = [...new Set(similar.map(p => p.vendor))];

            // Only create a group if we have products from multiple vendors
            // or if it's a standalone product
            groups.push({
                name: getGroupName(similar),
                products: similar,
                lowestPrice: similar[0].price,
                highestPrice: similar[similar.length - 1].price,
                vendorCount: vendors.length,
                savings: similar.length > 1
                    ? similar[similar.length - 1].price - similar[0].price
                    : 0,
            });
        }
    }

    // Sort groups by potential savings (groups with price differences first)
    return groups.sort((a, b) => {
        // Prioritize groups with multiple vendors
        if (a.vendorCount !== b.vendorCount) {
            return b.vendorCount - a.vendorCount;
        }
        // Then by savings potential
        return b.savings - a.savings;
    });
}

/**
 * Check if two product titles are similar
 */
function isSimilar(title1: string, title2: string): boolean {
    const words1 = extractKeywords(title1);
    const words2 = extractKeywords(title2);

    if (words1.length === 0 || words2.length === 0) return false;

    // Count matching words
    const matches = words1.filter(w => words2.includes(w));

    // Need at least 3 matching keywords or 50% match
    const minMatch = Math.min(3, Math.min(words1.length, words2.length));
    const matchRatio = matches.length / Math.min(words1.length, words2.length);

    return matches.length >= minMatch || matchRatio >= 0.5;
}

/**
 * Extract meaningful keywords from a product title
 */
function extractKeywords(title: string): string[] {
    // Common words to ignore
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'of',
        'new', 'latest', 'best', 'top', 'pack', 'set', 'combo', 'buy', 'get',
        'free', 'shipping', 'offer', 'deal', 'sale', 'discount', 'price',
        'men', 'women', 'mens', 'womens', 'unisex', 'kids', 'boys', 'girls',
        'size', 'color', 'colour', 'style', 'type', 'model', 'version',
        'original', 'genuine', 'authentic', 'official', 'branded',
    ]);

    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Generate a clean group name from products
 */
function getGroupName(products: ScrapeResult[]): string {
    // Use the shortest title as the group name (usually most generic)
    const shortest = products.reduce((a, b) =>
        a.title.length < b.title.length ? a : b
    );

    // Clean up the title
    let name = shortest.title
        .replace(/\s+/g, ' ')
        .trim();

    // Truncate if too long
    if (name.length > 80) {
        name = name.substring(0, 77) + '...';
    }

    return name;
}

export interface ProductGroup {
    name: string;
    products: ScrapeResult[];
    lowestPrice: number;
    highestPrice: number;
    vendorCount: number;
    savings: number;
}
