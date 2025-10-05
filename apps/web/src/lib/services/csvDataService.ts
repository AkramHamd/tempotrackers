// CSV Data Service for TempoTrackers
// This service loads and parses CSV prediction data

import { AirQualityData } from './dataService'

// Interface for CSV prediction data
export interface PredictionCSVData {
  latitude: number
  longitude: number
  date: string
  time: string
  aqi: number
  pm25: number
  pm10: number
  o3: number
  no2: number
  co: number
  so2: number
}

class CSVDataService {
  private csvData: PredictionCSVData[] = []
  private isLoaded = false

  // Load CSV data from specified path
  async loadCSVData(path: string): Promise<boolean> {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        console.error(`Failed to load CSV data: ${response.status}`)
        return false
      }

      const csvText = await response.text()
      this.csvData = this.parseCSV(csvText)
      this.isLoaded = true
      return true
    } catch (error) {
      console.error('Error loading CSV data:', error)
      return false
    }
  }

  // Parse CSV text into structured data
  private parseCSV(csvText: string): PredictionCSVData[] {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',')
    
    return lines.slice(1).filter(line => line.trim().length > 0).map(line => {
      const values = line.split(',')
      const entry: PredictionCSVData = {
        latitude: parseFloat(values[0]),
        longitude: parseFloat(values[1]),
        date: values[2],
        time: values[3],
        aqi: parseInt(values[4]),
        pm25: parseFloat(values[5]),
        pm10: parseFloat(values[6]),
        o3: parseFloat(values[7]),
        no2: parseFloat(values[8]),
        co: parseFloat(values[9]),
        so2: parseFloat(values[10])
      }
      return entry
    })
  }

  // Get all prediction data
  getAllPredictions(): PredictionCSVData[] {
    return this.csvData
  }

  // Get predictions for a specific date
  getPredictionsByDate(date: string): PredictionCSVData[] {
    return this.csvData.filter(data => data.date === date)
  }

  // Get predictions for a specific date and time
  getPredictionsByDateTime(date: string, time: string): PredictionCSVData[] {
    return this.csvData.filter(data => data.date === date && data.time === time)
  }

  // Convert CSV data to AirQualityData format for map display
  convertToAirQualityData(predictions?: PredictionCSVData[]): AirQualityData[] {
    const dataToConvert = predictions || this.csvData
    
    return dataToConvert.map((pred, index) => {
      return {
        id: `prediction-${index}`,
        latitude: pred.latitude,
        longitude: pred.longitude,
        timestamp: new Date(`${pred.date}T${pred.time}`),
        aqi: pred.aqi,
        quality: this.getQuality(pred.aqi),
        pollutants: {
          pm25: pred.pm25,
          pm10: pred.pm10,
          o3: pred.o3,
          no2: pred.no2,
          co: pred.co,
          so2: pred.so2
        },
        source: 'Prediction',
        confidence: 0.85 // Default confidence value
      }
    })
  }

  // Get quality category based on AQI value
  private getQuality(aqi: number): AirQualityData['quality'] {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  // Check if data is loaded
  isDataLoaded(): boolean {
    return this.isLoaded
  }
}

export const csvDataService = new CSVDataService()