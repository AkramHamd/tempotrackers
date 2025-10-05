// Prediction Service for TempoTrackers
// This service loads and processes prediction data from the ML models

export interface PredictionPoint {
  lat: number
  lng: number
  timestamp: Date
  aqi: number
  quality: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous'
  pollutants: {
    pm25?: number
    pm10?: number
    o3?: number
    no2?: number
    co?: number
    so2?: number
  }
  confidence?: number
}

class PredictionService {
  private predictionData: Map<string, PredictionPoint[]> = new Map()
  private loadedModels: string[] = []
  private isLoading = false

  // Get nearest prediction points to a location
  async getNearestPredictions(lat: number, lng: number, radius: number = 10): Promise<PredictionPoint[]> {
    // Ensure data is loaded
    if (this.loadedModels.length === 0 && !this.isLoading) {
      await this.loadPredictionData()
    }

    // Combine all prediction points
    let allPoints: PredictionPoint[] = []
    this.predictionData.forEach((points) => {
      allPoints = [...allPoints, ...points]
    })

    // Filter by distance (simple Euclidean distance for demo purposes)
    // In a real app, you'd use Haversine formula for earth distances
    const nearbyPoints = allPoints.filter((point) => {
      const distance = Math.sqrt(
        Math.pow(point.lat - lat, 2) + Math.pow(point.lng - lng, 2)
      )
      // Convert degrees to approximate kilometers (very rough estimate)
      // 1 degree ≈ 111 km at the equator
      return distance * 111 <= radius
    })

    return nearbyPoints
  }

  // Load prediction data from various model outputs
  async loadPredictionData(): Promise<void> {
    if (this.isLoading) return
    
    this.isLoading = true
    
    try {
      // For each pollutant type, load its prediction data
      const pollutants = ['PM25', 'PM10', 'O3', 'NO2', 'CO', 'SO2']
      
      for (const pollutant of pollutants) {
        // In a real app, this would fetch the CSV from an API or file system
        // For now, we'll generate mock data based on the model names we have
        const mockData = this.generateMockPredictionData(pollutant)
        this.predictionData.set(pollutant, mockData)
        this.loadedModels.push(pollutant)
      }

      console.log(`Loaded prediction data for ${this.loadedModels.length} models`)
    } catch (error) {
      console.error('Error loading prediction data:', error)
    } finally {
      this.isLoading = false
    }
  }

  // Get prediction data for a specific pollutant
  getPredictionsByType(type: string): PredictionPoint[] {
    return this.predictionData.get(type) || []
  }

  // Get all prediction data
  getAllPredictions(): PredictionPoint[] {
    let allPoints: PredictionPoint[] = []
    this.predictionData.forEach((points) => {
      allPoints = [...allPoints, ...points]
    })
    return allPoints
  }

  // Mock data generation for demonstration purposes
  // In a real app, this would be replaced with actual CSV parsing
  private generateMockPredictionData(pollutantType: string): PredictionPoint[] {
    const points: PredictionPoint[] = []
    
    // Generate a grid of points around NASA HQ
    const centerLat = 38.8833
    const centerLng = -77.0167
    
    // Create a grid of points
    for (let i = -10; i <= 10; i++) {
      for (let j = -10; j <= 10; j++) {
        const lat = centerLat + (i * 0.01)
        const lng = centerLng + (j * 0.01)
        
        // Generate realistic-ish data based on location
        // Further from center = generally worse air quality
        const distanceFromCenter = Math.sqrt(i * i + j * j) / 10
        
        // Base AQI depends on pollutant type and distance from center
        let baseAQI = 30 + (distanceFromCenter * 30)
        
        // Add some randomness
        baseAQI += Math.random() * 20 - 10
        const aqi = Math.round(baseAQI)
        
        // Determine quality based on AQI
        let quality: PredictionPoint['quality'] = 'Good'
        if (aqi <= 50) quality = 'Good'
        else if (aqi <= 100) quality = 'Moderate'
        else if (aqi <= 150) quality = 'Unhealthy for Sensitive Groups'
        else if (aqi <= 200) quality = 'Unhealthy'
        else if (aqi <= 300) quality = 'Very Unhealthy'
        else quality = 'Hazardous'
        
        // Create pollutant data based on the type
        const pollutants: PredictionPoint['pollutants'] = {}
        switch (pollutantType) {
          case 'PM25':
            pollutants.pm25 = aqi * 0.3
            break
          case 'PM10':
            pollutants.pm10 = aqi * 0.5
            break
          case 'O3':
            pollutants.o3 = aqi * 0.2
            break
          case 'NO2':
            pollutants.no2 = aqi * 0.15
            break
          case 'CO':
            pollutants.co = aqi * 0.1
            break
          case 'SO2':
            pollutants.so2 = aqi * 0.25
            break
        }
        
        points.push({
          lat,
          lng,
          timestamp: new Date(),
          aqi,
          quality,
          pollutants,
          confidence: 0.7 + (Math.random() * 0.2) // 70-90% confidence
        })
      }
    }
    
    return points
  }
}

// Export singleton instance
export const predictionService = new PredictionService()