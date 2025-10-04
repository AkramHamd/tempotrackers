// Placeholder for air quality dashboard component
export const AirQualityDashboard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Current Air Quality</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">AQI</span>
          <span className="text-2xl font-bold text-green-600">45</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">PM2.5</span>
          <span className="text-lg font-semibold">12 μg/m³</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Ozone</span>
          <span className="text-lg font-semibold">0.08 ppm</span>
        </div>
      </div>
    </div>
  )
}
