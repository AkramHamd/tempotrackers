#!/bin/bash

# Development Environment Setup Script
echo "🚀 Setting up TempoTrackers development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install web app dependencies
echo "📦 Installing web app dependencies..."
cd apps/web
npm install
cd ../..

# Install API dependencies
echo "📦 Installing API dependencies..."
cd apps/api
pip install -r requirements.txt
cd ../..

# Install shared packages
echo "📦 Installing shared packages..."
cd packages/shared
npm install
cd ../..

cd packages/ui
npm install
cd ../..

cd packages/types
npm install
cd ../..

# Create environment files
echo "⚙️ Creating environment files..."
cp infrastructure/env.example .env

# Start Docker services
echo "🐳 Starting Docker services..."
cd infrastructure/docker
docker-compose up -d db redis
cd ../..

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Visit http://localhost:3000 to view the app"
