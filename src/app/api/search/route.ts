import { NextRequest, NextResponse } from 'next/server';
import { getScrapers } from '@/lib/scrapers';
import { searchCache } from '@/lib/cache';
import { validateSearchRequest } from '@/lib/schemas';
import type { SearchResponse, ScrapeResult, VendorError, VendorTiming, Vendor } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for Vercel

/**
 * GET /api/search?q=...&vendors=amazon,flipkart
 * 
 * Search for products across multiple vendors in parallel
 */
export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get('q')?.trim();
    const vendorParam = searchParams.get('vendors');
    const vendors = vendorParam
        ? (vendorParam.split(',').filter(v => v) as Vendor[])
        : undefined;

    // Validate request
    const validation = validateSearchRequest({ query, vendors });
    if (!validation) {
        return NextResponse.json(
            {
                success: false,
                error: 'Invalid request. Please provide a search query.'
            },
            { status: 400 }
        );
    }

    // Check cache first
    const cachedResults = searchCache.get(query!, vendors);
    if (cachedResults) {
        const response: SearchResponse = {
            success: true,
            query: query!,
            totalResults: cachedResults.length,
            results: cachedResults,
            errors: [],
            timing: {
                totalMs: Date.now() - startTime,
                perVendor: [],
            },
            cached: true,
            timestamp: new Date().toISOString(),
        };
        return NextResponse.json(response);
    }

    // Get scrapers for requested vendors
    const scrapers = getScrapers(vendors);
    const errors: VendorError[] = [];
    const timings: VendorTiming[] = [];

    // Execute all scrapers in parallel with Promise.allSettled
    const scrapePromises = scrapers.map(async (scraper) => {
        const vendorStart = Date.now();
        try {
            const results = await scraper.scrape(query!);
            timings.push({
                vendor: scraper.vendor,
                durationMs: Date.now() - vendorStart,
                resultCount: results.length,
            });
            return results;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[${scraper.vendor}] Scrape failed:`, errorMessage);
            errors.push({
                vendor: scraper.vendor,
                message: errorMessage,
            });
            timings.push({
                vendor: scraper.vendor,
                durationMs: Date.now() - vendorStart,
                resultCount: 0,
            });
            return [] as ScrapeResult[];
        }
    });

    // Wait for all scrapers to complete
    const settledResults = await Promise.allSettled(scrapePromises);

    // Collect successful results
    const allResults: ScrapeResult[] = [];
    settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allResults.push(...result.value);
        } else {
            // Promise rejected (shouldn't happen with our try-catch, but just in case)
            const vendor = scrapers[index].vendor;
            if (!errors.find(e => e.vendor === vendor)) {
                errors.push({
                    vendor,
                    message: result.reason?.message || 'Unknown error',
                });
            }
        }
    });

    // Sort by price (ascending)
    allResults.sort((a, b) => a.price - b.price);

    // Cache the results
    if (allResults.length > 0) {
        searchCache.set(query!, allResults, vendors);
    }

    const response: SearchResponse = {
        success: allResults.length > 0 || errors.length < scrapers.length,
        query: query!,
        totalResults: allResults.length,
        results: allResults,
        errors,
        timing: {
            totalMs: Date.now() - startTime,
            perVendor: timings,
        },
        cached: false,
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
}
