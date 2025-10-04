// Next.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.nasa.gov', 'api.openweathermap.org'],
  },
  env: {
    TEMPO_API_URL: process.env.TEMPO_API_URL || 'https://api.nasa.gov',
    OPENAQ_API_URL: process.env.OPENAQ_API_URL || 'https://api.openaq.org',
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  },
}

module.exports = nextConfig
