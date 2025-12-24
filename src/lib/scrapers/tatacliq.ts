import { Page } from 'puppeteer-core';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Tata CLiQ Scraper (Fashion + Electronics)
 */
export class TataCliqScraper extends BaseScraper {
    vendor: Vendor = 'tatacliq';
    baseUrl = 'https://www.tatacliq.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/search/?searchCategory=all&text=${encodedQuery}`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        // Wait for products
        await page.waitForSelector('[class*="ProductModule"]', { timeout: 10000 }).catch(() => { });

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                originalPrice?: number;
                url: string;
                image?: string;
                discount?: string;
            }>[] = [];

            // TataCliq uses dynamically generated class names
            const cards = document.querySelectorAll('[class*="product-card"], [class*="ProductModule"]');

            cards.forEach((card) => {
                try {
                    // Brand + Name
                    const brandEl = card.querySelector('[class*="ProductBrand"], [class*="product-brand"]');
                    const nameEl = card.querySelector('[class*="ProductName"], [class*="product-name"]');
                    const brand = brandEl?.textContent?.trim() || '';
                    const name = nameEl?.textContent?.trim() || '';
                    const title = `${brand} ${name}`.trim();

                    // URL
                    const linkEl = card.querySelector('a') as HTMLAnchorElement;
                    let url = linkEl?.href || '';
                    if (url && !url.startsWith('http')) {
                        url = 'https://www.tatacliq.com' + url;
                    }

                    // Price
                    const priceEl = card.querySelector('[class*="Price"], [class*="price"]');
                    const priceText = priceEl?.textContent?.replace(/[₹,]/g, '').match(/\d+/)?.[0] || '';
                    const price = parseInt(priceText);

                    // Image
                    const imgEl = card.querySelector('img') as HTMLImageElement;
                    const image = imgEl?.src || imgEl?.getAttribute('data-src') || undefined;

                    // Discount
                    const discountEl = card.querySelector('[class*="Discount"], [class*="discount"]');
                    const discount = discountEl?.textContent?.trim();

                    if (title && price > 0 && url) {
                        products.push({
                            title,
                            price,
                            url,
                            image,
                            discount,
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
