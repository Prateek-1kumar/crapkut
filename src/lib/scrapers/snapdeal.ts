import { Page } from 'puppeteer-core';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Snapdeal Scraper - Updated for Puppeteer
 */
export class SnapdealScraper extends BaseScraper {
    vendor: Vendor = 'snapdeal';
    baseUrl = 'https://www.snapdeal.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/search?keyword=${encodedQuery}`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        try {
            await page.waitForSelector('.product-tuple-listing', { timeout: 10000 });
        } catch {
            console.log('[snapdeal] No product cards found');
        }

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                originalPrice?: number;
                url: string;
                image?: string;
                discount?: string;
            }>[] = [];

            const cards = document.querySelectorAll('.product-tuple-listing');

            cards.forEach((card) => {
                try {
                    const titleEl = card.querySelector('.product-title');
                    const title = titleEl?.textContent?.trim();

                    const linkEl = card.querySelector('a.dp-widget-link') as HTMLAnchorElement;
                    const url = linkEl?.href || '';

                    const priceEl = card.querySelector('.lfloat.product-price');
                    const priceText = priceEl?.textContent?.replace(/[₹,Rs.]/g, '') || '';
                    const price = parseFloat(priceText);

                    const originalPriceEl = card.querySelector('.lfloat.product-desc-price');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,Rs.]/g, '') || '';
                    const originalPrice = originalPriceText ? parseFloat(originalPriceText) : undefined;

                    const imgEl = card.querySelector('.product-image') as HTMLImageElement;
                    const image = imgEl?.src;

                    const discountEl = card.querySelector('.product-discount');
                    const discount = discountEl?.textContent?.trim();

                    if (title && price > 0 && url) {
                        products.push({ title, price, originalPrice, url, image, discount });
                    }
                } catch {
                    // Skip
                }
            });

            return products;
        });
    }
}
