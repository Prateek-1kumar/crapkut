/**
 * Type definitions for web scraping functionality
 */

export interface Product {
  id: number;
  title: string;
  price: string;
  element?: string;
  className?: string;
}

export interface Image {
  id: number;
  src: string;
  alt: string;
  width: number | string;
  height: number | string;
}

export interface Link {
  id: number;
  text: string;
  href: string;
  domain?: string;
}

export interface Heading {
  id: number;
  level: string;
  text: string;
  className?: string;
}

export interface TextParagraph {
  id: number;
  text: string;
  wordCount: number;
}

export interface GenericElement {
  id: number;
  text: string;
  element: string;
  className?: string;
}

export interface ExtractedData {
  products?: Product[];
  images?: Image[];
  links?: Link[];
  headings?: Heading[];
  textContent?: TextParagraph[];
  elements?: GenericElement[];
  genericResults?: unknown[];
  extractedAt: Date;
  sourceUrl: string;
  extractionMethod: string;
  totalElements: number;
}

export interface ScrapingOptions {
  url: string;
  extractionSpec: string;
  waitForSelector?: string;
  timeout?: number;
  userAgent?: string;
  config?: Record<string, unknown>; // Partial<ScrapingConfig> - avoiding circular import
  captcha?: {
    enabled: boolean;
    provider?: string;
  };
}

export interface ScrapingResult {
  success: boolean;
  data?: ExtractedData;
  error?: string;
  timestamp: Date;
}

export interface RetryState {
  attempt: number;
  lastError: Error | null;
  backoffDelay: number;
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface ViewportConfig {
  width: number;
  height: number;
}
