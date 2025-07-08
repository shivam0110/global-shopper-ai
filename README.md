# 🌍 Global Shopper AI v2.0

A revolutionary price comparison platform that uses **Google Search** and **AI intelligence** to find the best prices across **unlimited e-commerce websites worldwide**. Choose between Google-powered global search or direct website scraping for comprehensive price discovery.

## ✨ Revolutionary Features

### 🌐 **Unlimited Website Coverage**
- **Google Search Mode**: Access to thousands of e-commerce sites globally through Google Shopping and web search
- **Direct Scraping Mode**: In-depth analysis of 15+ major retailers with detailed product information
- **Dual Search Architecture**: Switch between modes instantly or let the system use both automatically

### 🤖 **Advanced AI Intelligence**
- **Google Gemini AI**: Validates product relevance, eliminates false matches, and provides intelligent ranking
- **Smart Fallback**: Automatic switching between search modes for optimal results
- **Real-time Analysis**: AI-powered insights on pricing trends, best value options, and recommendations

### 🚀 **Zero Setup Experience**
- **No Environment Files**: Complete setup through beautiful UI interface
- **Instant API Key Setup**: Direct integration with Google AI Studio
- **Browser-Based Security**: API keys stored locally, never transmitted to servers
- **One-Click Start**: From installation to searching in under 2 minutes

### 🎯 **Global Reach**
- **50+ Countries Supported**: True global coverage with intelligent regional fallbacks
- **Auto-Localization**: Country-specific currencies, languages, and popular e-commerce sites
- **Smart Regional Handling**: Automatic fallback to international sites for comprehensive coverage

## 🔄 Dual Search Architecture

### 🌐 **Google Search Mode (Default)**
- **Coverage**: Unlimited websites globally via Google Shopping and web search
- **Speed**: 2-5 seconds average search time
- **Maintenance**: Zero - no CSS selectors to break
- **Global Reach**: Works in all 50+ supported countries
- **Best For**: Broad product discovery and maximum website coverage

### 🎯 **Direct Scraping Mode**
- **Coverage**: 15+ carefully configured e-commerce websites
- **Detail**: Rich product information including ratings, reviews, shipping
- **Accuracy**: Precise product data extraction
- **Best For**: In-depth analysis of specific retailer offerings

### 🔄 **Intelligent Hybrid Mode**
The system automatically combines both approaches:
- Starts with Google search for broad coverage
- Supplements with direct scraping for comprehensive results
- Falls back gracefully when services are unavailable
- Merges results intelligently to avoid duplicates

## 🌍 Global Coverage

### **Google Search Coverage**
- **Unlimited Websites**: Access to thousands of e-commerce sites indexed by Google
- **All Countries**: Works globally with country-specific localization
- **Real-time Data**: Always current through Google's constantly updated index

### **Direct Scraping Coverage**

#### **Tier 1: Premium Support (7 Countries)**
**🇺🇸 United States**
- Amazon US, eBay US, Walmart, Best Buy

**🇮🇳 India**
- Amazon India, Flipkart, Snapdeal  

**🇬🇧 United Kingdom**
- Amazon UK, eBay UK, Argos

**🇩🇪 Germany**
- Amazon Germany, Otto

**🇨🇦 Canada**
- Amazon Canada, Best Buy Canada

**🇦🇺 Australia**
- Amazon Australia, eBay Australia

**🇯🇵 Japan**
- Amazon Japan, Rakuten

#### **Tier 2: Global Support (43+ Countries)**
All other countries automatically use international Amazon and eBay sites:

**Europe**: France, Italy, Spain, Netherlands, Belgium, Switzerland, Austria, Sweden, Norway, Denmark, Finland, Poland, Czech Republic, Hungary, Romania, Greece, Portugal, Ireland

**Americas**: Brazil, Mexico, Argentina, Chile, Colombia, Peru, Uruguay, Ecuador, Paraguay, Bolivia, Venezuela

**Asia-Pacific**: China, South Korea, Singapore, Malaysia, Thailand, Indonesia, Philippines, Vietnam, New Zealand

**Middle East & Africa**: UAE, Saudi Arabia, Israel, Turkey, Egypt, South Africa, Nigeria, Kenya

**Eastern Europe**: Russia

**Total: 50+ countries with unlimited website access!**

## 🏗️ Enhanced Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Modern UI     │    │  Search Mode    │    │   Google AI     │
│  (React/Next)   │◄──►│    Toggle       │◄──►│  (Gemini 1.5)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Dual Search     │◄──►│ Google Search   │
                       │   Engine        │    │   Service       │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Direct Scraping │    │ Web Scraping    │
                       │    Service      │    │ (15+ Websites)  │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────────────────────────────┐
                       │        AI Analysis & Enhancement        │
                       │   • Relevance Validation               │
                       │   • Intelligent Ranking               │
                       │   • Price Insights                    │
                       │   • Smart Recommendations            │
                       └─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- **That's it!** No environment setup, no config files, no server setup needed! ✨

### Installation & Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd global-shopper-ai
   npm install
   ```

2. **Start the Application**
   ```bash
   npm run dev
   ```

3. **Complete Setup in Browser** (60 seconds!)
   - Navigate to `http://localhost:3000`
   - Beautiful setup dialog appears automatically
   - Click "Get your free API key" → Opens Google AI Studio
   - Generate your Gemini API key (free tier available)
   - Paste key in setup dialog → Instant validation
   - Click "Start Price Comparison" → Ready to shop!

4. **Start Shopping Globally!**
   - Choose your search mode (Google or Direct)
   - Search any product in 50+ countries
   - Get AI-powered insights and rankings
   - Find the best deals worldwide!

## 🎨 Modern UI Features

### ✨ **Interactive Setup Experience**
- **Beautiful Welcome Screen**: Professional onboarding with feature highlights
- **Guided API Setup**: Step-by-step process with direct Google AI Studio integration
- **Real-time Validation**: Instant feedback on API key validity with detailed error messages
- **Secure Key Management**: Password-style input with visibility toggle
- **One-Click Reset**: Easy API key changes anytime

### 🔄 **Dynamic Search Interface**
- **Search Mode Toggle**: Visual switch between Google Search and Direct Scraping
- **Real-time Coverage Display**: Shows unlimited vs limited website coverage
- **Smart Country Selection**: 50+ countries with automatic website detection
- **Advanced Filters**: Price ranges, result limits, country-specific options

### 📊 **Rich Results Display**
- **AI Insights Panel**: Price ranges, averages, best value indicators
- **Search Mode Indicator**: Clear display of which method found the results
- **Performance Metrics**: Search time, websites covered, confidence scores
- **Product Cards**: Rich information including ratings, shipping, seller details

## 📖 Enhanced API Documentation

### Search Products (Enhanced)

**POST** `/api/search`

Now supports dual search modes and enhanced AI analysis.

**Headers:**
```
Content-Type: application/json
X-API-Key: your_gemini_api_key
X-Search-Mode: google|direct (optional, defaults to google)
```

**Request Body:**
```json
{
  "productName": "iPhone 16 Pro",
  "country": "US",
  "maxResults": 20,
  "useGoogleSearch": true,
  "priceRange": {
    "min": 100,
    "max": 2000
  }
}
```

**Enhanced Response:**
```json
{
  "products": [
    {
      "productName": "Apple iPhone 16 Pro 128GB",
      "price": "$999.00",
      "currency": "USD",
      "link": "https://amazon.com/...",
      "websiteName": "amazon",
      "availability": "In Stock",
      "rating": 4.7,
      "imageUrl": "https://...",
      "seller": "Apple Store",
      "shipping": "Free shipping",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ],
  "searchQuery": "iPhone 16 Pro",
  "country": "US",
  "totalResults": 15,
  "searchTime": 3200,
  "websites": ["amazon", "ebay", "bestbuy", "walmart"],
  "searchMode": "Google Search (Global)",
  "insights": {
    "priceRange": { "min": 899, "max": 1299 },
    "averagePrice": 1049,
    "bestValue": { /* ProductResult */ },
    "premiumOption": { /* ProductResult */ },
    "recommendations": [
      "Best Buy offers immediate pickup options",
      "Amazon has the most competitive pricing"
    ],
    "warnings": ["Limited stock reported at some retailers"]
  },
  "confidence": 92,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Supported Countries (Updated)

**GET** `/api/countries`

**Enhanced Response:**
```json
{
  "countries": [
    {
      "code": "US",
      "name": "United States", 
      "websites": ["Google Shopping", "Global E-commerce Sites"]
    },
    {
      "code": "IN",
      "name": "India",
      "websites": ["Amazon India", "Flipkart", "Snapdeal"]
    }
  ],
  "total": 50,
  "searchModes": {
    "google": "Unlimited websites globally",
    "direct": "15+ specific websites with detailed analysis"
  }
}
```

### Test API Key (Enhanced)

**POST** `/api/test-api-key`

**Request Body:**
```json
{
  "apiKey": "your_gemini_api_key_here"
}
```

**Enhanced Response:**
```json
{
  "valid": true,
  "message": "API key is valid and working",
  "model": "gemini-1.5-flash",
  "features": [
    "Product relevance validation",
    "Intelligent ranking",
    "Price analysis",
    "Smart recommendations"
  ]
}
```

## 🤖 Advanced AI Features

### 1. **Multi-Modal Product Analysis**
- **Relevance Validation**: Filters out unrelated products and accessories
- **Smart Matching**: Handles variations in naming, model numbers, colors, sizes
- **Context Awareness**: Considers regional naming differences and product categories

### 2. **Intelligent Ranking System**
- **Multi-Factor Analysis**: Price, ratings, availability, shipping, seller reputation
- **Value Optimization**: Identifies best value vs premium options
- **User Preference Learning**: Adapts to search patterns and preferences

### 3. **Enhanced Data Processing**
- **Price Normalization**: Handles all currency formats and regional variations
- **Product Title Cleaning**: Removes promotional text and standardizes naming
- **Availability Standardization**: Consistent stock status across all sources

### 4. **Smart Insights Generation**
- **Price Trend Analysis**: Identifies competitive pricing and outliers
- **Recommendation Engine**: Provides actionable shopping advice
- **Warning System**: Alerts about stock issues or pricing anomalies

## 🚀 Usage Examples

### Basic Google Search
```typescript
const result = await fetch('/api/search', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key',
    'X-Search-Mode': 'google'
  },
  body: JSON.stringify({
    productName: "MacBook Air M3",
    country: "US",
    maxResults: 20,
    useGoogleSearch: true
  })
});
```

### Direct Scraping Mode
```typescript
const result = await fetch('/api/search', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key',
    'X-Search-Mode': 'direct'
  },
  body: JSON.stringify({
    productName: "Gaming Laptop RTX 4070",
    country: "DE",
    maxResults: 15,
    useGoogleSearch: false,
    priceRange: { min: 1000, max: 3000 }
  })
});
```

### Global Search with Auto-Fallback
```typescript
// Searches France - uses Google globally, falls back to international sites
const result = await fetch('/api/search', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    productName: "Samsung Galaxy S24 Ultra",
    country: "FR",
    maxResults: 20
  })
});
```

## ⚙️ Advanced Configuration

### Search Mode Configuration

The application supports dynamic search mode switching:

```typescript
// In the UI - users can toggle between modes
const [useGoogleSearch, setUseGoogleSearch] = useState(true);

// In the backend - automatic fallback logic
if (googleResults.length < 3) {
  // Supplement with direct scraping
  const directResults = await directScraping();
  mergeResults(googleResults, directResults);
}
```

### Adding New Countries

To add international support for a new country:

```typescript
// In src/services/priceComparison.ts
{ code: 'XX', name: 'New Country', hasConfig: false }
```

The system automatically provides Google search coverage and international site fallbacks.

### Adding New Websites (Direct Scraping)

For dedicated website support, update `src/config/websites.ts`:

```typescript
{
  name: 'New E-commerce Site',
  baseUrl: 'https://newsite.com',
  searchUrl: 'https://newsite.com/search?q={query}',
  countries: ['US', 'CA'],
  selectors: {
    productContainer: '.product-card',
    productName: '.product-title',
    price: '.price-display',
    link: '.product-link',
    rating: '.rating-stars',
    availability: '.stock-status'
  },
  currency: 'USD',
  requiresJs: false,
  rateLimit: 2000
}
```

### Environment Variables (Optional)

All functionality works without environment setup! Optional advanced configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_CONCURRENT_REQUESTS` | Parallel scraping requests | 5 |
| `GOOGLE_SEARCH_DELAY` | Delay between Google requests | 2000ms |
| `USER_AGENT` | Browser identification | Chrome latest |
| `PUPPETEER_TIMEOUT` | Page load timeout | 30000ms |

## 🛠️ Development

### Enhanced Project Structure
```
src/
├── app/                     # Next.js 15 app router
│   ├── api/                # Enhanced API endpoints
│   │   ├── search/         # Dual-mode search endpoint  
│   │   ├── countries/      # Global country support
│   │   └── test-api-key/   # API validation with features
│   ├── globals.css         # Modern UI styles
│   ├── layout.tsx          # Root layout with setup logic
│   └── page.tsx            # Main interface with search modes
├── components/             # React components
│   ├── SearchInterface.tsx # Enhanced search UI with mode toggle
│   └── SetupDialog.tsx     # Beautiful API key setup dialog
├── config/                 # Configuration
│   └── websites.ts         # Website configurations for direct scraping
├── lib/                    # Utilities
│   └── utils.ts            # Helper functions with robust type handling
├── services/               # Core business logic
│   ├── gemini.ts           # Enhanced AI service with fallbacks
│   ├── googleSearchService.ts # NEW: Google search integration
│   ├── scraper.ts          # Direct website scraping
│   └── priceComparison.ts  # Main orchestrator with dual modes
└── types/                  # TypeScript definitions
    └── index.ts            # Comprehensive type definitions
```

### Recent Major Updates

#### v2.0.0 - Google Search Revolution 🚀
- **🌐 Google Search Integration**: Unlimited website coverage via Google Shopping and web search
- **🔄 Dual Search Architecture**: Choose between Google search and direct scraping
- **🌍 True Global Support**: From 7 to 50+ countries with intelligent fallbacks
- **🤖 Enhanced AI**: Improved relevance validation and intelligent ranking
- **🎨 Modern UI**: Search mode toggle, better visual feedback, streamlined interface
- **🛡️ Robust Error Handling**: Graceful fallbacks, type safety, null handling
- **⚡ Performance**: Faster searches with intelligent caching and parallel processing

#### v1.5.0 - UI & Reliability Improvements
- **Fixed text visibility**: All input fields now have proper text colors
- **Streamlined interface**: Removed AI suggestions for cleaner UX
- **Better error handling**: Comprehensive null safety and fallback mechanisms
- **International expansion**: Enhanced country support with automatic fallbacks

### Building & Testing

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Production server
npm start

# Run tests
npm test
```

### Performance Monitoring

The application includes comprehensive performance tracking:

```typescript
// Search performance metrics
{
  searchTime: 3200,          // Total search time in ms
  websitesCovered: 8,        // Number of websites searched
  productsFound: 15,         // Raw products discovered
  productsRelevant: 12,      // AI-validated relevant products
  confidenceScore: 92,       // AI confidence in results
  searchMode: "Google Search (Global)"
}
```

## 🔒 Security & Privacy

### **Privacy-First Architecture**
- **Local Storage**: API keys stored only in browser localStorage
- **No Server Storage**: Zero persistence of user data or API keys
- **Direct AI Communication**: Your API key communicates directly with Google
- **No Tracking**: No user behavior tracking or analytics collection

### **Secure Practices**
- **Rate Limiting**: Respectful request throttling (10 requests/hour per IP)
- **Input Validation**: Comprehensive sanitization of all user inputs
- **Error Handling**: Secure error messages without sensitive data exposure
- **HTTPS Enforcement**: All external requests use secure connections

### **Legal Compliance**
- **Robots.txt Respect**: Honors website crawling preferences
- **Fair Use**: Designed for personal price comparison use only
- **Regional Compliance**: Respects local e-commerce regulations
- **Data Minimization**: Only collects necessary product information

## 🚨 Known Limitations

### **Google Search Limitations**
- **Rate Limits**: Google may throttle requests from the same IP
- **CAPTCHA**: Occasional challenges during high-volume usage
- **Regional Variations**: Some results may vary by geographic location

### **Direct Scraping Limitations**
- **Website Changes**: E-commerce sites may update structures affecting scraping
- **Geographic Blocks**: Some sites restrict access from certain regions
- **JavaScript Rendering**: Heavy JS sites may require additional processing time

### **AI Service Limitations**
- **API Quotas**: Gemini free tier has usage limits (15 requests/minute)
- **Language Support**: Optimized for English product searches
- **Context Windows**: Very long product lists may be truncated

### **General Limitations**
- **Network Dependency**: Requires stable internet for optimal performance
- **Browser Compatibility**: Modern browsers required for full functionality

## 🤝 Contributing

We welcome contributions to make Global Shopper AI even better!

### **Quick Start for Contributors**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Commit: `git commit -m 'Add amazing new feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Contribution Ideas**
- **New Website Support**: Add scrapers for additional e-commerce sites
- **Country Expansion**: Enhance regional support and localization
- **Performance Optimization**: Improve search speed and efficiency
- **UI Enhancements**: Better mobile experience, accessibility improvements
- **AI Features**: Enhanced recommendation algorithms, price prediction

### **Development Guidelines**
- Follow existing code patterns and TypeScript conventions
- Add comprehensive error handling for new features
- Update documentation for any API changes
- Test thoroughly across different countries and websites
- Consider performance impact of new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

### **Getting Help**
- **GitHub Issues**: Report bugs, request features, ask questions
- **Documentation**: Comprehensive guides and API documentation
- **Community**: Connect with other users and contributors

### **Common Issues & Solutions**
- **API Key Issues**: Ensure valid Gemini API key with proper permissions
- **No Results Found**: Try different search terms or switch search modes
- **Slow Performance**: Check internet connection, try fewer concurrent requests
- **Website Errors**: Some sites may temporarily block requests - try again later

## 🙏 Acknowledgments

- **Google Gemini AI**: Powering intelligent product analysis and insights
- **Google Search**: Enabling unlimited global website coverage
- **Puppeteer Team**: Excellent headless browser automation
- **Cheerio**: Fast and flexible HTML parsing
- **Next.js Team**: Outstanding React framework and developer experience
- **Open Source Community**: All the amazing contributors and maintainers
- **Global Shopping Community**: Inspiration for building better price comparison tools

---

## 🌟 **Ready to revolutionize your shopping experience?**

### **🚀 Get started in 60 seconds:**
1. **Clone & Install** → `npm install`
2. **Start Application** → `npm run dev`  
3. **Setup API Key** → Beautiful UI guides you through
4. **Search Globally** → Find the best prices across unlimited websites!

### **🌍 What makes Global Shopper AI special:**
- **✅ Unlimited website coverage** via Google Search
- **✅ 50+ countries supported** with intelligent fallbacks  
- **✅ AI-powered insights** for smarter shopping decisions
- **✅ Zero configuration** required - works out of the box
- **✅ Privacy-first** design - your data stays with you
- **✅ Open source** - transparent and community-driven

**Start saving money globally today!** 💰🌍✨
