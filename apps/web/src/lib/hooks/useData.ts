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
      
      // Extract unique dates
      const dates = [...new Set(allPredictions.map(item => item.date))].sort()
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