import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Snapdeal Scraper (Budget marketplace)
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
                    // Title
                    const titleEl = card.querySelector('.product-title');
                    const title = titleEl?.textContent?.trim();

                    // URL
                    const linkEl = card.querySelector('.dp-widget-link') as HTMLAnchorElement;
                    const url = linkEl?.href;

                    // Price
                    const priceEl = card.querySelector('.lfloat.product-price');
                    const priceText = priceEl?.textContent?.replace(/[₹Rs.,\s]/g, '') || '';
                    const price = parseInt(priceText);

                    // Original price
                    const originalPriceEl = card.querySelector('.lfloat.product-desc-price');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹Rs.,\s]/g, '') || '';
                    const originalPrice = originalPriceText ? parseInt(originalPriceText) : undefined;

                    // Image
                    const imgEl = card.querySelector('.product-image img') as HTMLImageElement;
                    const image = imgEl?.src || imgEl?.getAttribute('data-src') || undefined;

                    // Discount
                    const discountEl = card.querySelector('.product-discount');
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
