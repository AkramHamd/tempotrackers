// React hooks for data access in TempoTrackers components

import { useState, useEffect, useCallback } from 'react'
import { dataService, AirQualityData, WeatherData, PredictionData } from '../services/dataService'

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

// Utility hook for AQI color
export function useAQIColor() {
  return useCallback((aqi: number) => {
    return dataService.getAQIColor(aqi)
  }, [])
}