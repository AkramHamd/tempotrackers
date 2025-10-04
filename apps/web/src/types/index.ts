// TypeScript type definitions
export interface AirQualityData {
  lat: number
  lon: number
  timestamp: string
  pollutants: {
    no2: number
    o3: number
    pm25: number
    pm10: number
  }
  aqi?: number
  quality?: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous'
}

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
}

export interface ForecastData {
  timestamp: string
  airQuality: AirQualityData
  weather: WeatherData
  confidence: number
}

export interface Alert {
  id: string
  type: 'warning' | 'info' | 'danger'
  message: string
  timestamp: string
  location?: {
    lat: number
    lon: number
  }
}
