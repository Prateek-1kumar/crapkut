import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { v4 as uuidv4 } from 'uuid';
import type { ScrapeResult, Vendor } from '../types';

/**
 * Base scraper interface that all vendor scrapers must implement
 */
export interface ScraperStrategy {
    vendor: Vendor;
    scrape(query: string): Promise<ScrapeResult[]>;
}

/**
 * Configuration for browser launch
 */
export interface BrowserConfig {
    headless?: boolean;
    timeout?: number;
}

const DEFAULT_CONFIG: BrowserConfig = {
    headless: true,
    timeout: 15000,
};

/**
 * Abstract base class for all scrapers with common functionality
 * Uses Puppeteer with @sparticuz/chromium for Vercel serverless compatibility
 */
export abstract class BaseScraper implements ScraperStrategy {
    abstract vendor: Vendor;
    abstract baseUrl: string;

    protected browser: Browser | null = null;
    protected config: BrowserConfig;

    constructor(config: Partial<BrowserConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Main scrape method to be implemented by each vendor
     */
    abstract scrape(query: string): Promise<ScrapeResult[]>;

    /**
     * Build search URL for the vendor
     */
    abstract buildSearchUrl(query: string): string;

    /**
     * Parse products from the page - to be implemented by each vendor
     */
    abstract parseProducts(page: Page): Promise<Partial<ScrapeResult>[]>;

    /**
     * Launch browser with serverless-compatible settings
     */
    protected async launchBrowser(): Promise<Browser> {
        if (!this.browser) {
            const isServerless = process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL;

            this.browser = await puppeteer.launch({
                args: isServerless
                    ? chromium.args
                    : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                defaultViewport: { width: 1366, height: 768 },
                executablePath: isServerless
                    ? await chromium.executablePath()
                    : process.platform === 'darwin'
                        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
                        : '/usr/bin/google-chrome-stable',
                headless: true,
            });
        }
        return this.browser;
    }

    /**
     * Create a new page with stealth settings
     */
    protected async createPage(): Promise<Page> {
        const browser = await this.launchBrowser();
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        });

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        });

        return page;
    }

    protected generateId(): string {
        return uuidv4();
    }

    protected parsePrice(priceStr: string): number {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    protected cleanTitle(title: string): string {
        return title.replace(/\s+/g, ' ').trim().substring(0, 200);
    }

    protected async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected async randomDelay(min = 500, max = 1500): Promise<void> {
        const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.delay(delayMs);
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    protected async executeScrape(query: string): Promise<ScrapeResult[]> {
        try {
            const page = await this.createPage();
            const searchUrl = this.buildSearchUrl(query);

            await page.goto(searchUrl, {
                waitUntil: 'domcontentloaded',
                timeout: this.config.timeout,
            });

            await this.randomDelay(1000, 2000);

            const rawProducts = await this.parseProducts(page);

            const results: ScrapeResult[] = rawProducts
                .filter(p => p.title && p.price && p.price > 0)
                .map(p => ({
                    id: this.generateId(),
                    title: this.cleanTitle(p.title || ''),
                    price: p.price || 0,
                    originalPrice: p.originalPrice,
                    currency: p.currency || 'INR',
                    vendor: this.vendor,
                    url: p.url || '',
                    image: p.image,
                    rating: p.rating,
                    reviews: p.reviews,
                    discount: p.discount,
                    inStock: p.inStock ?? true,
                }));

            return results;
        } finally {
            await this.close();
        }
    }
}
