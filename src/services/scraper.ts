import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import { WebsiteConfig, ProductResult, PriceComparisonError } from '../types';

export class ScraperService {
  private browser: Browser | null = null;
  private requestCounts: Map<string, number> = new Map();
  private lastRequestTime: Map<string, number> = new Map();

  constructor() {
    this.initBrowser();
  }

  private async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    } catch (error) {
      console.warn('Failed to initialize Puppeteer browser:', error);
    }
  }

  /**
   * Scrape products from a website
   */
  async scrapeWebsite(
    website: WebsiteConfig,
    searchQuery: string,
    maxResults: number = 10
  ): Promise<ProductResult[]> {
    try {
      await this.enforceRateLimit(website);
      
      const searchUrl = website.searchUrl.replace('{query}', encodeURIComponent(searchQuery));
      
      if (website.requiresJs) {
        return await this.scrapeWithPuppeteer(website, searchUrl, maxResults);
      } else {
        return await this.scrapeWithAxios(website, searchUrl, maxResults);
      }
    } catch (error) {
      throw new PriceComparisonError(
        `Failed to scrape ${website.name}`,
        'NETWORK_ERROR',
        website.name,
        error as Error
      );
    }
  }

  /**
   * Scrape using Axios and Cheerio for static content
   */
  private async scrapeWithAxios(
    website: WebsiteConfig,
    url: string,
    maxResults: number
  ): Promise<ProductResult[]> {
    const headers = {
      'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive'
    };

    const response = await axios.get(url, { 
      headers,
      timeout: 30000,
      maxRedirects: 5
    });

    return this.parseProductsFromHtml(response.data, website, maxResults);
  }

  /**
   * Scrape using Puppeteer for JavaScript-rendered content
   */
  private async scrapeWithPuppeteer(
    website: WebsiteConfig,
    url: string,
    maxResults: number
  ): Promise<ProductResult[]> {
    if (!this.browser) {
      await this.initBrowser();
    }

    if (!this.browser) {
      throw new Error('Browser initialization failed');
    }

    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent(process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Block unnecessary resources for faster loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait for product containers to load
      try {
        await page.waitForSelector(website.selectors.productContainer, { timeout: 10000 });
      } catch (error) {
        console.warn(`Product container not found for ${website.name}`);
      }

      const html = await page.content();
      return this.parseProductsFromHtml(html, website, maxResults);
    } finally {
      await page.close();
    }
  }

  /**
   * Parse products from HTML using Cheerio
   */
  private parseProductsFromHtml(
    html: string,
    website: WebsiteConfig,
    maxResults: number
  ): ProductResult[] {
    const $ = cheerio.load(html);
    const products: ProductResult[] = [];
    const productElements = $(website.selectors.productContainer).slice(0, maxResults * 2); // Get extra to filter later

    productElements.each((index, element) => {
      try {
        const $element = $(element);
        
        const productName = this.extractText($element, website.selectors.productName);
        const price = this.extractText($element, website.selectors.price);
        const link = this.extractLink($element, website.selectors.link, website.baseUrl);
        
        // Skip if essential data is missing
        if (!productName || !price || !link) {
          return;
        }

        const product: ProductResult = {
          productName: this.cleanProductName(productName),
          price: this.cleanPrice(price),
          currency: website.currency,
          link: link,
          websiteName: website.name,
          availability: this.extractText($element, website.selectors.availability) || 'Unknown',
          rating: this.extractRating($element, website.selectors.rating),
          imageUrl: this.extractImage($element, website.selectors.image, website.baseUrl),
          seller: this.extractText($element, website.selectors.seller),
          shipping: this.extractText($element, website.selectors.shipping),
          lastUpdated: new Date().toISOString()
        };

        products.push(product);
      } catch (error) {
        console.warn(`Error parsing product ${index} from ${website.name}:`, error);
      }
    });

    return products.slice(0, maxResults);
  }

  /**
   * Extract text content from element
   */
  private extractText($element: cheerio.Cheerio<cheerio.Element>, selector?: string): string {
    if (!selector) return '';
    
    const element = $element.find(selector).first();
    return element.text().trim() || element.attr('aria-label') || '';
  }

  /**
   * Extract and resolve links
   */
  private extractLink($element: cheerio.Cheerio<cheerio.Element>, selector: string, baseUrl: string): string {
    const href = $element.find(selector).first().attr('href');
    if (!href) return '';
    
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/')) return `${baseUrl}${href}`;
    
    return `${baseUrl}/${href}`;
  }

  /**
   * Extract and resolve image URLs
   */
  private extractImage($element: cheerio.Cheerio<cheerio.Element>, selector?: string, baseUrl?: string): string {
    if (!selector) return '';
    
    const $img = $element.find(selector).first();
    const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src') || '';
    
    if (!src) return '';
    if (src.startsWith('http')) return src;
    if (src.startsWith('//')) return `https:${src}`;
    if (src.startsWith('/') && baseUrl) return `${baseUrl}${src}`;
    
    return src;
  }

  /**
   * Extract rating from various formats
   */
  private extractRating($element: cheerio.Cheerio<cheerio.Element>, selector?: string): number | undefined {
    if (!selector) return undefined;
    
    const ratingText = this.extractText($element, selector);
    
    // Try to extract numeric rating
    const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/|\s+)\s*(\d+)/i);
    if (ratingMatch) {
      const rating = parseFloat(ratingMatch[1]);
      const maxRating = parseFloat(ratingMatch[2]);
      return maxRating === 5 ? rating : (rating / maxRating) * 5;
    }
    
    // Try simple decimal extraction
    const simpleMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
    if (simpleMatch) {
      const rating = parseFloat(simpleMatch[1]);
      return rating <= 5 ? rating : rating / 2; // Assume 10-point scale if > 5
    }
    
    return undefined;
  }

  /**
   * Clean and standardize product names
   */
  private cleanProductName(name: string): string {
    return name
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-().]/g, '')
      .trim()
      .substring(0, 200); // Limit length
  }

  /**
   * Clean and standardize price strings
   */
  private cleanPrice(price: string): string {
    // Remove extra whitespace and clean up price format
    return price
      .replace(/\s+/g, ' ')
      .replace(/(\d)\s+(\d)/g, '$1$2') // Remove spaces between digits
      .trim();
  }

  /**
   * Enforce rate limiting per website
   */
  private async enforceRateLimit(website: WebsiteConfig): Promise<void> {
    const now = Date.now();
    const websiteName = website.name;
    const rateLimit = website.rateLimit || 1000;
    
    const lastRequest = this.lastRequestTime.get(websiteName) || 0;
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < rateLimit) {
      const waitTime = rateLimit - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime.set(websiteName, Date.now());
    
    // Track request count
    const count = this.requestCounts.get(websiteName) || 0;
    this.requestCounts.set(websiteName, count + 1);
  }

  /**
   * Get request statistics
   */
  getStats(): { [website: string]: number } {
    const stats: { [website: string]: number } = {};
    this.requestCounts.forEach((count, website) => {
      stats[website] = count;
    });
    return stats;
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const scraperService = new ScraperService(); 