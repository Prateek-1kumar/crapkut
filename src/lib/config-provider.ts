import { ScrapingConfig, defaultConfig } from './scraping-config';

export class ConfigProvider {
  private static config: ScrapingConfig | null = null;

  static getConfig(): ScrapingConfig {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return this.config;
  }

  private static loadConfig(): ScrapingConfig {
    const config = { ...defaultConfig };

    // Load from environment variables
    if (process.env.SCRAPING_HEADLESS) {
      config.browser.headless = process.env.SCRAPING_HEADLESS === 'true';
    }

    if (process.env.SCRAPING_SLOW_MO) {
      config.browser.slowMo = parseInt(process.env.SCRAPING_SLOW_MO, 10);
    }

    if (process.env.SCRAPING_TIMEOUT) {
      config.browser.timeout = parseInt(process.env.SCRAPING_TIMEOUT, 10);
    }

    // Stealth configuration
    if (process.env.SCRAPING_STEALTH_ENABLED) {
      config.stealth.enabled = process.env.SCRAPING_STEALTH_ENABLED === 'true';
    }

    // Proxy configuration
    if (process.env.SCRAPING_PROXY_ENABLED) {
      config.proxy.enabled = process.env.SCRAPING_PROXY_ENABLED === 'true';
    }

    if (process.env.SCRAPING_PROXY_ROTATION_INTERVAL) {
      config.proxy.rotationInterval = parseInt(process.env.SCRAPING_PROXY_ROTATION_INTERVAL, 10);
    }

    // ScraperAPI
    if (process.env.SCRAPERAPI_KEY) {
      config.proxy.providers.scraperapi = {
        apiKey: process.env.SCRAPERAPI_KEY,
        endpoint: 'http://api.scraperapi.com',
      };
    }

    // Bright Data
    if (process.env.BRIGHTDATA_USERNAME && process.env.BRIGHTDATA_PASSWORD) {
      config.proxy.providers.brightdata = {
        username: process.env.BRIGHTDATA_USERNAME,
        password: process.env.BRIGHTDATA_PASSWORD,
        endpoint: process.env.BRIGHTDATA_ENDPOINT || 'zproxy.lum-superproxy.io',
        port: parseInt(process.env.BRIGHTDATA_PORT || '22225', 10),
      };
    }

    // SmartProxy
    if (process.env.SMARTPROXY_USERNAME && process.env.SMARTPROXY_PASSWORD) {
      config.proxy.providers.smartproxy = {
        username: process.env.SMARTPROXY_USERNAME,
        password: process.env.SMARTPROXY_PASSWORD,
        endpoint: process.env.SMARTPROXY_ENDPOINT || 'gate.smartproxy.com',
        port: parseInt(process.env.SMARTPROXY_PORT || '10000', 10),
      };
    }

    // CAPTCHA configuration
    if (process.env.SCRAPING_CAPTCHA_ENABLED) {
      config.captcha.enabled = process.env.SCRAPING_CAPTCHA_ENABLED === 'true';
    }

    if (process.env.SCRAPING_CAPTCHA_TIMEOUT) {
      config.captcha.timeout = parseInt(process.env.SCRAPING_CAPTCHA_TIMEOUT, 10);
    }

    // 2Captcha
    if (process.env.TWOCAPTCHA_API_KEY) {
      config.captcha.providers.twocaptcha = {
        apiKey: process.env.TWOCAPTCHA_API_KEY,
        endpoint: 'https://2captcha.com',
      };
    }

    // AntiCaptcha
    if (process.env.ANTICAPTCHA_API_KEY) {
      config.captcha.providers.anticaptcha = {
        apiKey: process.env.ANTICAPTCHA_API_KEY,
        endpoint: 'https://api.anti-captcha.com',
      };
    }

    // CapSolver
    if (process.env.CAPSOLVER_API_KEY) {
      config.captcha.providers.capsolver = {
        apiKey: process.env.CAPSOLVER_API_KEY,
        endpoint: 'https://api.capsolver.com',
      };
    }

    // Human behavior configuration
    if (process.env.SCRAPING_HUMAN_BEHAVIOR_ENABLED) {
      config.humanBehavior.enabled = process.env.SCRAPING_HUMAN_BEHAVIOR_ENABLED === 'true';
    }

    // Retry configuration
    if (process.env.SCRAPING_MAX_ATTEMPTS) {
      config.retry.maxAttempts = parseInt(process.env.SCRAPING_MAX_ATTEMPTS, 10);
    }

    if (process.env.SCRAPING_INITIAL_DELAY) {
      config.retry.initialDelay = parseInt(process.env.SCRAPING_INITIAL_DELAY, 10);
    }

    if (process.env.SCRAPING_MAX_DELAY) {
      config.retry.maxDelay = parseInt(process.env.SCRAPING_MAX_DELAY, 10);
    }

    // Rate limiting
    if (process.env.SCRAPING_RATE_LIMIT_ENABLED) {
      config.rateLimit.enabled = process.env.SCRAPING_RATE_LIMIT_ENABLED === 'true';
    }

    if (process.env.SCRAPING_REQUESTS_PER_MINUTE) {
      config.rateLimit.requestsPerMinute = parseInt(process.env.SCRAPING_REQUESTS_PER_MINUTE, 10);
    }

    if (process.env.SCRAPING_CONCURRENT_REQUESTS) {
      config.rateLimit.concurrent = parseInt(process.env.SCRAPING_CONCURRENT_REQUESTS, 10);
    }

    return config;
  }

  static updateConfig(updates: Partial<ScrapingConfig>): void {
    this.config = { ...this.getConfig(), ...updates };
  }

  static resetConfig(): void {
    this.config = null;
  }
}
