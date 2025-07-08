import { z } from 'zod';

// Product search request schema
export const ProductSearchSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  category: z.string().optional(),
  country: z.string().min(2, "Country code is required"),
  maxResults: z.number().min(1).max(50).default(10),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
});

export type ProductSearchRequest = z.infer<typeof ProductSearchSchema>;

// Product result interface
export interface ProductResult {
  link: string;
  price: string;
  currency: string;
  productName: string;
  websiteName: string;
  availability: string;
  shipping?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  features?: string[];
  seller?: string;
  condition?: string;
  lastUpdated: string;
}

// Website configuration interface
export interface WebsiteConfig {
  name: string;
  baseUrl: string;
  searchUrl: string;
  countries: string[];
  selectors: {
    productContainer: string;
    productName: string;
    price: string;
    link: string;
    availability?: string;
    rating?: string;
    image?: string;
    seller?: string;
    shipping?: string;
  };
  currency: string;
  requiresJs?: boolean;
  rateLimit?: number;
}

// Country-specific website mapping
export interface CountryWebsites {
  [countryCode: string]: WebsiteConfig[];
}

// Search result with metadata
export interface SearchResult {
  products: ProductResult[];
  searchQuery: string;
  country: string;
  totalResults: number;
  searchTime: number;
  websites: string[];
  insights?: {
    priceRange: { min: number; max: number };
    averagePrice: number;
    bestValue: ProductResult;
    premiumOption: ProductResult;
    recommendations: string[];
    warnings?: string[];
  };
  confidence?: number;
  errors?: string[];
}

// AI analysis request
export interface AIAnalysisRequest {
  products: ProductResult[];
  originalQuery: string;
  userPreferences?: {
    prioritizePrice?: boolean;
    prioritizeRating?: boolean;
    preferredSellers?: string[];
    avoidSellers?: string[];
  };
}

// AI analysis response
export interface AIAnalysisResponse {
  rankedProducts: ProductResult[];
  insights: {
    priceRange: { min: number; max: number };
    averagePrice: number;
    bestValue: ProductResult;
    premiumOption: ProductResult;
    recommendations: string[];
    warnings?: string[];
  };
  confidence: number;
}

// Error types
export class PriceComparisonError extends Error {
  constructor(
    message: string,
    public code: string,
    public website?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PriceComparisonError';
  }
}

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'PARSING_ERROR' 
  | 'RATE_LIMIT_ERROR'
  | 'INVALID_COUNTRY'
  | 'NO_RESULTS_FOUND'
  | 'AI_SERVICE_ERROR'
  | 'INVALID_REQUEST'; 