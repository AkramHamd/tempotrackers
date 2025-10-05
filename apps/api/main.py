from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime
from prediction_service import prediction_service

load_dotenv()

app = FastAPI(
    title="TempoTrackers API",
    description="Air Quality Forecasting API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AirQualityRequest(BaseModel):
    lat: float
    lon: float
    timestamp: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    pressure: Optional[float] = None

class AirQualityResponse(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    pollutants: Dict[str, float]
    aqi: int
    quality: str
    source: str = "Prediction"

class HeatmapRequest(BaseModel):
    center_lat: float
    center_lon: float
    radius_km: float = 2.0
    points: int = 50

class PredictionResponse(BaseModel):
    timestamp: str
    predictedAQI: int
    confidence: float
    factors: Dict[str, float]

@app.get("/")
async def root():
    return {"message": "TempoTrackers API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": len(prediction_service.models)}

@app.post("/forecast", response_model=AirQualityResponse)
async def get_air_quality_forecast(request: AirQualityRequest):
    try:
        # Create features dataframe
        features = pd.DataFrame({
            'lat': [request.lat],
            'lon': [request.lon],
            'temperature': [request.temperature or 20.0],
            'humidity': [request.humidity or 50.0],
            'wind_speed': [request.wind_speed or 5.0],
            'pressure': [request.pressure or 1013.25],
        })
        
        # Get predictions
        pollutants = prediction_service.predict_pollutants(features)
        aqi, quality = prediction_service.calculate_aqi(pollutants)
        
        return AirQualityResponse(
            latitude=request.lat,
            longitude=request.lon,
            timestamp=request.timestamp or datetime.now().isoformat(),
            pollutants=pollutants,
            aqi=aqi,
            quality=quality,
            source="Prediction"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/heatmap", response_model=List[AirQualityResponse])
async def generate_heatmap(request: HeatmapRequest):
    try:
        heatmap_data = prediction_service.generate_heatmap_data(
            center_lat=request.center_lat, 
            center_lon=request.center_lon,
            radius_km=request.radius_km,
            points=request.points
        )
        
        # Convert to response format
        results = []
        for point in heatmap_data:
            results.append(AirQualityResponse(
                latitude=point['latitude'],
                longitude=point['longitude'],
                timestamp=datetime.now().isoformat(),
                pollutants=point['pollutants'],
                aqi=point['aqi'],
                quality=point['quality'],
                source="Prediction"
            ))
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Heatmap generation error: {str(e)}")

@app.get("/current", response_model=List[AirQualityResponse])
async def get_current_air_quality(
    lat: float = Query(..., description="Center latitude"),
    lon: float = Query(..., description="Center longitude"),
    radius: float = Query(2.0, description="Radius in kilometers"),
    limit: int = Query(10, description="Maximum number of data points")
):
    try:
        # Generate mock current data around the given point
        current_data = []
        
        # Use a grid of points for demo purposes
        heatmap_data = prediction_service.generate_heatmap_data(
            center_lat=lat,
            center_lon=lon,
            radius_km=radius,
            points=max(int(limit**0.5), 3)  # Square root for grid dimensions
        )
        
        # Convert to response format (only take up to limit)
        for point in heatmap_data[:limit]:
            current_data.append(AirQualityResponse(
                latitude=point['latitude'],
                longitude=point['longitude'],
                timestamp=datetime.now().isoformat(),
                pollutants=point['pollutants'],
                aqi=point['aqi'],
                quality=point['quality'],
                source="TEMPO" if point['latitude'] % 2 > 1 else "Ground Station"  # Alternate sources for demo
            ))
        
        return current_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving current data: {str(e)}")

@app.get("/predictions", response_model=List[PredictionResponse])
async def get_predictions(
    hours_ahead: int = Query(24, description="Number of hours to predict ahead")
):
    try:
        # Generate mock predictions for the requested hours
        predictions = []
        now = datetime.now()
        
        for i in range(1, hours_ahead + 1):
            # Simulate different AQI levels throughout the day with some randomness
            hour_of_day = (now.hour + i) % 24
            base_aqi = 45 + 20 * (abs((hour_of_day - 12) / 12)) # Higher during morning/evening
            
            # Add slight random variation
            import random
            aqi_variance = random.uniform(-5, 5)
            predicted_aqi = int(max(0, min(300, base_aqi + aqi_variance)))
            
            # Confidence decreases the further in the future
            confidence = max(0.5, 1 - (i / hours_ahead) * 0.5)
            
            prediction_time = now.replace(hour=(now.hour + i) % 24)
            
            predictions.append(PredictionResponse(
                timestamp=prediction_time.isoformat(),
                predictedAQI=predicted_aqi,
                confidence=round(confidence, 2),
                factors={
                    "weather": round(random.uniform(0.3, 0.8), 2),
                    "traffic": round(random.uniform(0.2, 0.7), 2),
                    "industrial": round(random.uniform(0.1, 0.5), 2),
                    "seasonal": round(random.uniform(0.2, 0.6), 2)
                }
            ))
        
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating predictions: {str(e)}")

@app.get("/tempo-data")
async def get_tempo_data(lat: float, lon: float):
    # This would be replaced with actual TEMPO satellite data API
    try:
        # Create features dataframe for a prediction
        features = pd.DataFrame({
            'lat': [lat],
            'lon': [lon],
            'temperature': [20.0],
            'humidity': [50.0],
            'wind_speed': [5.0],
            'pressure': [1013.25],
        })
        
        # Get predictions as a simulation of TEMPO data
        pollutants = prediction_service.predict_pollutants(features)
        
        return {
            "source": "TEMPO",
            "lat": lat,
            "lon": lon,
            "timestamp": datetime.now().isoformat(),
            "pollutants": pollutants
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving TEMPO data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
