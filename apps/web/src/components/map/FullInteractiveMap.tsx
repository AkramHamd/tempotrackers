// Full Interactive Map Component with Leaflet.js
'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAirQualityData, useAQIColor, useCsvPredictionData } from '../../lib/hooks/useData'
import ControlPanel from '../control/ControlPanel'
import CitySearch from './CitySearch'
import ChatWidget from '../chat/ChatWidget'

// NASA Headquarters coordinates (Washington D.C.)
const NASA_HQ_COORDS = [38.8833, -77.0167] as [number, number]
// Path to prediction CSV file
const PREDICTION_CSV_PATH = '/data/predictions.csv'

export default function FullInteractiveMap() {
  const mapRef = useRef<any>(null)
  const [currentLayer, setCurrentLayer] = useState('satellite')
  const [currentDataLayer, setCurrentDataLayer] = useState('aqi')  // Data layer state
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const { data: airQualityData, loading, error } = useAirQualityData()
  const { 
    data: predictionData, 
    loading: predictionLoading, 
    error: predictionError,
    selectedDate,
    availableDates,
    selectDate
  } = useCsvPredictionData(PREDICTION_CSV_PATH)
  const getAQIColor = useAQIColor()
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showPredictions, setShowPredictions] = useState(true)  // Cambiado a true por defecto
  const [isFirstSearch, setIsFirstSearch] = useState(true)  // Estado para controlar si es la primera búsqueda

  // Método para cambiar la capa de fondo del mapa
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
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          maxZoom: 17
        })
        break
      default:
        newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19
        })
    }

    newLayer.addTo(map)
    setCurrentLayer(layerKey)
  }

  // Initialize map only once when component mounts
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Clean up existing map if any
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
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

        // Create map instance
        const container = document.getElementById('map-container')
        if (!container) {
          console.error('Map container not found')
          return
        }

        const instance = L.map('map-container', {
          zoomControl: false
        }).setView(NASA_HQ_COORDS, 13)

        // Store map instance in ref
        mapRef.current = instance

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
            <p style="font-size: 12px; color: #333; margin: 0;">
              The headquarters of the National Aeronautics and Space Administration, 
              where the TEMPO mission is managed and coordinated.
            </p>
          </div>
        `)

        setIsMapInitialized(true)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    // Initialize map
    initializeMap()

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setIsMapInitialized(false)
      }
    }
  }, [airQualityData, getAQIColor])

  // Handle map resize when control panel opens/closes
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return

    // Force map to recalculate size
    setTimeout(() => {
      mapRef.current.invalidateSize()
    }, 300)
  }, [isControlPanelOpen, isMapInitialized])

  // Función para centrar el mapa en una ubicación buscada
  const handleCitySelect = (coords: { lat: number; lng: number }, locationName: string) => {
    if (!isMapInitialized || !mapRef.current) return;
    
    try {
      // Centrar mapa en la ubicación seleccionada con animación
      mapRef.current.flyTo([coords.lat, coords.lng], 12, {
        animate: true,
        duration: 1.5
      });
      
      console.log(`Mostrando ubicación: ${locationName}`);
    } catch (error) {
      console.error('Error al centrar el mapa:', error);
    }
  };

  // Función para actualizar los marcadores según la capa de datos seleccionada
  const updateDataLayer = async (layerType: string) => {
    if (!isMapInitialized || !mapRef.current) return
    
    const L = (await import('leaflet')).default
    const map = mapRef.current
    
    // Eliminar marcadores existentes de calidad del aire
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && 
        (layer.options.alt === 'air-quality-marker' || 
         layer.options.alt === 'prediction-marker')) {
        map.removeLayer(layer)
      }
    })
    
    // Determine which dataset to display
    const dataToShow = showPredictions && layerType !== 'predictions' 
      ? [] // Don't show regular markers when predictions are active
      : airQualityData || []

    // Show real-time air quality data if not showing predictions or if showing both
    if (dataToShow && dataToShow.length > 0) {
      // Add air quality markers - existing code...
      dataToShow.forEach((data) => {
        // Saltamos NASA HQ ya que tiene su propio marcador
        if (data.id === 'nasa-hq') return
        
        let value, color, label, unit
        
        switch (layerType) {
          case 'pm25':
            value = data.pollutants.pm25
            color = getPollutantColor('pm25', value)
            label = 'PM2.5'
            unit = 'μg/m³'
            break
          case 'pm10':
            value = data.pollutants.pm10
            color = getPollutantColor('pm10', value)
            label = 'PM10'
            unit = 'μg/m³'
            break
          case 'o3':
            value = data.pollutants.o3
            color = getPollutantColor('o3', value)
            label = 'O3'
            unit = 'ppb'
            break
          case 'no2':
            value = data.pollutants.no2
            color = getPollutantColor('no2', value)
            label = 'NO2'
            unit = 'ppb'
            break
          case 'co':
            value = data.pollutants.co
            color = getPollutantColor('co', value)
            label = 'CO'
            unit = 'ppm'
            break
          case 'so2':
            value = data.pollutants.so2
            color = getPollutantColor('so2', value)
            label = 'SO2'
            unit = 'ppb'
            break
          case 'aqi':
          default:
            value = data.aqi
            color = getAQIColor(value)
            label = 'AQI'
            unit = ''
            break
        }
        
        const markerIcon = L.divIcon({
          html: `
            <div style="
              width: 24px; 
              height: 24px; 
              background: ${color}; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 8px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${Math.round(value)}</div>
          `,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const marker = L.marker([data.latitude, data.longitude], { 
          icon: markerIcon,
          alt: 'air-quality-marker'
        }).addTo(map)
        
        marker.bindPopup(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">Air Quality Station</h3>
            <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">${label}: <strong>${value}${unit}</strong></p>
            <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Source: <strong>${data.source}</strong></p>
            <p style="font-size: 11px; color: #999; margin: 0;">Updated: ${data.timestamp.toLocaleTimeString()}</p>
          </div>
        `)
      })
    }
    
    // Show prediction data
    if ((showPredictions && layerType === 'predictions') || 
        (showPredictions && layerType !== 'predictions')) {
      
      if (predictionData && predictionData.length > 0) {
        // Add prediction markers
        predictionData.forEach((data) => {
          let value, color, label, unit
          
          // Determine what to display based on layer type
          switch (layerType === 'predictions' ? 'aqi' : layerType) {
            case 'pm25':
              value = data.pollutants.pm25
              color = getPollutantColor('pm25', value)
              label = 'PM2.5'
              unit = 'μg/m³'
              break
            case 'pm10':
              value = data.pollutants.pm10
              color = getPollutantColor('pm10', value)
              label = 'PM10'
              unit = 'μg/m³'
              break
            case 'o3':
              value = data.pollutants.o3
              color = getPollutantColor('o3', value)
              label = 'O3'
              unit = 'ppb'
              break
            case 'no2':
              value = data.pollutants.no2
              color = getPollutantColor('no2', value)
              label = 'NO2'
              unit = 'ppb'
              break
            case 'co':
              value = data.pollutants.co
              color = getPollutantColor('co', value)
              label = 'CO'
              unit = 'ppm'
              break
            case 'so2':
              value = data.pollutants.so2
              color = getPollutantColor('so2', value)
              label = 'SO2'
              unit = 'ppb'
              break
            case 'aqi':
            default:
              value = data.aqi
              color = getAQIColor(value)
              label = 'AQI'
              unit = ''
              break
          }
          
          // Create a distinct marker for predictions with star-like shape
          const markerIcon = L.divIcon({
            html: `
              <div style="
                width: 24px; 
                height: 24px; 
                background: ${color}; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-weight: bold; 
                font-size: 8px;
                border: 2px dashed white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${Math.round(value)}</div>
            `,
            className: 'custom-div-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })

          const marker = L.marker([data.latitude, data.longitude], { 
            icon: markerIcon,
            alt: 'prediction-marker'
          }).addTo(map)
          
          marker.bindPopup(`
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0;">Predicted Air Quality</h3>
              <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">${label}: <strong>${value}${unit}</strong></p>
              <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Quality: <strong>${data.quality}</strong></p>
              <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">Date: <strong>${new Date(data.timestamp).toLocaleDateString()}</strong></p>
              <p style="font-size: 11px; color: #999; margin: 0;">Time: ${new Date(data.timestamp).toLocaleTimeString()}</p>
            </div>
          `)
        })
      }
    }
    
    // Actualizar el estado de la capa de datos actual
    setCurrentDataLayer(layerType)
  }

  // Función para obtener color según el tipo de contaminante y su valor
  const getPollutantColor = (pollutantType: string, value: number): string => {
    // Rangos y colores basados en estándares EPA
    const ranges = {
      pm25: [
        { max: 12, color: '#00e400' }, // Bueno
        { max: 35.4, color: '#ffff00' }, // Moderado
        { max: 55.4, color: '#ff7e00' }, // Poco saludable para grupos sensibles
        { max: 150.4, color: '#ff0000' }, // Poco saludable
        { max: 250.4, color: '#8f3f97' }, // Muy poco saludable
        { max: 10000, color: '#7e0023' } // Peligroso
      ],
      pm10: [
        { max: 54, color: '#00e400' },
        { max: 154, color: '#ffff00' },
        { max: 254, color: '#ff7e00' },
        { max: 354, color: '#ff0000' },
        { max: 424, color: '#8f3f97' },
        { max: 10000, color: '#7e0023' }
      ],
      o3: [
        { max: 54, color: '#00e400' },
        { max: 70, color: '#ffff00' },
        { max: 85, color: '#ff7e00' },
        { max: 105, color: '#ff0000' },
        { max: 200, color: '#8f3f97' },
        { max: 10000, color: '#7e0023' }
      ],
      no2: [
        { max: 53, color: '#00e400' },
        { max: 100, color: '#ffff00' },
        { max: 360, color: '#ff7e00' },
        { max: 649, color: '#ff0000' },
        { max: 1249, color: '#8f3f97' },
        { max: 10000, color: '#7e0023' }
      ],
      co: [
        { max: 4.4, color: '#00e400' },
        { max: 9.4, color: '#ffff00' },
        { max: 12.4, color: '#ff7e00' },
        { max: 15.4, color: '#ff0000' },
        { max: 30.4, color: '#8f3f97' },
        { max: 1000, color: '#7e0023' }
      ],
      so2: [
        { max: 35, color: '#00e400' },
        { max: 75, color: '#ffff00' },
        { max: 185, color: '#ff7e00' },
        { max: 304, color: '#ff0000' },
        { max: 604, color: '#8f3f97' },
        { max: 10000, color: '#7e0023' }
      ]
    }
    
    const rangeList = ranges[pollutantType as keyof typeof ranges] || ranges.pm25
    
    for (const range of rangeList) {
      if (value <= range.max) {
        return range.color
      }
    }
    
    return '#7e0023' // Color por defecto para valores extremadamente altos
  }

  // Efecto para actualizar marcadores cuando cambian los datos
  useEffect(() => {
    if (isMapInitialized && mapRef.current && 
        ((airQualityData && airQualityData.length > 0) || 
         (predictionData && predictionData.length > 0))) {
      updateDataLayer(currentDataLayer)
    }
  }, [airQualityData, predictionData, isMapInitialized, showPredictions, selectedDate])

  // Efecto para actualizar las predicciones cuando estén disponibles por primera vez
  useEffect(() => {
    if (isMapInitialized && predictionData && predictionData.length > 0 && showPredictions) {
      // Actualizar a capa de predicciones cuando los datos estén disponibles
      updateDataLayer('predictions')
    }
  }, [isMapInitialized, predictionData, showPredictions])

  if (loading && !predictionData.length) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TempoTrackers Map...</p>
          {loading && <p className="text-sm text-gray-500 mt-2">Fetching air quality data...</p>}
          {predictionLoading && <p className="text-sm text-gray-500 mt-2">Loading prediction data...</p>}
        </div>
      </div>
    )
  }

  if (error && predictionError && !airQualityData.length && !predictionData.length) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Map</h2>
          <p className="text-gray-600 mb-4">{error || predictionError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full">
      {/* Control Panel */}
      <ControlPanel 
        isOpen={isControlPanelOpen} 
        onToggle={() => setIsControlPanelOpen(!isControlPanelOpen)} 
      />
      
      {/* Leaflet Map Container */}
      <div 
        id="map-container" 
        className="h-full w-full"
      ></div>

      {/* City Search Component */}
      <CitySearch 
        onSearch={handleCitySelect} 
        availableDates={availableDates}
        selectedDate={selectedDate}
        onDateChange={selectDate}
        isFirstSearch={isFirstSearch}
        onSearchExecuted={() => {
          setIsFirstSearch(false);
          setShowPredictions(true);
          updateDataLayer('predictions');
        }}
      />

      {/* Navigation Header */}
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

      {/* Date selector for predictions */}
      {showPredictions && availableDates.length > 0 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Prediction Date:</label>
            <select 
              value={selectedDate} 
              onChange={(e) => selectDate(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded px-2 py-1"
            >
              {availableDates.map((date) => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Data Layer Controls */}
      <div className="absolute bottom-32 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <div className="mb-2 px-2 text-xs font-medium text-gray-600">Data Layers</div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => updateDataLayer('aqi')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentDataLayer === 'aqi'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Air Quality
          </button>
          <button
            onClick={() => updateDataLayer('pm25')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentDataLayer === 'pm25'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            PM2.5
          </button>
          <button
            onClick={() => updateDataLayer('pm10')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentDataLayer === 'pm10'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            PM10
          </button>
          <button
            onClick={() => updateDataLayer('o3')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentDataLayer === 'o3'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ozone
          </button>
          <button
            onClick={() => updateDataLayer('no2')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentDataLayer === 'no2'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            NO₂
          </button>
          <button
            onClick={() => updateDataLayer('co')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentDataLayer === 'co'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            CO
          </button>
          <button
            onClick={() => updateDataLayer('so2')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              currentDataLayer === 'so2'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            SO₂
          </button>
          <button
            onClick={() => {
              setShowPredictions(!showPredictions);
              if (!showPredictions) updateDataLayer('predictions');
              else updateDataLayer('aqi');
            }}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              showPredictions
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {showPredictions ? 'Hide Predictions' : 'Show Predictions'}
          </button>
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

      {/* Chat Button */}
      <div className="absolute top-36 right-4 z-[1000]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center w-10 h-10"
          title="Abrir chat de asistencia"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Legend for current data layer */}
      {!isControlPanelOpen && (
        <div className="absolute bottom-16 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs transition-all duration-300">
          <div className="text-xs font-medium text-gray-700 mb-2">
            {currentDataLayer === 'aqi' ? 'Air Quality Index Legend' : 
            currentDataLayer === 'pm25' ? 'PM2.5 Legend (μg/m³)' :
            currentDataLayer === 'pm10' ? 'PM10 Legend (μg/m³)' :
            currentDataLayer === 'o3' ? 'Ozone Legend (ppb)' :
            currentDataLayer === 'no2' ? 'NO₂ Legend (ppb)' :
            currentDataLayer === 'co' ? 'CO Legend (ppm)' :
            currentDataLayer === 'so2' ? 'SO₂ Legend (ppb)' : 'Legend'}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#00e400]"></div>
              <span className="text-gray-600">Good</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ffff00]"></div>
              <span className="text-gray-600">Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff7e00]"></div>
              <span className="text-gray-600">Unhealthy for Sensitive Groups</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff0000]"></div>
              <span className="text-gray-600">Unhealthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#8f3f97]"></div>
              <span className="text-gray-600">Very Unhealthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#7e0023]"></div>
              <span className="text-gray-600">Hazardous</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {isChatOpen && (
        <div className="fixed top-0 right-0 bottom-0 z-[2000] max-w-md w-full">
          <ChatWidget 
            isOpen={true} 
            onToggle={() => setIsChatOpen(false)} 
            showFloatingButton={false} 
            currentAQI={airQualityData?.length 
              ? Math.round(airQualityData.reduce((sum, data) => sum + data.aqi, 0) / airQualityData.length)
              : 0}
            airQualityData={airQualityData?.map(data => ({
              aqi: data.aqi,
              location: `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`,
              timestamp: data.timestamp,
              pollutants: {
                pm25: data.pollutants.pm25,
                pm10: data.pollutants.pm10,
                o3: data.pollutants.o3,
                no2: data.pollutants.no2
              }
            }))}
          />
        </div>
      )}

      {/* Prediction data loading indicator */}
      {predictionLoading && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 rounded-lg p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-xs text-gray-600">Loading predictions...</span>
          </div>
        </div>
      )}
      
      {/* Prediction data error indicator */}
      {predictionError && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-red-50 border border-red-200 rounded-lg p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 text-sm">⚠️</span>
            <span className="text-xs text-red-600">Error loading predictions: {predictionError}</span>
          </div>
        </div>
      )}
    </div>
  )
}

