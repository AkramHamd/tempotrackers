from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import joblib
import numpy as np
from datetime import datetime
import os

app = FastAPI(title="SO2 Prediction API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "SO2 model.pkl")
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    date: str
    zoom_level: int
    bounds: dict = {
        "north": float,
        "south": float,
        "east": float,
        "west": float
    }

class PredictionPoint(BaseModel):
    latitude: float
    longitude: float
    prediction: float

class PredictionResponse(BaseModel):
    centerPoint: dict
    predictions: List[PredictionPoint]
    averagePrediction: float

def Make_Circle(lat: float, lon: float, radius_km: float, num_points: int = 8) -> List[tuple]:
    """Generate points in a circle around a center point."""
    points = []
    for i in range(num_points):
        angle = (i / num_points) * 2 * np.pi
        dx = radius_km * np.cos(angle) / 111.32  # Convert km to degrees
        dy = radius_km * np.sin(angle) / (111.32 * np.cos(np.radians(lat)))
        points.append((lat + dy, lon + dx))
    return points

def Make_Prediction_Dataset(lat: float, lon: float, date: str, radius_km: float = 5) -> np.ndarray:
    """Create prediction dataset for a location."""
    # Get points in a circle
    points = Make_Circle(lat, lon, radius_km)
    
    # Convert date to features (assuming model expects certain date-based features)
    dt = datetime.strptime(date, "%Y-%m-%d")
    day_of_week = dt.weekday()
    month = dt.month
    
    # Create feature matrix
    X = []
    for point_lat, point_lon in points:
        features = [
            point_lat,
            point_lon,
            day_of_week,
            month,
            # Add any other features your model expects
        ]
        X.append(features)
    
    return np.array(X)

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Calculate area size and adjust prediction density
        area_width = abs(request.bounds["east"] - request.bounds["west"])
        area_height = abs(request.bounds["north"] - request.bounds["south"])
        area_size = area_width * area_height

        # Determine number of prediction points based on zoom level
        if request.zoom_level < 10:
            num_points = 1  # Single point for wide area
            radius_km = 10
        elif request.zoom_level < 13:
            num_points = 9  # District level
            radius_km = 5
        else:
            num_points = 25  # Neighborhood level
            radius_km = 2

        # Generate prediction points
        predictions = []
        lat_step = area_height / (np.sqrt(num_points) + 1)
        lon_step = area_width / (np.sqrt(num_points) + 1)

        for i in range(int(np.sqrt(num_points))):
            for j in range(int(np.sqrt(num_points))):
                lat = request.bounds["south"] + (i + 1) * lat_step
                lon = request.bounds["west"] + (j + 1) * lon_step
                
                # Create dataset for this point
                X = Make_Prediction_Dataset(lat, lon, request.date, radius_km)
                
                # Make prediction
                prediction = float(model.predict(X).mean())  # Average predictions for all points in circle
                
                predictions.append(PredictionPoint(
                    latitude=lat,
                    longitude=lon,
                    prediction=prediction
                ))

        # Calculate average prediction
        average_prediction = sum(p.prediction for p in predictions) / len(predictions)

        return PredictionResponse(
            centerPoint={
                "latitude": request.latitude,
                "longitude": request.longitude,
                "date": request.date
            },
            predictions=predictions,
            averagePrediction=average_prediction
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}