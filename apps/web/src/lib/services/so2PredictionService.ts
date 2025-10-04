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

  async getPredictions(
    latitude: number,
    longitude: number,
    date: Date = new Date(),
    radiusKm: number = 50,
    numPoints: number = 100
  ): Promise<PredictionResponse> {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(`${this.apiBaseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          date: formattedDate,
          radius_km: radiusKm,
          num_points: numPoints,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch SO2 predictions');
      }

      const data = await response.json();
      
      // For now, return mock data that matches the structure we expect from the API
      // This will be replaced with actual API data when backend is ready
      return this.getMockPredictions(latitude, longitude, formattedDate);
    } catch (error) {
      console.error('Error fetching SO2 predictions:', error);
      // Return mock data in case of error
      return this.getMockPredictions(latitude, longitude, format(date, 'yyyy-MM-dd'));
    }
  }

  private getMockPredictions(
    latitude: number,
    longitude: number,
    date: string
  ): PredictionResponse {
    // Generate circle points with mock predictions
    const predictions: CirclePoint[] = Array.from({ length: 100 }, (_, i) => {
      const angle = (i / 100) * 2 * Math.PI;
      const radiusDeg = 50 / 111.32; // 50km radius
      
      const lat = latitude + radiusDeg * Math.cos(angle);
      const lon = longitude + (radiusDeg * Math.sin(angle)) / Math.cos((latitude * Math.PI) / 180);
      
      // Generate a mock SO2 value that varies with position
      const prediction = Math.abs(20 + 10 * Math.sin(angle) + 5 * Math.cos(2 * angle));

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
