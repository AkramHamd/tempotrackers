// Full Interactive Map Component with Leaflet.js
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// NASA Headquarters coordinates (Washington D.C.)
const NASA_HQ_COORDS = [38.8833, -77.0167] as [number, number]

// Sample air quality data
const sampleAirQualityData = [
  { lat: 38.8900, lng: -77.0100, aqi: 52, quality: 'Moderate', pollutant: 'PM2.5: 15 μg/m³' },
  { lat: 38.8750, lng: -77.0250, aqi: 38, quality: 'Good', pollutant: 'PM2.5: 9 μg/m³' },
  { lat: 38.9000, lng: -77.0000, aqi: 65, quality: 'Moderate', pollutant: 'PM2.5: 18 μg/m³' },
  { lat: 38.8700, lng: -77.0300, aqi: 42, quality: 'Good', pollutant: 'PM2.5: 11 μg/m³' },
  { lat: 38.9100, lng: -76.9900, aqi: 58, quality: 'Moderate', pollutant: 'PM2.5: 16 μg/m³' }
]

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#00e400'
  if (aqi <= 100) return '#ffff00'
  if (aqi <= 150) return '#ff7e00'
  if (aqi <= 200) return '#ff0000'
  if (aqi <= 300) return '#8f3f97'
  return '#7e0023'
}

export default function FullInteractiveMap() {
  const [isClient, setIsClient] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [currentLayer, setCurrentLayer] = useState('satellite')

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Dynamically import Leaflet only on client side
    const initMap = async () => {
      const L = (await import('leaflet')).default
      
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Create map
      const mapInstance = L.map('map-container').setView(NASA_HQ_COORDS, 13)
      setMap(mapInstance)

      // Add satellite layer by default
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }).addTo(mapInstance)

      // Create NASA HQ marker
      const nasaIcon = L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #1e40af; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">NASA</div>
        `,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })

      const nasaMarker = L.marker(NASA_HQ_COORDS, { icon: nasaIcon }).addTo(mapInstance)
      nasaMarker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; color: #1e40af; margin: 0 0 4px 0;">NASA Headquarters</h3>
          <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">Washington D.C.</p>
          <p style="font-size: 12px; color: #333; margin: 0 0 8px 0;">
            The headquarters of the National Aeronautics and Space Administration, 
            where the TEMPO mission is managed and coordinated.
          </p>
          <div style="border-top: 1px solid #eee; padding-top: 8px;">
            <p style="font-size: 11px; color: #666; margin: 0;">
              <strong>Current AQI:</strong> 45 (Good)<br/>
              <strong>PM2.5:</strong> 12 μg/m³<br/>
              <strong>Last Updated:</strong> ${new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      `)

      // Add air quality markers
      sampleAirQualityData.forEach((data) => {
        const aqiIcon = L.divIcon({
          html: `
            <div style="
              width: 24px; 
              height: 24px; 
              background: ${getAQIColor(data.aqi)}; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 8px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${data.aqi}</div>
          `,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const aqiMarker = L.marker([data.lat, data.lng], { icon: aqiIcon }).addTo(mapInstance)
        aqiMarker.bindPopup(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">Air Quality Station</h3>
            <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">AQI: <strong>${data.aqi}</strong></p>
            <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Quality: <strong>${data.quality}</strong></p>
            <p style="font-size: 12px; color: #666; margin: 0;">${data.pollutant}</p>
          </div>
        `)
      })

      // Store layers for switching
      const layers = {
        satellite: satelliteLayer,
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17
        })
      }

      // Store layers globally for switching
      ;(window as any).mapLayers = layers
      ;(window as any).mapInstance = mapInstance
    }

    initMap()

    // Cleanup
    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [isClient])

  const switchLayer = (layerKey: string) => {
    if (!isClient || !(window as any).mapLayers || !(window as any).mapInstance) return

    const layers = (window as any).mapLayers
    const mapInstance = (window as any).mapInstance

    // Remove current layer
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof (window as any).L.TileLayer) {
        mapInstance.removeLayer(layer)
      }
    })

    // Add new layer
    layers[layerKey].addTo(mapInstance)
    setCurrentLayer(layerKey)
  }

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
      {/* Leaflet Map Container */}
      <div id="map-container" className="h-full w-full"></div>

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
          <button
            onClick={() => switchLayer('satellite')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentLayer === 'satellite'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => switchLayer('street')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentLayer === 'street'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => switchLayer('terrain')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentLayer === 'terrain'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>
    </div>
  )
}