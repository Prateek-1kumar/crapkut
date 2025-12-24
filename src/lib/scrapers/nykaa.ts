import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Nykaa Scraper (Beauty & Skincare)
 */
export class NykaaScraper extends BaseScraper {
    vendor: Vendor = 'nykaa';
    baseUrl = 'https://www.nykaa.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/search/result/?q=${encodedQuery}`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        // Wait for products
        await page.waitForSelector('.productWrapper', { timeout: 10000 }).catch(() => { });

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                originalPrice?: number;
                url: string;
                image?: string;
                rating?: number;
                discount?: string;
            }>[] = [];

            const cards = document.querySelectorAll('.productWrapper');

            cards.forEach((card) => {
                try {
                    // Title
                    const titleEl = card.querySelector('.css-xrzmfa') || card.querySelector('[class*="product-name"]');
                    const title = titleEl?.textContent?.trim();

                    // URL
                    const linkEl = card.querySelector('a') as HTMLAnchorElement;
                    let url = linkEl?.href || '';
                    if (url && !url.startsWith('http')) {
                        url = 'https://www.nykaa.com' + url;
                    }

                    // Price (discounted)
                    const priceEl = card.querySelector('.css-111z9ua') || card.querySelector('[class*="product-price"]');
                    const priceText = priceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const price = parseInt(priceText);

                    // Original price
                    const originalPriceEl = card.querySelector('.css-17x46n5') || card.querySelector('[class*="strike"]');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const originalPrice = originalPriceText ? parseInt(originalPriceText) : undefined;

                    // Image
                    const imgEl = card.querySelector('img') as HTMLImageElement;
                    const image = imgEl?.src || imgEl?.getAttribute('data-src') || undefined;

                    // Rating
                    const ratingEl = card.querySelector('[class*="rating"]');
                    const ratingText = ratingEl?.textContent?.match(/[\d.]+/)?.[0];
                    const rating = ratingText ? parseFloat(ratingText) : undefined;

                    // Discount
                    const discountEl = card.querySelector('[class*="discount"]');
                    const discount = discountEl?.textContent?.trim();

                    if (title && price > 0 && url) {
                        products.push({
                            title,
                            price,
                            originalPrice,
                            url,
                            image,
                            rating,
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
