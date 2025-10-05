// React hooks for data access in TempoTrackers components

import { useState, useEffect, useCallback } from 'react'
import { dataService, AirQualityData, WeatherData, PredictionData } from '../services/dataService'
import { csvDataService, PredictionCSVData } from '../services/csvDataService'

// Hook for current air quality data
export function useAirQualityData() {
  const [data, setData] = useState<AirQualityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const airQualityData = await dataService.getCurrentAirQuality()
      setData(airQualityData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch air quality data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    
    // Set up auto-refresh
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for weather data
export function useWeatherData() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const weatherData = await dataService.getCurrentWeather()
      setData(weatherData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    
    // Set up auto-refresh
    const interval = setInterval(fetchData, 300000) // Refresh every 5 minutes
    
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for prediction data
export function usePredictions(hoursAhead: number = 24) {
  const [data, setData] = useState<PredictionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const predictionData = await dataService.getPredictions(hoursAhead)
      setData(predictionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prediction data')
    } finally {
      setLoading(false)
    }
  }, [hoursAhead])

  useEffect(() => {
    fetchData()
    
    // Set up auto-refresh
    const interval = setInterval(fetchData, 300000) // Refresh every 5 minutes
    
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// NEW HOOK: API-based prediction data for heatmap
export function useApiPredictionData(centerLat: number, centerLon: number, radius: number = 2, points: number = 50) {
  const [data, setData] = useState<AirQualityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [availableDates, setAvailableDates] = useState<string[]>([
    new Date().toISOString().split('T')[0], // Today
    new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] // Day after tomorrow
  ])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call the API endpoint to get heatmap data
      const response = await fetch('/api/heatmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          center_lat: centerLat,
          center_lon: centerLon,
          radius_km: radius,
          points: points
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Set the prediction data
      setData(responseData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API prediction data')
      // Fallback to mock data if API call fails
      const mockData = await dataService.getPredictions(24);
      
      // Helper functions to replace private methods in dataService
      const getQualityLevel = (aqi: number): AirQualityData['quality'] => {
        if (aqi <= 50) return 'Good'
        if (aqi <= 100) return 'Moderate'
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
        if (aqi <= 200) return 'Unhealthy'
        if (aqi <= 300) return 'Very Unhealthy'
        return 'Hazardous'
      };
      
      const generatePollutants = (aqi: number) => {
        return {
          pm25: aqi * 0.3,
          pm10: aqi * 0.5,
          o3: aqi * 0.2,
          no2: aqi * 0.15,
          co: aqi * 0.1,
          so2: aqi * 0.25
        }
      };
      
      // Convert PredictionData to AirQualityData format
      const airQualityData: AirQualityData[] = mockData.map((pred, index) => ({
        id: `pred-${index}`,
        latitude: centerLat + (Math.random() - 0.5) * 0.05,
        longitude: centerLon + (Math.random() - 0.5) * 0.05,
        timestamp: pred.timestamp,
        aqi: pred.predictedAQI,
        quality: getQualityLevel(pred.predictedAQI),
        pollutants: generatePollutants(pred.predictedAQI),
        source: 'Prediction',
        confidence: pred.confidence
      }));
      
      setData(airQualityData);
    } finally {
      setLoading(false)
    }
  }, [centerLat, centerLon, radius, points])

  // Change selected date
  const selectDate = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    selectedDate,
    availableDates,
    selectDate
  }
}

// Hook for CSV prediction data
export function useCsvPredictionData(csvFilePath: string = '/data/predictions.csv') {
  const [data, setData] = useState<AirQualityData[]>([])
  const [originalData, setOriginalData] = useState<PredictionCSVData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableDates, setAvailableDates] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load CSV data
      const success = await csvDataService.loadCSVData(csvFilePath)
      
      if (!success) {
        throw new Error('Failed to load CSV prediction data')
      }
      
      // Get all prediction data
      const allPredictions = csvDataService.getAllPredictions()
      setOriginalData(allPredictions)
      
      // Extract unique dates - using Array.from() instead of spread operator
      const uniqueDates = new Set(allPredictions.map(item => item.date))
      const dates = Array.from(uniqueDates).sort()
      setAvailableDates(dates)
      
      // Set initial selected date if available
      if (dates.length > 0 && !selectedDate) {
        setSelectedDate(dates[0])
      }
      
      // Filter by selected date or use all data
      const filteredData = selectedDate 
        ? csvDataService.getPredictionsByDate(selectedDate)
        : allPredictions
        
      // Convert to AirQualityData format
      const airQualityData = csvDataService.convertToAirQualityData(filteredData)
      setData(airQualityData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSV prediction data')
    } finally {
      setLoading(false)
    }
  }, [csvFilePath, selectedDate])

  // Change selected date
  const selectDate = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    selectedDate,
    availableDates,
    selectDate,
    originalData
  }
}

// Utility hook for AQI color
export function useAQIColor() {
  return useCallback((aqi: number) => {
    return dataService.getAQIColor(aqi)
  }, [])
}