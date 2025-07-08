import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProductResult, AIAnalysisRequest, AIAnalysisResponse, PriceComparisonError } from '../types';

export class GeminiService {
  private apiKey: string;
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Analyze and rank products using AI
   */
  async analyzeProducts(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text, request.products);
    } catch (error) {
      throw new PriceComparisonError(
        'AI analysis failed',
        'AI_SERVICE_ERROR',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Determine if scraped products match the user's search query
   */
  async validateProductRelevance(
    searchQuery: string,
    products: ProductResult[]
  ): Promise<ProductResult[]> {
    if (products.length === 0) return [];

    try {
      const prompt = `
You are an expert e-commerce product matcher. Analyze if the following products match the user's search query.

Search Query: "${searchQuery}"

Products to analyze:
${products.map((p, i) => `
${i + 1}. Product: ${p.productName}
   Website: ${p.websiteName}
   Price: ${p.price} ${p.currency}
   Link: ${p.link}
`).join('')}

Instructions:
1. Determine if each product is relevant to the search query
2. Consider variations in naming, model numbers, colors, sizes
3. Exclude products that are clearly different categories or accessories unless specifically searched for
4. Be lenient with brand names and model variations
5. Consider context (e.g., "iPhone 16" should match "iPhone 16 Pro" but not "iPhone 15")

Return ONLY a JSON array of indices (0-based) for products that match the query.
Example: [0, 2, 4] for products at positions 0, 2, and 4.

Response format: [numbers only]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response to get relevant product indices
      const relevantIndices = this.parseRelevanceResponse(text);
      return relevantIndices.map(i => products[i]).filter(Boolean);
    } catch (error) {
      console.warn('Product relevance validation failed, returning all products:', error);
      return products;
    }
  }

  /**
   * Enhance product descriptions and standardize data
   */
  async enhanceProductData(products: ProductResult[]): Promise<ProductResult[]> {
    if (products.length === 0) return [];

    try {
      const prompt = `
You are an e-commerce data enhancement specialist. Clean and standardize the following product data:

Products:
${products.map((p, i) => `
${i + 1}. ${JSON.stringify(p, null, 2)}
`).join('')}

Instructions:
1. Clean and standardize product names (remove excess symbols, fix capitalization)
2. Normalize price format (extract numbers, handle currency symbols)
3. Standardize availability status
4. Extract meaningful features from product names
5. Improve seller information
6. Return the same structure with enhanced data

Return ONLY a JSON array of the enhanced products.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseEnhancedProducts(text, products);
    } catch (error) {
      console.warn('Product enhancement failed, returning original data:', error);
      return products;
    }
  }



  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const { products, originalQuery, userPreferences } = request;

    return `
You are an expert e-commerce price comparison analyst. Analyze and rank the following products based on the user's search query and preferences.

Original Search Query: "${originalQuery}"

User Preferences:
- Prioritize Price: ${userPreferences?.prioritizePrice ?? true}
- Prioritize Rating: ${userPreferences?.prioritizeRating ?? false}
- Preferred Sellers: ${userPreferences?.preferredSellers?.join(', ') ?? 'None'}
- Avoid Sellers: ${userPreferences?.avoidSellers?.join(', ') ?? 'None'}

Products to analyze:
${products.map((p, i) => `
${i + 1}. Product: ${p.productName}
   Website: ${p.websiteName}
   Price: ${p.price} ${p.currency}
   Rating: ${p.rating ?? 'N/A'}
   Availability: ${p.availability}
   Seller: ${p.seller ?? 'N/A'}
   Link: ${p.link}
`).join('')}

Instructions:
1. Rank products from best to worst value considering price, quality, and user preferences
2. Calculate price insights (min, max, average)
3. Identify the best value and premium options
4. Provide specific recommendations and warnings
5. Assign a confidence score (0-100) for your analysis

Return your analysis in this EXACT JSON format:
{
  "rankedIndices": [array of product indices in ranked order, 0-based],
  "priceInsights": {
    "minPrice": number,
    "maxPrice": number,
    "averagePrice": number,
    "bestValueIndex": number,
    "premiumOptionIndex": number
  },
  "recommendations": [array of recommendation strings],
  "warnings": [array of warning strings],
  "confidence": number (0-100)
}
`;
  }

  private parseAIResponse(text: string, originalProducts: ProductResult[]): AIAnalysisResponse {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and construct response
      const rankedProducts = analysis.rankedIndices
        .map((index: number) => originalProducts[index])
        .filter(Boolean);

      const priceValues = originalProducts.map(p => this.extractPrice(p.price));
      const validPrices = priceValues.filter(p => p > 0);
      
      const priceRange = validPrices.length > 0
        ? {
            min: Math.min(...validPrices),
            max: Math.max(...validPrices)
          }
        : { min: 0, max: 0 };

      const averagePrice = validPrices.length > 0 
        ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
        : 0;

      return {
        rankedProducts,
        insights: {
          priceRange,
          averagePrice,
          bestValue: originalProducts[analysis.priceInsights.bestValueIndex] || rankedProducts[0],
          premiumOption: originalProducts[analysis.priceInsights.premiumOptionIndex] || rankedProducts[rankedProducts.length - 1],
          recommendations: analysis.recommendations || [],
          warnings: analysis.warnings || []
        },
        confidence: Math.min(Math.max(analysis.confidence || 70, 0), 100)
      };
    } catch (error) {
      // Fallback: simple price-based ranking
      return this.fallbackAnalysis(originalProducts);
    }
  }

  private parseRelevanceResponse(text: string): number[] {
    try {
      const jsonMatch = text.match(/\[[\d,\s]*\]/);
      if (!jsonMatch) return [];
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      return [];
    }
  }

  private parseEnhancedProducts(text: string, originalProducts: ProductResult[]): ProductResult[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return originalProducts;
      
      const enhanced = JSON.parse(jsonMatch[0]);
      return enhanced.length === originalProducts.length ? enhanced : originalProducts;
    } catch (error) {
      return originalProducts;
    }
  }



  private extractPrice(priceStr: string | number | null | undefined): number {
    // Handle null/undefined/non-string values
    if (!priceStr || typeof priceStr === 'number') {
      return typeof priceStr === 'number' ? priceStr : 0;
    }
    
    // Convert to string and extract numeric value
    const priceString = String(priceStr);
    const numericMatch = priceString.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(numericMatch) || 0;
  }

  private fallbackAnalysis(products: ProductResult[]): AIAnalysisResponse {
    // Simple price-based ranking as fallback
    const productsWithPrices = products.map((p, index) => ({
      product: p,
      index,
      price: this.extractPrice(p.price)
    })).filter(p => p.price > 0);

    productsWithPrices.sort((a, b) => a.price - b.price);
    
    const prices = productsWithPrices.map(p => p.price);
    
    // Handle case when no valid prices are found
    const priceRange = prices.length > 0 
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 };
      
    const averagePrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : 0;

    return {
      rankedProducts: productsWithPrices.length > 0 ? productsWithPrices.map(p => p.product) : products,
      insights: {
        priceRange,
        averagePrice,
        bestValue: productsWithPrices[0]?.product || products[0],
        premiumOption: productsWithPrices[productsWithPrices.length - 1]?.product || products[0],
        recommendations: productsWithPrices.length > 0 
          ? ['Products ranked by price (lowest first)']
          : ['No valid prices found for ranking'],
        warnings: productsWithPrices.length === 0 
          ? ['Unable to extract valid prices from products']
          : []
      },
      confidence: productsWithPrices.length > 0 ? 60 : 30
    };
  }
}

// Default instance for backward compatibility
export const geminiService = new GeminiService();

// Factory function to create service with custom API key
export const createGeminiService = (apiKey: string) => new GeminiService(apiKey); 