import { Page } from 'puppeteer-core';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Ajio Scraper (Fashion)
 */
export class AjioScraper extends BaseScraper {
    vendor: Vendor = 'ajio';
    baseUrl = 'https://www.ajio.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/search/?text=${encodedQuery}`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        // Wait for products
        await page.waitForSelector('.item', { timeout: 10000 }).catch(() => { });

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                originalPrice?: number;
                url: string;
                image?: string;
                discount?: string;
            }>[] = [];

            const cards = document.querySelectorAll('.item.rilrtl-products-list__item');

            cards.forEach((card) => {
                try {
                    // Brand + Name
                    const brandEl = card.querySelector('.brand');
                    const nameEl = card.querySelector('.name');
                    const brand = brandEl?.textContent?.trim() || '';
                    const name = nameEl?.textContent?.trim() || '';
                    const title = `${brand} ${name}`.trim();

                    // URL
                    const linkEl = card.querySelector('a') as HTMLAnchorElement;
                    let url = linkEl?.href || '';
                    if (url && !url.startsWith('http')) {
                        url = 'https://www.ajio.com' + url;
                    }

                    // Price
                    const priceEl = card.querySelector('.price strong');
                    const priceText = priceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const price = parseInt(priceText);

                    // Original price
                    const originalPriceEl = card.querySelector('.orginal-price');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const originalPrice = originalPriceText ? parseInt(originalPriceText) : undefined;

                    // Image
                    const imgEl = card.querySelector('img.rilrtl-lazy-img') as HTMLImageElement;
                    const image = imgEl?.src || imgEl?.getAttribute('data-src') || undefined;

                    // Discount
                    const discountEl = card.querySelector('.discount');
                    const discount = discountEl?.textContent?.trim();

                    if (title && price > 0 && url) {
                        products.push({
                            title,
                            price,
                            originalPrice,
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
