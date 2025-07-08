'use client';

import { useState, useEffect } from 'react';
import SearchInterface from '../components/SearchInterface';
import SetupDialog from '../components/SetupDialog';
import { SearchResult } from '../types';

export default function Home() {
  const [countries, setCountries] = useState<{ code: string; name: string; websites: string[] }[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  // Load API key from localStorage and countries on component mount
  useEffect(() => {
    // Check for stored API key
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setShowSetup(true);
    }

    async function loadCountries() {
      try {
        const response = await fetch('/api/countries');
        if (response.ok) {
          const data = await response.json();
          setCountries(data.countries);
        } else {
          console.error('Failed to load countries');
        }
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    }

    loadCountries();
  }, []);

  // Handle API key submission
  const handleApiKeySubmit = (newApiKey: string) => {
    localStorage.setItem('gemini-api-key', newApiKey);
    setApiKey(newApiKey);
  };

  // Handle API key reset
  const handleResetApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey(null);
    setShowSetup(true);
  };

  // Handle product search
  const handleSearch = async (query: string, country: string, maxResults: number, useGoogleSearch: boolean = true): Promise<SearchResult> => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || '', // Pass API key in header
        'X-Search-Mode': useGoogleSearch ? 'google' : 'direct', // Pass search mode
      },
      body: JSON.stringify({
        productName: query,
        country,
        maxResults,
        useGoogleSearch,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Search failed');
    }

    return await response.json();
  };



  if (isLoadingCountries) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supported countries...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SetupDialog
        isOpen={showSetup}
        onApiKeySubmit={handleApiKeySubmit}
        onClose={() => setShowSetup(false)}
      />
      
      {apiKey && (
        <SearchInterface
          onSearch={handleSearch}
          countries={countries}
          onResetApiKey={handleResetApiKey}
          apiKey={apiKey}
        />
      )}
    </>
  );
}
