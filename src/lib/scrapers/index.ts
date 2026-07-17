import { BaseScraper, type ScraperStrategy } from './base';
import type { Vendor, ScrapeResult } from '../types';
import { defaultVendors, vendorInfo } from '../vendors';
import { Page } from 'puppeteer-core';

/**
 * Generic Store Scraper - Lightweight fallback scraper implementation
 * for basic store search and extraction before full Groq/Playwright engine is active.
 */
export class GenericStoreScraper extends BaseScraper {
  vendor: Vendor;
  baseUrl: string;

  constructor(vendor: Vendor, baseUrl = 'https://www.google.com') {
    super();
    this.vendor = vendor;
    this.baseUrl = baseUrl;
  }

  buildSearchUrl(query: string): string {
    return `${this.baseUrl}/search?q=${encodeURIComponent(query + ' ' + this.vendor)}`;
  }

  async scrape(query: string): Promise<ScrapeResult[]> {
    return this.executeScrape(query);
  }

  async parseProducts(_page: Page): Promise<Partial<ScrapeResult>[]> {
    // Return clean empty/stub array cleanly while we transition to the new extraction logic
    return [];
  }
}

/**
 * Get scrapers for the specified vendors
 */
export function getScrapers(vendors?: Vendor[]): BaseScraper[] {
  const targetVendors = vendors && vendors.length > 0 ? vendors : defaultVendors;
  return targetVendors.map((vendor) => new GenericStoreScraper(vendor));
}

export type { ScraperStrategy, BaseScraper };
export { defaultVendors, vendorInfo };
