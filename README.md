# TempoTrackers - Air Quality Forecasting App

## Project Structure

This is a modular web application for NASA Space Apps Challenge. It forecasts air quality by integrating EPA (Environmental Protection Agency) data with ground-based pollution measurements.

### Architecture Overview

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Leaflet.js 
- **Backend**: Unicorn FastAPI + Python for ML pipeline
- **Cloud**: Next steps
- **ML**: Scikit-Learn/XGBoost for air quality prediction

### Key Features

- EPA satellite data integration
- Interactive mapping with Leaflet.js
- AI-powered air quality forecasting
- Multi-stakeholder alert system
- Historical trends analysis
- Mobile-responsive design

### Development Phases

1. **Foundation & Setup** - Project structure, basic UI
2. **Data Pipeline & ML** - EPA data, ML models
3. **Core Features** - Mapping, forecasting, alerts
4. **Advanced Features** - Historical analysis, optimization

### Warning
.ipynb files are just illustrative but they are not executable. Models have been trained separatedly.

### Getting Started

#### Prerequisites
- Python3
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

- EPA satellite data
