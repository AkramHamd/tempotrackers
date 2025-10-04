// Full Interactive Map Component with Leaflet.js
'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAirQualityData, useAQIColor } from '../../lib/hooks/useData'
import { useSO2Predictions } from '../../lib/hooks/useSO2Predictions'
import ControlPanel from '../control/ControlPanel'
import CitySearch from './CitySearch'
import DatePicker from './DatePicker'
import { CirclePoint } from '../../lib/types/so2'

// Center coordinates for Washington D.C. area
const DC_AREA_COORDS = [38.9072, -77.0369] as [number, number]

export default function FullInteractiveMap() {
  const mapRef = useRef<any>(null)
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const heatmapLayerRef = useRef<any>(null)
  const [currentLayer, setCurrentLayer] = useState('satellite')
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentZoom, setCurrentZoom] = useState(13)
  const [mapBounds, setMapBounds] = useState({
    north: DC_AREA_COORDS[0] + 0.1,
    south: DC_AREA_COORDS[0] - 0.1,
    east: DC_AREA_COORDS[1] + 0.1,
    west: DC_AREA_COORDS[1] - 0.1
  })
  
  const { data: airQualityData, loading: aqiLoading, error: aqiError } = useAirQualityData()
  const { 
    data: so2Data, 
    loading: so2Loading, 
    error: so2Error,
    getSO2Color 
  } = useSO2Predictions({
    latitude: DC_AREA_COORDS[0],
    longitude: DC_AREA_COORDS[1],
    zoomLevel: currentZoom,
    bounds: mapBounds,
    selectedDate
  })
  const getAQIColor = useAQIColor()
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [showSO2Layer, setShowSO2Layer] = useState(true)

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return; // Skip if map is already initialized

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
          console.error('Map container not found')
          return
        }

        // Import Leaflet and its dependencies
        const L = (await import('leaflet')).default
        require('leaflet/dist/leaflet.css')
        await import('leaflet.heat')

        const instance = L.map('map-container', {
          zoomControl: false,
          minZoom: 8, // Allow wider view
          maxZoom: 18
        }).setView(DC_AREA_COORDS, currentZoom)

        // Add event listeners for zoom and move with debounce
        const updateMapState = () => {
          const zoom = instance.getZoom();
          const bounds = instance.getBounds();
          
          setCurrentZoom(zoom);
          setMapBounds({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          });
        };

        const debouncedUpdate = () => {
          if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
          }
          updateTimerRef.current = setTimeout(updateMapState, 300);
        };

        instance.on('zoomend', debouncedUpdate);
        instance.on('moveend', debouncedUpdate);

        // Initial state
        updateMapState();

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

        // No NASA marker needed
        
        // No NASA data needed

        // Add SO2 prediction markers
        if (showSO2Layer && so2Data && so2Data.predictions.length > 0) {
          so2Data.predictions.forEach((point: CirclePoint) => {
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
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setIsMapInitialized(false)
      }
    }
  }, [])

  // Update markers when data or visibility changes
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current || !airQualityData || !so2Data) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;

      // Clear existing markers, circles, and heatmap
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle || layer === heatmapLayerRef.current) {
          map.removeLayer(layer);
        }
      });

      // Ensure we have the correct tile layer
      if (!map.hasLayer(L.TileLayer)) {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19
        }).addTo(map);
      }
      
      // Clear heatmap reference
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current = null;
      }

      // No NASA HQ marker needed

      // Add air quality markers
      if (airQualityData?.length > 0) {
        airQualityData.forEach((data) => {
          // Show all air quality markers
          
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

      // Add SO2 prediction heatmap
      if (showSO2Layer && so2Data && so2Data.predictions.length > 0) {
        // Add coverage area
        L.circle(DC_AREA_COORDS, {
          radius: 5000, // 5km radius
          color: 'gray',
          fillColor: 'gray',
          fillOpacity: 0.05,
          weight: 1,
          dashArray: '5, 10'
        }).addTo(map);

        // Convert predictions to heatmap data
        const heatData = so2Data.predictions.map((point: CirclePoint) => {
          // Scale intensity based on prediction value (0-1)
          const intensity = point.prediction / 30; // Assuming max value is 30
          return [point.latitude, point.longitude, intensity];
        });

        // Create and add heatmap layer
        const HeatLayer = (L as any).heatLayer;
        const heat = new HeatLayer(heatData, {
          radius: 30, // Larger radius for better visibility
          blur: 20, // Increased blur for smoother transitions
          maxZoom: 18,
          max: 1.0,
          minOpacity: 0.4, // Minimum opacity for better visibility
          gradient: {
            0.0: 'rgba(0, 0, 255, 0.7)',  // Blue with opacity
            0.3: 'rgba(0, 255, 0, 0.7)',  // Lime with opacity
            0.5: 'rgba(255, 255, 0, 0.7)', // Yellow with opacity
            0.7: 'rgba(255, 165, 0, 0.7)', // Orange with opacity
            1.0: 'rgba(255, 0, 0, 0.7)'    // Red with opacity
          }
        }).addTo(map);

        // Store reference for cleanup
        heatmapLayerRef.current = heat;

        // Add markers for high SO2 values
        so2Data.predictions.forEach((point: CirclePoint) => {
          if (point.prediction > 25) { // Higher threshold for alerts
            const marker = L.marker([point.latitude, point.longitude], {
              icon: L.divIcon({
                html: `
                  <div style="
                    width: 24px; 
                    height: 24px; 
                    background: rgba(255,0,0,0.7); 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 10px;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  ">${Math.round(point.prediction)}</div>
                `,
                className: 'custom-div-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            })
            .bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">High SO₂ Alert</h3>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Value: <strong>${point.prediction.toFixed(2)} ppb</strong></p>
                <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Location: <strong>(${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)})</strong></p>
                <p style="font-size: 11px; color: #999; margin: 0;">Date: ${so2Data.centerPoint.date}</p>
              </div>
            `)
            .addTo(map);
          }
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
            Interactive air quality monitoring in Washington D.C. area
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
          
          <div className="px-3 py-2 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Date Selection</h4>
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          <div className="px-3 py-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Layers</h4>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setShowSO2Layer(!showSO2Layer)}
                className={`px-3 py-2 text-sm font-medium rounded transition-colors relative ${
                  showSO2Layer
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                disabled={so2Loading}
              >
                <span className="flex items-center space-x-2">
                  <span>SO₂ Predictions</span>
                  {so2Loading && (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                  )}
                </span>
                {showSO2Layer && so2Data && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {so2Data.predictions.length}
                  </span>
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>Zoom: {currentZoom}</p>
              <p>Area: {((mapBounds.north - mapBounds.south) * (mapBounds.east - mapBounds.west)).toFixed(4)}°</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

