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
  averagePrediction: number;
}

export interface ViewBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
