import { Page } from 'playwright';
import { BaseScraper } from './base';
import type { ScrapeResult, Vendor } from '../types';

/**
 * eBay Scraper (International)
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
        return page.evaluate(() => {
            const products: Partial<{
                title: string;
                price: number;
                originalPrice?: number;
                currency: string;
                url: string;
                image?: string;
            }>[] = [];

            // eBay search result items
            const cards = document.querySelectorAll('.s-item');

            cards.forEach((card) => {
                try {
                    // Skip the "Shop on eBay" card
                    if (card.querySelector('.s-item__title--tag')) return;

                    // Title
                    const titleEl = card.querySelector('.s-item__title span');
                    const title = titleEl?.textContent?.trim();

                    // URL
                    const linkEl = card.querySelector('.s-item__link') as HTMLAnchorElement;
                    const url = linkEl?.href;

                    // Price
                    const priceEl = card.querySelector('.s-item__price');
                    let priceText = priceEl?.textContent || '';
                    // Handle price ranges (take the first price)
                    if (priceText.includes(' to ')) {
                        priceText = priceText.split(' to ')[0];
                    }
                    const priceMatch = priceText.replace(/[^0-9.]/g, '');
                    const price = parseFloat(priceMatch);

                    // Detect currency
                    let currency = 'USD';
                    if (priceText.includes('₹')) currency = 'INR';
                    else if (priceText.includes('£')) currency = 'GBP';
                    else if (priceText.includes('€')) currency = 'EUR';

                    // Image
                    const imgEl = card.querySelector('.s-item__image-img') as HTMLImageElement;
                    const image = imgEl?.src;

                    if (title && price > 0 && url && !title.includes('Shop on eBay')) {
                        products.push({
                            title,
                            price,
                            currency,
                            url,
                            image,
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
