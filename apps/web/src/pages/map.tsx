// Dedicated Map Page with Full Functionality
'use client'

import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'

// NASA Headquarters coordinates (Washington D.C.)
const NASA_HQ_COORDS = [38.8833, -77.0167] as [number, number]

// Custom NASA marker icon
const nasaIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#1e40af" stroke="#ffffff" stroke-width="2"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">NASA</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

// Map controls component
function MapControls() {
  const map = useMap()
  const [currentLayer, setCurrentLayer] = useState('satellite')

  const layers = {
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    street: {
      name: 'Street',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    terrain: {
      name: 'Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
  }

  const switchLayer = (layerKey: string) => {
    const layer = layers[layerKey as keyof typeof layers]
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })
    
    L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: 19
    }).addTo(map)
    
    setCurrentLayer(layerKey)
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
      <div className="flex flex-col space-y-1">
        {Object.entries(layers).map(([key, layer]) => (
          <button
            key={key}
            onClick={() => switchLayer(key)}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentLayer === key
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {layer.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// Air quality data overlay component
function AirQualityOverlay() {
  const [airQualityData, setAirQualityData] = useState<any[]>([])

  useEffect(() => {
    // Simulate air quality data around NASA HQ
    const mockData = [
      { lat: 38.8833, lng: -77.0167, aqi: 45, quality: 'Good', pollutant: 'PM2.5: 12 μg/m³' },
      { lat: 38.8900, lng: -77.0100, aqi: 52, quality: 'Moderate', pollutant: 'PM2.5: 15 μg/m³' },
      { lat: 38.8750, lng: -77.0250, aqi: 38, quality: 'Good', pollutant: 'PM2.5: 9 μg/m³' },
      { lat: 38.9000, lng: -77.0000, aqi: 65, quality: 'Moderate', pollutant: 'PM2.5: 18 μg/m³' },
      { lat: 38.8700, lng: -77.0300, aqi: 42, quality: 'Good', pollutant: 'PM2.5: 11 μg/m³' },
      { lat: 38.9100, lng: -76.9900, aqi: 58, quality: 'Moderate', pollutant: 'PM2.5: 16 μg/m³' }
    ]
    setAirQualityData(mockData)
  }, [])

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400'
    if (aqi <= 100) return '#ffff00'
    if (aqi <= 150) return '#ff7e00'
    if (aqi <= 200) return '#ff0000'
    if (aqi <= 300) return '#8f3f97'
    return '#7e0023'
  }

  return (
    <>
      {airQualityData.map((data, index) => (
        <Marker
          key={index}
          position={[data.lat, data.lng]}
          icon={new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${getAQIColor(data.aqi)}" stroke="#ffffff" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="8" font-weight="bold">${data.aqi}</text>
              </svg>
            `)}`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">Air Quality Station</h3>
              <p className="text-sm text-gray-600">AQI: <span className="font-semibold">{data.aqi}</span></p>
              <p className="text-sm text-gray-600">Quality: <span className="font-semibold">{data.quality}</span></p>
              <p className="text-sm text-gray-600">{data.pollutant}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

// Full Interactive Map Component
function FullInteractiveMap() {
  return (
    <div className="relative h-screen w-full">
      <LeafletMapContainer
        center={NASA_HQ_COORDS}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        {/* NASA Headquarters Marker */}
        <Marker position={NASA_HQ_COORDS} icon={nasaIcon}>
          <Popup>
            <div className="p-3">
              <h3 className="font-bold text-blue-600 text-lg">NASA Headquarters</h3>
              <p className="text-sm text-gray-600 mb-2">Washington D.C.</p>
              <p className="text-sm text-gray-700">
                The headquarters of the National Aeronautics and Space Administration, 
                where the TEMPO mission is managed and coordinated.
              </p>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Current AQI:</strong> 45 (Good)<br/>
                  <strong>PM2.5:</strong> 12 μg/m³<br/>
                  <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Air Quality Data Overlay */}
        <AirQualityOverlay />
        
        {/* Map Controls */}
        <MapControls />
      </LeafletMapContainer>

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
    </div>
  )
}

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FullInteractiveMap />
    </div>
  )
}
