// Placeholder for alert panel component
export const AlertPanel = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>
      <div className="space-y-3">
        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">
            Moderate air quality expected tomorrow
          </p>
        </div>
        <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-sm text-blue-800">
            New TEMPO data available
          </p>
        </div>
      </div>
    </div>
  )
}
