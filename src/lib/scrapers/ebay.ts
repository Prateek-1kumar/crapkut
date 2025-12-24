import { Page } from 'puppeteer-core';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * eBay Scraper - Updated for Puppeteer
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
        try {
            await Promise.race([
                page.waitForSelector('.s-card', { timeout: 10000 }),
                page.waitForSelector('.s-item', { timeout: 10000 }),
            ]);
        } catch {
            console.log('[ebay] No product cards found');
        }

        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                currency: string;
                url: string;
                image?: string;
            }>[] = [];

            // Try new card layout first
            const cardLayout = document.querySelectorAll('li.s-card');

            if (cardLayout.length > 0) {
                cardLayout.forEach((card) => {
                    try {
                        const titleEl = card.querySelector('.s-card__title') ||
                            card.querySelector('a.s-card__link');
                        const title = titleEl?.textContent?.trim();

                        const linkEl = card.querySelector('a.s-card__link') as HTMLAnchorElement;
                        const url = linkEl?.href;

                        const priceEl = card.querySelector('.s-card__price');
                        let priceText = priceEl?.textContent || '';
                        if (priceText.includes(' to ')) {
                            priceText = priceText.split(' to ')[0];
                        }
                        const cleanPrice = priceText.replace(/[^0-9.]/g, '');
                        const price = parseFloat(cleanPrice);
                        const currency = priceText.includes('$') ? 'USD' :
                            priceText.includes('£') ? 'GBP' : 'USD';

                        const imgEl = card.querySelector('img') as HTMLImageElement;
                        const image = imgEl?.src;

                        if (title && price > 0 && url) {
                            products.push({ title, price, currency, url, image });
                        }
                    } catch {
                        // Skip
                    }
                });
            }

            // Fallback to old layout
            if (products.length === 0) {
                const listLayout = document.querySelectorAll('.s-item');
                listLayout.forEach((item) => {
                    try {
                        const titleEl = item.querySelector('.s-item__title');
                        if (!titleEl || titleEl.textContent?.includes('Shop on eBay')) return;
                        const title = titleEl.textContent?.trim();

                        const linkEl = item.querySelector('.s-item__link') as HTMLAnchorElement;
                        const url = linkEl?.href;

                        const priceEl = item.querySelector('.s-item__price');
                        let priceText = priceEl?.textContent || '';
                        if (priceText.includes(' to ')) {
                            priceText = priceText.split(' to ')[0];
                        }
                        const cleanPrice = priceText.replace(/[^0-9.]/g, '');
                        const price = parseFloat(cleanPrice);
                        const currency = priceText.includes('$') ? 'USD' : 'USD';

                        const imgEl = item.querySelector('.s-item__image-img') as HTMLImageElement;
                        const image = imgEl?.src;

                        if (title && price > 0 && url) {
                            products.push({ title, price, currency, url, image });
                        }
                    } catch {
                        // Skip
                    }
                });
            }

            return products;
        });
    }
}
