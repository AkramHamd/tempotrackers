// Data Service for TempoTrackers
// This service provides mock data for development

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

class DataService {
  // Mock data generation
  private generateMockAQI(): number {
    return Math.floor(Math.random() * 200) + 1
  }

  private getQuality(aqi: number): AirQualityData['quality'] {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  private generateMockPollutants(aqi: number) {
    return {
      pm25: aqi * 0.3,
      pm10: aqi * 0.5,
      o3: aqi * 0.2,
      no2: aqi * 0.15,
      co: aqi * 0.1,
      so2: aqi * 0.25
    }
  }

  // Public API
  async getCurrentAirQuality(): Promise<AirQualityData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockData: AirQualityData[] = []
    for (let i = 0; i < 10; i++) {
      const aqi = this.generateMockAQI()
      mockData.push({
        id: `station-${i}`,
        latitude: 38.8833 + (Math.random() - 0.5) * 0.1,
        longitude: -77.0167 + (Math.random() - 0.5) * 0.1,
        timestamp: new Date(),
        aqi,
        quality: this.getQuality(aqi),
        pollutants: this.generateMockPollutants(aqi),
        source: Math.random() > 0.5 ? 'TEMPO' : 'Ground Station'
      })
    }

    return mockData
  }

  async getCurrentWeather(): Promise<WeatherData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 40,
      windSpeed: Math.random() * 10,
      windDirection: Math.random() * 360,
      pressure: 1000 + Math.random() * 30,
      visibility: 5 + Math.random() * 10
    }
  }

  async getPredictions(hoursAhead: number = 24): Promise<PredictionData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700))

    const predictions: PredictionData[] = []
    const now = new Date()

    for (let i = 1; i <= hoursAhead; i++) {
      predictions.push({
        timestamp: new Date(now.getTime() + i * 3600000),
        predictedAQI: this.generateMockAQI(),
        confidence: 70 + Math.random() * 25,
        factors: {
          weather: Math.random(),
          traffic: Math.random(),
          industrial: Math.random(),
          seasonal: Math.random()
        }
      })
    }

    return predictions
  }

  async getHistoricalAirQuality(startDate: Date, endDate: Date, intervalHours: number = 1): Promise<AirQualityData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const historicalData: AirQualityData[] = []
    let currentTime = startDate.getTime()

    while (currentTime <= endDate.getTime()) {
      const aqi = this.generateMockAQI()
      historicalData.push({
        id: `historical-${currentTime}`,
        latitude: 38.8833,
        longitude: -77.0167,
        timestamp: new Date(currentTime),
        aqi,
        quality: this.getQuality(aqi),
        pollutants: this.generateMockPollutants(aqi),
        source: 'Ground Station'
      })

      currentTime += intervalHours * 3600000
    }

    return historicalData
  }

  async getStations(): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))

    return Array(10).fill(null).map((_, i) => ({
      id: `station-${i}`,
      name: `Station ${i + 1}`,
      type: Math.random() > 0.5 ? 'TEMPO' : 'Ground',
      location: {
        latitude: 38.8833 + (Math.random() - 0.5) * 0.1,
        longitude: -77.0167 + (Math.random() - 0.5) * 0.1
      },
      status: 'active'
    }))
  }

  getAQIColor(aqi: number): string {
    if (aqi <= 50) return '#00e400' // Good
    if (aqi <= 100) return '#ffff00' // Moderate
    if (aqi <= 150) return '#ff7e00' // Unhealthy for Sensitive Groups
    if (aqi <= 200) return '#ff0000' // Unhealthy
    if (aqi <= 300) return '#8f3f97' // Very Unhealthy
    return '#7e0023' // Hazardous
  }
}

export const dataService = new DataService()