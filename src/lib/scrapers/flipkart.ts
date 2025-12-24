import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Flipkart Scraper
 */
export class FlipkartScraper extends BaseScraper {
    vendor: Vendor = 'flipkart';
    baseUrl = 'https://www.flipkart.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/search?q=${encodedQuery}`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        // Close login popup if it appears
        try {
            const closeBtn = page.locator('button._2KpZ6l._2doB4z');
            if (await closeBtn.isVisible({ timeout: 2000 })) {
                await closeBtn.click();
            }
        } catch {
            // No popup
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
                discount?: string;
            }>[] = [];

            // Flipkart uses different card layouts for different categories
            // Try multiple selectors
            const cardSelectors = [
                '._1AtVbE',
                '._4ddWXP',
                '[data-id]',
                '._2kHMtA',
                '._1xHGtK',
            ];

            for (const selector of cardSelectors) {
                const cards = document.querySelectorAll(selector);

                cards.forEach((card) => {
                    try {
                        // Title - multiple possible selectors
                        const titleEl = card.querySelector('._4rR01T') ||
                            card.querySelector('.s1Q9rs') ||
                            card.querySelector('a[title]') ||
                            card.querySelector('.IRpwTa');
                        const title = titleEl?.textContent?.trim() ||
                            (titleEl as HTMLElement)?.getAttribute('title');

                        // URL
                        const linkEl = card.querySelector('a._1fQZEK') ||
                            card.querySelector('a.s1Q9rs') ||
                            card.querySelector('a[href*="/p/"]') as HTMLAnchorElement;
                        let url = linkEl?.getAttribute('href') || '';
                        if (url && !url.startsWith('http')) {
                            url = 'https://www.flipkart.com' + url;
                        }

                        // Price
                        const priceEl = card.querySelector('._30jeq3') ||
                            card.querySelector('._1_WHN1');
                        const priceText = priceEl?.textContent?.replace(/[₹,]/g, '') || '';
                        const price = parseFloat(priceText);

                        // Original price
                        const originalPriceEl = card.querySelector('._3I9_wc');
                        const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,]/g, '') || '';
                        const originalPrice = originalPriceText ? parseFloat(originalPriceText) : undefined;

                        // Image
                        const imgEl = (card.querySelector('img._396cs4') ||
                            card.querySelector('img._2r_T1I')) as HTMLImageElement | null;
                        const image = imgEl?.src;

                        // Rating
                        const ratingEl = card.querySelector('._3LWZlK');
                        const ratingText = ratingEl?.textContent;
                        const rating = ratingText ? parseFloat(ratingText) : undefined;

                        // Discount
                        const discountEl = card.querySelector('._3Ay6Sb');
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

                // If we found products, don't try other selectors
                if (products.length > 0) break;
            }

            return products;
        });
    }
}
