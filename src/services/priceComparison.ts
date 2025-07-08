import { 
  ProductSearchRequest, 
  ProductResult, 
  SearchResult, 
  PriceComparisonError,
} from '../types';
import { getWebsitesForCountry } from '../config/websites';
import { scraperService } from './scraper';
import { googleSearchService } from './googleSearchService';
import { geminiService, createGeminiService } from './gemini';

export class PriceComparisonService {
  private geminiService: any;
  private useGoogleSearch: boolean;

  constructor(apiKey?: string, useGoogleSearch: boolean = true) {
    this.geminiService = apiKey ? createGeminiService(apiKey) : geminiService;
    this.useGoogleSearch = useGoogleSearch;
  }

  /**
   * Main search function - orchestrates the entire price comparison process
   */
  async searchProducts(request: ProductSearchRequest): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Validate request
      this.validateRequest(request);
      
      let allProducts: ProductResult[] = [];
      let websiteNames: string[] = [];

      if (this.useGoogleSearch) {
        // Use Google Search (covers all websites globally)
        console.log(`Starting Google-powered price comparison for "${request.productName}" in ${request.country}`);
        
        try {
          allProducts = await googleSearchService.searchProducts(
            request.productName,
            request.country,
            request.maxResults * 2 // Get extra to account for filtering
          );
          
          websiteNames = [...new Set(allProducts.map(p => p.websiteName))];
          console.log(`Found ${allProducts.length} products from ${websiteNames.length} websites via Google`);
          
          // If Google search returns very few results, also try direct scraping as supplement
          if (allProducts.length < 3) {
            console.log('Google search returned few results, supplementing with direct scraping...');
            try {
              const directResult = await this.searchWithDirectScraping(request);
              const additionalProducts = directResult.products;
              
              // Merge results, avoiding duplicates
              const existingLinks = new Set(allProducts.map(p => p.link));
              const newProducts = additionalProducts.filter(p => !existingLinks.has(p.link));
              
              allProducts.push(...newProducts);
              websiteNames.push(...directResult.websites.filter(w => !websiteNames.includes(w)));
              
              console.log(`Added ${newProducts.length} products from direct scraping`);
            } catch (directError) {
              console.warn('Direct scraping supplement also failed:', directError);
            }
          }
        } catch (error) {
          console.warn('Google search failed, falling back to direct scraping:', error);
          // Fallback to direct scraping if Google search fails
          const fallbackResult = await this.searchWithDirectScraping(request);
          allProducts = fallbackResult.products;
          websiteNames = fallbackResult.websites;
        }
      } else {
        // Use direct website scraping (legacy method)
        const directResult = await this.searchWithDirectScraping(request);
        allProducts = directResult.products;
        websiteNames = directResult.websites;
      }
      
      if (allProducts.length === 0) {
        throw new PriceComparisonError(
          'No products found. Try adjusting your search terms or try again later.',
          'NO_RESULTS_FOUND'
        );
      }

      // Step 2: Use AI to validate product relevance
      console.log(`Found ${allProducts.length} products, validating relevance...`);
      const relevantProducts = await this.geminiService.validateProductRelevance(
        request.productName,
        allProducts
      );

      // Step 3: Enhance product data using AI
      const enhancedProducts = await this.geminiService.enhanceProductData(relevantProducts);

      // Step 4: Filter by price range if specified
      const filteredProducts = this.applyPriceFilter(enhancedProducts, request.priceRange);

      // Step 5: Use AI for intelligent ranking and analysis
      const aiAnalysis = await this.geminiService.analyzeProducts({
        products: filteredProducts,
        originalQuery: request.productName,
        userPreferences: {
          prioritizePrice: true,
          prioritizeRating: false
        }
      });

      // Step 6: Limit results as requested
      const finalProducts = aiAnalysis.rankedProducts.slice(0, request.maxResults);

      const searchTime = Date.now() - startTime;
      
      console.log(`Price comparison completed in ${searchTime}ms. Found ${finalProducts.length} relevant products.`);

      return {
        products: finalProducts,
        searchQuery: request.productName,
        country: request.country,
        totalResults: finalProducts.length,
        searchTime,
        websites: websiteNames,
        insights: aiAnalysis.insights,
        confidence: aiAnalysis.confidence
      };

    } catch (error) {  
      if (error instanceof PriceComparisonError) {
        throw error;
      }
      
      throw new PriceComparisonError(
        'Price comparison failed',
        'INVALID_REQUEST',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Legacy direct website scraping method (fallback)
   */
  private async searchWithDirectScraping(request: ProductSearchRequest): Promise<{products: ProductResult[], websites: string[]}> {
    // Get websites for the specified country
    let websites = getWebsitesForCountry(request.country);
    
    // If no specific websites found for this country, use international fallbacks
    if (websites.length === 0) {
      console.log(`No specific websites configured for ${request.country}, using international fallbacks`);
      websites = this.getInternationalFallbackWebsites(request.country);
    }
    
    if (websites.length === 0) {
      throw new PriceComparisonError(
        `No supported websites found for country: ${request.country}`,
        'INVALID_COUNTRY'
      );
    }

    console.log(`Starting direct scraping for "${request.productName}" in ${request.country}`);
    const allProducts = await this.scrapeAllWebsites(websites, request);
    
    return {
      products: allProducts,
      websites: websites.map(w => w.name)
    };
  }

  /**
   * Get supported countries - now supports all countries globally via Google
   */
  getSupportedCountries(): { code: string; name: string; websites: string[] }[] {
    // Include more countries - Google Search works globally
    const allCountries = [
      // Countries with specific website configurations (enhanced coverage)
      { code: 'US', name: 'United States', hasConfig: true },
      { code: 'IN', name: 'India', hasConfig: true },
      { code: 'GB', name: 'United Kingdom', hasConfig: true },
      { code: 'DE', name: 'Germany', hasConfig: true },
      { code: 'CA', name: 'Canada', hasConfig: true },
      { code: 'AU', name: 'Australia', hasConfig: true },
      { code: 'JP', name: 'Japan', hasConfig: true },
      
      // Additional countries - all supported via Google Search
      { code: 'FR', name: 'France', hasConfig: false },
      { code: 'IT', name: 'Italy', hasConfig: false },
      { code: 'ES', name: 'Spain', hasConfig: false },
      { code: 'NL', name: 'Netherlands', hasConfig: false },
      { code: 'BE', name: 'Belgium', hasConfig: false },
      { code: 'CH', name: 'Switzerland', hasConfig: false },
      { code: 'AT', name: 'Austria', hasConfig: false },
      { code: 'SE', name: 'Sweden', hasConfig: false },
      { code: 'NO', name: 'Norway', hasConfig: false },
      { code: 'DK', name: 'Denmark', hasConfig: false },
      { code: 'FI', name: 'Finland', hasConfig: false },
      { code: 'BR', name: 'Brazil', hasConfig: false },
      { code: 'MX', name: 'Mexico', hasConfig: false },
      { code: 'AR', name: 'Argentina', hasConfig: false },
      { code: 'CN', name: 'China', hasConfig: false },
      { code: 'KR', name: 'South Korea', hasConfig: false },
      { code: 'SG', name: 'Singapore', hasConfig: false },
      { code: 'MY', name: 'Malaysia', hasConfig: false },
      { code: 'TH', name: 'Thailand', hasConfig: false },
      { code: 'ID', name: 'Indonesia', hasConfig: false },
      { code: 'PH', name: 'Philippines', hasConfig: false },
      { code: 'VN', name: 'Vietnam', hasConfig: false },
      { code: 'AE', name: 'United Arab Emirates', hasConfig: false },
      { code: 'SA', name: 'Saudi Arabia', hasConfig: false },
      { code: 'EG', name: 'Egypt', hasConfig: false },
      { code: 'ZA', name: 'South Africa', hasConfig: false },
      { code: 'NG', name: 'Nigeria', hasConfig: false },
      { code: 'KE', name: 'Kenya', hasConfig: false },
      { code: 'NZ', name: 'New Zealand', hasConfig: false },
      { code: 'RU', name: 'Russia', hasConfig: false },
      { code: 'PL', name: 'Poland', hasConfig: false },
      { code: 'CZ', name: 'Czech Republic', hasConfig: false },
      { code: 'HU', name: 'Hungary', hasConfig: false },
      { code: 'RO', name: 'Romania', hasConfig: false },
      { code: 'GR', name: 'Greece', hasConfig: false },
      { code: 'PT', name: 'Portugal', hasConfig: false },
      { code: 'IE', name: 'Ireland', hasConfig: false },
      { code: 'IL', name: 'Israel', hasConfig: false },
      { code: 'TR', name: 'Turkey', hasConfig: false },
      { code: 'CL', name: 'Chile', hasConfig: false },
      { code: 'CO', name: 'Colombia', hasConfig: false },
      { code: 'PE', name: 'Peru', hasConfig: false },
      { code: 'UY', name: 'Uruguay', hasConfig: false },
      { code: 'EC', name: 'Ecuador', hasConfig: false },
      { code: 'PY', name: 'Paraguay', hasConfig: false },
      { code: 'BO', name: 'Bolivia', hasConfig: false },
      { code: 'VE', name: 'Venezuela', hasConfig: false }
    ];
    
    return allCountries.map(country => {
      const websites = getWebsitesForCountry(country.code);
      return {
        code: country.code,
        name: country.name,
        websites: this.useGoogleSearch
          ? ['Google Shopping', 'Global E-commerce Sites'] // Google covers all sites
          : websites.length > 0 
            ? websites.map(w => w.name)
            : ['Amazon (International)', 'eBay (International)'] // Fallback to international sites
      };
    });
  }

  /**
   * Toggle between Google Search and direct scraping
   */
  setSearchMode(useGoogleSearch: boolean): void {
    this.useGoogleSearch = useGoogleSearch;
  }

  /**
   * Get current search mode
   */
  getSearchMode(): string {
    return this.useGoogleSearch ? 'Google Search (Global)' : 'Direct Scraping (Limited)';
  }

  /**
   * Scrape products from all websites in parallel (legacy method)
   */
  private async scrapeAllWebsites(
    websites: any[],
    request: ProductSearchRequest
  ): Promise<ProductResult[]> {
    const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '5');
    const results: ProductResult[] = [];
    const errors: string[] = [];

    // Process websites in batches to avoid overwhelming servers
    for (let i = 0; i < websites.length; i += maxConcurrent) {
      const batch = websites.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (website) => {
        try {
          console.log(`Scraping ${website.name}...`);
          const products = await scraperService.scrapeWebsite(
            website,
            request.productName,
            Math.ceil(request.maxResults * 1.5) // Get extra to account for filtering
          );
          
          console.log(`Found ${products.length} products from ${website.name}`);
          return products;
        } catch (error) {
          const errorMsg = `${website.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.warn(`Failed to scrape ${website.name}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());

      // Add delay between batches to be respectful
      if (i + maxConcurrent < websites.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Apply price range filter
   */
  private applyPriceFilter(
    products: ProductResult[],
    priceRange?: { min?: number; max?: number }
  ): ProductResult[] {
    if (!priceRange || (!priceRange.min && !priceRange.max)) {
      return products;
    }

    return products.filter(product => {
      const price = this.extractNumericPrice(product.price);
      if (price <= 0) return true; // Include products with unparseable prices
      
      if (priceRange.min && price < priceRange.min) return false;
      if (priceRange.max && price > priceRange.max) return false;
      
      return true;
    });
  }

  /**
   * Extract numeric price from price string
   */
  private extractNumericPrice(priceStr: string): number {
    const numericMatch = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(numericMatch) || 0;
  }

  /**
   * Validate search request
   */
  private validateRequest(request: ProductSearchRequest): void {
    if (!request.productName || request.productName.trim().length === 0) {
      throw new PriceComparisonError(
        'Product name is required',
        'INVALID_REQUEST'
      );
    }

    if (!request.country || request.country.length !== 2) {
      throw new PriceComparisonError(
        'Valid 2-letter country code is required',
        'INVALID_REQUEST'
      );
    }

    // Check if country is in our supported list
    const supportedCountries = this.getSupportedCountries();
    const isSupported = supportedCountries.some(c => c.code === request.country.toUpperCase());
    
    if (!isSupported) {
      throw new PriceComparisonError(
        `Country ${request.country} is not supported. Supported countries: ${supportedCountries.map(c => c.code).join(', ')}`,
        'INVALID_COUNTRY'
      );
    }

    if (request.maxResults && (request.maxResults < 1 || request.maxResults > 50)) {
      throw new PriceComparisonError(
        'maxResults must be between 1 and 50',
        'INVALID_REQUEST'
      );
    }
  }

  /**
   * Get human-readable country name
   */
  private getCountryName(code: string): string {
    const countryNames: { [key: string]: string } = {
      'US': 'United States',
      'IN': 'India',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'CA': 'Canada',
      'AU': 'Australia',
      'JP': 'Japan'
    };
    
    return countryNames[code] || code;
  }

  /**
   * Get international fallback websites for countries without specific configurations
   */
  private getInternationalFallbackWebsites(countryCode: string): any[] {
    // Use US sites as international fallbacks for countries without specific configurations
    const usWebsites = getWebsitesForCountry('US');
    const internationalWebsites = usWebsites.filter(site => 
      site.name.includes('Amazon') || site.name.includes('eBay')
    );
    
    // Modify the websites to indicate they're international
    return internationalWebsites.map(site => ({
      ...site,
      name: site.name.replace('US', 'International'),
      countries: [countryCode]
    }));
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      searchMode: this.getSearchMode(),
      scraperStats: this.useGoogleSearch ? null : scraperService.getStats(),
      googleStats: this.useGoogleSearch ? googleSearchService.getStats() : null,
      supportedCountries: this.getSupportedCountries().length,
      totalWebsites: this.useGoogleSearch 
        ? 'Unlimited (via Google)'
        : this.getSupportedCountries().reduce((acc, country) => acc + country.websites.length, 0)
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await scraperService.close();
  }
}

export const priceComparisonService = new PriceComparisonService(); 