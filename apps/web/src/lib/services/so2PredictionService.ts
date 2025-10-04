// SO2 Prediction Service with dynamic circle generation

interface CirclePoint {
  latitude: number;
  longitude: number;
  prediction: number;
}

interface PredictionResponse {
  centerPoint: {
    latitude: number;
    longitude: number;
    date: string;
  };
  predictions: CirclePoint[];
  averagePrediction: number;
}

interface ViewBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface PredictionParams {
  latitude: number;
  longitude: number;
  date: string;
  zoomLevel: number;
  bounds: ViewBounds;
}

const ZOOM_THRESHOLDS = {
  CITY: 10,
  DISTRICT: 13,
  NEIGHBORHOOD: 15
};

const CIRCLE_COUNTS = {
  CITY: 1,
  DISTRICT: 9,
  NEIGHBORHOOD: 25
};

export class SO2PredictionService {
  private static instance: SO2PredictionService;

  private constructor() {}

  static getInstance(): SO2PredictionService {
    if (!SO2PredictionService.instance) {
      SO2PredictionService.instance = new SO2PredictionService();
    }
    return SO2PredictionService.instance;
  }

  getPredictions({
    latitude,
    longitude,
    date,
    zoomLevel,
    bounds
  }: PredictionParams): PredictionResponse {
    // Calculate area size in km²
    const areaWidth = this.calculateDistance(bounds.north, bounds.west, bounds.north, bounds.east);
    const areaHeight = this.calculateDistance(bounds.north, bounds.west, bounds.south, bounds.west);
    const areaSize = areaWidth * areaHeight;

    // Determine circle count based on zoom level
    let circleCount: number;
    if (zoomLevel < ZOOM_THRESHOLDS.CITY) {
      circleCount = CIRCLE_COUNTS.CITY;
    } else if (zoomLevel < ZOOM_THRESHOLDS.DISTRICT) {
      circleCount = CIRCLE_COUNTS.DISTRICT;
    } else {
      circleCount = CIRCLE_COUNTS.NEIGHBORHOOD;
    }

    // Generate grid points
    const predictions: CirclePoint[] = this.generateGridPoints(bounds, circleCount);

    // Calculate predictions for each point
    predictions.forEach(point => {
      point.prediction = this.calculatePrediction(point, date, areaSize);
    });

    // Calculate average prediction
    const averagePrediction = predictions.reduce((sum, p) => sum + p.prediction, 0) / predictions.length;

    return {
      centerPoint: {
        latitude,
        longitude,
        date
      },
      predictions,
      averagePrediction
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private generateGridPoints(bounds: ViewBounds, count: number): CirclePoint[] {
    const points: CirclePoint[] = [];
    const rows = Math.floor(Math.sqrt(count));
    const cols = Math.ceil(count / rows);

    const latStep = (bounds.north - bounds.south) / rows;
    const lonStep = (bounds.east - bounds.west) / cols;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (points.length < count) {
          points.push({
            latitude: bounds.south + (i + 0.5) * latStep,
            longitude: bounds.west + (j + 0.5) * lonStep,
            prediction: 0 // Will be calculated later
          });
        }
      }
    }

    return points;
  }

  private calculatePrediction(point: CirclePoint, date: string, areaSize: number): number {
    // Mock prediction calculation based on location and date
    // In a real implementation, this would use the ML model
    const baseValue = 15; // Base SO2 value
    const dateEffect = new Date(date).getDay() / 7 * 5; // Day of week effect
    const areaEffect = Math.log(areaSize) * 2; // Area size effect
    const randomVariation = Math.random() * 5; // Random variation

    return Math.max(5, Math.min(30, baseValue + dateEffect + areaEffect + randomVariation));
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