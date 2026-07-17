import { NextRequest, NextResponse } from 'next/server';
import { runPriceIntelligenceEngine } from '@/lib/engine';
import { ZodError } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Universal Price Comparison & Intelligence API Endpoint.
 * Accepts POST JSON `{ input: "...", mode?: "auto"|"query"|"url", targetVendors?: [...] }`
 * OR GET query param `?q=...` for rapid testing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = await runPriceIntelligenceEngine(body);
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues || (error as any).errors,
        },
        { status: 400 }
      );
    }

    console.error('[API:Compare] Engine execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal engine error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('url') || searchParams.get('input');

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing query parameter "?q=" or "?url="',
          example: '/api/compare?q=Sony+WH-1000XM5',
        },
        { status: 400 }
      );
    }

    const report = await runPriceIntelligenceEngine({
      input: query,
      mode: searchParams.has('url') ? 'url' : 'auto',
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('[API:Compare GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal engine error',
      },
      { status: 500 }
    );
  }
}
