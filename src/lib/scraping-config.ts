// Enhanced scraping configuration
export interface ScrapingConfig {
  // Browser settings
  browser: {
    headless: boolean;
    slowMo: number;
    timeout: number;
    viewport: {
      width: number;
      height: number;
    };
  };

  // Stealth settings
  stealth: {
    enabled: boolean;
    plugins: string[];
  };

  // Proxy settings
  proxy: {
    enabled: boolean;
    type: 'rotating' | 'static' | 'residential';
    providers: {
      scraperapi?: {
        apiKey: string;
        endpoint: string;
      };
      brightdata?: {
        username: string;
        password: string;
        endpoint: string;
        port: number;
      };
      smartproxy?: {
        username: string;
        password: string;
        endpoint: string;
        port: number;
      };
    };
    rotationInterval: number; // in milliseconds
  };

  // CAPTCHA handling
  captcha: {
    enabled: boolean;
    providers: {
      twocaptcha?: {
        apiKey: string;
        endpoint: string;
      };
      anticaptcha?: {
        apiKey: string;
        endpoint: string;
      };
      capsolver?: {
        apiKey: string;
        endpoint: string;
      };
    };
    timeout: number;
    maxRetries: number;
  };

  // Human behavior simulation
  humanBehavior: {
    enabled: boolean;
    mouseMovement: boolean;
    randomDelays: boolean;
    scrollBehavior: boolean;
    typingSpeed: {
      min: number;
      max: number;
    };
  };

  // Retry logic
  retry: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
    maxDelay: number;
  };

  // Rate limiting
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    concurrent: number;
  };
}

export const defaultConfig: ScrapingConfig = {
  browser: {
    headless: true,
    slowMo: 50,
    timeout: 60000,
    viewport: {
      width: 1366,
      height: 768,
    },
  },
  
  stealth: {
    enabled: true,
    plugins: ['stealth', 'recaptcha'],
  },

  proxy: {
    enabled: false,
    type: 'rotating',
    providers: {},
    rotationInterval: 300000, // 5 minutes
  },

  captcha: {
    enabled: false,
    providers: {},
    timeout: 120000, // 2 minutes
    maxRetries: 3,
  },

  humanBehavior: {
    enabled: true,
    mouseMovement: true,
    randomDelays: true,
    scrollBehavior: true,
    typingSpeed: {
      min: 50,
      max: 150,
    },
  },

  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
    maxDelay: 30000,
  },

  rateLimit: {
    enabled: true,
    requestsPerMinute: 30,
    concurrent: 3,
  },
};

// User agent pool for rotation
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

// Common screen resolutions for random viewport
export const SCREEN_RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1600, height: 900 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1200 },
];

// Common timezone offsets
export const TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/Chicago',
];
