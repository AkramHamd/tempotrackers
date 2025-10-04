import { format } from 'date-fns';

export interface SO2Prediction {
  latitude: number;
  longitude: number;
  value: number;
  date: string;
}

export interface CirclePoint {
  latitude: number;
  longitude: number;
  prediction: number;
}

export interface PredictionResponse {
  centerPoint: {
    latitude: number;
    longitude: number;
    date: string;
  };
  predictions: CirclePoint[];
  averageSO2: number;
  maxSO2: number;
  minSO2: number;
}

class SO2PredictionService {
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Cache predictions to avoid unnecessary recalculations
  private predictionCache: { [key: string]: PredictionResponse } = {};

  async getPredictions(
    latitude: number,
    longitude: number,
    date: Date = new Date(),
    radiusKm: number = 50,
    numPoints: number = 100
  ): Promise<PredictionResponse> {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const cacheKey = `${latitude},${longitude},${formattedDate}`;
      
      // Return cached data if available
      if (this.predictionCache[cacheKey]) {
        return this.predictionCache[cacheKey];
      }
      
      // Generate new predictions
      const predictions = this.getMockPredictions(latitude, longitude, formattedDate);
      
      // Cache the predictions
      this.predictionCache[cacheKey] = predictions;
      
      // Simulate network delay only for first load
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(predictions);
        }, 1000);
      });
    } catch (error) {
      console.error('Error fetching SO2 predictions:', error);
      throw error;
    }
  }

  private getMockPredictions(
    latitude: number,
    longitude: number,
    date: string
  ): PredictionResponse {
    // Generate fewer points in a smaller radius for better performance
    const predictions: CirclePoint[] = Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * 2 * Math.PI;
      const radiusDeg = 5 / 111.32; // 5km radius for focused view
      
      const lat = latitude + radiusDeg * Math.cos(angle);
      const lon = longitude + (radiusDeg * Math.sin(angle)) / Math.cos((latitude * Math.PI) / 180);
      
      // Generate a more realistic SO2 value pattern
      const distanceFromCenter = Math.sqrt(Math.pow(lat - latitude, 2) + Math.pow(lon - longitude, 2));
      const prediction = Math.max(5, 30 * (1 - distanceFromCenter / radiusDeg) + Math.random() * 5);

      return {
        latitude: lat,
        longitude: lon,
        prediction
      };
    });

    const so2Values = predictions.map(p => p.prediction);
    const averageSO2 = so2Values.reduce((a, b) => a + b, 0) / so2Values.length;
    const maxSO2 = Math.max(...so2Values);
    const minSO2 = Math.min(...so2Values);

    return {
      centerPoint: {
        latitude,
        longitude,
        date
      },
      predictions,
      averageSO2,
      maxSO2,
      minSO2
    };
  }

  getSO2Color(value: number): string {
    // Color scale for SO2 concentrations (ppb)
    if (value <= 10) return '#00e400'; // Good
    if (value <= 20) return '#ffff00'; // Moderate
    if (value <= 30) return '#ff7e00'; // Unhealthy for Sensitive Groups
    if (value <= 40) return '#ff0000'; // Unhealthy
    if (value <= 50) return '#8f3f97'; // Very Unhealthy
    return '#7e0023'; // Hazardous
  }

  getSO2Quality(value: number): string {
    if (value <= 10) return 'Good';
    if (value <= 20) return 'Moderate';
    if (value <= 30) return 'Unhealthy for Sensitive Groups';
    if (value <= 40) return 'Unhealthy';
    if (value <= 50) return 'Very Unhealthy';
    return 'Hazardous';
  }
}

export const so2PredictionService = new SO2PredictionService();
