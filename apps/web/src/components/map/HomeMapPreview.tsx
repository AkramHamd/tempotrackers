// Simplified Map Component for Home Page
'use client'

import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
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

export const HomeMapPreview = () => {
  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <LeafletMapContainer
        center={NASA_HQ_COORDS}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        {/* NASA Headquarters Marker */}
        <Marker position={NASA_HQ_COORDS} icon={nasaIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-blue-600 text-sm">NASA Headquarters</h3>
              <p className="text-xs text-gray-600">Washington D.C.</p>
            </div>
          </Popup>
        </Marker>

        {/* Sample Air Quality Markers */}
        {sampleAirQualityData.map((data, index) => (
          <Marker
            key={index}
            position={[data.lat, data.lng]}
            icon={new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="${getAQIColor(data.aqi)}" stroke="#ffffff" stroke-width="2"/>
                  <text x="10" y="13" text-anchor="middle" fill="white" font-family="Arial" font-size="6" font-weight="bold">${data.aqi}</text>
                </svg>
              `)}`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="p-1">
                <p className="text-xs text-gray-600">AQI: <span className="font-semibold">{data.aqi}</span></p>
                <p className="text-xs text-gray-600">{data.quality}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>

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
