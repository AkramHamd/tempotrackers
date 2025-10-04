import { useState, useEffect } from 'react';
import { SO2PredictionService } from '../services/so2PredictionService';
import { ViewBounds, PredictionResponse } from '../types/so2';

interface UseSO2PredictionsParams {
  latitude: number;
  longitude: number;
  zoomLevel: number;
  bounds: ViewBounds;
  selectedDate?: Date;
}

export function useSO2Predictions({
  latitude,
  longitude,
  zoomLevel,
  bounds,
  selectedDate = new Date()
}: UseSO2PredictionsParams) {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const service = SO2PredictionService.getInstance();
        const predictions = await service.getPredictions({
          latitude,
          longitude,
          date: selectedDate.toISOString().split('T')[0],
          zoomLevel,
          bounds
        });
        setData(predictions);
      } catch (err) {
        console.error('Error fetching SO2 predictions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch SO2 predictions');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [latitude, longitude, zoomLevel, bounds, selectedDate]);

  const getSO2Color = (value: number) => {
    const service = SO2PredictionService.getInstance();
    return service.getColorForValue(value);
  };

  return { data, loading, error, getSO2Color };
}