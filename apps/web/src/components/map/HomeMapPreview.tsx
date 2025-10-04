// Simplified Map Component for Home Page with Leaflet.js
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
      const mapInstance = L.map('home-map-container').setView(NASA_HQ_COORDS, 12)

      // Add satellite layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      }).addTo(mapInstance)

      // Create NASA HQ marker
      const nasaIcon = L.divIcon({
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background: #1e40af; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: 10px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">NASA</div>
        `,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      const nasaMarker = L.marker(NASA_HQ_COORDS, { icon: nasaIcon }).addTo(mapInstance)
      nasaMarker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; color: #1e40af; margin: 0 0 4px 0;">NASA Headquarters</h3>
          <p style="font-size: 12px; color: #666; margin: 0;">Washington D.C.</p>
        </div>
      `)

      // Add air quality markers
      sampleAirQualityData.forEach((data) => {
        const aqiIcon = L.divIcon({
          html: `
            <div style="
              width: 16px; 
              height: 16px; 
              background: ${getAQIColor(data.aqi)}; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 6px;
              border: 1px solid white;
              box-shadow: 0 1px 2px rgba(0,0,0,0.3);
            ">${data.aqi}</div>
          `,
          className: 'custom-div-icon',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })

        const aqiMarker = L.marker([data.lat, data.lng], { icon: aqiIcon }).addTo(mapInstance)
        aqiMarker.bindPopup(`
          <div style="padding: 6px;">
            <p style="font-size: 11px; color: #666; margin: 0 0 2px 0;">AQI: <strong>${data.aqi}</strong></p>
            <p style="font-size: 11px; color: #666; margin: 0;">${data.quality}</p>
          </div>
        `)
      })

      // Disable interactions for preview
      mapInstance.dragging.disable()
      mapInstance.touchZoom.disable()
      mapInstance.doubleClickZoom.disable()
      mapInstance.scrollWheelZoom.disable()
      mapInstance.boxZoom.disable()
      mapInstance.keyboard.disable()

      // Store map instance for cleanup
      ;(window as any).homeMapInstance = mapInstance
    }

    initMap()

    // Cleanup
    return () => {
      if ((window as any).homeMapInstance) {
        ;(window as any).homeMapInstance.remove()
      }
    }
  }, [isClient])

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
      {/* Leaflet Map Container */}
      <div id="home-map-container" className="h-full w-full"></div>

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