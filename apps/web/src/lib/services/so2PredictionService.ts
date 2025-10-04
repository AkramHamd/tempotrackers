import { CirclePoint, PredictionResponse, ViewBounds } from '../types/so2';

interface PredictionParams {
  latitude: number;
  longitude: number;
  date: string;
  zoomLevel: number;
  bounds: ViewBounds;
}

export class SO2PredictionService {
  private static instance: SO2PredictionService;
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  private constructor() {}

  static getInstance(): SO2PredictionService {
    if (!SO2PredictionService.instance) {
      SO2PredictionService.instance = new SO2PredictionService();
    }
    return SO2PredictionService.instance;
  }

  async getPredictions({
    latitude,
    longitude,
    date,
    zoomLevel,
    bounds
  }: PredictionParams): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          date,
          zoom_level: zoomLevel,
          bounds
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data as PredictionResponse;
    } catch (error) {
      console.error('Error fetching SO2 predictions:', error);
      throw error;
    }
  }

  getColorForValue(value: number): string {
    // Color scale from green to red based on SO2 value
    if (value <= 10) return '#00ff00';
    if (value <= 15) return '#ffff00';
    if (value <= 20) return '#ffa500';
    if (value <= 25) return '#ff4500';
    return '#ff0000';
  }
}