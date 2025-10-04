// Next.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['api.nasa.gov', 'api.openweathermap.org'],
  },
  env: {
    TEMPO_API_URL: process.env.TEMPO_API_URL,
    OPENAQ_API_URL: process.env.OPENAQ_API_URL,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
  },
}

module.exports = nextConfig
