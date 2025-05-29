/**
 * Utility functions for web scraping operations
 */

import { type Page } from 'puppeteer';
import type { Product, Image, Link, Heading, TextParagraph, GenericElement } from '@/types/scraper';

/**
 * Sleep utility for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Validates if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely gets text content from an element
 */
export const getTextContent = (element: Element | null): string => {
  return element?.textContent?.trim() ?? '';
};

/**
 * Safely gets attribute value from an element
 */
export const getAttribute = (element: Element | null, attr: string): string => {
  return element?.getAttribute(attr) ?? '';
};

/**
 * Checks if a URL is absolute
 */
export const isAbsoluteUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
};

/**
 * Converts relative URL to absolute URL
 */
export const makeAbsoluteUrl = (baseUrl: string, relativeUrl: string): string => {
  if (isAbsoluteUrl(relativeUrl)) {
    return relativeUrl;
  }
  
  try {
    const base = new URL(baseUrl);
    return new URL(relativeUrl, base).href;
  } catch {
    return relativeUrl;
  }
};

/**
 * Gets domain from URL
 */
export const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
};

/**
 * Counts words in text
 */
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Generic element extractor for common patterns
 */
export const extractElementsBySelectors = async (
  page: Page,
  selectors: string[],
  extractorFn: (element: Element, index: number) => unknown
): Promise<unknown[]> => {
  return await page.evaluate((selectorList, extractor) => {
    const results: unknown[] = [];
    
    for (const selector of selectorList) {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach((element, index) => {
        const extracted = extractor(element, index);
        if (extracted) {
          results.push(extracted);
        }
      });
      
      if (results.length > 0) break;
    }
    
    return results;
  }, selectors, extractorFn);
};

/**
 * Product extractor function
 */
export const extractProduct = (element: Element, index: number): Product | null => {
  const titleElement = element.querySelector('h1, h2, h3, .title, [class*="title"], [class*="name"]');
  const priceElement = element.querySelector('.price, [class*="price"], [class*="cost"]');
  
  if (!titleElement && !priceElement) {
    return null;
  }
  
  return {
    id: index + 1,
    title: getTextContent(titleElement) || 'No title found',
    price: getTextContent(priceElement) || 'No price found',
    element: element.tagName,
    className: element.className || undefined,
  };
};

/**
 * Image extractor function
 */
export const extractImage = (element: Element, index: number): Image | null => {
  if (!(element instanceof HTMLImageElement)) {
    return null;
  }
  
  const src = element.src || getAttribute(element, 'data-src') || getAttribute(element, 'data-lazy-src');
  
  if (!src?.startsWith('http')) {
    return null;
  }
  
  return {
    id: index + 1,
    src,
    alt: element.alt || 'No alt text',
    width: element.width || 'unknown',
    height: element.height || 'unknown',
  };
};

/**
 * Link extractor function
 */
export const extractLink = (element: Element, index: number, baseUrl: string): Link | null => {
  if (!(element instanceof HTMLAnchorElement)) {
    return null;
  }
  
  const href = element.href;
  const text = getTextContent(element);
  
  if (!href || !text) {
    return null;
  }
  
  const absoluteUrl = makeAbsoluteUrl(baseUrl, href);
  
  return {
    id: index + 1,
    text,
    href: absoluteUrl,
    domain: getDomain(absoluteUrl),
  };
};

/**
 * Heading extractor function
 */
export const extractHeading = (element: Element, index: number): Heading | null => {
  const text = getTextContent(element);
  
  if (!text) {
    return null;
  }
  
  return {
    id: index + 1,
    level: element.tagName.toLowerCase(),
    text,
    className: element.className || undefined,
  };
};

/**
 * Text paragraph extractor function
 */
export const extractParagraph = (element: Element, index: number): TextParagraph | null => {
  const text = getTextContent(element);
  
  if (!text || text.length < 20) {
    return null;
  }
  
  return {
    id: index + 1,
    text,
    wordCount: countWords(text),
  };
};

/**
 * Generic element extractor function
 */
export const extractGenericElement = (element: Element, index: number): GenericElement | null => {
  const text = getTextContent(element);
  
  if (!text) {
    return null;
  }
  
  return {
    id: index + 1,
    text,
    element: element.tagName,
    className: element.className || undefined,
  };
};

/**
 * Counts elements recursively in data structure
 */
export const countElementsRecursive = (data: unknown): number => {
  let count = 0;
  
  const countRecursive = (obj: unknown): void => {
    if (Array.isArray(obj)) {
      count += obj.length;
      obj.forEach(countRecursive);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(countRecursive);
    }
  };

  countRecursive(data);
  return count;
};

/**
 * Checks if a string might be a CSS selector
 */
export const isCSSSelector = (str: string): boolean => {
  const selectorPatterns = [
    /^[.#][\w-]+/,  // class or ID selector
    /^\w+$/,        // tag selector
    /\[[\w-]+(=|~=|\|=|\^=|\$=|\*=)?"?[^"]*"?\]/,  // attribute selector
    /:\w+/,         // pseudo selector
  ];
  
  return selectorPatterns.some(pattern => pattern.test(str.trim()));
};

/**
 * Keyword matching utilities
 */
export const hasKeywords = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
};

export const PRODUCT_KEYWORDS = ['product', 'price', 'title', 'name', 'cost', 'item'];
export const IMAGE_KEYWORDS = ['image', 'img', 'photo', 'picture', 'gallery'];
export const LINK_KEYWORDS = ['link', 'url', 'href', 'anchor'];
export const HEADING_KEYWORDS = ['heading', 'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
export const TEXT_KEYWORDS = ['text', 'content', 'paragraph', 'description', 'article'];

/**
 * Common selector patterns
 */
export const PRODUCT_SELECTORS = [
  '[data-testid*="product"]',
  '.product',
  '.item',
  '[class*="product"]',
  '[class*="item"]',
];

export const IMAGE_SELECTORS = ['img'];

export const LINK_SELECTORS = ['a[href]'];

export const HEADING_SELECTORS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export const TEXT_SELECTORS = ['p', 'div', 'span', 'article'];

/**
 * Error handling utilities
 */
export class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

export class NavigationError extends ScrapingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'NAVIGATION_ERROR', context);
    this.name = 'NavigationError';
  }
}

export class ExtractionError extends ScrapingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'EXTRACTION_ERROR', context);
    this.name = 'ExtractionError';
  }
}

export class TimeoutError extends ScrapingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'TIMEOUT_ERROR', context);
    this.name = 'TimeoutError';
  }
}

export class ProxyError extends ScrapingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'PROXY_ERROR', context);
    this.name = 'ProxyError';
  }
}

/**
 * High-level extraction functions using utility functions
 */

/**
 * Extract products from a page
 */
export const extractProductsFromPage = async (page: Page): Promise<unknown> => {
  const products = await page.evaluate(() => {
    const results: unknown[] = [];
    const productElements = document.querySelectorAll('[data-testid*="product"], .product, .item, [class*="product"], [class*="item"]');
    
    productElements.forEach((element, index) => {
      const titleElement = element.querySelector('h1, h2, h3, .title, [class*="title"], [class*="name"]');
      const priceElement = element.querySelector('.price, [class*="price"], [class*="cost"]');
      
      if (titleElement || priceElement) {
        results.push({
          id: index + 1,
          title: titleElement?.textContent?.trim() ?? 'No title found',
          price: priceElement?.textContent?.trim() ?? 'No price found',
          element: element.tagName,
          className: element.className || undefined,
        });
      }
    });
    
    return { products: results };
  });
  
  return products;
};

/**
 * Extract images from a page
 */
export const extractImagesFromPage = async (page: Page): Promise<unknown> => {
  const images = await page.evaluate(() => {
    const results: unknown[] = [];
    const imageElements = document.querySelectorAll('img');
    
    imageElements.forEach((element, index) => {
      if (element instanceof HTMLImageElement) {
        const src = element.src;
        if (src?.startsWith('http')) {
          results.push({
            id: index + 1,
            src,
            alt: element.alt ?? 'No alt text',
            width: element.width || 'unknown',
            height: element.height || 'unknown',
          });
        }
      }
    });
    
    return { images: results };
  });
  
  return images;
};

/**
 * Extract links from a page
 */
export const extractLinksFromPage = async (page: Page, baseUrl: string): Promise<unknown> => {
  const links = await page.evaluate((url) => {
    const results: unknown[] = [];
    const linkElements = document.querySelectorAll('a[href]');
    
    linkElements.forEach((element, index) => {
      if (element instanceof HTMLAnchorElement) {
        const href = element.href;
        const text = element.textContent?.trim();
        
        if (href && text) {
          let absoluteUrl = href;
          try {
            if (!href.startsWith('http')) {
              absoluteUrl = new URL(href, url).href;
            }
            
            results.push({
              id: index + 1,
              text,
              href: absoluteUrl,
              domain: new URL(absoluteUrl).hostname,
            });
          } catch {
            // Skip invalid URLs
          }
        }
      }
    });
    
    return { links: results };
  }, baseUrl);
  
  return links;
};

/**
 * Extract headings from a page
 */
export const extractHeadingsFromPage = async (page: Page): Promise<unknown> => {
  const headings = await page.evaluate(() => {
    const results: unknown[] = [];
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text) {
        results.push({
          id: index + 1,
          level: element.tagName.toLowerCase(),
          text,
          className: element.className || undefined,
        });
      }
    });
    
    return { headings: results };
  });
  
  return headings;
};

/**
 * Extract text content from a page
 */
export const extractTextContentFromPage = async (page: Page): Promise<unknown> => {
  const textContent = await page.evaluate(() => {
    const results: unknown[] = [];
    const textElements = document.querySelectorAll('p, div, span, article');
    
    textElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length >= 20) {
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        results.push({
          id: index + 1,
          text,
          wordCount,
        });
      }
    });
    
    return { textContent: results };
  });
  
  return textContent;
};

/**
 * Extract elements by CSS selector
 */
export const extractByCSSFromPage = async (page: Page, selector: string): Promise<unknown> => {
  const elements = await page.evaluate((sel) => {
    const results: unknown[] = [];
    const elements = document.querySelectorAll(sel);
    
    elements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text) {
        results.push({
          id: index + 1,
          text,
          element: element.tagName,
          className: element.className || undefined,
        });
      }
    });
    
    return { elements: results };
  }, selector);
  
  return elements;
};

/**
 * Generic extraction based on keywords
 */
export const extractGenericFromPage = async (page: Page, spec: string): Promise<unknown> => {
  const generic = await page.evaluate((specification) => {
    const results: unknown[] = [];
    const allElements = document.querySelectorAll('*');
    const keywords = specification.toLowerCase().split(' ');
    
    allElements.forEach((element, index) => {
      const text = element.textContent?.toLowerCase() ?? '';
      
      let classNameString = '';
      const el = element as Element & { className?: unknown };
      const classNameValue = el.className;

      if (typeof classNameValue === 'string') {
        classNameString = classNameValue.toLowerCase();
      } else if (classNameValue && typeof classNameValue === 'object' && classNameValue !== null && 'baseVal' in classNameValue) {
        const baseVal = (classNameValue as { baseVal: unknown }).baseVal;
        if (typeof baseVal === 'string') {
          classNameString = baseVal.toLowerCase();
        }
      }
      
      const matchesKeywords = keywords.some(keyword => 
        text.includes(keyword) || classNameString.includes(keyword)
      );
      
      if (matchesKeywords && text.length > 10) {
        results.push({
          id: index + 1,
          text: element.textContent?.trim() ?? '',
          element: element.tagName,
          className: classNameString || undefined,
        });
      }
    });
    
    return { elements: results.slice(0, 50) }; // Limit results
  }, spec);
  
  return generic;
};

/**
 * Determine extraction method based on spec
 */
export const determineExtractionMethod = (spec: string): string => {
  const lowerSpec = spec.toLowerCase();
  
  if (hasKeywords(lowerSpec, PRODUCT_KEYWORDS)) {
    return 'product-extraction';
  } else if (hasKeywords(lowerSpec, IMAGE_KEYWORDS)) {
    return 'image-extraction';
  } else if (hasKeywords(lowerSpec, LINK_KEYWORDS)) {
    return 'link-extraction';
  } else if (hasKeywords(lowerSpec, HEADING_KEYWORDS)) {
    return 'heading-extraction';
  } else if (hasKeywords(lowerSpec, TEXT_KEYWORDS)) {
    return 'text-extraction';
  } else if (isCSSSelector(spec)) {
    return 'css-selector';
  } else {
    return 'generic-extraction';
  }
};
