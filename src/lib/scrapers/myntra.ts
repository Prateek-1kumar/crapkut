import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Myntra Scraper (Fashion)
 */
export class MyntraScraper extends BaseScraper {
    vendor: Vendor = 'myntra';
    baseUrl = 'https://www.myntra.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query.replace(/\s+/g, '-'));
        return `${this.baseUrl}/${encodedQuery}`;
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
                discount?: string;
            }>[] = [];

            // Myntra product cards
            const cards = document.querySelectorAll('.product-base');

            cards.forEach((card) => {
                try {
                    // Brand + Title
                    const brandEl = card.querySelector('.product-brand');
                    const nameEl = card.querySelector('.product-product');
                    const brand = brandEl?.textContent?.trim() || '';
                    const name = nameEl?.textContent?.trim() || '';
                    const title = `${brand} ${name}`.trim();

                    // URL
                    const linkEl = card.closest('a') as HTMLAnchorElement;
                    let url = linkEl?.href || '';
                    if (url && !url.startsWith('http')) {
                        url = 'https://www.myntra.com' + url;
                    }

                    // Price
                    const priceEl = card.querySelector('.product-discountedPrice') ||
                        card.querySelector('.product-price');
                    const priceText = priceEl?.textContent?.replace(/[₹Rs.,\s]/g, '') || '';
                    const price = parseInt(priceText);

                    // Original price
                    const originalPriceEl = card.querySelector('.product-strike');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹Rs.,\s]/g, '') || '';
                    const originalPrice = originalPriceText ? parseInt(originalPriceText) : undefined;

                    // Image
                    const imgEl = card.querySelector('img.img-responsive') as HTMLImageElement;
                    const image = imgEl?.src || imgEl?.getAttribute('data-src') || undefined;

                    // Rating
                    const ratingEl = card.querySelector('.product-ratingsContainer span');
                    const ratingText = ratingEl?.textContent;
                    const rating = ratingText ? parseFloat(ratingText) : undefined;

                    // Discount badge
                    const discountEl = card.querySelector('.product-discountPercentage');
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
