// Simplified Map Component for Home Page
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// NASA Headquarters coordinates (Washington D.C.)
const NASA_HQ_COORDS = [38.8833, -77.0167] as [number, number]

// Sample air quality data
const sampleAirQualityData = [
  { lat: 38.8900, lng: -77.0100, aqi: 52, quality: 'Moderate', pollutant: 'PM2.5: 15 μg/m³' },
  { lat: 38.8750, lng: -77.0250, aqi: 38, quality: 'Good', pollutant: 'PM2.5: 9 μg/m³' },
  { lat: 38.9000, lng: -77.0000, aqi: 65, quality: 'Moderate', pollutant: 'PM2.5: 18 μg/m³' }
]

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#00e400'
  if (aqi <= 100) return '#ffff00'
  if (aqi <= 150) return '#ff7e00'
  if (aqi <= 200) return '#ff0000'
  if (aqi <= 300) return '#8f3f97'
  return '#7e0023'
}

const HomeMapPreview = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading Map Preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
      {/* Map placeholder with NASA HQ info */}
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-24 h-24 bg-blue-200 rounded-full"></div>
          <div className="absolute top-20 right-16 w-16 h-16 bg-indigo-200 rounded-full"></div>
          <div className="absolute bottom-16 left-1/4 w-12 h-12 bg-purple-200 rounded-full"></div>
        </div>

        {/* NASA HQ Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">NASA</span>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 text-center">
            <p className="text-xs font-semibold text-gray-900">NASA HQ</p>
            <p className="text-xs text-gray-600">Washington D.C.</p>
          </div>
        </div>

        {/* Sample Air Quality Markers */}
        <div className="absolute top-1/3 left-1/3">
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">52</span>
          </div>
        </div>
        <div className="absolute top-1/4 right-1/3">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">38</span>
          </div>
        </div>
        <div className="absolute bottom-1/3 left-1/4">
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">65</span>
          </div>
        </div>
      </div>

      {/* Overlay with CTA */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Interactive Air Quality Map</h3>
              <p className="text-xs text-gray-600">Real-time TEMPO data around NASA HQ</p>
            </div>
            <Link 
              href="/map" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Explore Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeMapPreview