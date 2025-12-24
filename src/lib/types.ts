/**
 * Core types for the Price Comparison Engine
 */

export type Vendor =
    | 'amazon'
    | 'flipkart'
    | 'ebay'
    | 'snapdeal'
    | 'meesho'
    | 'jiomart'
    | 'croma'
    | 'reliance-digital'
    | 'vijay-sales'
    | 'myntra'
    | 'ajio'
    | 'tatacliq'
    | 'nykaa'
    | 'aliexpress';

export interface ScrapeResult {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    currency: string;
    vendor: Vendor;
    url: string;
    image?: string;
    rating?: number;
    reviews?: number;
    discount?: string;
    inStock?: boolean;
}

export interface VendorError {
    vendor: Vendor;
    message: string;
    code?: string;
}

export interface VendorTiming {
    vendor: Vendor;
    durationMs: number;
    resultCount: number;
}

export interface SearchResponse {
    success: boolean;
    query: string;
    totalResults: number;
    results: ScrapeResult[];
    errors: VendorError[];
    timing: {
        totalMs: number;
        perVendor: VendorTiming[];
    };
    cached: boolean;
    timestamp: string;
}

export interface SearchRequest {
    query: string;
    vendors?: Vendor[];
    maxResultsPerVendor?: number;
    timeout?: number;
}
