import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string | number | null | undefined, currency: string): string {
  // Handle null/undefined/non-string values
  if (!price && price !== 0) return 'Price not available';
  
  // If it's already a number, use it directly
  if (typeof price === 'number') {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${price.toLocaleString()}`;
  }
  
  // Convert to string and extract numeric value
  const priceString = String(price);
  const numericMatch = priceString.replace(/[^\d.,]/g, '').replace(',', '.');
  const numericPrice = parseFloat(numericMatch);
  
  if (isNaN(numericPrice)) return priceString; // Return original if can't parse
  
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  return `${symbol}${numericPrice.toLocaleString()}`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  
  return date.toLocaleDateString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getWebsiteIcon(websiteName: string): string {
  const websiteName_lower = websiteName.toLowerCase();
  
  if (websiteName_lower.includes('amazon')) return '🛒';
  if (websiteName_lower.includes('ebay')) return '🏪';
  if (websiteName_lower.includes('walmart')) return '🏬';
  if (websiteName_lower.includes('flipkart')) return '🛍️';
  if (websiteName_lower.includes('best buy')) return '🔌';
  if (websiteName_lower.includes('argos')) return '📦';
  if (websiteName_lower.includes('otto')) return '🏪';
  if (websiteName_lower.includes('snapdeal')) return '💰';
  if (websiteName_lower.includes('rakuten')) return '🎌';
  
  return '🏪';
}

export function getRatingStars(rating?: number): string {
  if (!rating) return '';
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}

export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 