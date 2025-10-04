// Shared TypeScript type definitions

export interface Coordinates {
  lat: number
  lon: number
}

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
  quality?: AirQualityLevel
}

export type AirQualityLevel = 
  | 'good' 
  | 'moderate' 
  | 'unhealthy-sensitive' 
  | 'unhealthy' 
  | 'very-unhealthy' 
  | 'hazardous'

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  timestamp: string
}

export interface ForecastData {
  timestamp: string
  airQuality: AirQualityData
  weather: WeatherData
  confidence: number
}

export interface Alert {
  id: string
  type: AlertType
  message: string
  timestamp: string
  location?: Coordinates
  severity: AlertSeverity
}

export type AlertType = 'warning' | 'info' | 'danger' | 'critical'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Stakeholder {
  id: string
  type: StakeholderType
  name: string
  email: string
  location: Coordinates
  preferences: NotificationPreferences
}

export type StakeholderType = 
  | 'health_sensitive'
  | 'school_admin'
  | 'government'
  | 'emergency_response'
  | 'general_public'

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  aqiThreshold: number
}

export interface TempoData {
  lat: number
  lon: number
  timestamp: string
  no2: number
  o3: number
  pm25: number
  pm10: number
  confidence: number
}

export interface OpenAQData {
  location: string
  city: string
  country: string
  coordinates: Coordinates
  measurements: Measurement[]
}

export interface Measurement {
  parameter: string
  value: number
  unit: string
  timestamp: string
  source: string
}
