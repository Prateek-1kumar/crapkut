import { chromium, Browser, Page, BrowserContext } from 'playwright';
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
    blockResources?: boolean;
}

const DEFAULT_CONFIG: BrowserConfig = {
    headless: true,
    timeout: 15000, // 15 seconds - faster failure feedback
    blockResources: false, // Don't block images - we need product images
};

/**
 * Abstract base class for all scrapers with common functionality
 */
export abstract class BaseScraper implements ScraperStrategy {
    abstract vendor: Vendor;
    abstract baseUrl: string;

    protected browser: Browser | null = null;
    protected context: BrowserContext | null = null;
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
     * Parse product elements from the page
     */
    abstract parseProducts(page: Page): Promise<Partial<ScrapeResult>[]>;

    /**
     * Launch browser with stealth settings
     */
    protected async launchBrowser(): Promise<Browser> {
        this.browser = await chromium.launch({
            headless: this.config.headless,
        });
        return this.browser;
    }

    /**
     * Create a new context with stealth settings
     */
    protected async createContext(): Promise<BrowserContext> {
        if (!this.browser) {
            await this.launchBrowser();
        }

        this.context = await this.browser!.newContext({
            userAgent: this.getRandomUserAgent(),
            viewport: { width: 1920, height: 1080 },
            locale: 'en-IN',
            timezoneId: 'Asia/Kolkata',
            extraHTTPHeaders: {
                'Accept-Language': 'en-IN,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
        });

        return this.context;
    }

    /**
     * Create a new page with resource blocking
     */
    protected async createPage(): Promise<Page> {
        if (!this.context) {
            await this.createContext();
        }

        const page = await this.context!.newPage();

        // Block unnecessary resources for faster scraping
        if (this.config.blockResources) {
            await page.route('**/*', (route) => {
                const resourceType = route.request().resourceType();
                if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                    route.abort();
                } else {
                    route.continue();
                }
            });
        }

        // Apply stealth scripts
        await this.applyStealthScripts(page);

        return page;
    }

    /**
     * Apply stealth mode scripts to evade bot detection
     */
    protected async applyStealthScripts(page: Page): Promise<void> {
        await page.addInitScript(() => {
            // Remove webdriver flag
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });

            // Mock plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });

            // Mock languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-IN', 'en-US', 'en'],
            });

            // Mock permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters: PermissionDescriptor) =>
                parameters.name === 'notifications'
                    ? Promise.resolve({ state: 'denied' } as PermissionStatus)
                    : originalQuery(parameters);

            // Mock chrome object
            Object.defineProperty(window, 'chrome', {
                writable: true,
                enumerable: true,
                configurable: false,
                value: {
                    runtime: {},
                    loadTimes: function () { },
                    csi: function () { },
                    app: {},
                },
            });
        });
    }

    /**
     * Get a random user agent string
     */
    protected getRandomUserAgent(): string {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    /**
     * Generate a unique ID for each result
     */
    protected generateId(): string {
        return uuidv4();
    }

    /**
     * Parse price string to number
     */
    protected parsePrice(priceStr: string): number {
        // Remove currency symbols and commas
        const cleaned = priceStr.replace(/[₹$€£,\s]/g, '').trim();
        const price = parseFloat(cleaned);
        return isNaN(price) ? 0 : price;
    }

    /**
     * Clean and truncate product title
     */
    protected cleanTitle(title: string, maxLength = 150): string {
        return title.trim().substring(0, maxLength);
    }

    /**
     * Add delay to avoid detection
     */
    protected async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Random delay between min and max ms
     */
    protected async randomDelay(min = 500, max = 1500): Promise<void> {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.delay(delay);
    }

    /**
     * Close browser and cleanup
     */
    async close(): Promise<void> {
        if (this.context) {
            await this.context.close();
            this.context = null;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Execute scrape with proper cleanup
     */
    protected async executeScrape(query: string): Promise<ScrapeResult[]> {
        let page: Page | null = null;

        try {
            page = await this.createPage();
            const searchUrl = this.buildSearchUrl(query);

            await page.goto(searchUrl, {
                waitUntil: 'domcontentloaded',
                timeout: this.config.timeout,
            });

            // Wait a bit for dynamic content
            await this.randomDelay(1000, 2000);

            const rawProducts = await this.parseProducts(page);

            // Transform to full ScrapeResult with validation
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
