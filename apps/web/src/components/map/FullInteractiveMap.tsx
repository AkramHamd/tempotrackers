// Full Interactive Map Component for Map Page
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// NASA Headquarters coordinates (Washington D.C.)
const NASA_HQ_COORDS = [38.8833, -77.0167] as [number, number]

// Main Full Interactive Map Component
export default function FullInteractiveMap() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TempoTrackers Map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full">
      {/* Map placeholder with NASA HQ info */}
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-indigo-200 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-purple-200 rounded-full"></div>
        </div>

        {/* NASA HQ Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">NASA</span>
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 text-center">
            <p className="text-sm font-semibold text-gray-900">NASA Headquarters</p>
            <p className="text-xs text-gray-600">Washington D.C.</p>
          </div>
        </div>

        {/* Air Quality Stations */}
        <div className="absolute top-1/3 left-1/3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">45</span>
          </div>
        </div>
        <div className="absolute top-1/4 right-1/3">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">52</span>
          </div>
        </div>
        <div className="absolute bottom-1/3 left-1/4">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">38</span>
          </div>
        </div>
      </div>

      {/* Map Info Panel */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="font-semibold text-gray-900 mb-2">TempoTrackers Map</h3>
        <p className="text-sm text-gray-600 mb-3">
          Interactive air quality monitoring centered on NASA Headquarters in Washington D.C.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-xs text-gray-600">NASA Headquarters</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Good Air Quality (AQI 0-50)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Moderate Air Quality (AQI 51-100)</span>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold">TempoTrackers</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Map Tools Panel */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Live Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">TEMPO Satellite</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">Ground Stations</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-1">
          <button className="px-3 py-2 text-sm font-medium rounded bg-blue-600 text-white">
            Satellite
          </button>
          <button className="px-3 py-2 text-sm font-medium rounded text-gray-700 hover:bg-gray-100">
            Street
          </button>
          <button className="px-3 py-2 text-sm font-medium rounded text-gray-700 hover:bg-gray-100">
            Terrain
          </button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-blue-600 text-white rounded-lg shadow-lg p-3 max-w-xs">
        <h4 className="font-semibold text-sm mb-1">Interactive Map Coming Soon!</h4>
        <p className="text-xs opacity-90">
          Full Leaflet.js integration with satellite imagery, street maps, and real-time air quality data will be available in the next update.
        </p>
      </div>
    </div>
  )
}
