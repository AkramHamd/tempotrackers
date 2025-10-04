// Mock Data Service for TempoTrackers Development
// This service generates realistic air quality data for development and testing

export interface AirQualityData {
  id: string
  latitude: number
  longitude: number
  timestamp: Date
  aqi: number
  quality: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous'
  pollutants: {
    pm25: number // μg/m³
    pm10: number // μg/m³
    o3: number // ppb
    no2: number // ppb
    co: number // ppm
    so2: number // ppb
  }
  source: 'TEMPO' | 'Ground Station' | 'Prediction'
  confidence?: number // For predictions
}

export interface WeatherData {
  temperature: number // °C
  humidity: number // %
  windSpeed: number // m/s
  windDirection: number // degrees
  pressure: number // hPa
  visibility: number // km
}

export interface PredictionData {
  timestamp: Date
  predictedAQI: number
  confidence: number
  factors: {
    weather: number
    traffic: number
    industrial: number
    seasonal: number
  }
}

// NASA HQ coordinates and surrounding area
const NASA_HQ = { lat: 38.8833, lng: -77.0167 }
const AREA_BOUNDS = {
  north: 38.95,
  south: 38.80,
  east: -76.95,
  west: -77.05
}

// Air Quality Index thresholds
const AQI_THRESHOLDS = {
  Good: { min: 0, max: 50, color: '#00e400' },
  Moderate: { min: 51, max: 100, color: '#ffff00' },
  'Unhealthy for Sensitive Groups': { min: 101, max: 150, color: '#ff7e00' },
  Unhealthy: { min: 151, max: 200, color: '#ff0000' },
  'Very Unhealthy': { min: 201, max: 300, color: '#8f3f97' },
  Hazardous: { min: 301, max: 500, color: '#7e0023' }
}

// Generate realistic air quality data
export class MockDataService {
  private static instance: MockDataService
  private stations: Array<{ id: string; lat: number; lng: number; type: 'TEMPO' | 'Ground' }> = []

  constructor() {
    this.initializeStations()
  }

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  private initializeStations() {
    // NASA HQ station
    this.stations.push({
      id: 'nasa-hq',
      lat: NASA_HQ.lat,
      lng: NASA_HQ.lng,
      type: 'Ground'
    })

    // TEMPO satellite grid points (simulated)
    for (let i = 0; i < 20; i++) {
      this.stations.push({
        id: `tempo-${i}`,
        lat: this.randomBetween(AREA_BOUNDS.south, AREA_BOUNDS.north),
        lng: this.randomBetween(AREA_BOUNDS.west, AREA_BOUNDS.east),
        type: 'TEMPO'
      })
    }

    // Additional ground stations
    const groundStations = [
      { lat: 38.8900, lng: -77.0100 },
      { lat: 38.8750, lng: -77.0250 },
      { lat: 38.9000, lng: -77.0000 },
      { lat: 38.8700, lng: -77.0300 },
      { lat: 38.9100, lng: -76.9900 },
      { lat: 38.8600, lng: -77.0200 },
      { lat: 38.9200, lng: -77.0100 }
    ]

    groundStations.forEach((station, index) => {
      this.stations.push({
        id: `ground-${index}`,
        lat: station.lat,
        lng: station.lng,
        type: 'Ground'
      })
    })
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  private getAQIQuality(aqi: number): 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  private generatePollutants(aqi: number) {
    // Generate realistic pollutant concentrations based on AQI
    const baseLevel = aqi / 100

    return {
      pm25: Math.round((baseLevel * 15 + this.randomBetween(-3, 3)) * 10) / 10,
      pm10: Math.round((baseLevel * 25 + this.randomBetween(-5, 5)) * 10) / 10,
      o3: Math.round((baseLevel * 60 + this.randomBetween(-10, 10)) * 10) / 10,
      no2: Math.round((baseLevel * 40 + this.randomBetween(-8, 8)) * 10) / 10,
      co: Math.round((baseLevel * 2 + this.randomBetween(-0.5, 0.5)) * 100) / 100,
      so2: Math.round((baseLevel * 30 + this.randomBetween(-6, 6)) * 10) / 10
    }
  }

  // Generate current air quality data
  generateCurrentData(): AirQualityData[] {
    const now = new Date()
    
    return this.stations.map(station => {
      // Generate realistic AQI based on location and time
      let baseAQI = 40 + Math.sin(now.getHours() / 24 * Math.PI * 2) * 15
      
      // Add location-based variation
      const distanceFromCenter = Math.sqrt(
        Math.pow(station.lat - NASA_HQ.lat, 2) + 
        Math.pow(station.lng - NASA_HQ.lng, 2)
      )
      baseAQI += distanceFromCenter * 100 + this.randomBetween(-10, 10)
      
      // TEMPO data tends to be slightly different from ground stations
      if (station.type === 'TEMPO') {
        baseAQI += this.randomBetween(-5, 5)
      }
      
      const aqi = Math.max(0, Math.min(500, Math.round(baseAQI)))
      const quality = this.getAQIQuality(aqi)
      
      return {
        id: station.id,
        latitude: station.lat,
        longitude: station.lng,
        timestamp: now,
        aqi,
        quality,
        pollutants: this.generatePollutants(aqi),
        source: station.type === 'TEMPO' ? 'TEMPO' : 'Ground Station'
      }
    })
  }

  // Generate historical data for a time range
  generateHistoricalData(startDate: Date, endDate: Date, intervalHours: number = 1): AirQualityData[] {
    const data: AirQualityData[] = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const hourlyData = this.generateCurrentData()
      hourlyData.forEach(station => {
        data.push({
          ...station,
          timestamp: new Date(current)
        })
      })
      current.setHours(current.getHours() + intervalHours)
    }
    
    return data
  }

  // Generate weather data
  generateWeatherData(): WeatherData {
    const now = new Date()
    const hour = now.getHours()
    
    // Simulate daily temperature cycle
    const baseTemp = 20 + Math.sin((hour - 6) / 24 * Math.PI * 2) * 8
    
    return {
      temperature: Math.round((baseTemp + this.randomBetween(-2, 2)) * 10) / 10,
      humidity: Math.round((60 + Math.sin(hour / 24 * Math.PI * 2) * 20 + this.randomBetween(-5, 5)) * 10) / 10,
      windSpeed: Math.round((3 + this.randomBetween(-1, 3)) * 10) / 10,
      windDirection: Math.round(this.randomBetween(0, 360)),
      pressure: Math.round((1013 + this.randomBetween(-10, 10)) * 10) / 10,
      visibility: Math.round((10 + this.randomBetween(-2, 2)) * 10) / 10
    }
  }

  // Generate prediction data
  generatePredictionData(hoursAhead: number = 24): PredictionData[] {
    const predictions: PredictionData[] = []
    const now = new Date()
    
    for (let i = 1; i <= hoursAhead; i++) {
      const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000)
      const hour = futureTime.getHours()
      
      // Simulate prediction with decreasing confidence over time
      const confidence = Math.max(0.5, 1 - (i / hoursAhead) * 0.5)
      
      // Generate predicted AQI with some uncertainty
      const baseAQI = 45 + Math.sin(hour / 24 * Math.PI * 2) * 15
      const predictedAQI = Math.round(baseAQI + this.randomBetween(-10, 10))
      
      predictions.push({
        timestamp: futureTime,
        predictedAQI: Math.max(0, Math.min(500, predictedAQI)),
        confidence: Math.round(confidence * 100) / 100,
        factors: {
          weather: Math.round(this.randomBetween(0.3, 0.8) * 100) / 100,
          traffic: Math.round(this.randomBetween(0.2, 0.7) * 100) / 100,
          industrial: Math.round(this.randomBetween(0.1, 0.5) * 100) / 100,
          seasonal: Math.round(this.randomBetween(0.2, 0.6) * 100) / 100
        }
      })
    }
    
    return predictions
  }

  // Get AQI color for visualization
  getAQIColor(aqi: number): string {
    const quality = this.getAQIQuality(aqi)
    return AQI_THRESHOLDS[quality].color
  }

  // Get station information
  getStations() {
    return this.stations.map(station => ({
      ...station,
      name: station.id === 'nasa-hq' ? 'NASA Headquarters' : `Station ${station.id}`,
      description: station.type === 'TEMPO' ? 'TEMPO Satellite Data' : 'Ground Monitoring Station'
    }))
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance()
