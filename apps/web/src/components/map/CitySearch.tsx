'use client';

import { useState } from 'react';

interface CitySearchProps {
  onCitySelect: (lat: number, lng: number) => void;
}

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Server response error');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onCitySelect(parseFloat(lat), parseFloat(lon));
        // Keep the search query visible
        setHasSearched(true);
      } else {
        setError('No results found for this search');
      }
    } catch (error) {
      console.error('Error searching for city:', error);
      setError('An error occurred while searching for the city');
    } finally {
      setLoading(false);
    }
  };

  // Determine position based on whether a search has been performed
  const positionClass = hasSearched 
    ? "absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
    : "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] w-full max-w-md px-4";

  return (
    <div className={positionClass}>
      <form 
        onSubmit={handleSearch}
        className="flex flex-col w-full items-center space-y-3 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg"
      >
        {!hasSearched ? (
          <div className="text-center mb-1 w-full">
            <h2 className="text-xl font-semibold text-gray-800">Where would you like to explore?</h2>
            <p className="text-sm text-gray-600 mt-1">Enter a city to check its air quality</p>
          </div>
        ) : (
          <div className="text-center mb-1 w-full">
            <h3 className="text-sm font-medium text-gray-700">New search</h3>
          </div>
        )}
        
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 text-sm outline-none border border-gray-200 rounded"
          disabled={loading}
        />
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="w-full p-2 text-sm outline-none border border-gray-200 rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Go'}
        </button>
      </form>
      
      {error && (
        <div className="mt-2 text-sm bg-red-50 text-red-700 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}