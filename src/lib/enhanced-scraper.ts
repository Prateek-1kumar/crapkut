// Enhanced scraper designed for production use
// This version uses dynamic imports to avoid Next.js build issues
import type { Browser, Page } from 'puppeteer-core'; // Changed from puppeteer to puppeteer-core
import type { ScrapingMetadata } from '@/types/scraping';
import { ScrapingConfig, defaultConfig } from './scraping-config';
import { logger } from '@/utils/logger';
import chromium from '@sparticuz/chromium'; // Added import
import {
  ScrapingOptions, 
  ScrapingResult, 
  RetryState,
  ExtractedData
} from '@/types/scraper';
import {
  NavigationError,
  ExtractionError,
  isValidUrl,
  countElementsRecursive,
  isCSSSelector,
  hasKeywords,
  extractProductsFromPage,
  extractImagesFromPage,
  extractLinksFromPage,
  extractHeadingsFromPage,
  extractTextContentFromPage,
  extractByCSSFromPage,
  extractGenericFromPage,
  determineExtractionMethod,
  PRODUCT_KEYWORDS,
  IMAGE_KEYWORDS,
  LINK_KEYWORDS,
  HEADING_KEYWORDS,
  TEXT_KEYWORDS
} from '@/utils/scraper-utils';

export class ProductionScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly config: ScrapingConfig;
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    try {
      logger.info('Initializing production scraper...');
      
      // Dynamic import to avoid build issues
      const puppeteerCore = await import('puppeteer-core');
      
      const launchOptions = {
        args: chromium.args, // Use args from @sparticuz/chromium
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(), // Use executablePath from @sparticuz/chromium
        headless: chromium.headless, // Use headless from @sparticuz/chromium
        ignoreHTTPSErrors: true,
        // Original args that might still be relevant or can be reviewed:
        // '--no-sandbox',
        // '--disable-setuid-sandbox',
        // '--disable-dev-shm-usage',
        // '--disable-accelerated-2d-canvas',
        // '--no-first-run',
        // '--no-zygote',
        // '--disable-gpu',
        // '--disable-blink-features=AutomationControlled',
        // '--disable-features=VizDisplayCompositor',
        // '--disable-web-security',
        // '--disable-features=site-per-process',
        // '--window-size=1920,1080',
        // slowMo: this.config.browser.slowMo, // slowMo might not be ideal for serverless
      };

      this.browser = await puppeteerCore.launch(launchOptions); // Use puppeteerCore.launch
      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Enhanced headers
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });

      // Basic stealth techniques
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
      });

      logger.info('Production scraper initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize scraper:', { error: error instanceof Error ? error.message : String(error) });
      throw new NavigationError('Failed to initialize scraper');
    }
  }

  async scrape(options: ScrapingOptions): Promise<ScrapingResult> {
    const startTime = Date.now();
    const mergedConfig = { ...this.config, ...options.config };
    
    // Validate URL
    if (!isValidUrl(options.url)) {
      throw new NavigationError('Invalid URL provided', { url: options.url });
    }
    
    // Rate limiting
    await this.enforceRateLimit();

    if (!this.page) {
      await this.initialize();
    }

    if (!this.page) {
      throw new NavigationError('Failed to initialize page');
    }

    // Retry logic
    const retryState: RetryState = {
      attempt: 0,
      lastError: null,
      backoffDelay: mergedConfig.retry.initialDelay,
    };

    while (retryState.attempt < mergedConfig.retry.maxAttempts) {
      try {
        logger.info(`Scraping attempt ${retryState.attempt + 1}/${mergedConfig.retry.maxAttempts}`, { 
          url: options.url,
          attempt: retryState.attempt + 1 
        });
        
        // Navigate to URL
        const response = await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: options.timeout ?? mergedConfig.browser.timeout,
        });

        if (!response?.ok()) {
          throw new NavigationError(`HTTP ${response?.status()}: Failed to load page`, { 
            status: response?.status(),
            url: options.url 
          });
        }

        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract data
        const extractedData = await this.extractDataBySpec(
          this.page,
          options.extractionSpec,
          options.url
        );

        const processingTime = Date.now() - startTime;

        const metadata: ScrapingMetadata = {
          processingTime,
          elementsFound: countElementsRecursive(extractedData),
          extractionMethod: this.getExtractionMethod(options.extractionSpec),
          timestamp: new Date().toISOString(),
          attempts: retryState.attempt + 1,
          proxyUsed: 'none',
          userAgent: options.userAgent ?? 'default',
        };

        logger.performance('Scraping completed successfully', startTime, { 
          elementsFound: metadata.elementsFound,
          extractionMethod: metadata.extractionMethod 
        });
        
        return {
          success: true,
          data: extractedData,
          timestamp: new Date()
        };

      } catch (error) {
        retryState.attempt++;
        retryState.lastError = error instanceof Error ? error : new Error(String(error));
        
        logger.warn(`Scraping attempt ${retryState.attempt} failed`, { 
          error: retryState.lastError.message,
          url: options.url,
          attempt: retryState.attempt 
        });

        if (retryState.attempt >= mergedConfig.retry.maxAttempts) {
          logger.error('All scraping attempts failed', { 
            url: options.url,
            totalAttempts: retryState.attempt,
            finalError: retryState.lastError.message 
          });
          throw retryState.lastError;
        }

        // Wait before retry
        logger.debug(`Waiting ${retryState.backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryState.backoffDelay));
        
        retryState.backoffDelay = Math.min(
          retryState.backoffDelay * mergedConfig.retry.backoffMultiplier,
          mergedConfig.retry.maxDelay
        );
      }
    }

    throw retryState.lastError || new ExtractionError('Scraping failed');
  }

  private async enforceRateLimit(): Promise<void> {
    if (!this.config.rateLimit.enabled) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / this.config.rateLimit.requestsPerMinute;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      logger.debug(`Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private async extractDataBySpec(
    page: Page,
    spec: string,
    sourceUrl: string
  ): Promise<ExtractedData> {
    const lowerSpec = spec.toLowerCase();
    
    try {
      let extractedData: unknown = {};

      if (hasKeywords(lowerSpec, PRODUCT_KEYWORDS)) {
        extractedData = await extractProductsFromPage(page);
      } else if (hasKeywords(lowerSpec, IMAGE_KEYWORDS)) {
        extractedData = await extractImagesFromPage(page);
      } else if (hasKeywords(lowerSpec, LINK_KEYWORDS)) {
        extractedData = await extractLinksFromPage(page, sourceUrl);
      } else if (hasKeywords(lowerSpec, HEADING_KEYWORDS)) {
        extractedData = await extractHeadingsFromPage(page);
      } else if (hasKeywords(lowerSpec, TEXT_KEYWORDS)) {
        extractedData = await extractTextContentFromPage(page);
      } else if (isCSSSelector(spec)) {
        extractedData = await extractByCSSFromPage(page, spec);
      } else {
        extractedData = await extractGenericFromPage(page, spec);
      }

      const totalElements = countElementsRecursive(extractedData);
      const extractionMethod = determineExtractionMethod(spec);

      return {
        ...(extractedData as Record<string, unknown>),
        extractedAt: new Date(),
        sourceUrl,
        extractionMethod,
        totalElements,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Data extraction failed', { error: errorMessage, spec, sourceUrl });
      throw new ExtractionError('Failed to extract data from the page', { spec, sourceUrl });
    }
  }

  private getExtractionMethod(spec: string): string {
    return determineExtractionMethod(spec);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info('Production scraper closed successfully');
    }
  }
}

// Export interfaces for external use
export type { ScrapingOptions, ScrapingResult, RetryState };
