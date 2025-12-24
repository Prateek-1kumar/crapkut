import { Page } from 'puppeteer-core';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Amazon India Scraper - Updated for Puppeteer
 */
export class AmazonScraper extends BaseScraper {
    vendor: Vendor = 'amazon';
    baseUrl = 'https://www.amazon.in';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/s?k=${encodedQuery}`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        try {
            await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });
        } catch {
            console.log('[amazon] No product cards found');
        }

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                originalPrice?: number;
                url: string;
                image?: string;
                rating?: number;
                reviews?: number;
            }>[] = [];

            const cards = document.querySelectorAll('[data-component-type="s-search-result"]');

            cards.forEach((card) => {
                try {
                    const titleEl = card.querySelector('h2 .a-text-normal') ||
                        card.querySelector('h2 a span');
                    const title = titleEl?.textContent?.trim();

                    const linkEl = (card.querySelector('a.a-link-normal.s-no-outline') ||
                        card.querySelector('h2 a')) as HTMLAnchorElement;
                    const url = linkEl?.href;

                    let price = 0;
                    const fullPriceEl = card.querySelector('.a-price .a-offscreen');
                    if (fullPriceEl) {
                        const fullPriceText = fullPriceEl.textContent?.replace(/[₹,]/g, '') || '';
                        price = parseFloat(fullPriceText);
                    } else {
                        const priceWhole = card.querySelector('.a-price-whole')?.textContent?.replace(/[,\.]/g, '') || '';
                        const priceFraction = card.querySelector('.a-price-fraction')?.textContent || '00';
                        price = parseFloat(`${priceWhole}.${priceFraction}`);
                    }

                    const originalPriceEl = card.querySelector('.a-price.a-text-price .a-offscreen');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const originalPrice = originalPriceText ? parseFloat(originalPriceText) : undefined;

                    const imgEl = card.querySelector('img.s-image') as HTMLImageElement;
                    const image = imgEl?.src;

                    const ratingEl = card.querySelector('.a-icon-alt');
                    const ratingText = ratingEl?.textContent?.match(/[\d.]+/)?.[0];
                    const rating = ratingText ? parseFloat(ratingText) : undefined;

                    if (title && price > 0 && url) {
                        products.push({ title, price, originalPrice, url, image, rating });
                    }
                } catch {
                    // Skip
                }
            });

            return products;
        });
    }
}
