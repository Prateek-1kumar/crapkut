import { Page } from 'puppeteer-core';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Flipkart Scraper - Updated for Puppeteer
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
            const closeBtn = await page.$('button._2KpZ6l._2doB4z');
            if (closeBtn) {
                await closeBtn.click();
                await this.delay(500);
            }
        } catch {
            // No popup
        }

        // Wait for product cards
        try {
            await page.waitForSelector('div[data-id]', { timeout: 10000 });
        } catch {
            console.log('[flipkart] No product cards found');
        }

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

            const cards = document.querySelectorAll('div[data-id]');

            cards.forEach((card) => {
                try {
                    const titleEl = card.querySelector('a.atJtCj') ||
                        card.querySelector('a.IRpwF-') ||
                        card.querySelector('._4rR01T') ||
                        card.querySelector('.s1Q9rs');
                    const title = (titleEl as HTMLElement)?.title ||
                        titleEl?.textContent?.trim();

                    const linkEl = card.querySelector('a[href*="/p/"]') ||
                        card.querySelector('a') as HTMLAnchorElement;
                    let url = linkEl?.getAttribute('href') || '';
                    if (url && !url.startsWith('http')) {
                        url = 'https://www.flipkart.com' + url;
                    }

                    const priceEl = card.querySelector('.hZ3P6w') ||
                        card.querySelector('._30jeq3') ||
                        card.querySelector('.Nx9376');
                    const priceText = priceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const price = parseFloat(priceText);

                    const originalPriceEl = card.querySelector('.y3H6nd') ||
                        card.querySelector('._3I9_wc');
                    const originalPriceText = originalPriceEl?.textContent?.replace(/[₹,]/g, '') || '';
                    const originalPrice = originalPriceText ? parseFloat(originalPriceText) : undefined;

                    const imgEl = (card.querySelector('img._396cs4') ||
                        card.querySelector('img._2r_T1I') ||
                        card.querySelector('img')) as HTMLImageElement | null;
                    const image = imgEl?.src;

                    const ratingEl = card.querySelector('.XQD9m-') ||
                        card.querySelector('._3LWZlK');
                    const ratingText = ratingEl?.textContent;
                    const rating = ratingText ? parseFloat(ratingText) : undefined;

                    const discountEl = card.querySelector('.Uk_O9r') ||
                        card.querySelector('._3Ay6Sb');
                    const discount = discountEl?.textContent?.trim();

                    if (title && price > 0 && url) {
                        products.push({ title, price, originalPrice, url, image, rating, discount });
                    }
                } catch {
                    // Skip
                }
            });

            return products;
        });
    }
}
