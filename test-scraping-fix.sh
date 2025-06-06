#!/bin/bash

# Test script to verify the adaptive scraping system functionality

echo "🧪 Testing Adaptive Scraping System"
echo "=================================="

# Check if the development server is running
echo "1. Checking if development server is running..."
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ Development server is running on http://localhost:3002"
else
    echo "❌ Development server is not running. Please start with: npm run dev"
    exit 1
fi

# Test simple scraping API call
echo ""
echo "2. Testing scraping API with simple site..."

# Test with a simple, reliable site
curl -X POST http://localhost:3002/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "spec": "text content"
  }' \
  -w "HTTP Status: %{http_code}\n" \
  -s -o /tmp/scrape_test.json

if [ -f /tmp/scrape_test.json ]; then
    echo "✅ API call completed"
    
    # Check if response contains data
    if grep -q "data" /tmp/scrape_test.json; then
        echo "✅ Response contains data"
        echo "📊 Response preview:"
        cat /tmp/scrape_test.json | head -c 500
        echo "..."
    else
        echo "❌ Response doesn't contain expected data"
        echo "🔍 Full response:"
        cat /tmp/scrape_test.json
    fi
    
    rm /tmp/scrape_test.json
else
    echo "❌ API call failed"
fi

echo ""
echo "🎯 Test completed. Check the browser at http://localhost:3002 for full functionality."
