// Interactive Map Component with Leaflet.js
'use client'

import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import { Icon, TileLayer as LeafletTileLayer } from 'leaflet'
import * as L from 'leaflet'
import { useEffect, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import CitySearch from './CitySearch'
import { usePredictionData, PredictionPoint } from '../../lib/hooks/usePredictionData'

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

// Map view updater component
function MapViewUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

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

// Prediction overlay component
function PredictionOverlay({ predictionData }: { predictionData: PredictionPoint[] }) {
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
      {predictionData.map((point, index) => (
        <Circle
          key={`pred-${index}`}
          center={[point.lat, point.lng]}
          radius={200}
          pathOptions={{
            color: getAQIColor(point.aqi),
            fillColor: getAQIColor(point.aqi),
            fillOpacity: 0.5
          }}
          eventHandlers={{
            click: () => {
              // Popup is handled by Marker
            }
          }}
        />
      ))}
      
      {predictionData.map((point, index) => (
        <Marker
          key={`marker-${index}`}
          position={[point.lat, point.lng]}
          icon={new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
              <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" fill="${getAQIColor(point.aqi)}" stroke="#ffffff" stroke-width="1"/>
                <text x="8" y="10" text-anchor="middle" fill="white" font-family="Arial" font-size="6" font-weight="bold">${point.aqi}</text>
              </svg>
            `)}`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">Air Quality Prediction</h3>
              <p className="text-sm text-gray-600">AQI: <span className="font-semibold">{point.aqi}</span></p>
              <p className="text-sm text-gray-600">Quality: <span className="font-semibold">{point.quality}</span></p>
              <div className="text-sm mt-1 pt-1 border-t border-gray-200">
                {point.pollutants.pm25 && <p>PM2.5: {point.pollutants.pm25.toFixed(1)} μg/m³</p>}
                {point.pollutants.pm10 && <p>PM10: {point.pollutants.pm10.toFixed(1)} μg/m³</p>}
                {point.pollutants.o3 && <p>O3: {point.pollutants.o3.toFixed(1)} ppb</p>}
                {point.pollutants.no2 && <p>NO2: {point.pollutants.no2.toFixed(1)} ppb</p>}
                {point.pollutants.co && <p>CO: {point.pollutants.co.toFixed(2)} ppm</p>}
                {point.pollutants.so2 && <p>SO2: {point.pollutants.so2.toFixed(1)} ppb</p>}
              </div>
              <div className="mt-1 pt-1 border-t border-gray-200 text-xs text-gray-500">
                <p>Confidence: {Math.round((point.confidence || 0) * 100)}%</p>
                <p>Updated: {point.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
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
      { lat: 38.9000, lng: -77.0000, aqi: 65, quality: 'Moderate', pollutant: 'PM2.5: 18 μg/m³' }
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

// Main Interactive Map Component
const InteractiveMap = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(NASA_HQ_COORDS)
  const [mapZoom, setMapZoom] = useState<number>(13)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [showPredictions, setShowPredictions] = useState<boolean>(true)
  const [isFirstSearch, setIsFirstSearch] = useState<boolean>(true) // Add state for tracking first search
  
  // Get prediction data using our custom hook
  const { data: predictionData, loading: loadingPredictions, getAllPredictions } = usePredictionData()

  // Load all prediction data when component mounts
  useEffect(() => {
    getAllPredictions()
  }, [getAllPredictions])

  // Handle location search
  const handleSearch = useCallback((coords: { lat: number; lng: number }, locationName: string) => {
    setMapCenter([coords.lat, coords.lng])
    setMapZoom(14)
    setSelectedLocation(locationName)
  }, [])

  return (
    <div className="relative h-screen w-full">
      <LeafletMapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        {/* Update map view when center or zoom changes */}
        <MapViewUpdater center={mapCenter} zoom={mapZoom} />
        
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
                  <strong>Current Air Quality:</strong> 45 (Good)<br/>
                  <strong>PM2.5:</strong> 12 μg/m³<br/>
                  <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Air Quality Data Overlay */}
        <AirQualityOverlay />
        
        {/* Prediction Data Overlay */}
        {showPredictions && predictionData.length > 0 && (
          <PredictionOverlay predictionData={predictionData} />
        )}
        
        {/* Map Controls */}
        <MapControls />
      </LeafletMapContainer>

      {/* City Search Component */}
      <CitySearch 
        onSearch={handleSearch} 
        isFirstSearch={isFirstSearch} 
        onSearchExecuted={() => setIsFirstSearch(false)} 
      />

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="absolute top-4 left-[22rem] z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 max-w-md">
          <p className="text-sm font-medium">{selectedLocation}</p>
        </div>
      )}

      {/* Loading indicator for predictions */}
      {loadingPredictions && (
        <div className="absolute bottom-20 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 px-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Loading predictions...</span>
          </div>
        </div>
      )}

      {/* Toggle Predictions Button */}
      <button
        className="absolute bottom-4 left-4 z-[1000] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        onClick={() => setShowPredictions(!showPredictions)}
      >
        {showPredictions ? 'Hide Predictions' : 'Show Predictions'}
      </button>

      {/* Map Info Panel */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="font-semibold text-gray-900 mb-2">TempoTrackers Map</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-xs text-gray-600">NASA Headquarters</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Good Air Quality (0-50)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Moderate Air Quality (51-100)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">Unhealthy for Sensitive Groups (101-150)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Unhealthy (151-200)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">Very Unhealthy (201-300)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-800"></div>
            <span className="text-xs text-gray-600">Hazardous (301+)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveMap
