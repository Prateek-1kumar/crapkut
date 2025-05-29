import { NextRequest, NextResponse } from 'next/server';
import { ProductionScraper } from '@/lib/enhanced-scraper';
import { ConfigProvider } from '@/lib/config-provider';
import type { ScrapeRequest, ScrapeResponse } from '@/types/scraping';

let scraper: ProductionScraper | null = null;

const getScraper = async (): Promise<ProductionScraper> => {
  if (!scraper) {
    const config = ConfigProvider.getConfig();
    scraper = new ProductionScraper(config);
    await scraper.initialize();
  }
  return scraper;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: ScrapeRequest = await request.json();
    const { url, extractionSpec, userAgent } = body;

    // Validate input
    if (!url || !extractionSpec) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL and extraction specification are required',
        } as ScrapeResponse,
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL format',
        } as ScrapeResponse,
        { status: 400 }
      );
    }

    console.log(`Starting scrape for: ${url}`);
    console.log(`Extraction spec: ${extractionSpec}`);

    // Get scraper instance
    const scraperInstance = await getScraper();

    // Start timing
    const scrapeStartTime = Date.now();

    // Perform scraping
    const result = await scraperInstance.scrape({
      url,
      extractionSpec,
      userAgent,
      timeout: parseInt(process.env.MAX_SCRAPING_TIMEOUT ?? '30000'),
    });

    // Add delay for polite scraping
    const delay = parseInt(process.env.SCRAPING_DELAY_MS ?? '1000');
    await new Promise(resolve => setTimeout(resolve, delay));

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: result.data ? {
        processingTime: Date.now() - scrapeStartTime,
        elementsFound: result.data.totalElements || 0,
        extractionMethod: result.data.extractionMethod || 'unknown',
        timestamp: result.timestamp.toISOString(),
        attempts: 1,
        proxyUsed: 'none',
        userAgent: userAgent ?? 'default',
      } : undefined,
    } as ScrapeResponse);

  } catch (error) {
    console.error('Scraping API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as ScrapeResponse,
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Web Scraping API is running',
    endpoints: {
      POST: '/api/scrape - Submit scraping job',
    },
    version: '1.0.0',
  });
}

// Cleanup on process exit
process.on('exit', async () => {
  if (scraper) {
    await scraper.close();
  }
});

process.on('SIGINT', async () => {
  if (scraper) {
    await scraper.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (scraper) {
    await scraper.close();
  }
  process.exit(0);
});
