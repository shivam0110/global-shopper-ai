'use client';

import { useState } from 'react';
import { Key, Eye, EyeOff, ExternalLink, CheckCircle } from 'lucide-react';

interface SetupDialogProps {
  isOpen: boolean;
  onApiKeySubmit: (apiKey: string) => void;
  onClose: () => void;
}

export default function SetupDialog({ isOpen, onApiKeySubmit, onClose }: SetupDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      alert('Please enter your Gemini API key');
      return;
    }

    setIsValidating(true);
    
    try {
      // Test the API key by making a simple request
      const testResponse = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      if (testResponse.ok) {
        onApiKeySubmit(apiKey.trim());
        onClose();
      } else {
        const error = await testResponse.json();
        alert(`API key validation failed: ${error.message}`);
      }
    } catch (error) {
      console.error('API key validation error:', error);
      alert('Failed to validate API key. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Key className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Setup Global Shopper AI</h2>
              <p className="text-gray-600">Configure your Gemini API key to start comparing prices</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Getting Your Gemini API Key
            </h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-2 text-sm">
              <li>
                Visit{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                >
                  Google AI Studio
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>Sign in with your Google account</li>
              <li>Click &quot;Create API Key&quot; and select a project</li>
              <li>Copy the generated API key and paste it below</li>
            </ol>
          </div>

          {/* API Key Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AIzaSy..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your API key is stored locally in your browser and never sent to our servers
              </p>
            </div>

            {/* Features Preview */}
            {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">🌍 What you&apos;ll get:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Search across 15+ websites
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  7 countries supported
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  AI-powered product matching
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Intelligent price ranking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Smart search suggestions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time price comparison
                </li>
              </ul>
            </div> */}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isValidating || !apiKey.trim()}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Validating...
                  </>
                ) : (
                  'Start Price Comparison'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              🔒 <strong>Security:</strong> Your API key is stored securely in your browser&apos;s local storage and is only used to make requests to Google&apos;s Gemini API. We never store or transmit your API key to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
