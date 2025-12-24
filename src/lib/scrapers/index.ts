/**
 * Scraper Registry - Central export for all vendor scrapers
 * NOTE: This module is server-only due to Playwright imports
 */

import { BaseScraper, ScraperStrategy } from './base';
import { AmazonScraper } from './amazon';
import { FlipkartScraper } from './flipkart';
import { EbayScraper } from './ebay';
import { MyntraScraper } from './myntra';
import { CromaScraper } from './croma';
import { AjioScraper } from './ajio';
import { SnapdealScraper } from './snapdeal';
import { TataCliqScraper } from './tatacliq';
import { NykaaScraper } from './nykaa';
import type { Vendor } from '../types';
import { defaultVendors, vendorInfo } from '../vendors';

/**
 * Map of vendor names to their scraper classes
 */
export const scraperRegistry: Record<Vendor, new () => BaseScraper> = {
    'amazon': AmazonScraper,
    'flipkart': FlipkartScraper,
    'ebay': EbayScraper,
    'myntra': MyntraScraper,
    'croma': CromaScraper,
    'ajio': AjioScraper,
    'snapdeal': SnapdealScraper,
    'tatacliq': TataCliqScraper,
    'nykaa': NykaaScraper,
    // Placeholder vendors (to be implemented)
    'meesho': AmazonScraper, // Fallback
    'jiomart': AmazonScraper, // Fallback
    'reliance-digital': CromaScraper, // Similar to Croma
    'vijay-sales': CromaScraper, // Similar to Croma
    'aliexpress': EbayScraper, // Similar to eBay
};

/**
 * Get scrapers for the specified vendors
 */
export function getScrapers(vendors?: Vendor[]): BaseScraper[] {
    const targetVendors = vendors && vendors.length > 0 ? vendors : defaultVendors;
    return targetVendors.map(vendor => new scraperRegistry[vendor]());
}

// Re-export types and vendor info
export type { ScraperStrategy, BaseScraper };
export { defaultVendors, vendorInfo };

