// Main dashboard page
import { MapContainer } from '@/components/map/MapContainer'
import { AirQualityDashboard } from '@/components/dashboard/AirQualityDashboard'
import { AlertPanel } from '@/components/alerts/AlertPanel'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 py-4">
            TempoTrackers - Air Quality Forecast
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MapContainer />
          </div>
          <div className="space-y-6">
            <AirQualityDashboard />
            <AlertPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
