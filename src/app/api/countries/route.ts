import { NextResponse } from 'next/server';
import { PriceComparisonService } from '../../../services/priceComparison';

export async function GET() {
  try {
    // Create a temporary service instance without API key for static data
    const priceComparisonService = new PriceComparisonService();
    const countries = priceComparisonService.getSupportedCountries();
    
    return NextResponse.json({
      countries,
      total: countries.length
    });
    
  } catch (error) {
    console.error('Countries API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get supported countries' },
      { status: 500 }
    );
  }
} 