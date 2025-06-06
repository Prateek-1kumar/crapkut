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
    slowMo: 0, // Remove slowMo for serverless speed
    timeout: 15000, // Reduced from 60000 to 15000
    viewport: {
      width: 1024, // Smaller viewport for speed
      height: 768,
    },
  },
  
  stealth: {
    enabled: false, // Disable for speed in serverless
    plugins: [],
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
    timeout: 30000, // Reduced from 120000 to 30000
    maxRetries: 1, // Reduced from 3 to 1
  },

  humanBehavior: {
    enabled: false, // Disable for serverless speed
    mouseMovement: false,
    randomDelays: false,
    scrollBehavior: false,
    typingSpeed: {
      min: 50,
      max: 150,
    },
  },

  retry: {
    maxAttempts: 2, // Reduced from 3 to 2
    backoffMultiplier: 1.5, // Reduced from 2 to 1.5
    initialDelay: 500, // Reduced from 1000 to 500
    maxDelay: 5000, // Reduced from 30000 to 5000
  },

  rateLimit: {
    enabled: false, // Disable for serverless to avoid delays
    requestsPerMinute: 60, // Increased for faster processing
    concurrent: 1, // Reduced for serverless memory limits
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
