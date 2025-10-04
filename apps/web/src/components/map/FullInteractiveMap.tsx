// Full Interactive Map Component with Leaflet.js
'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAirQualityData, useAQIColor } from '../../lib/hooks/useData'
import { useSO2Predictions } from '../../lib/hooks/useSO2Predictions'
import ControlPanel from '../control/ControlPanel'
import CitySearch from './CitySearch'

// NASA Headquarters coordinates (Washington D.C.)
const NASA_HQ_COORDS = [38.8833, -77.0167] as [number, number]

export default function FullInteractiveMap() {
  const mapRef = useRef<any>(null)
  const [currentLayer, setCurrentLayer] = useState('satellite')
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const { data: airQualityData, loading: aqiLoading, error: aqiError } = useAirQualityData()
  const { 
    data: so2Data, 
    loading: so2Loading, 
    error: so2Error,
    getSO2Color 
  } = useSO2Predictions({
    latitude: NASA_HQ_COORDS[0],
    longitude: NASA_HQ_COORDS[1]
  })
  const getAQIColor = useAQIColor()
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [showSO2Layer, setShowSO2Layer] = useState(false)

  // Initialize map with retry mechanism
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 100; // ms

    const initializeMap = async () => {
      try {
        // Clean up existing map if any
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }

        // Check for container
        const container = document.getElementById('map-container')
        if (!container) {
          retryCount++
          if (retryCount < maxRetries) {
            console.log(`Map container not found, retrying (${retryCount}/${maxRetries})...`)
            setTimeout(initializeMap, retryInterval)
            return
          } else {
            console.error('Map container not found after maximum retries')
            return
          }
        }

        // Import Leaflet
        const L = (await import('leaflet')).default
        require('leaflet/dist/leaflet.css')

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        const instance = L.map('map-container', {
          zoomControl: false
        }).setView(NASA_HQ_COORDS, 13)

        // Wait for map to be ready
        instance.whenReady(() => {
          // Store map instance in ref
          mapRef.current = instance
          setIsMapInitialized(true)
        })

        // Add zoom control
        L.control.zoom({
          position: 'bottomright'
        }).addTo(instance)

        // Set initial layer
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19
        }).addTo(instance)

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

        const nasaMarker = L.marker(NASA_HQ_COORDS, { icon: nasaIcon }).addTo(instance)
        
        // Get NASA HQ data if available
        const nasaData = airQualityData?.find(data => data.id === 'nasa-hq')
        
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
                <strong>Current AQI:</strong> ${nasaData ? `${nasaData.aqi} (${nasaData.quality})` : 'Loading...'}<br/>
                <strong>PM2.5:</strong> ${nasaData ? `${nasaData.pollutants.pm25} μg/m³` : 'Loading...'}<br/>
                <strong>Source:</strong> ${nasaData ? nasaData.source : 'Loading...'}<br/>
                <strong>Last Updated:</strong> ${nasaData ? nasaData.timestamp.toLocaleTimeString() : 'Loading...'}
              </p>
            </div>
          </div>
        `)

        // Add SO2 prediction markers
        if (showSO2Layer && so2Data && so2Data.predictions.length > 0) {
          so2Data.predictions.forEach((point) => {
            const so2Icon = L.divIcon({
              html: `
                <div style="
                  width: 20px; 
                  height: 20px; 
                  background: ${getSO2Color(point.prediction)}; 
                  border-radius: 50%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  color: white; 
                  font-weight: bold; 
                  font-size: 8px;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">${Math.round(point.prediction)}</div>
              `,
              className: 'custom-div-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            const so2Marker = L.marker([point.latitude, point.longitude], { icon: so2Icon }).addTo(instance);
            so2Marker.bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">SO₂ Prediction</h3>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Value: <strong>${point.prediction.toFixed(2)} ppb</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Location: <strong>(${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)})</strong></p>
                <p style="font-size: 11px; color: #999; margin: 0;">Date: ${so2Data.centerPoint.date}</p>
              </div>
            `);
          });
        }

        // Add air quality markers from real data
        if (airQualityData && airQualityData.length > 0) {
          airQualityData.forEach((data) => {
            // Skip NASA HQ as it has its own marker
            if (data.id === 'nasa-hq') return
            
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

            const aqiMarker = L.marker([data.latitude, data.longitude], { icon: aqiIcon }).addTo(instance)
            aqiMarker.bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">Air Quality Station</h3>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">AQI: <strong>${data.aqi}</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Quality: <strong>${data.quality}</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">PM2.5: <strong>${data.pollutants.pm25} μg/m³</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Source: <strong>${data.source}</strong></p>
                <p style="font-size: 11px; color: #999; margin: 0;">Updated: ${data.timestamp.toLocaleTimeString()}</p>
              </div>
            `)
          })
        }

        // Map initialization is handled in whenReady callback
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    let retryTimer: NodeJS.Timeout | null = null;

    // Initialize map
    const startInitialization = () => {
      retryTimer = setTimeout(initializeMap, 0);
    };

    startInitialization();

    // Cleanup function
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setIsMapInitialized(false)
      }
    }
  }, [airQualityData, getAQIColor, so2Data, getSO2Color, showSO2Layer])

  // Update markers when data changes
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add NASA HQ marker
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
      });

      const nasaMarker = L.marker(NASA_HQ_COORDS, { icon: nasaIcon }).addTo(map);
      
      // Get NASA HQ data if available
      const nasaData = airQualityData?.find(data => data.id === 'nasa-hq');
      
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
              <strong>Current AQI:</strong> ${nasaData ? `${nasaData.aqi} (${nasaData.quality})` : 'Loading...'}<br/>
              <strong>PM2.5:</strong> ${nasaData ? `${nasaData.pollutants.pm25} μg/m³` : 'Loading...'}<br/>
              <strong>Source:</strong> ${nasaData ? nasaData.source : 'Loading...'}<br/>
              <strong>Last Updated:</strong> ${nasaData ? nasaData.timestamp.toLocaleTimeString() : 'Loading...'}
            </p>
          </div>
        </div>
      `);

      // Add air quality markers
      if (airQualityData?.length > 0) {
        airQualityData.forEach((data) => {
          if (data.id === 'nasa-hq') return;
          
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
          });

          L.marker([data.latitude, data.longitude], { icon: aqiIcon })
            .bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">Air Quality Station</h3>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">AQI: <strong>${data.aqi}</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Quality: <strong>${data.quality}</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">PM2.5: <strong>${data.pollutants.pm25} μg/m³</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Source: <strong>${data.source}</strong></p>
                <p style="font-size: 11px; color: #999; margin: 0;">Updated: ${data.timestamp.toLocaleTimeString()}</p>
              </div>
            `)
            .addTo(map);
        });
      }

      // Add SO2 prediction markers
      if (showSO2Layer && so2Data && so2Data.predictions.length > 0) {
        so2Data.predictions.forEach((point) => {
          const so2Icon = L.divIcon({
            html: `
              <div style="
                width: 20px; 
                height: 20px; 
                background: ${getSO2Color(point.prediction)}; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-weight: bold; 
                font-size: 8px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${Math.round(point.prediction)}</div>
            `,
            className: 'custom-div-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker([point.latitude, point.longitude], { icon: so2Icon })
            .bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">SO₂ Prediction</h3>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Value: <strong>${point.prediction.toFixed(2)} ppb</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Location: <strong>(${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)})</strong></p>
                <p style="font-size: 11px; color: #999; margin: 0;">Date: ${so2Data.centerPoint.date}</p>
              </div>
            `)
            .addTo(map);
        });
      }
    };

    updateMarkers();
  }, [isMapInitialized, airQualityData, so2Data, showSO2Layer, getAQIColor, getSO2Color]);

  // Handle map resize when control panel opens/closes
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;

    const resizeTimer = setTimeout(() => {
      // Double check map ref is still valid after timeout
      if (mapRef.current) {
        try {
          mapRef.current.invalidateSize();
        } catch (error) {
          console.warn('Failed to resize map:', error);
        }
      }
    }, 300);

    // Clean up timer
    return () => clearTimeout(resizeTimer);
  }, [isControlPanelOpen, isMapInitialized])

  // No resize handling needed - map container never changes size


  const switchLayer = async (layerKey: string) => {
    if (!isMapInitialized || !mapRef.current) return

    const L = (await import('leaflet')).default
    const map = mapRef.current

    // Remove current tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Add new layer based on key
    let newLayer
    switch (layerKey) {
      case 'satellite':
        newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19
        })
        break
      case 'street':
        newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        })
        break
      case 'terrain':
        newLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17
        })
        break
    }

    if (newLayer) {
      newLayer.addTo(map)
      setCurrentLayer(layerKey)
    }
  }

  // Función para centrar el mapa en una ubicación buscada
  const handleCitySelect = (lat: number, lng: number) => {
    if (!isMapInitialized || !mapRef.current) return;
    
    try {
      // Centrar mapa en la ubicación seleccionada con animación
      mapRef.current.flyTo([lat, lng], 12, {
        animate: true,
        duration: 1.5
      });
    } catch (error) {
      console.error('Error al centrar el mapa:', error);
    }
  };

  const error = aqiError || so2Error;

  return (
    <div className="relative h-screen w-full">
      {/* Map Container - Always render this first */}
      <div id="map-container" className="h-full w-full" />

      {/* Loading Overlay */}
      {!isMapInitialized && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading TempoTrackers Map...</p>
            {(aqiLoading || so2Loading) && <p className="text-sm text-gray-500 mt-2">Fetching air quality data...</p>}
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Map</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <ControlPanel 
        isOpen={isControlPanelOpen} 
        onToggle={() => setIsControlPanelOpen(!isControlPanelOpen)} 
      />
      

      {/* City Search Component */}
      <CitySearch onCitySelect={handleCitySelect} />

      {/* Map Info Panel - Hidden when control panel is open */}
      {!isControlPanelOpen && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs transition-all duration-300">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">TempoTrackers</h3>
          </div>
          <p className="text-xs text-gray-600">
            Interactive air quality monitoring around NASA Headquarters
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <div>Stations: {airQualityData?.length || 0}</div>
            <div>Last Update: {airQualityData?.[0]?.timestamp.toLocaleTimeString() || 'Loading...'}</div>
          </div>
        </div>
      )}

      {/* Navigation Header - Hidden when control panel is open */}
      {!isControlPanelOpen && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 transition-all duration-300">
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
      )}

      {/* Map Tools Panel */}
      <div className={`absolute top-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 transition-all duration-300 ${
        isControlPanelOpen ? 'left-1/2 transform -translate-x-1/2' : 'left-1/2 transform -translate-x-1/2'
      }`}>
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
          <div className="px-3 py-2 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Map Type</h4>
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
          
          <div className="px-3 py-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Layers</h4>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setShowSO2Layer(!showSO2Layer)}
                className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                  showSO2Layer
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                SO₂ Predictions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

