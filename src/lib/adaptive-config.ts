// Adaptive configuration system for intelligent scraping strategy selection
import { ScrapingConfig, defaultConfig } from './scraping-config';
import { logger } from '@/utils/logger';

export type ScrapingStrategy = 'fast' | 'balanced' | 'stealth';

export interface SiteAnalysis {
  domain: string;
  category: SiteCategory;
  complexity: SiteComplexity;
  knownIssues: string[];
  recommendedStrategy: ScrapingStrategy;
}

export type SiteCategory = 
  | 'news'
  | 'blog' 
  | 'ecommerce'
  | 'social'
  | 'spa'
  | 'educational'
  | 'government'
  | 'corporate'
  | 'unknown';

export type SiteComplexity = 'simple' | 'moderate' | 'complex';

export interface StrategyConfig {
  resourceBlocking: {
    images: boolean;
    css: boolean;
    fonts: boolean;
    media: boolean;
  };
  stealth: {
    enabled: boolean;
    humanBehavior: boolean;
  };
  timeouts: {
    navigation: number;
    page: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  waitTime: number;
}

export class AdaptiveConfigProvider {
  private static successCache = new Map<string, ScrapingStrategy>();
  private static failureCache = new Map<string, Set<ScrapingStrategy>>();

  // Known site patterns and their characteristics
  private static readonly SITE_PATTERNS = {
    news: [
      'bbc.com', 'cnn.com', 'nytimes.com', 'reuters.com', 'theguardian.com',
      'washingtonpost.com', 'wsj.com', 'npr.org', 'techcrunch.com',
      'news.ycombinator.com', 'reddit.com'
    ],
    blog: [
      'medium.com', 'dev.to', 'hashnode.com', 'substack.com', 'wordpress.com',
      'blogger.com', 'tumblr.com'
    ],
    ecommerce: [
      'amazon.com', 'ebay.com', 'shopify.com', 'etsy.com', 'walmart.com',
      'target.com', 'bestbuy.com', 'alibaba.com'
    ],
    social: [
      'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com',
      'tiktok.com', 'youtube.com', 'pinterest.com'
    ],
    spa: [
      'gmail.com', 'outlook.com', 'notion.so', 'figma.com', 'canva.com',
      'slack.com', 'discord.com', 'trello.com'
    ],
    educational: [
      'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'eduveda.academy',
      'mit.edu', 'stanford.edu', 'harvard.edu'
    ],
    government: [
      'gov.uk', 'gov.in', 'whitehouse.gov', 'europa.eu'
    ],
    corporate: [
      'microsoft.com', 'google.com', 'apple.com', 'meta.com', 'openai.com'
    ]
  };

  // Strategy configurations
  private static readonly STRATEGIES: Record<ScrapingStrategy, StrategyConfig> = {
    fast: {
      resourceBlocking: {
        images: true,
        css: true,
        fonts: true,
        media: true
      },
      stealth: {
        enabled: false,
        humanBehavior: false
      },
      timeouts: {
        navigation: 3000,  // 3 seconds for fast strategy
        page: 3000
      },
      viewport: {
        width: 1024,
        height: 768
      },
      waitTime: 200  // Minimal wait time for fast strategy
    },
    balanced: {
      resourceBlocking: {
        images: true,
        css: false,
        fonts: true,
        media: true
      },
      stealth: {
        enabled: true,
        humanBehavior: false
      },
      timeouts: {
        navigation: 5000,  // 5 seconds for balanced strategy
        page: 5000
      },
      viewport: {
        width: 1366,
        height: 768
      },
      waitTime: 500  // Short wait time for balanced strategy
    },
    stealth: {
      resourceBlocking: {
        images: false,
        css: false,
        fonts: false,
        media: false
      },
      stealth: {
        enabled: true,
        humanBehavior: true
      },
      timeouts: {
        navigation: 8000,  // 8 seconds max for stealth strategy
        page: 8000
      },
      viewport: {
        width: 1920,
        height: 1080
      },
      waitTime: 1000  // Still quick for serverless
    }
  };

  /**
   * Analyze a URL and determine the optimal scraping strategy
   */
  static analyzeSite(url: string): SiteAnalysis {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');
      
      // Check for known site patterns
      const category = this.categorizeUrl(domain);
      const complexity = this.assessComplexity(domain, category);
      const knownIssues = this.getKnownIssues(domain);
      
      // Check success/failure cache
      const recommendedStrategy = this.getRecommendedStrategy(domain, category, complexity);
      
      return {
        domain,
        category,
        complexity,
        knownIssues,
        recommendedStrategy
      };
    } catch (error) {
      logger.warn('Failed to analyze site URL:', { url, error });
      return {
        domain: 'unknown',
        category: 'unknown',
        complexity: 'moderate',
        knownIssues: ['URL parsing failed'],
        recommendedStrategy: 'balanced'
      };
    }
  }

  /**
   * Get the configuration for a specific strategy
   */
  static getStrategyConfig(strategy: ScrapingStrategy): StrategyConfig {
    return { ...this.STRATEGIES[strategy] };
  }

  /**
   * Generate scraping configuration based on analysis
   */
  static generateConfig(analysis: SiteAnalysis, baseConfig: ScrapingConfig = defaultConfig): ScrapingConfig {
    const strategyConfig = this.getStrategyConfig(analysis.recommendedStrategy);
    
    return {
      ...baseConfig,
      browser: {
        ...baseConfig.browser,
        timeout: strategyConfig.timeouts.navigation,
        viewport: strategyConfig.viewport
      },
      stealth: {
        ...baseConfig.stealth,
        enabled: strategyConfig.stealth.enabled
      },
      humanBehavior: {
        ...baseConfig.humanBehavior,
        enabled: strategyConfig.stealth.humanBehavior,
        mouseMovement: strategyConfig.stealth.humanBehavior,
        randomDelays: strategyConfig.stealth.humanBehavior,
        scrollBehavior: strategyConfig.stealth.humanBehavior
      },
      retry: {
        ...baseConfig.retry,
        maxAttempts: analysis.complexity === 'complex' ? 3 : 2
      }
    };
  }

  /**
   * Get the fallback chain for a given strategy
   */
  static getFallbackChain(initialStrategy: ScrapingStrategy): ScrapingStrategy[] {
    const chains: Record<ScrapingStrategy, ScrapingStrategy[]> = {
      fast: ['fast', 'balanced', 'stealth'],
      balanced: ['balanced', 'stealth', 'fast'],
      stealth: ['stealth', 'balanced', 'fast']
    };
    
    return chains[initialStrategy];
  }

  /**
   * Record successful strategy for a domain
   */
  static recordSuccess(domain: string, strategy: ScrapingStrategy): void {
    this.successCache.set(domain, strategy);
    logger.info('Recorded successful strategy for domain:', { domain, strategy });
  }

  /**
   * Record failed strategy for a domain
   */
  static recordFailure(domain: string, strategy: ScrapingStrategy): void {
    if (!this.failureCache.has(domain)) {
      this.failureCache.set(domain, new Set());
    }
    this.failureCache.get(domain)!.add(strategy);
    logger.info('Recorded failed strategy for domain:', { domain, strategy });
  }

  /**
   * Check if a strategy has previously failed for a domain
   */
  static hasPreviouslyFailed(domain: string, strategy: ScrapingStrategy): boolean {
    return this.failureCache.get(domain)?.has(strategy) ?? false;
  }

  /**
   * Get resource blocking configuration for strategy
   */
  static getResourceBlockingConfig(strategy: ScrapingStrategy): StrategyConfig['resourceBlocking'] {
    return this.STRATEGIES[strategy].resourceBlocking;
  }

  private static categorizeUrl(domain: string): SiteCategory {
    for (const [category, patterns] of Object.entries(this.SITE_PATTERNS)) {
      if (patterns.some(pattern => domain.includes(pattern))) {
        return category as SiteCategory;
      }
    }
    
    // Heuristic categorization based on domain patterns
    if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) {
      return 'ecommerce';
    }
    if (domain.includes('blog') || domain.includes('news')) {
      return 'blog';
    }
    if (domain.includes('edu') || domain.includes('academy') || domain.includes('learn')) {
      return 'educational';
    }
    if (domain.includes('gov')) {
      return 'government';
    }
    
    return 'unknown';
  }

  private static assessComplexity(domain: string, category: SiteCategory): SiteComplexity {
    // SPA sites are generally more complex
    if (category === 'spa' || category === 'social') {
      return 'complex';
    }
    
    // News and blogs are usually simpler
    if (category === 'news' || category === 'blog') {
      return 'simple';
    }
    
    // E-commerce sites vary but lean moderate
    if (category === 'ecommerce') {
      return 'moderate';
    }
    
    // Educational sites are usually well-structured
    if (category === 'educational') {
      return 'simple';
    }
    
    return 'moderate';
  }

  private static getKnownIssues(domain: string): string[] {
    const issues: string[] = [];
    
    // Known problematic sites
    const problematicSites = {
      'amazon.com': ['Dynamic content loading', 'Anti-bot measures'],
      'facebook.com': ['Heavy JavaScript', 'Login required'],
      'twitter.com': ['Rate limiting', 'Dynamic loading'],
      'linkedin.com': ['Login walls', 'Anti-scraping'],
      'instagram.com': ['Login required', 'Dynamic content']
    };
    
    for (const [site, siteIssues] of Object.entries(problematicSites)) {
      if (domain.includes(site)) {
        issues.push(...siteIssues);
      }
    }
    
    return issues;
  }

  private static getRecommendedStrategy(
    domain: string, 
    category: SiteCategory, 
    complexity: SiteComplexity
  ): ScrapingStrategy {
    // Check if we have a successful strategy cached
    const cached = this.successCache.get(domain);
    if (cached) {
      return cached;
    }
    
    // Strategy based on site characteristics
    if (complexity === 'simple' && (category === 'news' || category === 'blog' || category === 'educational')) {
      return 'fast';
    }
    
    if (category === 'spa' || category === 'social' || complexity === 'complex') {
      return 'stealth';
    }
    
    // Default to balanced for most sites
    return 'balanced';
  }
}
