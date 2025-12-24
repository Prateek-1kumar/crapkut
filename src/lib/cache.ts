import type { ScrapeResult, Vendor } from './types';

/**
 * Simple in-memory cache with TTL
 */
interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<ScrapeResult[]>>();
    private readonly defaultTTL = 60 * 1000; // 60 seconds

    /**
     * Generate cache key from query and vendors
     */
    private generateKey(query: string, vendors?: Vendor[]): string {
        const normalizedQuery = query.toLowerCase().trim();
        const vendorKey = vendors?.sort().join(',') || 'all';
        return `${normalizedQuery}:${vendorKey}`;
    }

    /**
     * Get cached results if not expired
     */
    get(query: string, vendors?: Vendor[]): ScrapeResult[] | null {
        const key = this.generateKey(query, vendors);
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Store results in cache
     */
    set(query: string, results: ScrapeResult[], vendors?: Vendor[], ttl?: number): void {
        const key = this.generateKey(query, vendors);
        this.cache.set(key, {
            data: results,
            expiresAt: Date.now() + (ttl || this.defaultTTL),
        });

        // Cleanup old entries periodically
        if (this.cache.size > 100) {
            this.cleanup();
        }
    }

    /**
     * Remove expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Singleton instance
export const searchCache = new MemoryCache();
