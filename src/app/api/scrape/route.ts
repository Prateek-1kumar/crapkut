import { NextRequest, NextResponse } from 'next/server';
import { ProductionScraper } from '@/lib/enhanced-scraper';
import { ConfigProvider } from '@/lib/config-provider';
import { AdaptiveConfigProvider } from '@/lib/adaptive-config';
import type { ScrapeRequest, ScrapeResponse } from '@/types/scraping';

// Note: We'll create a new scraper instance for each request to ensure proper cleanup
// and adaptive configuration per URL

export async function POST(request: NextRequest): Promise<NextResponse> {
  let scraperInstance: ProductionScraper | null = null;
  
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

    console.log(`Starting adaptive scrape for: ${url}`);
    console.log(`Extraction spec: ${extractionSpec}`);

    // Analyze the site first to provide better user feedback
    const analysis = AdaptiveConfigProvider.analyzeSite(url);
    console.log(`Site analysis:`, {
      domain: analysis.domain,
      category: analysis.category,
      complexity: analysis.complexity,
      recommendedStrategy: analysis.recommendedStrategy,
      knownIssues: analysis.knownIssues
    });

    // Create new scraper instance with adaptive config
    const config = ConfigProvider.getConfig();
    scraperInstance = new ProductionScraper(config);

    // Start timing
    const scrapeStartTime = Date.now();

    // Set aggressive timeout for Vercel serverless environment (55 seconds max)
    const serverlessTimeout = parseInt(process.env.VERCEL_FUNCTION_TIMEOUT ?? '55000'); 
    
    // Perform adaptive scraping with fallback strategies - fast timeouts for 60s limit
    const result = await Promise.race([
      scraperInstance.scrapeWithFallback({
        url,
        extractionSpec,
        userAgent,
        timeout: 8000, // 8 seconds per strategy attempt
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Function timeout - Vercel serverless limit reached. Try a simpler page.')), serverlessTimeout)
      )
    ]);

    const processingTime = Date.now() - scrapeStartTime;
    console.log(`Scraping completed successfully in ${processingTime}ms using adaptive strategy`);

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: result.data ? {
        processingTime,
        elementsFound: result.data.totalElements || 0,
        extractionMethod: result.data.extractionMethod || 'unknown',
        timestamp: result.timestamp.toISOString(),
        attempts: 1,
        proxyUsed: 'none',
        userAgent: userAgent ?? 'default',
        siteAnalysis: {
          category: analysis.category,
          complexity: analysis.complexity,
          strategy: analysis.recommendedStrategy
        }
      } : undefined,
    } as ScrapeResponse);

  } catch (error) {
    console.error('Adaptive scraping API error:', error);

    let errorMessage = 'An unexpected error occurred';
    let suggestions: string[] = [];

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide helpful suggestions based on error type
      if (errorMessage.includes('timeout')) {
        suggestions = [
          'The page took too long to load. Try a simpler page or more specific extraction.',
          'Some sites block automated access - try again later.',
          'For complex sites, try extracting specific elements instead of everything.'
        ];
      } else if (errorMessage.includes('navigation')) {
        suggestions = [
          'The page could not be accessed. Check if the URL is correct.',
          'The site might be down or blocking automated requests.',
          'Try adding "https://" to the URL if missing.'
        ];
      } else if (errorMessage.includes('extraction')) {
        suggestions = [
          'No data could be extracted with the given specification.',
          'Try using different keywords or CSS selectors.',
          'The page structure might not match your extraction criteria.'
        ];
      } else {
        suggestions = [
          'Try again with a different extraction specification.',
          'Some sites require specific approaches - the system will learn and adapt.',
          'For best results, use simple sites like news articles or blogs.'
        ];
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        suggestions,
      } as ScrapeResponse,
      { status: 500 }
    );
  } finally {
    // Always cleanup the scraper instance
    if (scraperInstance) {
      try {
        await scraperInstance.close();
      } catch (cleanupError) {
        console.error('Error during scraper cleanup:', cleanupError);
      }
    }
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Adaptive Web Scraping API is running',
    features: [
      'Intelligent site analysis',
      'Adaptive strategy selection',
      'Automatic fallback mechanisms',
      'Optimized for serverless deployment'
    ],
    endpoints: {
      POST: '/api/scrape - Submit scraping job with adaptive optimization',
    },
    version: '2.0.0',
  });
}
