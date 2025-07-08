import { WebsiteConfig, CountryWebsites } from '../types';

// Major e-commerce websites configuration by country
export const websiteConfigs: CountryWebsites = {
  // United States
  'US': [
    {
      name: 'Amazon US',
      baseUrl: 'https://www.amazon.com',
      searchUrl: 'https://www.amazon.com/s?k={query}',
      countries: ['US'],
      selectors: {
        productContainer: '[data-component-type="s-search-result"]',
        productName: 'h2 a span',
        price: '.a-price-whole, .a-price .a-offscreen',
        link: 'h2 a',
        availability: '.a-size-base-plus',
        rating: '.a-icon-alt',
        image: '.s-image',
        seller: '.a-size-base-plus .a-color-base',
        shipping: '.a-color-base .a-text-bold'
      },
      currency: 'USD',
      requiresJs: true,
      rateLimit: 1000
    },
    {
      name: 'eBay US',
      baseUrl: 'https://www.ebay.com',
      searchUrl: 'https://www.ebay.com/sch/i.html?_nkw={query}',
      countries: ['US'],
      selectors: {
        productContainer: '.s-item',
        productName: '.s-item__title',
        price: '.s-item__price',
        link: '.s-item__link',
        availability: '.s-item__availability',
        rating: '.x-star-rating',
        image: '.s-item__image img',
        seller: '.s-item__seller-info-text',
        shipping: '.s-item__shipping'
      },
      currency: 'USD',
      requiresJs: false,
      rateLimit: 800
    },
    {
      name: 'Walmart',
      baseUrl: 'https://www.walmart.com',
      searchUrl: 'https://www.walmart.com/search?q={query}',
      countries: ['US'],
      selectors: {
        productContainer: '[data-testid="item-stack"]',
        productName: '[data-automation-id="product-title"]',
        price: '[itemprop="price"]',
        link: 'a[href*="/ip/"]',
        availability: '[data-automation-id="availability-text"]',
        rating: '.average-rating',
        image: 'img[data-testid="productTileImage"]',
        seller: '[data-automation-id="seller-name"]',
        shipping: '[data-automation-id="fulfillment-speed"]'
      },
      currency: 'USD',
      requiresJs: true,
      rateLimit: 1200
    },
    {
      name: 'Best Buy',
      baseUrl: 'https://www.bestbuy.com',
      searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st={query}',
      countries: ['US'],
      selectors: {
        productContainer: '.sku-item',
        productName: '.sku-title a',
        price: '.sr-only:contains("current price")',
        link: '.sku-title a',
        availability: '.fulfillment-add-to-cart-button',
        rating: '.sr-only:contains("out of 5 stars")',
        image: '.product-image img',
        seller: '.marketplace-seller',
        shipping: '.fulfillment-shipping-text'
      },
      currency: 'USD',
      requiresJs: true,
      rateLimit: 1000
    }
  ],

  // India
  'IN': [
    {
      name: 'Amazon India',
      baseUrl: 'https://www.amazon.in',
      searchUrl: 'https://www.amazon.in/s?k={query}',
      countries: ['IN'],
      selectors: {
        productContainer: '[data-component-type="s-search-result"]',
        productName: 'h2 a span',
        price: '.a-price-whole, .a-price .a-offscreen',
        link: 'h2 a',
        availability: '.a-size-base-plus',
        rating: '.a-icon-alt',
        image: '.s-image',
        seller: '.a-size-base-plus .a-color-base',
        shipping: '.a-color-base .a-text-bold'
      },
      currency: 'INR',
      requiresJs: true,
      rateLimit: 1000
    },
    {
      name: 'Flipkart',
      baseUrl: 'https://www.flipkart.com',
      searchUrl: 'https://www.flipkart.com/search?q={query}',
      countries: ['IN'],
      selectors: {
        productContainer: '._13oc-S',
        productName: '._4rR01T',
        price: '._30jeq3._1_WHN1',
        link: '._1fQZEK',
        availability: '._16FRp0',
        rating: '._3LWZlK',
        image: '._396cs4 img',
        seller: '.sFIfmC',
        shipping: '._2Tpdn3'
      },
      currency: 'INR',
      requiresJs: true,
      rateLimit: 800
    },
    {
      name: 'Snapdeal',
      baseUrl: 'https://www.snapdeal.com',
      searchUrl: 'https://www.snapdeal.com/search?keyword={query}',
      countries: ['IN'],
      selectors: {
        productContainer: '.product-tuple-listing',
        productName: '.product-title',
        price: '.lfloat.product-price',
        link: '.dp-widget-link',
        availability: '.product-delivery-details',
        rating: '.filled-stars',
        image: '.product-image img',
        seller: '.seller-name',
        shipping: '.product-delivery-details'
      },
      currency: 'INR',
      requiresJs: false,
      rateLimit: 1000
    }
  ],

  // United Kingdom
  'GB': [
    {
      name: 'Amazon UK',
      baseUrl: 'https://www.amazon.co.uk',
      searchUrl: 'https://www.amazon.co.uk/s?k={query}',
      countries: ['GB'],
      selectors: {
        productContainer: '[data-component-type="s-search-result"]',
        productName: 'h2 a span',
        price: '.a-price-whole, .a-price .a-offscreen',
        link: 'h2 a',
        availability: '.a-size-base-plus',
        rating: '.a-icon-alt',
        image: '.s-image',
        seller: '.a-size-base-plus .a-color-base',
        shipping: '.a-color-base .a-text-bold'
      },
      currency: 'GBP',
      requiresJs: true,
      rateLimit: 1000
    },
    {
      name: 'eBay UK',
      baseUrl: 'https://www.ebay.co.uk',
      searchUrl: 'https://www.ebay.co.uk/sch/i.html?_nkw={query}',
      countries: ['GB'],
      selectors: {
        productContainer: '.s-item',
        productName: '.s-item__title',
        price: '.s-item__price',
        link: '.s-item__link',
        availability: '.s-item__availability',
        rating: '.x-star-rating',
        image: '.s-item__image img',
        seller: '.s-item__seller-info-text',
        shipping: '.s-item__shipping'
      },
      currency: 'GBP',
      requiresJs: false,
      rateLimit: 800
    },
    {
      name: 'Argos',
      baseUrl: 'https://www.argos.co.uk',
      searchUrl: 'https://www.argos.co.uk/search/{query}',
      countries: ['GB'],
      selectors: {
        productContainer: '[data-test="component-product-card"]',
        productName: '[data-test="component-product-card-title"]',
        price: '[data-test="component-product-card-price"]',
        link: '[data-test="component-product-card-title"] a',
        availability: '[data-test="component-product-card-availability"]',
        rating: '.sr-only:contains("out of 5 stars")',
        image: '[data-test="component-product-card-image"] img',
        seller: '.marketplace-seller',
        shipping: '.delivery-options'
      },
      currency: 'GBP',
      requiresJs: true,
      rateLimit: 1200
    }
  ],

  // Germany
  'DE': [
    {
      name: 'Amazon Germany',
      baseUrl: 'https://www.amazon.de',
      searchUrl: 'https://www.amazon.de/s?k={query}',
      countries: ['DE'],
      selectors: {
        productContainer: '[data-component-type="s-search-result"]',
        productName: 'h2 a span',
        price: '.a-price-whole, .a-price .a-offscreen',
        link: 'h2 a',
        availability: '.a-size-base-plus',
        rating: '.a-icon-alt',
        image: '.s-image',
        seller: '.a-size-base-plus .a-color-base',
        shipping: '.a-color-base .a-text-bold'
      },
      currency: 'EUR',
      requiresJs: true,
      rateLimit: 1000
    },
    {
      name: 'Otto',
      baseUrl: 'https://www.otto.de',
      searchUrl: 'https://www.otto.de/suche/{query}',
      countries: ['DE'],
      selectors: {
        productContainer: '.productTile',
        productName: '.productTile__title',
        price: '.productTile__price',
        link: '.productTile__link',
        availability: '.productTile__availability',
        rating: '.productTile__rating',
        image: '.productTile__image img',
        seller: '.productTile__brand',
        shipping: '.productTile__delivery'
      },
      currency: 'EUR',
      requiresJs: true,
      rateLimit: 1200
    }
  ],

  // Canada
  'CA': [
    {
      name: 'Amazon Canada',
      baseUrl: 'https://www.amazon.ca',
      searchUrl: 'https://www.amazon.ca/s?k={query}',
      countries: ['CA'],
      selectors: {
        productContainer: '[data-component-type="s-search-result"]',
        productName: 'h2 a span',
        price: '.a-price-whole, .a-price .a-offscreen',
        link: 'h2 a',
        availability: '.a-size-base-plus',
        rating: '.a-icon-alt',
        image: '.s-image',
        seller: '.a-size-base-plus .a-color-base',
        shipping: '.a-color-base .a-text-bold'
      },
      currency: 'CAD',
      requiresJs: true,
      rateLimit: 1000
    },
    {
      name: 'Best Buy Canada',
      baseUrl: 'https://www.bestbuy.ca',
      searchUrl: 'https://www.bestbuy.ca/en-ca/search?search={query}',
      countries: ['CA'],
      selectors: {
        productContainer: '.product-item',
        productName: '.product-item-name',
        price: '.sr-only:contains("Current price")',
        link: '.product-item-name a',
        availability: '.availability',
        rating: '.sr-only:contains("out of 5 stars")',
        image: '.product-image img',
        seller: '.marketplace-seller',
        shipping: '.shipping-text'
      },
      currency: 'CAD',
      requiresJs: true,
      rateLimit: 1200
    }
  ],

  // Australia
  'AU': [
    {
      name: 'Amazon Australia',
      baseUrl: 'https://www.amazon.com.au',
      searchUrl: 'https://www.amazon.com.au/s?k={query}',
      countries: ['AU'],
      selectors: {
        productContainer: '[data-component-type="s-search-result"]',
        productName: 'h2 a span',
        price: '.a-price-whole, .a-price .a-offscreen',
        link: 'h2 a',
        availability: '.a-size-base-plus',
        rating: '.a-icon-alt',
        image: '.s-image',
        seller: '.a-size-base-plus .a-color-base',
        shipping: '.a-color-base .a-text-bold'
      },
      currency: 'AUD',
      requiresJs: true,
      rateLimit: 1000
    },
    {
      name: 'eBay Australia',
      baseUrl: 'https://www.ebay.com.au',
      searchUrl: 'https://www.ebay.com.au/sch/i.html?_nkw={query}',
      countries: ['AU'],
      selectors: {
        productContainer: '.s-item',
        productName: '.s-item__title',
        price: '.s-item__price',
        link: '.s-item__link',
        availability: '.s-item__availability',
        rating: '.x-star-rating',
        image: '.s-item__image img',
        seller: '.s-item__seller-info-text',
        shipping: '.s-item__shipping'
      },
      currency: 'AUD',
      requiresJs: false,
      rateLimit: 800
    }
  ],

  // Japan
  'JP': [
    {
      name: 'Amazon Japan',
      baseUrl: 'https://www.amazon.co.jp',
      searchUrl: 'https://www.amazon.co.jp/s?k={query}',
      countries: ['JP'],
      selectors: {
        productContainer: '[data-component-type="s-search-result"]',
        productName: 'h2 a span',
        price: '.a-price-whole, .a-price .a-offscreen',
        link: 'h2 a',
        availability: '.a-size-base-plus',
        rating: '.a-icon-alt',
        image: '.s-image',
        seller: '.a-size-base-plus .a-color-base',
        shipping: '.a-color-base .a-text-bold'
      },
      currency: 'JPY',
      requiresJs: true,
      rateLimit: 1000
    },
    {
      name: 'Rakuten',
      baseUrl: 'https://search.rakuten.co.jp',
      searchUrl: 'https://search.rakuten.co.jp/search/mall/{query}',
      countries: ['JP'],
      selectors: {
        productContainer: '.searchresultitem',
        productName: '.title a',
        price: '.important',
        link: '.title a',
        availability: '.delivery',
        rating: '.rating',
        image: '.image img',
        seller: '.merchant',
        shipping: '.postage'
      },
      currency: 'JPY',
      requiresJs: false,
      rateLimit: 1200
    }
  ]
};

// Get websites for a specific country
export function getWebsitesForCountry(countryCode: string): WebsiteConfig[] {
  return websiteConfigs[countryCode.toUpperCase()] || [];
}

// Get all supported countries
export function getSupportedCountries(): string[] {
  return Object.keys(websiteConfigs);
}

// Check if a country is supported
export function isCountrySupported(countryCode: string): boolean {
  return countryCode.toUpperCase() in websiteConfigs;
} 