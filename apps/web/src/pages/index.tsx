// Main home page with TempoTrackers branding and map preview
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically import the map preview component to avoid SSR issues
const HomeMapPreview = dynamic(() => import('../components/map/HomeMapPreview'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading Map Preview...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with TempoTrackers branding */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TempoTrackers
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">NASA Space Apps Challenge</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-8">
                <Link href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  About
                </Link>
                <Link href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Features
                </Link>
                <Link href="/map" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Interactive Map
                </Link>
                <Link href="#data" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Data Sources
                </Link>
              </nav>
              <Link href="/map" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Explore Map
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Air Quality Forecasting
            <span className="block text-blue-600">Powered by NASA TEMPO</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Real-time air quality monitoring and forecasting using NASA's Tropospheric Emissions: 
            Monitoring of Pollution (TEMPO) satellite data, integrated with ground-based measurements 
            and weather data to protect public health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">
              Explore the Map
            </Link>
            <Link href="#features" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Interactive Air Quality Monitoring</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore real-time air quality data around NASA Headquarters with our interactive map featuring 
              satellite imagery, street views, and live TEMPO data integration.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <HomeMapPreview />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h3>
            <p className="text-xl text-gray-600">Advanced air quality monitoring and forecasting capabilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Real-time TEMPO Data</h4>
              <p className="text-gray-600">Live satellite data from NASA's TEMPO mission for accurate air quality monitoring across North America.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Forecasting</h4>
              <p className="text-gray-600">Machine learning models predict air quality trends and provide accurate forecasts for better health decisions.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17h8a2 2 0 002-2V9a2 2 0 00-2-2H4.828" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Interactive Mapping</h4>
              <p className="text-gray-600">Explore air quality data on interactive maps with satellite imagery and detailed street views.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
