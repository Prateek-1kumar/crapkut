import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Amazon India Scraper
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

            // Amazon product cards
            const cards = document.querySelectorAll('[data-component-type="s-search-result"]');

            cards.forEach((card) => {
                try {
                    // Title
                    const titleEl = card.querySelector('h2 a span');
                    const title = titleEl?.textContent?.trim();

                    // URL
                    const linkEl = card.querySelector('h2 a') as HTMLAnchorElement;
                    const url = linkEl?.href;

                    // Price - whole and fraction
                    const priceWhole = card.querySelector('.a-price-whole')?.textContent?.replace(/[,\.]/g, '') || '';
                    const priceFraction = card.querySelector('.a-price-fraction')?.textContent || '00';
                    const price = parseFloat(`${priceWhole}.${priceFraction}`);

                    // Original price (if on sale)
                    const originalPriceEl = card.querySelector('.a-price.a-text-price .a-offscreen');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const originalPrice = originalPriceText ? parseFloat(originalPriceText) : undefined;

                    // Image
                    const imgEl = card.querySelector('.s-image') as HTMLImageElement;
                    const image = imgEl?.src;

                    // Rating
                    const ratingEl = card.querySelector('.a-icon-star-small .a-icon-alt');
                    const ratingText = ratingEl?.textContent?.match(/[\d.]+/)?.[0];
                    const rating = ratingText ? parseFloat(ratingText) : undefined;

                    // Reviews count
                    const reviewsEl = card.querySelector('[aria-label*="ratings"]') ||
                        card.querySelector('.a-size-base.s-underline-text');
                    const reviewsText = reviewsEl?.textContent?.replace(/[,]/g, '').match(/\d+/)?.[0];
                    const reviews = reviewsText ? parseInt(reviewsText) : undefined;

                    if (title && price > 0 && url) {
                        products.push({
                            title,
                            price,
                            originalPrice,
                            url,
                            image,
                            rating,
                            reviews,
                        });
                    }
                } catch {
                    // Skip malformed product cards
                }
            });

            return products;
        });
    }
}
