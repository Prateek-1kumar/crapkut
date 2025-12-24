import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * eBay Scraper - Updated with verified selectors for both old and new layouts
 */
export class EbayScraper extends BaseScraper {
    vendor: Vendor = 'ebay';
    baseUrl = 'https://www.ebay.com';

    buildSearchUrl(query: string): string {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/sch/i.html?_nkw=${encodedQuery}`;
    }

    async scrape(query: string): Promise<ScrapeResult[]> {
        return this.executeScrape(query);
    }

    async parseProducts(page: Page): Promise<Partial<ScrapeResult>[]> {
        // Wait for either new card layout or old list layout
        try {
            await Promise.race([
                page.waitForSelector('.s-card', { timeout: 10000 }),
                page.waitForSelector('.s-item', { timeout: 10000 }),
            ]);
        } catch {
            console.log('[ebay] No product cards found after waiting');
        }

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                currency: string;
                url: string;
                image?: string;
            }>[] = [];

            // Try new card layout first (modern eBay)
            const cardLayout = document.querySelectorAll('li.s-card');

            if (cardLayout.length > 0) {
                cardLayout.forEach((card) => {
                    try {
                        // Title from card layout
                        const titleEl = card.querySelector('.s-card__title') ||
                            card.querySelector('a.s-card__link');
                        const title = titleEl?.textContent?.trim();

                        // URL from card layout
                        const linkEl = card.querySelector('a.s-card__link') as HTMLAnchorElement;
                        const url = linkEl?.href;

                        // Price from card layout - may be a range
                        const priceEl = card.querySelector('.s-card__price');
                        let priceText = priceEl?.textContent || '';

                        // Handle price ranges like "$179.00 to $409.00" - take the lower price
                        if (priceText.includes(' to ')) {
                            priceText = priceText.split(' to ')[0];
                        }

                        // Clean price text
                        const cleanPrice = priceText.replace(/[^0-9.]/g, '');
                        const price = parseFloat(cleanPrice);
                        const currency = priceText.includes('$') ? 'USD' :
                            priceText.includes('£') ? 'GBP' :
                                priceText.includes('€') ? 'EUR' : 'USD';

                        // Image from card layout
                        const imgEl = card.querySelector('img') as HTMLImageElement;
                        const image = imgEl?.src;

                        if (title && price > 0 && url) {
                            products.push({ title, price, currency, url, image });
                        }
                    } catch {
                        // Skip malformed cards
                    }
                });
            }

            // Fallback to old list layout (.s-item)
            if (products.length === 0) {
                const listLayout = document.querySelectorAll('.s-item');

                listLayout.forEach((item) => {
                    try {
                        // Skip the first one which is often a header
                        const titleEl = item.querySelector('.s-item__title');
                        if (!titleEl || titleEl.textContent?.includes('Shop on eBay')) return;

                        const title = titleEl.textContent?.trim();

                        // URL
                        const linkEl = item.querySelector('.s-item__link') as HTMLAnchorElement;
                        const url = linkEl?.href;

                        // Price
                        const priceEl = item.querySelector('.s-item__price');
                        let priceText = priceEl?.textContent || '';

                        // Handle price ranges
                        if (priceText.includes(' to ')) {
                            priceText = priceText.split(' to ')[0];
                        }

                        const cleanPrice = priceText.replace(/[^0-9.]/g, '');
                        const price = parseFloat(cleanPrice);
                        const currency = priceText.includes('$') ? 'USD' :
                            priceText.includes('£') ? 'GBP' :
                                priceText.includes('€') ? 'EUR' : 'USD';

                        // Image
                        const imgEl = item.querySelector('.s-item__image-img') as HTMLImageElement;
                        const image = imgEl?.src;

                        if (title && price > 0 && url) {
                            products.push({ title, price, currency, url, image });
                        }
                    } catch {
                        // Skip malformed items
                    }
                });
            }

            return products;
        });
    }
}
