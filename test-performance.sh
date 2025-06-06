#!/bin/bash

# Test script for scraping performance optimizations
echo "🧪 Testing Scraping Performance Optimizations"
echo "============================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Test local development server
echo "🚀 Starting development server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Test the API endpoint
echo "🔍 Testing API endpoint..."
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "extractionSpec": "Extract the main heading"
  }' \
  --max-time 30 \
  -w "\n⏱️  Total time: %{time_total}s\n"

# Kill the development server
kill $DEV_PID

echo "✅ Test completed!"
echo ""
echo "🔧 To deploy to Vercel:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Run: vercel --prod"
echo ""
echo "📖 Check DEPLOYMENT.md for detailed instructions"
