// React hook for prediction data
import { useState, useEffect } from 'react'
import { predictionService, PredictionPoint } from '../services/predictionService'

// Re-export PredictionPoint for use in other files
export { PredictionPoint }

// Hook para obtener predicciones cercanas a una ubicación
export function usePredictionData(lat?: number, lng?: number, radius: number = 10) {
  const [predictionData, setPredictionData] = useState<PredictionPoint[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Solo cargar datos si tenemos coordenadas
    if (lat !== undefined && lng !== undefined) {
      loadPredictionData(lat, lng, radius)
    }
  }, [lat, lng, radius])

  // Cargar datos de predicción para la ubicación dada
  const loadPredictionData = async (latitude: number, longitude: number, searchRadius: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const predictions = await predictionService.getNearestPredictions(latitude, longitude, searchRadius)
      setPredictionData(predictions)
    } catch (err) {
      console.error('Error loading prediction data:', err)
      setError('Failed to load prediction data')
    } finally {
      setLoading(false)
    }
  }

  // Obtener todas las predicciones (sin filtrar por ubicación)
  const getAllPredictions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await predictionService.loadPredictionData() // Asegurar que los datos estén cargados
      const predictions = predictionService.getAllPredictions()
      setPredictionData(predictions)
      
      return predictions
    } catch (err) {
      console.error('Error loading all prediction data:', err)
      setError('Failed to load prediction data')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Obtener predicciones por tipo de contaminante
  const getPredictionsByType = (type: string) => {
    return predictionService.getPredictionsByType(type)
  }

  return { 
    data: predictionData, 
    loading, 
    error, 
    loadPredictionData, 
    getAllPredictions,
    getPredictionsByType
  }
}