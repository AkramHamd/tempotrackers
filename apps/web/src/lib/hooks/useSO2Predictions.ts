import { useState, useEffect, useCallback } from 'react';
import { so2PredictionService, type PredictionResponse } from '../services/so2PredictionService';

interface UseSO2PredictionsProps {
  latitude: number;
  longitude: number;
  date?: Date;
  radiusKm?: number;
  numPoints?: number;
  refreshInterval?: number;
}

export function useSO2Predictions({
  latitude,
  longitude,
  date = new Date(),
  radiusKm = 50,
  numPoints = 100,
  refreshInterval = 300000 // 5 minutes default
}: UseSO2PredictionsProps) {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const predictions = await so2PredictionService.getPredictions(
        latitude,
        longitude,
        date,
        radiusKm,
        numPoints
      );
      setData(predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SO2 predictions');
      console.error('Error fetching SO2 predictions:', err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, date, radiusKm, numPoints]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const getSO2Color = useCallback((value: number) => {
    return so2PredictionService.getSO2Color(value);
  }, []);

  const getSO2Quality = useCallback((value: number) => {
    return so2PredictionService.getSO2Quality(value);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    getSO2Color,
    getSO2Quality
  };
}
