// Enhanced scraper designed for production use with adaptive configuration
// This version uses dynamic imports to avoid Next.js build issues
import type { Browser, Page } from 'puppeteer-core'; // Keep puppeteer-core types for compatibility
import type { ScrapingMetadata } from '@/types/scraping';
import { ScrapingConfig, defaultConfig } from './scraping-config';
import { AdaptiveConfigProvider, StrategyConfig } from './adaptive-config';
import { logger } from '@/utils/logger';
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
  private currentUrl: string | null = null;
  private currentStrategy: string | null = null;

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async initializeWithStrategy(url: string, strategy?: string): Promise<void> {
    if (this.browser) {
      await this.cleanup();
    }

    try {
      // Analyze the target site for optimal strategy
      const analysis = AdaptiveConfigProvider.analyzeSite(url);
      const adaptiveConfig = AdaptiveConfigProvider.generateConfig(analysis, this.config);
      const strategyConfig = AdaptiveConfigProvider.getStrategyConfig(analysis.recommendedStrategy);
      
      this.currentUrl = url;
      this.currentStrategy = strategy || analysis.recommendedStrategy;
      
      logger.info('Initializing production scraper with adaptive strategy:', {
        url,
        strategy: this.currentStrategy,
        category: analysis.category,
        complexity: analysis.complexity,
        issues: analysis.knownIssues
      });
      
      // Dynamic import to avoid build issues - choose based on environment
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';
      
      if (isProduction || isVercel) {
        // Production/Vercel (serverless) environment using chromium
        const puppeteerCore = await import('puppeteer-core');
        const chromium = await import('@sparticuz/chromium');
        
        const launchOptions = {
          args: [
            ...chromium.default.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--single-process', // Important for Vercel
            '--no-zygote', // Important for Vercel
          ],
          defaultViewport: strategyConfig.viewport,
          executablePath: await chromium.default.executablePath(),
          headless: true, // Always headless in production
          ignoreHTTPSErrors: true,
          timeout: 3000, // Fast timeout for Vercel serverless
        };
        this.browser = await puppeteerCore.launch(launchOptions);
      } else {
        // Development environment using regular puppeteer with fallback to puppeteer-core
        try {
          const puppeteer = await import('puppeteer');
          const launchOptions = {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
              '--disable-background-timer-throttling',
              '--disable-renderer-backgrounding',
              '--disable-backgrounding-occluded-windows',
              '--disable-features=TranslateUI',
              '--disable-ipc-flooding-protection',
              '--disable-extensions',
              '--disable-plugins',
            ],
            defaultViewport: strategyConfig.viewport,
            headless: adaptiveConfig.browser.headless,
            ignoreHTTPSErrors: true,
            timeout: 3000, // Fast timeout for development too
          };
          this.browser = await puppeteer.launch(launchOptions) as any;
        } catch (devError) {
          // Fallback to puppeteer-core if regular puppeteer fails
          logger.warn('Regular puppeteer failed, falling back to puppeteer-core:', { error: devError });
          const puppeteerCore = await import('puppeteer-core');
          const launchOptions = {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
            ],
            defaultViewport: strategyConfig.viewport,
            headless: adaptiveConfig.browser.headless,
            ignoreHTTPSErrors: true,
            timeout: 5000, // Faster timeout for fallback too
          };
          this.browser = await puppeteerCore.launch(launchOptions);
        }
      }
      
      if (!this.browser) {
        throw new NavigationError('Failed to initialize browser');
      }
      
      this.page = await this.browser.newPage();

      // Set viewport based on strategy
      await this.page.setViewport(strategyConfig.viewport);
      
      // Set user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Adaptive headers
      await this.page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      });

      // Adaptive resource blocking based on strategy
      await this.setupResourceBlocking(strategyConfig);

      // Setup stealth based on strategy
      if (strategyConfig.stealth.enabled && this.page) {
        await this.setupStealthMode();
      }

      logger.info('Production scraper initialized successfully with strategy:', {
        strategy: this.currentStrategy,
        resourceBlocking: strategyConfig.resourceBlocking,
        stealth: strategyConfig.stealth.enabled
      });
      
    } catch (error) {
      logger.error('Failed to initialize scraper:', { error: error instanceof Error ? error.message : String(error) });
      throw new NavigationError('Failed to initialize scraper');
    }
  }

  // Keep the old initialize method for backward compatibility
  async initialize(): Promise<void> {
    if (!this.currentUrl) {
      // Fallback to old method if no URL provided
      await this.initializeWithStrategy('https://example.com', 'balanced');
      return;
    }
    await this.initializeWithStrategy(this.currentUrl);
  }

  private async setupResourceBlocking(strategyConfig: StrategyConfig): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    
    const resourceConfig = strategyConfig.resourceBlocking;
    
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      const resourceType = req.resourceType();
      
      if (resourceConfig.images && resourceType === 'image') {
        req.abort();
      } else if (resourceConfig.css && resourceType === 'stylesheet') {
        req.abort();
      } else if (resourceConfig.fonts && resourceType === 'font') {
        req.abort();
      } else if (resourceConfig.media && ['media', 'video', 'audio'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  private async setupStealthMode(): Promise<void> {
    await this.page!.evaluateOnNewDocument(() => {
      // Remove webdriver traces
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Set realistic languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Add realistic plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format"},
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          }
        ],
      });
    });
  }

  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async scrapeWithFallback(options: ScrapingOptions): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    // Analyze site and get fallback chain
    const analysis = AdaptiveConfigProvider.analyzeSite(options.url);
    const fallbackChain = AdaptiveConfigProvider.getFallbackChain(analysis.recommendedStrategy);
    const domain = new URL(options.url).hostname.replace(/^www\./, '');
    
    let lastError: Error | null = null;
    
    for (const strategy of fallbackChain) {
      // Skip if this strategy previously failed for this domain
      if (AdaptiveConfigProvider.hasPreviouslyFailed(domain, strategy)) {
        logger.info(`Skipping strategy ${strategy} for domain ${domain} (previously failed)`);
        continue;
      }
      
      try {
        logger.info(`Attempting scraping with strategy: ${strategy}`, { domain, url: options.url });
        
        // Initialize with specific strategy
        await this.initializeWithStrategy(options.url, strategy);
        
        // Attempt scraping
        const result = await this.scrape(options);
        
        // Record success
        AdaptiveConfigProvider.recordSuccess(domain, strategy);
        
        logger.info(`Scraping successful with strategy: ${strategy}`, { 
          domain, 
          processingTime: Date.now() - startTime 
        });
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Record failure
        AdaptiveConfigProvider.recordFailure(domain, strategy);
        
        logger.warn(`Scraping failed with strategy: ${strategy}`, { 
          domain, 
          error: lastError.message 
        });
        
        // Clean up before trying next strategy
        await this.cleanup();
      }
    }
    
    // If all strategies failed, throw the last error
    logger.error('All scraping strategies failed', { domain, error: lastError?.message });
    throw lastError ?? new Error('All scraping strategies failed');
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

    // Make sure we're initialized for this URL
    if (!this.page || this.currentUrl !== options.url) {
      await this.initializeWithStrategy(options.url);
    }

    if (!this.page) {
      throw new NavigationError('Failed to initialize page');
    }

    // Get strategy config for timeouts
    const analysis = AdaptiveConfigProvider.analyzeSite(options.url);
    const strategyConfig = AdaptiveConfigProvider.getStrategyConfig(analysis.recommendedStrategy);

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
          attempt: retryState.attempt + 1,
          strategy: this.currentStrategy
        });
        
        // Navigate to URL with adaptive timeouts
        const response = await this.page.goto(options.url, {
          waitUntil: 'domcontentloaded',
          timeout: strategyConfig.timeouts.navigation,
        });

        if (!response?.ok()) {
          throw new NavigationError(`HTTP ${response?.status()}: Failed to load page`, { 
            status: response?.status(),
            url: options.url 
          });
        }

        // Adaptive wait time based on strategy
        await new Promise(resolve => setTimeout(resolve, strategyConfig.waitTime));

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
          extractionMethod: metadata.extractionMethod,
          strategy: this.currentStrategy
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
          attempt: retryState.attempt,
          strategy: this.currentStrategy
        });

        if (retryState.attempt >= mergedConfig.retry.maxAttempts) {
          logger.error('All scraping attempts failed', { 
            url: options.url,
            totalAttempts: retryState.attempt,
            finalError: retryState.lastError.message,
            strategy: this.currentStrategy
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

    throw retryState.lastError ?? new ExtractionError('Scraping failed');
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
