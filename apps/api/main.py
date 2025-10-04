from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="TempoTrackers API",
    description="Air Quality Forecasting API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AirQualityRequest(BaseModel):
    lat: float
    lon: float
    timestamp: Optional[str] = None

class AirQualityResponse(BaseModel):
    lat: float
    lon: float
    timestamp: str
    pollutants: dict
    aqi: int
    quality: str

@app.get("/")
async def root():
    return {"message": "TempoTrackers API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/forecast", response_model=AirQualityResponse)
async def get_air_quality_forecast(request: AirQualityRequest):
    # TODO: Implement ML model inference
    return AirQualityResponse(
        lat=request.lat,
        lon=request.lon,
        timestamp="2024-01-01T00:00:00Z",
        pollutants={"no2": 0, "o3": 0, "pm25": 0, "pm10": 0},
        aqi=45,
        quality="good"
    )

@app.get("/tempo-data")
async def get_tempo_data(lat: float, lon: float):
    # TODO: Implement TEMPO data retrieval
    return {"message": "TEMPO data endpoint", "lat": lat, "lon": lon}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
