'use client';

import React, { useState } from 'react';
import { Search, MapPin, AlertCircle, Settings, Key } from 'lucide-react';
import { ProductResult, SearchResult } from '../types';
import { formatPrice, getWebsiteIcon, getRatingStars, truncateText, extractDomain } from '../lib/utils';

interface SearchInterfaceProps {
  onSearch: (query: string, country: string, maxResults: number, useGoogleSearch?: boolean) => Promise<SearchResult>;
  countries: { code: string; name: string; websites: string[] }[];
  onResetApiKey: () => void;
  apiKey: string;
}

interface ExtendedSearchResult extends SearchResult {
  searchMode?: string;
}

export default function SearchInterface({ onSearch, countries, onResetApiKey, apiKey }: SearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('US');
  const [maxResults, setMaxResults] = useState(10);
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ExtendedSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a product name');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onSearch(query.trim(), country, maxResults, useGoogleSearch) as ExtendedSearchResult;
      setResults(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountry = countries.find(c => c.code === country);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌍 Global Shopper AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Find the best prices across {useGoogleSearch ? 'unlimited websites worldwide' : 'multiple websites'} using AI-powered comparison
          </p>
          
          {/* API Key Status */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <Key className="h-4 w-4 mr-1" />
              API Key: {apiKey.substring(0, 8)}...
            </div>
            <button
              onClick={onResetApiKey}
              className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Change API Key"
            >
              <Settings className="h-4 w-4 mr-1" />
              Change Key
            </button>
          </div>
        </div>

        {/* Search Mode Toggle */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Search Mode</h3>
                <p className="text-sm text-gray-600">
                  {useGoogleSearch 
                    ? 'Google Search covers unlimited websites globally with broader product coverage'
                    : 'Direct scraping searches specific websites with detailed product information'
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGoogleSearch}
                    onChange={(e) => setUseGoogleSearch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {useGoogleSearch ? '🌐 Google Search' : '🎯 Direct Scraping'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Product Search Input */}
              <div className="md:col-span-6 relative">
                <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="product"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., iPhone 16 Pro, MacBook Air, Nike Air Max"
                    required
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div className="md:col-span-3">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Max Results */}
              <div className="md:col-span-2">
                <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Results
                </label>
                <select
                  id="maxResults"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="md:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Selected Country Info */}
            {selectedCountry && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {useGoogleSearch ? (
                    <>
                      Searching globally via <strong>Google</strong> in{' '}
                      <strong>{selectedCountry.name}</strong> for unlimited website coverage
                    </>
                  ) : (
                    <>
                      Searching across <strong>{selectedCountry.websites.length}</strong> websites in{' '}
                      <strong>{selectedCountry.name}</strong>:{' '}
                      {selectedCountry.websites.join(', ')}
                    </>
                  )}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <div>
                  <p className="text-blue-800 font-medium">Searching for &quot;{query}&quot;...</p>
                  <p className="text-blue-600 text-sm">This may take a few moments as we scan multiple websites</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {results && !isLoading && (
          <div className="max-w-6xl mx-auto">
            {/* Search Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Search Results for &quot;{results.searchQuery}&quot;
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Found {results.totalResults} products in {results.country} 
                    {results.searchMode && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {results.searchMode}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Search completed in {results.searchTime}ms
                  </p>
                  <p className="text-sm text-gray-500">
                    Websites: {results.websites.join(', ')}
                  </p>
                </div>
              </div>
              
              {/* AI Insights */}
              {results.insights && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    🤖 AI Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Price Range:</span> {' '}
                      {results.insights.priceRange?.min != null && results.insights.priceRange?.max != null
                        ? `${formatPrice(results.insights.priceRange.min.toString(), results.products[0]?.currency || 'USD')} - ${formatPrice(results.insights.priceRange.max.toString(), results.products[0]?.currency || 'USD')}`
                        : 'Not available'
                      }
                    </div>
                    <div>
                      <span className="text-blue-600">Average Price:</span> {' '}
                      {results.insights.averagePrice != null
                        ? formatPrice(results.insights.averagePrice.toString(), results.products[0]?.currency || 'USD')
                        : 'Not available'
                      }
                    </div>
                    <div>
                      <span className="text-blue-600">Confidence:</span> {results.confidence || 0}%
                    </div>
                  </div>
                  
                  {results.insights.recommendations.length > 0 && (
                    <div className="mt-3">
                      <span className="text-blue-600 font-medium">Recommendations:</span>
                      <ul className="list-disc list-inside mt-1 text-blue-800">
                        {results.insights.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.products.map((product, index) => (
                <ProductCard 
                  key={`${product.websiteName}-${index}`} 
                  product={product} 
                  rank={index + 1} 
                />
              ))}
            </div>

            {/* No Results */}
            {results.products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found. Try adjusting your search terms or selecting a different country.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, rank }: { product: ProductResult; rank: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Rank Badge */}
      <div className="relative">
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center z-10">
          {rank}
        </div>
        
        {/* Product Image */}
        {product.imageUrl && (
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {truncateText(product.productName, 80)}
        </h3>

        {/* Price and Website */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(product.price, product.currency)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-1">{getWebsiteIcon(product.websiteName)}</span>
            {extractDomain(product.link)}
          </div>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <span className="text-yellow-400 mr-1">{getRatingStars(product.rating)}</span>
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)} {product.reviewCount && `(${product.reviewCount})`}
            </span>
          </div>
        )}

        {/* Availability */}
        <div className="mb-3">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            product.availability.toLowerCase().includes('in stock') || 
            product.availability.toLowerCase().includes('available')
              ? 'bg-green-100 text-green-800'
              : product.availability.toLowerCase().includes('out of stock')
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {product.availability}
          </span>
        </div>

        {/* Seller and Shipping */}
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          {product.seller && (
            <div>Seller: {truncateText(product.seller, 30)}</div>
          )}
          {product.shipping && (
            <div>Shipping: {truncateText(product.shipping, 30)}</div>
          )}
        </div>

        {/* View Product Button */}
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center block font-medium"
        >
          View Product
        </a>
      </div>
    </div>
  );
} 