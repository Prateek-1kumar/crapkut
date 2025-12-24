import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Croma Scraper (Electronics)
 */
export class CromaScraper extends BaseScraper {
    vendor: Vendor = 'croma';
    baseUrl = 'https://www.croma.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/searchB?q=${encodedQuery}%3Arelevance`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        // Wait for products to load
        await page.waitForSelector('.product-item', { timeout: 10000 }).catch(() => { });

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                originalPrice?: number;
                url: string;
                image?: string;
                rating?: number;
            }>[] = [];

            const cards = document.querySelectorAll('.product-item');

            cards.forEach((card) => {
                try {
                    // Title
                    const titleEl = card.querySelector('.product-title');
                    const title = titleEl?.textContent?.trim();

                    // URL
                    const linkEl = card.querySelector('a') as HTMLAnchorElement;
                    let url = linkEl?.href || '';
                    if (url && !url.startsWith('http')) {
                        url = 'https://www.croma.com' + url;
                    }

                    // Price
                    const priceEl = card.querySelector('.amount');
                    const priceText = priceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const price = parseInt(priceText);

                    // Original price
                    const originalPriceEl = card.querySelector('.old-price .amount');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const originalPrice = originalPriceText ? parseInt(originalPriceText) : undefined;

                    // Image
                    const imgEl = card.querySelector('img') as HTMLImageElement;
                    const image = imgEl?.src || imgEl?.getAttribute('data-src') || undefined;

                    if (title && price > 0 && url) {
                        products.push({
                            title,
                            price,
                            originalPrice,
                            url,
                            image,
                        });
                    }
                } catch {
                    // Skip malformed cards
                }
            });

            return products;
        });
    }
}
