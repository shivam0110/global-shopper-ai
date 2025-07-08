import { NextRequest, NextResponse } from 'next/server';
import { ProductSearchSchema, PriceComparisonError } from '../../../types';
import { PriceComparisonService } from '../../../services/priceComparison';

// Rate limiting setup
const requestTimes = new Map<string, number[]>();
const RATE_LIMIT = 10; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const times = requestTimes.get(clientId) || [];
  
  // Remove old requests outside the window
  const recentTimes = times.filter(time => now - time < RATE_WINDOW);
  
  if (recentTimes.length >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentTimes.push(now);
  requestTimes.set(clientId, recentTimes);
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Extract client identifier for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Get search mode from header
    const searchMode = request.headers.get('X-Search-Mode') || 'google';
    const useGoogleSearch = searchMode === 'google';

    // Parse request body
    const body = await request.json();
    const { productName, country, maxResults = 10 } = body;

    // Validate required fields
    if (!productName || !country) {
      return NextResponse.json(
        { error: 'Product name and country are required' },
        { status: 400 }
      );
    }

    // Create service instance with API key and search mode
    const priceService = new PriceComparisonService(apiKey, useGoogleSearch);

    // Perform the search
    const result = await priceService.searchProducts({
      productName,
      country: country.toUpperCase(),
      maxResults: Math.min(maxResults, 50), // Cap at 50 results
    });

    // Add search mode info to response
    return NextResponse.json({
      ...result,
      searchMode: useGoogleSearch ? 'Google Search (Global)' : 'Direct Scraping (Limited)',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Search API error:', error);

    // Handle known error types
    if (error instanceof PriceComparisonError && error.code === 'INVALID_REQUEST') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof PriceComparisonError && error.code === 'INVALID_COUNTRY') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof PriceComparisonError && error.code === 'NO_RESULTS_FOUND') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof PriceComparisonError && error.code === 'AI_SERVICE_ERROR') {
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again.' },
        { status: 503 }
      );
    }

    if (error instanceof PriceComparisonError && error.code === 'GOOGLE_SEARCH_ERROR') {
      return NextResponse.json(
        { error: 'Google search failed. Please try again or switch to direct scraping mode.' },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }
    
    const productName = searchParams.get('productName');
    const country = searchParams.get('country');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const category = searchParams.get('category') || undefined;
    
    if (!productName || !country) {
      return NextResponse.json(
        { error: 'productName and country are required' },
        { status: 400 }
      );
    }

    const searchRequest = {
      productName,
      country,
      maxResults,
      category
    };

    // Validate using schema
    const validationResult = ProductSearchSchema.safeParse(searchRequest);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Create service instance with user's API key
    const priceComparisonService = new PriceComparisonService(apiKey);
    const result = await priceComparisonService.searchProducts(validationResult.data);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Search API error:', error);
    
    if (error instanceof PriceComparisonError) {
      const statusCode = getStatusCodeForError(error.code);
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          website: error.website 
        },
        { status: statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getStatusCodeForError(errorCode: string): number {
  switch (errorCode) {
    case 'INVALID_REQUEST':
      return 400;
    case 'INVALID_COUNTRY':
      return 400;
    case 'NO_RESULTS_FOUND':
      return 404;
    case 'RATE_LIMIT_ERROR':
      return 429;
    case 'AI_SERVICE_ERROR':
      return 503;
    case 'NETWORK_ERROR':
      return 502;
    case 'PARSING_ERROR':
      return 502;
    default:
      return 500;
  }
} 