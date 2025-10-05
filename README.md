# TempoTrackers - Air Quality Forecasting App

## Project Structure

This is a modular web application for NASA Space Apps Challenge that forecasts air quality by integrating real-time TEMPO data with ground-based measurements and weather data.

### Architecture Overview

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Leaflet.js
- **Backend**: FastAPI + Python for ML pipeline
- **Database**: PostgreSQL + Redis
- **Cloud**: AWS/Vercel deployment
- **ML**: scikit-learn/TensorFlow for air quality prediction

### Key Features

- Real-time TEMPO satellite data integration
- Interactive mapping with Leaflet.js
- AI-powered air quality forecasting
- Multi-stakeholder alert system
- Historical trends analysis
- Mobile-responsive design

### Development Phases

1. **Foundation & Setup** - Project structure, basic UI
2. **Data Pipeline & ML** - TEMPO API, weather data, ML models
3. **Core Features** - Mapping, forecasting, alerts
4. **Advanced Features** - Historical analysis, optimization

### Getting Started

#### Prerequisites
- Node.js 18+ and npm
- Gemini AI API key (for chat functionality)

#### Setup Instructions

1. **Clone and install dependencies:**
```bash
git clone https://github.com/AkramHamd/tempotrackers.git
cd tempotrackers
npm install
```

2. **Configure environment variables:**
```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your actual API keys
# Get Gemini API key from: https://aistudio.google.com/app/apikey
```

3. **Start development:**
```bash
# Start all development servers
npm run dev

# Or start specific services
cd apps/web && npm run dev    # Web app
cd apps/api && python main.py # API server
```

4. **Build for production:**
```bash
npm run build
```

#### Environment Variables
- `GEMINI_API_KEY`: Required for AI chat functionality
- `NEXT_PUBLIC_APP_URL`: Application URL (default: http://localhost:3000)
- Additional variables documented in `.env.example`

### Data Sources

- NASA TEMPO satellite data
- OpenAQ ground station data
- Weather APIs (OpenWeatherMap, NOAA)
- Pandora network data
