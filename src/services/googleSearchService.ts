import axios from 'axios';
import * as cheerio from 'cheerio';
import { ProductResult, PriceComparisonError } from '../types';

export class GoogleSearchService {
  private baseUrl = 'https://www.google.com/search';
  private requestCount = 0;
  private lastRequestTime = 0;
  private minDelay = 2000; // 2 seconds between requests to be respectful

  /**
   * Search for products using Google Shopping and regular search
   */
  async searchProducts(
    productName: string,
    country: string,
    maxResults: number = 20
  ): Promise<ProductResult[]> {
    await this.enforceRateLimit();
    
    const results: ProductResult[] = [];
    
    try {
      console.log(`Google Search: Searching for "${productName}" in ${country}`);
      
      // Try Google Shopping first (best for products)
      try {
        const shoppingResults = await this.searchGoogleShopping(productName, country, Math.ceil(maxResults * 0.7));
        results.push(...shoppingResults);
        console.log(`Google Shopping: Found ${shoppingResults.length} products`);
      } catch (error) {
        console.warn('Google Shopping search failed:', error);
      }
      
      // If we need more results, search regular Google for e-commerce sites
      if (results.length < maxResults) {
        try {
          const remaining = maxResults - results.length;
          const webResults = await this.searchGoogleWeb(productName, country, remaining);
          results.push(...webResults);
          console.log(`Google Web: Found ${webResults.length} additional products`);
        } catch (error) {
          console.warn('Google web search failed:', error);
        }
      }
      
      // Remove duplicates based on product name and price similarity
      const uniqueResults = this.removeDuplicates(results);
      
      console.log(`Google Search: Total unique results: ${uniqueResults.length}`);
      return uniqueResults.slice(0, maxResults);
    } catch (error) {
      console.error('Google Search completely failed:', error);
      throw new PriceComparisonError(
        'Google search failed',
        'GOOGLE_SEARCH_ERROR',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Search Google Shopping for products
   */
  private async searchGoogleShopping(
    productName: string,
    country: string,
    maxResults: number
  ): Promise<ProductResult[]> {
    const countryCode = this.getGoogleCountryCode(country);
    const language = this.getGoogleLanguage(country);
    
    const params = {
      q: productName,
      tbm: 'shop', // Google Shopping
      hl: language,
      gl: countryCode,
      num: Math.min(maxResults, 20).toString()
    };

    const url = `${this.baseUrl}?${new URLSearchParams(params).toString()}`;
    
    const response = await this.makeRequest(url);
    return this.parseGoogleShoppingResults(response.data, country);
  }

  /**
   * Search regular Google for e-commerce sites
   */
  private async searchGoogleWeb(
    productName: string,
    country: string,
    maxResults: number
  ): Promise<ProductResult[]> {
    const countryCode = this.getGoogleCountryCode(country);
    const language = this.getGoogleLanguage(country);
    
    // Add e-commerce site queries to improve results
    const ecommerceSites = this.getPopularEcommerceSites(country);
    const searchQuery = `"${productName}" price buy (${ecommerceSites.join(' OR ')})`;
    
    const params = {
      q: searchQuery,
      hl: language,
      gl: countryCode,
      num: Math.min(maxResults, 10).toString()
    };

    const url = `${this.baseUrl}?${new URLSearchParams(params).toString()}`;
    
    const response = await this.makeRequest(url);
    return this.parseGoogleWebResults(response.data, productName, country);
  }

  /**
   * Make HTTP request with proper headers to avoid blocking
   */
  private async makeRequest(url: string) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };

    return await axios.get(url, {
      headers,
      timeout: 30000,
      maxRedirects: 5
    });
  }

  /**
   * Parse Google Shopping results
   */
  private parseGoogleShoppingResults(html: string, country: string): ProductResult[] {
    const $ = cheerio.load(html);
    const products: ProductResult[] = [];
    
    // Debug: Log HTML structure
    console.log(`Google Shopping HTML length: ${html.length}`);
    console.log(`Page title: ${$('title').text()}`);
    
    // Check if Google blocked us
    if (html.includes('unusual traffic') || html.includes('CAPTCHA') || html.includes('blocked')) {
      console.warn('Google may have blocked our request');
      return products;
    }
    
    // Google Shopping product containers - updated selectors
    const productSelectors = [
      '.sh-dgr__grid-result', // Main shopping results
      '.sh-pr__product-results', // Product results  
      '.sh-np__click-target', // Shopping ads
      '.pla-unit', // Product listing ads
      '.mnr-c', // Mobile results
      '.aw5Odc', // New format
      '.sh-dlr__list-result', // List results
      '[data-sh-pr]' // Data attribute based
    ];

    let totalFound = 0;
    productSelectors.forEach(selector => {
      const elements = $(selector);
      console.log(`Selector "${selector}": found ${elements.length} elements`);
      
      elements.each((_, element) => {
        try {
          const $element = $(element);
          
          // Extract product information
          const productName = this.extractProductName($element);
          const price = this.extractPrice($element);
          const link = this.extractLink($element);
          const seller = this.extractSeller($element);
          const imageUrl = this.extractImage($element);
          const rating = this.extractRating($element);
          
          console.log(`Product candidate: name="${productName}", price="${price}", link="${link}"`);
          
          if (productName && price && link) {
            const product: ProductResult = {
              productName: this.cleanText(productName),
              price: this.cleanPrice(price),
              currency: this.getCurrencyForCountry(country),
              link: this.normalizeUrl(link) || link,
              websiteName: this.extractWebsiteName(link),
              availability: 'Check website',
              rating: rating,
              imageUrl: this.normalizeUrl(imageUrl),
              seller: this.cleanText(seller) || undefined,
              shipping: undefined,
              lastUpdated: new Date().toISOString()
            };
            
            products.push(product);
            totalFound++;
            console.log(`Added product ${totalFound}: ${productName}`);
          }
        } catch (error) {
          console.warn('Error parsing Google Shopping result:', error);
        }
      });
    });
    
    // If no shopping results, try generic product parsing
    if (products.length === 0) {
      console.log('No shopping results found, trying generic product parsing...');
      
      // Look for any links that might be products
      $('a[href*="amazon"], a[href*="ebay"], a[href*="walmart"], a[href*="shop"]').each((_, element) => {
        try {
          const $element = $(element);
          const text = $element.text().trim();
          const href = $element.attr('href');
          
          if (text && href && text.length > 10 && text.length < 200) {
            console.log(`Generic product candidate: "${text}" -> ${href}`);
            
            const product: ProductResult = {
              productName: this.cleanText(text),
              price: 'Price available on site',
              currency: this.getCurrencyForCountry(country),
              link: this.normalizeUrl(href) || href || '',
              websiteName: this.extractWebsiteName(href),
              availability: 'Check website',
              rating: undefined,
              imageUrl: undefined,
              seller: undefined,
              shipping: undefined,
              lastUpdated: new Date().toISOString()
            };
            
            products.push(product);
          }
        } catch (error) {
          console.warn('Error parsing generic product result:', error);
        }
      });
    }

    console.log(`Google Shopping parsing complete: ${products.length} products found`);
    return products;
  }

  /**
   * Parse regular Google web results for e-commerce pages
   */
  private parseGoogleWebResults(html: string, productName: string, country: string): ProductResult[] {
    const $ = cheerio.load(html);
    const products: ProductResult[] = [];
    
    // Regular search result containers
    $('.g, .tF2Cxc').each((_, element) => {
      try {
        const $element = $(element);
        
        // Extract basic information
        const titleElement = $element.find('h3').first();
        const title = titleElement.text().trim();
        const linkElement = $element.find('a[href]').first();
        const link = linkElement.attr('href') || '';
        const snippet = $element.find('.VwiC3b, .s, .st').text().trim();
        
        // Check if this looks like an e-commerce page
        if (this.isEcommerceResult(title, snippet, link)) {
          // Try to extract price from snippet
          const priceFromSnippet = this.extractPriceFromText(snippet);
          
          if (priceFromSnippet) {
            const product: ProductResult = {
              productName: this.extractProductNameFromTitle(title, productName),
              price: priceFromSnippet,
              currency: this.getCurrencyForCountry(country),
              link: this.normalizeGoogleUrl(link),
              websiteName: this.extractWebsiteName(link),
              availability: 'Check website',
              rating: undefined,
              imageUrl: undefined,
              seller: undefined,
              shipping: undefined,
              lastUpdated: new Date().toISOString()
            };
            
            products.push(product);
          }
        }
      } catch (error) {
        console.warn('Error parsing Google web result:', error);
      }
    });

    return products;
  }

  /**
   * Extract product name from various elements
   */
  private extractProductName($element: any): string {
    const selectors = [
      '.sh-np__product-title',
      '.PLla-pc',
      'h3',
      '.product-title',
      '[data-sh-p]',
      '.sh-dlr__list-result-title',
      '.a-size-base-plus',
      '.a-size-mini',
      '.translate-content',
      'h4',
      '.title',
      '[aria-label]'
    ];
    
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim();
      if (text && text.length > 3) {
        console.log(`Found product name via "${selector}": ${text}`);
        return text;
      }
    }
    
    // Try aria-label as fallback
    const ariaLabel = $element.attr('aria-label');
    if (ariaLabel && ariaLabel.length > 3) {
      console.log(`Found product name via aria-label: ${ariaLabel}`);
      return ariaLabel;
    }
    
    // Last resort: try getting any text content
    const elementText = $element.text().trim();
    if (elementText && elementText.length > 10 && elementText.length < 300) {
      console.log(`Found product name via element text: ${elementText.substring(0, 100)}...`);
      return elementText.substring(0, 100); // Truncate long text
    }
    
    console.log('No product name found');
    return '';
  }

  /**
   * Extract price from various elements
   */
  private extractPrice($element: any): string {
    const selectors = [
      '.a30cke',
      '.g9WBQb',
      '.sh-pr__price',
      '.price',
      '[data-sh-p-price]',
      '.a-price-whole',
      '.a-offscreen',
      '.notranslate',
      '.currency',
      '.amount'
    ];
    
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim();
      if (text && this.looksLikePrice(text)) {
        console.log(`Found price via "${selector}": ${text}`);
        return text;
      }
    }
    
    // Also check element attributes
    const priceAttr = $element.attr('data-sh-p-price') || $element.attr('data-price');
    if (priceAttr && this.looksLikePrice(priceAttr)) {
      console.log(`Found price via attribute: ${priceAttr}`);
      return priceAttr;
    }
    
    // Look for price patterns in any text content
    const allText = $element.text();
    const pricePattern = /[\$€£¥₹][\d,]+(?:\.\d{2})?|[\d,]+(?:\.\d{2})?\s*[\$€£¥₹]/g;
    const matches = allText.match(pricePattern);
    if (matches && matches.length > 0) {
      console.log(`Found price via regex in text: ${matches[0]}`);
      return matches[0];
    }
    
    console.log('No price found');
    return '';
  }

  /**
   * Extract link from element
   */
  private extractLink($element: any): string {
    const link = $element.find('a').first().attr('href');
    return link || '';
  }

  /**
   * Extract seller information
   */
  private extractSeller($element: any): string {
    const selectors = [
      '.sh-np__seller-name',
      '.merchant-name',
      '.seller'
    ];
    
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim();
      if (text) return text;
    }
    
    return '';
  }

  /**
   * Extract image URL
   */
  private extractImage($element: any): string {
    const img = $element.find('img').first();
    return img.attr('src') || img.attr('data-src') || '';
  }

  /**
   * Extract rating if available
   */
  private extractRating($element: any): number | undefined {
    const ratingText = $element.find('.Rsc7Yb').text().trim();
    const match = ratingText.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  /**
   * Check if search result looks like an e-commerce page
   */
  private isEcommerceResult(title: string, snippet: string, url: string): boolean {
    const ecommerceKeywords = [
      'buy', 'price', 'shop', 'store', 'cart', 'purchase', 'order',
      'sale', 'deal', 'offer', 'discount', '$', '€', '£', '¥', '₹'
    ];
    
    const ecommerceDomains = [
      'amazon', 'ebay', 'walmart', 'target', 'bestbuy', 'shop',
      'store', 'market', 'mall', 'flipkart', 'alibaba', 'etsy'
    ];
    
    const combinedText = `${title} ${snippet} ${url}`.toLowerCase();
    
    return ecommerceKeywords.some(keyword => combinedText.includes(keyword)) ||
           ecommerceDomains.some(domain => url.toLowerCase().includes(domain));
  }

  /**
   * Extract price from text using regex
   */
  private extractPriceFromText(text: string): string | null {
    const pricePatterns = [
      /\$[\d,]+(?:\.\d{2})?/g,           // $123.45, $1,234
      /€[\d,]+(?:\.\d{2})?/g,           // €123.45
      /£[\d,]+(?:\.\d{2})?/g,           // £123.45
      /¥[\d,]+/g,                       // ¥123
      /₹[\d,]+(?:\.\d{2})?/g,           // ₹123.45
      /[\d,]+(?:\.\d{2})?\s*(?:\$|€|£|¥|₹)/g  // 123.45 $
    ];
    
    for (const pattern of pricePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }
    
    return null;
  }

  /**
   * Check if text looks like a price
   */
  private looksLikePrice(text: string): boolean {
    return /[\$€£¥₹][\d,]+(?:\.\d{2})?|[\d,]+(?:\.\d{2})?\s*[\$€£¥₹]/.test(text);
  }

  /**
   * Extract product name from page title
   */
  private extractProductNameFromTitle(title: string, searchQuery: string): string {
    // Remove common e-commerce site patterns
    const cleaned = title
      .replace(/\s*-\s*Amazon.*$/i, '')
      .replace(/\s*-\s*eBay.*$/i, '')
      .replace(/\s*\|\s*.*$/i, '')
      .replace(/Buy\s+/i, '')
      .replace(/Shop\s+/i, '')
      .trim();
    
    return cleaned || searchQuery;
  }

  /**
   * Get popular e-commerce sites for a country
   */
  private getPopularEcommerceSites(country: string): string[] {
    const sitesByCountry: { [key: string]: string[] } = {
      'US': ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com'],
      'IN': ['amazon.in', 'flipkart.com', 'snapdeal.com', 'myntra.com'],
      'GB': ['amazon.co.uk', 'ebay.co.uk', 'argos.co.uk', 'currys.co.uk'],
      'DE': ['amazon.de', 'otto.de', 'zalando.de', 'mediamarkt.de'],
      'FR': ['amazon.fr', 'cdiscount.com', 'fnac.com', 'darty.com'],
      'CA': ['amazon.ca', 'bestbuy.ca', 'canadiantire.ca'],
      'AU': ['amazon.com.au', 'ebay.com.au', 'jbhifi.com.au'],
      'JP': ['amazon.co.jp', 'rakuten.co.jp', 'yahoo.co.jp']
    };
    
    return sitesByCountry[country] || sitesByCountry['US'];
  }

  /**
   * Get Google country code for search
   */
  private getGoogleCountryCode(country: string): string {
    const countryMap: { [key: string]: string } = {
      'US': 'us', 'IN': 'in', 'GB': 'uk', 'DE': 'de',
      'FR': 'fr', 'CA': 'ca', 'AU': 'au', 'JP': 'jp',
      'IT': 'it', 'ES': 'es', 'NL': 'nl', 'BR': 'br'
    };
    
    return countryMap[country] || 'us';
  }

  /**
   * Get Google language for search
   */
  private getGoogleLanguage(country: string): string {
    const languageMap: { [key: string]: string } = {
      'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en',
      'IN': 'en', 'DE': 'de', 'FR': 'fr', 'IT': 'it',
      'ES': 'es', 'NL': 'nl', 'JP': 'ja', 'BR': 'pt'
    };
    
    return languageMap[country] || 'en';
  }

  /**
   * Get currency for country
   */
  private getCurrencyForCountry(country: string): string {
    const currencyMap: { [key: string]: string } = {
      'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'DE': 'EUR',
      'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
      'IN': 'INR', 'JP': 'JPY', 'AU': 'AUD', 'BR': 'BRL'
    };
    
    return currencyMap[country] || 'USD';
  }

  /**
   * Extract website name from URL
   */
  private extractWebsiteName(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '').replace('.com', '').replace('.co.uk', '');
    } catch {
      return 'Unknown Store';
    }
  }

  /**
   * Normalize Google redirect URLs
   */
  private normalizeGoogleUrl(url: string): string {
    if (url.startsWith('/url?q=')) {
      const match = url.match(/\/url\?q=([^&]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
    return url;
  }

  /**
   * Normalize URLs
   */
  private normalizeUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('//')) return `https:${url}`;
    if (!url.startsWith('http')) return `https://${url}`;
    return url;
  }

  /**
   * Clean text content
   */
  private cleanText(text: string | undefined): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Clean price format
   */
  private cleanPrice(price: string): string {
    return price.replace(/\s+/g, ' ').trim();
  }

  /**
   * Remove duplicate products
   */
  private removeDuplicates(products: ProductResult[]): ProductResult[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.productName.toLowerCase()}-${product.price}-${product.websiteName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      totalRequests: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
  }
}

export const googleSearchService = new GoogleSearchService(); 