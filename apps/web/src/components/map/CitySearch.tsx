// City Search Component for TempoTrackers Map
'use client'

import { useState, useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
// Removing Spanish locale setup
// import { setupDatePickerLocale } from '../../lib/datepicker-locale'

// No longer needed for English UI
// setupDatePickerLocale()

interface CitySearchProps {
  onSearch: (coords: { lat: number; lng: number }, locationName: string) => void;
  availableDates?: string[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  isFirstSearch: boolean;
  onSearchExecuted: () => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ 
  onSearch, 
  availableDates = [], 
  selectedDate = '', 
  onDateChange = () => {}, 
  isFirstSearch,
  onSearchExecuted
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{coords: { lat: number; lng: number }, name: string} | null>(null)
  const [date, setDate] = useState<Date>(selectedDate ? new Date(selectedDate) : new Date())
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (e.target.value.length >= 3) {
      searchLocation(e.target.value)
    } else {
      setResults([])
    }
  }

  // Search location using Nominatim API
  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Error searching location:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle location selection
  const handleLocationSelect = (result: any) => {
    const coords = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    }
    
    setQuery(result.display_name.split(',')[0])
    setShowResults(false)
    setSelectedLocation({coords, name: result.display_name})
  }

  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setDate(newDate)
      // Convert to ISO format and pass only the date part (YYYY-MM-DD)
      const dateString = newDate.toISOString().split('T')[0]
      onDateChange(dateString)
    }
  }

  // Handle search execution
  const handleSearchExecution = () => {
    if (selectedLocation) {
      // Call the parent component's search handler
      onSearch(selectedLocation.coords, selectedLocation.name)
      onSearchExecuted() // Notify parent that search has been executed
    }
  }

  // Handle clicks outside of search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Set initial date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate))
    }
  }, [selectedDate])

  return (
    <div 
      ref={searchRef}
      className={`absolute z-[1000] bg-white rounded-lg shadow-lg w-64 md:w-80 transition-all duration-300 ${
        isFirstSearch
          ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          : 'top-20 left-4'
      }`}
    >
      <div className="p-3">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search city or location..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (results.length > 0) setShowResults(true)
              }}
            />
            <div className="absolute left-3 top-2.5">
              <svg 
                className="w-4 h-4 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            {isLoading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-72 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  onClick={() => handleLocationSelect(result)}
                >
                  <div className="font-medium">{result.display_name.split(',')[0]}</div>
                  <div className="text-xs text-gray-500 truncate">{result.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Date selector - Reemplazado por DatePicker */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prediction Date</label>
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            minDate={new Date()} // Optional: allows selection only from today onwards
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            placeholderText="Select a date"
          />
        </div>
        
        {/* Go button */}
        <button
          onClick={handleSearchExecution}
          disabled={!selectedLocation}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
            selectedLocation 
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Searching...' : 'GO'}
        </button>
      </div>
    </div>
  )
}

export default CitySearch