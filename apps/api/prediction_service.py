import joblib
import numpy as np
import pandas as pd
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Path to models directory (local to this package to ensure inclusion in serverless bundles)
MODELS_DIR = Path(__file__).parent / "models"

# Available pollutant models
POLLUTANT_MODELS = {
    "co": "CO_model.pkl",
    "no2": "NO2_model.pkl",
    "o3": "O3_model.pkl",
    "pm10": "PM10_model.pkl",
    "pm25": "PM25_model.pkl",
    "so2": "SO2_model.pkl"
}

class PredictionService:
    def __init__(self):
        self.models = {}
        self.load_models()
        
    def load_models(self) -> None:
        """Load all available pollutant models"""
        print(f"Loading models from {MODELS_DIR}")
        for pollutant, model_file in POLLUTANT_MODELS.items():
            model_path = MODELS_DIR / model_file
            if model_path.exists():
                try:
                    self.models[pollutant] = joblib.load(model_path)
                    print(f"Loaded model: {pollutant}")
                except Exception as e:
                    print(f"Error loading {pollutant} model: {e}")
            else:
                print(f"Model not found: {model_path}")
                
        print(f"Loaded {len(self.models)} models from {MODELS_DIR}")
    
    def predict_pollutants(self, features: pd.DataFrame) -> Dict[str, float]:
        """
        Predict air quality for each pollutant
        
        Args:
            features: DataFrame with features (lat, lon, temperature, humidity, etc.)
            
        Returns:
            Dict with pollutant predictions
        """
        results = {}
        
        for pollutant, model in self.models.items():
            try:
                prediction = model.predict(features)[0]
                # Ensure non-negative values
                results[pollutant] = max(0, float(prediction))
            except Exception as e:
                print(f"Error predicting {pollutant}: {e}")
                results[pollutant] = 0.0
                
        return results

    def calculate_aqi(self, pollutants: Dict[str, float]) -> Tuple[int, str]:
        """
        Calculate AQI from pollutant concentrations
        
        Args:
            pollutants: Dict with pollutant concentrations
            
        Returns:
            Tuple of (AQI value, AQI category)
        """
        # AQI breakpoints for different pollutants
        # These are simplified - a real implementation would have complete breakpoints
        aqi_values = []
        
        # PM2.5 (μg/m³)
        if "pm25" in pollutants:
            pm25 = pollutants["pm25"]
            if pm25 <= 12:
                aqi = linear_scale(pm25, 0, 12, 0, 50)
            elif pm25 <= 35.4:
                aqi = linear_scale(pm25, 12.1, 35.4, 51, 100)
            elif pm25 <= 55.4:
                aqi = linear_scale(pm25, 35.5, 55.4, 101, 150)
            elif pm25 <= 150.4:
                aqi = linear_scale(pm25, 55.5, 150.4, 151, 200)
            elif pm25 <= 250.4:
                aqi = linear_scale(pm25, 150.5, 250.4, 201, 300)
            else:
                aqi = linear_scale(pm25, 250.5, 500, 301, 500)
            aqi_values.append(aqi)
            
        # PM10 (μg/m³)
        if "pm10" in pollutants:
            pm10 = pollutants["pm10"]
            if pm10 <= 54:
                aqi = linear_scale(pm10, 0, 54, 0, 50)
            elif pm10 <= 154:
                aqi = linear_scale(pm10, 55, 154, 51, 100)
            elif pm10 <= 254:
                aqi = linear_scale(pm10, 155, 254, 101, 150)
            elif pm10 <= 354:
                aqi = linear_scale(pm10, 255, 354, 151, 200)
            elif pm10 <= 424:
                aqi = linear_scale(pm10, 355, 424, 201, 300)
            else:
                aqi = linear_scale(pm10, 425, 604, 301, 500)
            aqi_values.append(aqi)
            
        # O3 (ppb)
        if "o3" in pollutants:
            o3 = pollutants["o3"]
            if o3 <= 54:
                aqi = linear_scale(o3, 0, 54, 0, 50)
            elif o3 <= 70:
                aqi = linear_scale(o3, 55, 70, 51, 100)
            elif o3 <= 85:
                aqi = linear_scale(o3, 71, 85, 101, 150)
            elif o3 <= 105:
                aqi = linear_scale(o3, 86, 105, 151, 200)
            elif o3 <= 200:
                aqi = linear_scale(o3, 106, 200, 201, 300)
            else:
                aqi = 301  # Hazardous
            aqi_values.append(aqi)
            
        # CO (ppm)
        if "co" in pollutants:
            co = pollutants["co"]
            if co <= 4.4:
                aqi = linear_scale(co, 0, 4.4, 0, 50)
            elif co <= 9.4:
                aqi = linear_scale(co, 4.5, 9.4, 51, 100)
            elif co <= 12.4:
                aqi = linear_scale(co, 9.5, 12.4, 101, 150)
            elif co <= 15.4:
                aqi = linear_scale(co, 12.5, 15.4, 151, 200)
            elif co <= 30.4:
                aqi = linear_scale(co, 15.5, 30.4, 201, 300)
            else:
                aqi = linear_scale(co, 30.5, 50.4, 301, 500)
            aqi_values.append(aqi)
            
        # NO2 (ppb)
        if "no2" in pollutants:
            no2 = pollutants["no2"]
            if no2 <= 53:
                aqi = linear_scale(no2, 0, 53, 0, 50)
            elif no2 <= 100:
                aqi = linear_scale(no2, 54, 100, 51, 100)
            elif no2 <= 360:
                aqi = linear_scale(no2, 101, 360, 101, 150)
            elif no2 <= 649:
                aqi = linear_scale(no2, 361, 649, 151, 200)
            elif no2 <= 1249:
                aqi = linear_scale(no2, 650, 1249, 201, 300)
            else:
                aqi = linear_scale(no2, 1250, 2049, 301, 500)
            aqi_values.append(aqi)
            
        # SO2 (ppb)
        if "so2" in pollutants:
            so2 = pollutants["so2"]
            if so2 <= 35:
                aqi = linear_scale(so2, 0, 35, 0, 50)
            elif so2 <= 75:
                aqi = linear_scale(so2, 36, 75, 51, 100)
            elif so2 <= 185:
                aqi = linear_scale(so2, 76, 185, 101, 150)
            elif so2 <= 304:
                aqi = linear_scale(so2, 186, 304, 151, 200)
            elif so2 <= 604:
                aqi = linear_scale(so2, 305, 604, 201, 300)
            else:
                aqi = linear_scale(so2, 605, 1004, 301, 500)
            aqi_values.append(aqi)
            
        # Take highest AQI value among pollutants
        aqi_value = int(max(aqi_values)) if aqi_values else 0
        
        # Determine AQI category
        if aqi_value <= 50:
            category = "Good"
        elif aqi_value <= 100:
            category = "Moderate"
        elif aqi_value <= 150:
            category = "Unhealthy for Sensitive Groups"
        elif aqi_value <= 200:
            category = "Unhealthy"
        elif aqi_value <= 300:
            category = "Very Unhealthy"
        else:
            category = "Hazardous"
            
        return aqi_value, category
        
    def generate_heatmap_data(self, center_lat: float, center_lon: float, 
                            radius_km: float = 2, points: int = 100) -> List[Dict]:
        """
        Generate a grid of predictions around a central point for heatmap visualization
        
        Args:
            center_lat: Center latitude
            center_lon: Center longitude
            radius_km: Radius in kilometers
            points: Number of points in grid
            
        Returns:
            List of dictionaries with lat, lon, and pollutant values
        """
        # Generate grid points around center
        lats = np.linspace(center_lat - (radius_km/111), center_lat + (radius_km/111), points)
        lons = np.linspace(center_lon - (radius_km/(111*np.cos(np.radians(center_lat)))), 
                           center_lon + (radius_km/(111*np.cos(np.radians(center_lat)))), points)
        
        # Create mesh grid
        lat_grid, lon_grid = np.meshgrid(lats, lons)
        
        # Generate mock meteorological data (in a real app, you'd use actual data)
        temperatures = np.random.uniform(15, 25, (points, points))
        humidity = np.random.uniform(40, 60, (points, points))
        wind_speed = np.random.uniform(2, 10, (points, points))
        pressure = np.random.uniform(1010, 1020, (points, points))
        
        results = []
        
        # Process grid points
        for i in range(points):
            for j in range(points):
                features = pd.DataFrame({
                    'lat': [lat_grid[i, j]],
                    'lon': [lon_grid[i, j]],
                    'temperature': [temperatures[i, j]],
                    'humidity': [humidity[i, j]],
                    'wind_speed': [wind_speed[i, j]],
                    'pressure': [pressure[i, j]]
                })
                
                pollutants = self.predict_pollutants(features)
                aqi, quality = self.calculate_aqi(pollutants)
                
                results.append({
                    'latitude': float(lat_grid[i, j]),
                    'longitude': float(lon_grid[i, j]),
                    'pollutants': pollutants,
                    'aqi': aqi,
                    'quality': quality
                })
                
        return results

def linear_scale(value: float, from_min: float, from_max: float, to_min: float, to_max: float) -> float:
    """
    Linear interpolation function
    
    Args:
        value: Value to scale
        from_min: Input minimum
        from_max: Input maximum
        to_min: Output minimum
        to_max: Output maximum
        
    Returns:
        Scaled value
    """
    return ((value - from_min) / (from_max - from_min)) * (to_max - to_min) + to_min

# Initialize the prediction service
prediction_service = PredictionService()