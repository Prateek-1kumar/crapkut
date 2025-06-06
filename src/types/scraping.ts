export interface ScrapeRequest {
  url: string;
  extractionSpec: string;
  userAgent?: string;
}

export interface ScrapeResponse {
  success: boolean;
  data?: ExtractedData;
  error?: string;
  metadata?: ScrapingMetadata;
}

export interface ExtractedData {
  [key: string]: unknown;
  extractedAt: string;
  sourceUrl: string;
  // Common extraction results
  products?: Array<{
    id: number;
    title?: string;
    price?: string;
    url?: string;
    image?: string;
    rating?: number;
    description?: string;
    element?: string;
    className?: string;
  }>;
  images?: Array<{
    id: number;
    src: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
  }>;
  links?: Array<{
    id: number;
    url: string;
    text?: string;
    title?: string;
  }>;
  headings?: string[];
  textContent?: string[];
  genericResults?: Array<Record<string, unknown>>;
  elements?: Array<Record<string, unknown>>;
  searchTerms?: string[];
}

export interface ScrapingMetadata {
  processingTime: number;
  elementsFound: number;
  extractionMethod: string;
  timestamp: string;
  attempts?: number;
  proxyUsed?: string;
  userAgent?: string;
  captchaSolved?: boolean;
  siteAnalysis?: {
    category: string;
    complexity: string;
    strategy: string;
  };
}

export interface ScrapeJob {
  id: string;
  url: string;
  extractionSpec: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: ExtractedData;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DatabaseRecord {
  id: string;
  url: string;
  extraction_spec: string;
  extracted_data: ExtractedData;
  created_at: string;
  metadata: ScrapingMetadata;
}
