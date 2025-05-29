import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page } from 'puppeteer';
import type { ScrapingMetadata } from '@/types/scraping';
import { ScrapingConfig, defaultConfig, USER_AGENTS, SCREEN_RESOLUTIONS } from './scraping-config';
import { CaptchaManager, TwoCaptchaProvider, AntiCaptchaProvider, CapSolverProvider } from './captcha-manager';
import { ProxyManager, ScraperAPIProvider, BrightDataProvider, SmartProxyProvider } from './proxy-manager';
import { HumanBehaviorSimulator } from './human-behavior';
import { logger } from '@/utils/logger';
import { 
  ExtractedData,
  ScrapingOptions, 
  ScrapingResult, 
  RetryState
} from '@/types/scraper';
import {
  NavigationError,
  ExtractionError,
  isValidUrl,
  extractProductsFromPage,
  extractImagesFromPage,
  extractLinksFromPage,
  extractHeadingsFromPage,
  extractTextContentFromPage,
  extractByCSSFromPage,
  extractGenericFromPage,
  countElementsRecursive,
  determineExtractionMethod,
  hasKeywords,
  isCSSSelector,
  PRODUCT_KEYWORDS,
  IMAGE_KEYWORDS,
  LINK_KEYWORDS,
  HEADING_KEYWORDS,
  TEXT_KEYWORDS
} from '@/utils/scraper-utils';

// Configure puppeteer-extra with stealth plugin
puppeteerExtra.use(StealthPlugin());

export class IntelligentScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly config: ScrapingConfig;
  private readonly captchaManager: CaptchaManager;
  private readonly proxyManager: ProxyManager;
  private humanBehavior: HumanBehaviorSimulator | null = null;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly defaultUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    // Initialize managers
    this.captchaManager = new CaptchaManager();
    this.proxyManager = new ProxyManager(this.config.proxy.rotationInterval);
    
    this.configureCaptchaProviders();
    this.configureProxyProviders();
  }

  private configureCaptchaProviders(): void {
    if (!this.config.captcha.enabled) return;
    
    const { providers } = this.config.captcha;
    
    if (providers.twocaptcha?.apiKey) {
      this.captchaManager.addProvider(new TwoCaptchaProvider(providers.twocaptcha.apiKey));
    }
    
    if (providers.anticaptcha?.apiKey) {
      this.captchaManager.addProvider(new AntiCaptchaProvider(providers.anticaptcha.apiKey));
    }
    
    if (providers.capsolver?.apiKey) {
      this.captchaManager.addProvider(new CapSolverProvider(providers.capsolver.apiKey));
    }
  }

  private configureProxyProviders(): void {
    if (!this.config.proxy.enabled) return;
    
    const { providers } = this.config.proxy;
    
    if (providers.scraperapi?.apiKey) {
      this.proxyManager.addProvider(new ScraperAPIProvider(providers.scraperapi.apiKey));
    }
    
    if (providers.brightdata?.username && providers.brightdata?.password) {
      this.proxyManager.addProvider(new BrightDataProvider(
        providers.brightdata.username,
        providers.brightdata.password,
        providers.brightdata.endpoint,
        providers.brightdata.port
      ));
    }
    
    if (providers.smartproxy?.username && providers.smartproxy?.password) {
      this.proxyManager.addProvider(new SmartProxyProvider(
        providers.smartproxy.username,
        providers.smartproxy.password
      ));
    }
  }

  async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    try {
      logger.info('Initializing enhanced scraper...');
      
      // Get proxy if enabled
      const proxy = await this.proxyManager.getWorkingProxy();
      const proxyArgs = proxy ? [`--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`] : [];
      
      // Random user agent and viewport
      const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const viewport = SCREEN_RESOLUTIONS[Math.floor(Math.random() * SCREEN_RESOLUTIONS.length)];

      const launchOptions = {
        headless: this.config.browser.headless,
        slowMo: this.config.browser.slowMo,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--disable-web-security',
          '--disable-features=site-per-process',
          '--flag-switches-begin',
          '--flag-switches-end',
          '--disable-extensions-except=/path/to/extension',
          '--disable-extensions',
          '--disable-default-apps',
          '--window-size=1920,1080',
          '--start-maximized',
          ...proxyArgs,
        ],
      };

      // Use puppeteer-extra for stealth
      this.browser = await puppeteerExtra.launch(launchOptions);

      this.page = await this.browser.newPage();
      
      // Set random viewport
      await this.page.setViewport(viewport);
      
      // Set random user agent
      await this.page.setUserAgent(userAgent);

      // Enhanced headers for better stealth
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      });

      // Advanced stealth techniques
      await this.page.evaluateOnNewDocument(() => {
        // Remove webdriver traces
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Override plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            {
              0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format"},
              description: "Portable Document Format",
              filename: "internal-pdf-viewer",
              length: 1,
              name: "Chrome PDF Plugin"
            },
            {
              0: {type: "application/pdf", suffixes: "pdf", description: ""},
              description: "",
              filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
              length: 1,
              name: "Chrome PDF Viewer"
            },
            {
              0: {type: "application/x-nacl", suffixes: "", description: "Native Client Executable"},
              1: {type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable"},
              description: "",
              filename: "internal-nacl-plugin",
              length: 2,
              name: "Native Client"
            }
          ],
        });

        // Override languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
            : originalQuery(parameters);

        // Override chrome object
        Object.defineProperty(window, 'chrome', {
          writable: true,
          enumerable: true,
          configurable: false,
          value: {
            runtime: {
              onConnect: undefined,
              onMessage: undefined,
              connect: undefined,
              sendMessage: undefined,
            },
          },
        });

        // Add realistic screen properties
        Object.defineProperty(screen, 'availTop', {
          get: () => 23,
        });

        // Mock WebGL
        const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) {
            return 'Intel Inc.';
          }
          if (parameter === 37446) {
            return 'Intel Iris OpenGL Engine';
          }
          return originalGetParameter.call(this, parameter);
        };
      });

      // Setup proxy authentication if needed
      if (proxy?.username && proxy?.password) {
        await this.page.authenticate({
          username: proxy.username,
          password: proxy.password,
        });
      }

      // Initialize human behavior simulator
      if (this.config.humanBehavior.enabled) {
        this.humanBehavior = new HumanBehaviorSimulator(this.page);
        await this.humanBehavior.setupHumanBehavior();
      }

      logger.info('Enhanced scraper initialized successfully');
      logger.debug(`User Agent: ${userAgent.substring(0, 50)}...`);
      logger.debug(`Viewport: ${viewport.width}x${viewport.height}`);
      const proxyInfo = proxy ? `${proxy.host}:${proxy.port}` : 'None';
      logger.debug(`Proxy: ${proxyInfo}`);
      logger.debug(`Stealth: ${this.config.stealth.enabled ? 'Enabled' : 'Disabled'}`);
      logger.debug(`Human Behavior: ${this.config.humanBehavior.enabled ? 'Enabled' : 'Disabled'}`);
      
    } catch (error) {
      logger.error('Failed to initialize enhanced scraper', { error: error instanceof Error ? error.message : String(error) });
      throw new NavigationError('Failed to initialize scraper');
    }
  }

  async scrape(options: ScrapingOptions): Promise<ScrapingResult> {
    const startTime = Date.now();
    const mergedConfig = { ...this.config, ...options.config };
    
    await this.validateAndPrepare(options);
    
    const retryState: RetryState = {
      attempt: 0,
      lastError: null,
      backoffDelay: mergedConfig.retry.initialDelay,
    };

    while (retryState.attempt < mergedConfig.retry.maxAttempts) {
      try {
        const result = await this.executeScrapeAttempt(options, mergedConfig, startTime, retryState.attempt);
        return result;
      } catch (error) {
        const shouldContinue = await this.handleScrapeError(error, retryState, mergedConfig, options.url);
        if (!shouldContinue) {
          return {
            success: false,
            error: retryState.lastError?.message ?? 'All scraping attempts failed',
            timestamp: new Date(),
          };
        }
      }
    }

    return {
      success: false,
      error: retryState.lastError?.message ?? 'Scraping failed',
      timestamp: new Date(),
    };
  }

  private async validateAndPrepare(options: ScrapingOptions): Promise<void> {
    if (!isValidUrl(options.url)) {
      throw new NavigationError('Invalid URL provided', { url: options.url });
    }
    
    await this.enforceRateLimit();

    if (!this.page) {
      await this.initialize();
    }

    if (!this.page) {
      throw new NavigationError('Failed to initialize page');
    }
  }

  private async executeScrapeAttempt(
    options: ScrapingOptions, 
    mergedConfig: ScrapingConfig, 
    startTime: number, 
    attemptNumber: number
  ): Promise<ScrapingResult> {
    logger.info(`Scraping attempt ${attemptNumber + 1}/${mergedConfig.retry.maxAttempts}`, { 
      url: options.url,
      attempt: attemptNumber + 1 
    });
    
    await this.preparePageForScraping(options, mergedConfig);
    const extractedData = await this.performDataExtraction(options);
    
    return this.createSuccessResult(extractedData, options, startTime, attemptNumber);
  }

  private async preparePageForScraping(options: ScrapingOptions, mergedConfig: ScrapingConfig): Promise<void> {
    await this.checkRobotsTxt(options.url);

    if (this.humanBehavior && mergedConfig.humanBehavior.enabled) {
      await this.humanBehavior.randomDelay(500, 1500);
    }

    await this.navigateToPage(options, mergedConfig);
    await this.handlePageInteractions(mergedConfig);
  }

  private async navigateToPage(options: ScrapingOptions, mergedConfig: ScrapingConfig): Promise<void> {
    if (!this.page) throw new NavigationError('Page not initialized');

    logger.debug(`Navigating to: ${options.url}`);
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

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private async handlePageInteractions(mergedConfig: ScrapingConfig): Promise<void> {
    if (this.humanBehavior && mergedConfig.humanBehavior.enabled) {
      await this.humanBehavior.simulateReading(1500);
    }

    if (mergedConfig.captcha.enabled) {
      await this.handleCaptcha();
    }

    if (this.humanBehavior && mergedConfig.humanBehavior.enabled) {
      await this.humanBehavior.randomInteractions();
    }
  }

  private async performDataExtraction(options: ScrapingOptions): Promise<ExtractedData> {
    if (!this.page) throw new NavigationError('Page not initialized');

    return await this.extractDataBySpec(
      this.page,
      options.extractionSpec,
      options.url
    );
  }

  private createSuccessResult(
    extractedData: ExtractedData, 
    options: ScrapingOptions, 
    startTime: number, 
    attemptNumber: number
  ): ScrapingResult {
    const processingTime = Date.now() - startTime;

    const metadata: ScrapingMetadata = {
      processingTime,
      elementsFound: countElementsRecursive(extractedData),
      extractionMethod: determineExtractionMethod(options.extractionSpec),
      timestamp: new Date().toISOString(),
      attempts: attemptNumber + 1,
      proxyUsed: this.proxyManager.getCurrentProxy()?.host ?? 'none',
      userAgent: options.userAgent ?? 'random',
    };

    logger.performance('Scraping completed successfully', startTime, { 
      elementsFound: metadata.elementsFound,
      extractionMethod: metadata.extractionMethod,
      url: options.url 
    });

    return {
      success: true,
      data: extractedData,
      timestamp: new Date(),
    };
  }

  private async handleScrapeError(
    error: unknown, 
    retryState: RetryState, 
    mergedConfig: ScrapingConfig, 
    url: string
  ): Promise<boolean> {
    retryState.attempt++;
    retryState.lastError = error instanceof Error ? error : new Error(String(error));
    
    logger.warn(`Scraping attempt ${retryState.attempt} failed`, { 
      error: retryState.lastError.message,
      url: url,
      attempt: retryState.attempt 
    });

    if (retryState.attempt >= mergedConfig.retry.maxAttempts) {
      logger.error('All scraping attempts failed', { 
        url: url,
        totalAttempts: retryState.attempt,
        finalError: retryState.lastError.message 
      });
      return false;
    }

    await this.handleRetryableError(retryState.lastError, retryState);
    await this.waitForRetry(retryState, mergedConfig);
    
    return true;
  }

  private async waitForRetry(retryState: RetryState, mergedConfig: ScrapingConfig): Promise<void> {
    logger.debug(`Waiting ${retryState.backoffDelay}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, retryState.backoffDelay));
    
    retryState.backoffDelay = Math.min(
      retryState.backoffDelay * mergedConfig.retry.backoffMultiplier,
      mergedConfig.retry.maxDelay
    );
  }

  private async enforceRateLimit(): Promise<void> {
    if (!this.config.rateLimit.enabled) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / this.config.rateLimit.requestsPerMinute;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private async handleCaptcha(): Promise<void> {
    if (!this.page) return;

    try {
      const captchaOptions = await this.captchaManager.detectCaptcha(this.page);
      
      if (captchaOptions) {
        console.log(`CAPTCHA detected: ${captchaOptions.type}`);
        
        const solution = await this.captchaManager.solveCaptcha(captchaOptions);
        
        // Inject the solution into the page
        if (captchaOptions.type === 'recaptcha') {
          await this.page.evaluate((token) => {
            const textarea = document.getElementById('g-recaptcha-response') as HTMLTextAreaElement;
            if (textarea) {
              textarea.value = token;
              textarea.style.display = 'block';
            }
            
            // Trigger callback if available
            const grecaptcha = (window as typeof window & { grecaptcha?: { getResponse?: () => string } }).grecaptcha;
            if (grecaptcha?.getResponse) {
              grecaptcha.getResponse = () => token;
            }
          }, solution);
          
          console.log('CAPTCHA solution injected successfully');
        }
      }
    } catch (error) {
      console.warn('CAPTCHA handling failed:', error);
      // Continue without CAPTCHA solution
    }
  }

  private async handleRetryableError(error: Error, retryState: RetryState): Promise<void> {
    const errorMessage = error.message.toLowerCase();
    
    // Handle proxy-related errors
    if (errorMessage.includes('proxy') || errorMessage.includes('timeout') || errorMessage.includes('net::')) {
      console.log('Proxy-related error detected, rotating proxy...');
      const currentProxy = this.proxyManager.getCurrentProxy();
      if (currentProxy) {
        this.proxyManager.markProxyAsFailed(currentProxy);
      }
      await this.proxyManager.rotateProxy();
      
      // Reinitialize browser with new proxy
      await this.close();
      await this.initialize();
    }
    
    // Handle rate limiting errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      console.log('Rate limiting detected, increasing delay...');
      retryState.backoffDelay *= 3; // Aggressive backoff for rate limiting
    }
    
    // Handle bot detection
    if (errorMessage.includes('blocked') || errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      console.log('Potential bot detection, rotating proxy and user agent...');
      await this.proxyManager.rotateProxy();
      await this.close();
      await this.initialize(); // This will pick a new user agent
    }
  }

  private async checkRobotsTxt(url: string): Promise<void> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      
      const robotsResponse = await fetch(robotsUrl);
      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text();
        
        // Basic robots.txt check - look for disallow directives
        if (robotsText.includes('Disallow: /') && !robotsText.includes('Allow:')) {
          console.warn('robots.txt suggests scraping is not allowed for this site');
          // Note: We're just warning, not blocking. Implement stricter checking if needed.
        }
      }
    } catch (error) {
      console.log('Could not check robots.txt:', error);
      // Continue with scraping even if robots.txt check fails
    }
  }

  private async extractDataBySpec(
    page: Page,
    spec: string,
    sourceUrl: string
  ): Promise<ExtractedData> {
    const lowerSpec = spec.toLowerCase();
    
    try {
      let extractedData: unknown = {};

      // Intelligent parsing based on common patterns
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
        // Generic extraction based on keywords
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

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info('Enhanced scraper closed successfully');
    }
  }
}
