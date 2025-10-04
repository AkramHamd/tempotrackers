// Lateral Control Panel Component for TempoTrackers
'use client'

import { useState, useEffect } from 'react'
import { useAirQualityData, useWeatherData, usePredictions } from '../../lib/hooks/useData'

interface ControlPanelProps {
  isOpen: boolean
  onToggle: () => void
}

export default function ControlPanel({ isOpen, onToggle }: ControlPanelProps) {
  const { data: airQualityData, loading: aqiLoading } = useAirQualityData()
  const { data: weatherData, loading: weatherLoading } = useWeatherData()
  const { data: predictions, loading: predictionsLoading } = usePredictions()
  
  const [activeSection, setActiveSection] = useState('overview')
  const [isMinimized, setIsMinimized] = useState(false)

  // Calculate average AQI
  const averageAQI = airQualityData?.length 
    ? Math.round(airQualityData.reduce((sum, data) => sum + data.aqi, 0) / airQualityData.length)
    : 0

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400'
    if (aqi <= 100) return '#ffff00'
    if (aqi <= 150) return '#ff7e00'
    if (aqi <= 200) return '#ff0000'
    if (aqi <= 300) return '#8f3f97'
    return '#7e0023'
  }

  const getAQIQuality = (aqi: number) => {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  const sections = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'data', name: 'Data Sources', icon: '📡' },
    { id: 'predictions', name: 'Predictions', icon: '🔮' },
    { id: 'alerts', name: 'Alerts', icon: '⚠️' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ]

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-[1000] bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
        title="Open Control Panel"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    )
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-sm shadow-xl z-[1000] transition-all duration-500 ease-in-out transform ${
      isMinimized ? 'w-16' : 'w-80'
    } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isMinimized && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Control Panel</h2>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close Panel"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2">
        <nav className="space-y-1">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isOpen ? 'fadeInUp 0.3s ease-out forwards' : 'none'
              }}
            >
              <span className="text-lg">{section.icon}</span>
              {!isMinimized && <span className="text-sm font-medium">{section.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4">
          <div 
            className="animate-fadeInUp"
            style={{
              animation: 'fadeInUp 0.4s ease-out forwards'
            }}
          >
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Air Quality Overview</h3>
              
              {/* Current AQI */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Current Average AQI</h4>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getAQIColor(averageAQI) }}
                  ></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{averageAQI}</div>
                <div className="text-sm text-gray-600">{getAQIQuality(averageAQI)}</div>
                {aqiLoading && <div className="text-xs text-gray-500 mt-1">Loading...</div>}
              </div>

              {/* Weather Info */}
              {weatherData && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Current Weather</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-medium ml-1">{weatherData.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-medium ml-1">{weatherData.humidity}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Wind:</span>
                      <span className="font-medium ml-1">{weatherData.windSpeed} m/s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pressure:</span>
                      <span className="font-medium ml-1">{weatherData.pressure} hPa</span>
                    </div>
                  </div>
                  {weatherLoading && <div className="text-xs text-gray-500 mt-1">Loading weather...</div>}
                </div>
              )}

              {/* Map Legend */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Map Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-gray-600">NASA Headquarters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Good Air Quality (AQI 0-50)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">Moderate Air Quality (AQI 51-100)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600">Unhealthy for Sensitive Groups (AQI 101-150)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Unhealthy (AQI 151+)</span>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Data Collection</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Processing</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AI Models</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-600 font-medium">Training</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🛰️</span>
                      <h4 className="font-semibold text-gray-900">TEMPO Satellite</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 text-xs font-medium">Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    NASA's Tropospheric Emissions: Monitoring of Pollution satellite providing hourly air quality data across North America.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>Coverage: North America</div>
                    <div>Resolution: 2km</div>
                    <div>Update: Every hour</div>
                    <div>Points: {airQualityData?.filter(d => d.source === 'TEMPO').length || 0}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🏭</span>
                      <h4 className="font-semibold text-gray-900">Ground Stations</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 text-xs font-medium">Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    EPA and local air quality monitoring stations providing real-time measurements.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>Stations: {airQualityData?.filter(d => d.source === 'Ground Station').length || 0}</div>
                    <div>Update: Real-time</div>
                    <div>Accuracy: High</div>
                    <div>Coverage: Local</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🌤️</span>
                      <h4 className="font-semibold text-gray-900">Weather Data</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 text-xs font-medium">Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Meteorological data for air quality correlation and prediction modeling.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>Source: OpenWeatherMap</div>
                    <div>Update: Every 5 min</div>
                    <div>Parameters: 6</div>
                    <div>Accuracy: 95%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'predictions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Predictions</h3>
              
              {predictions && predictions.length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Next 24 Hours</h4>
                    <div className="space-y-2">
                      {predictions.slice(0, 6).map((pred, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {pred.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{pred.predictedAQI}</span>
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getAQIColor(pred.predictedAQI) }}
                            ></div>
                            <span className="text-xs text-gray-500">
                              {Math.round(pred.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {predictionsLoading && <div className="text-xs text-gray-500 mt-2">Loading predictions...</div>}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Prediction Factors</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weather Impact:</span>
                        <span className="font-medium">{Math.round(predictions[0]?.factors.weather * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Traffic Impact:</span>
                        <span className="font-medium">{Math.round(predictions[0]?.factors.traffic * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industrial Impact:</span>
                        <span className="font-medium">{Math.round(predictions[0]?.factors.industrial * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🔮</div>
                  <p className="text-sm">AI predictions coming soon</p>
                  <p className="text-xs">Model training in progress</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'alerts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
              
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-yellow-600">⚠️</span>
                    <h4 className="font-medium text-yellow-800">Moderate Air Quality</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    AQI levels are moderate in some areas. Sensitive groups should limit outdoor activities.
                  </p>
                  <div className="text-xs text-yellow-600 mt-1">2 minutes ago</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-blue-600">ℹ️</span>
                    <h4 className="font-medium text-blue-800">Data Update</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    New TEMPO satellite data received and processed successfully.
                  </p>
                  <div className="text-xs text-blue-600 mt-1">5 minutes ago</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🔔</div>
                  <p className="text-sm text-gray-600 mb-2">Smart Alert System</p>
                  <p className="text-xs text-gray-500">
                    AI-powered alerts will notify you of air quality changes and health recommendations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Refresh Rate</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                    <option value="1">Every minute</option>
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alert Thresholds</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Moderate (AQI 51-100)</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Unhealthy (AQI 101-150)</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Very Unhealthy (AQI 151+)</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Map Layers</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Air Quality Overlay</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prediction Overlay</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weather Overlay</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Coverage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Stations:</span>
                      <span className="font-medium">{airQualityData?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TEMPO Points:</span>
                      <span className="font-medium">{airQualityData?.filter(d => d.source === 'TEMPO').length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ground Stations:</span>
                      <span className="font-medium">{airQualityData?.filter(d => d.source === 'Ground Station').length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Quality</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium text-green-600">99.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="font-medium text-green-600">95.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Update:</span>
                      <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm text-gray-600 mb-2">Advanced Analytics</p>
                  <p className="text-xs text-gray-500">
                    Historical trends, correlation analysis, and predictive insights coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  )
}
