#!/usr/bin/env node

/**
 * Comprehensive End-to-End Test of Adaptive Scraping System
 * Tests both the adaptive configuration and dynamic rendering capabilities
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// Test URLs with expected behaviors
const testCases = [
  {
    name: 'Simple Static Site',
    url: 'https://example.com',
    extractionSpec: 'Extract the main heading and content',
    expectedCategory: 'unknown',
    expectedStrategy: 'balanced',
    expectedComplexity: 'moderate'
  },
  {
    name: 'News Site (Fast Strategy)',
    url: 'https://news.ycombinator.com',
    extractionSpec: 'Extract the top stories with titles and points',
    expectedCategory: 'news',
    expectedStrategy: 'fast',
    expectedComplexity: 'simple'
  },
  {
    name: 'JSON API (Structured Data)',
    url: 'https://httpbin.org/json',
    extractionSpec: 'Extract all structured data from this JSON response',
    expectedCategory: 'unknown',
    expectedStrategy: 'balanced',
    expectedComplexity: 'moderate'
  },
  {
    name: 'GitHub (Complex Site)',
    url: 'https://github.com/trending',
    extractionSpec: 'Extract trending repositories with names and descriptions',
    expectedCategory: 'unknown',
    expectedStrategy: 'balanced',
    expectedComplexity: 'moderate'
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`   URL: ${testCase.url}`);
  console.log(`   Spec: ${testCase.extractionSpec}`);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}/api/scrape`, {
      url: testCase.url,
      extractionSpec: testCase.extractionSpec
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const processingTime = Date.now() - startTime;
    const result = response.data;
    
    if (result.success) {
      console.log(`   ✅ SUCCESS in ${processingTime}ms`);
      
      // Validate adaptive system
      const siteAnalysis = result.metadata?.siteAnalysis;
      if (siteAnalysis) {
        console.log(`   🎯 Site Analysis:`);
        console.log(`      Category: ${siteAnalysis.category} (expected: ${testCase.expectedCategory})`);
        console.log(`      Strategy: ${siteAnalysis.strategy} (expected: ${testCase.expectedStrategy})`);
        console.log(`      Complexity: ${siteAnalysis.complexity} (expected: ${testCase.expectedComplexity})`);
        
        // Validate predictions
        const categoryMatch = siteAnalysis.category === testCase.expectedCategory ? '✅' : '⚠️';
        const strategyMatch = siteAnalysis.strategy === testCase.expectedStrategy ? '✅' : '⚠️';
        const complexityMatch = siteAnalysis.complexity === testCase.expectedComplexity ? '✅' : '⚠️';
        
        console.log(`   ${categoryMatch} Category prediction`);
        console.log(`   ${strategyMatch} Strategy selection`);
        console.log(`   ${complexityMatch} Complexity assessment`);
      }
      
      // Validate data extraction
      const data = result.data;
      if (data) {
        console.log(`   📊 Data Extraction:`);
        console.log(`      Elements found: ${result.metadata?.elementsFound || 0}`);
        console.log(`      Extraction method: ${data.extractionMethod || 'unknown'}`);
        console.log(`      Processing time: ${result.metadata?.processingTime || 0}ms`);
        
        // Check for different data types (for dynamic rendering testing)
        if (data.products && data.products.length > 0) {
          console.log(`   🛍️  Product-like data detected (${data.products.length} items)`);
        }
        if (data.elements && data.elements.length > 0) {
          console.log(`   📝 Generic elements detected (${data.elements.length} items)`);
        }
        
        // Check for structured data indicators
        const hasStructuredData = JSON.stringify(data).includes('"title"') || 
                                 JSON.stringify(data).includes('"text"') ||
                                 JSON.stringify(data).includes('"price"');
        if (hasStructuredData) {
          console.log(`   🏗️  Structured data detected (good for dynamic rendering)`);
        }
      }
      
    } else {
      console.log(`   ❌ FAILED: ${result.error}`);
      if (result.suggestions) {
        console.log(`   💡 Suggestions: ${result.suggestions.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    if (error.response?.data?.error) {
      console.log(`   🔍 Details: ${error.response.data.error}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive End-to-End Tests');
  console.log('===========================================');
  
  for (const testCase of testCases) {
    await runTest(testCase);
    
    // Brief pause between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Adaptive configuration system: Automatically detects site types and selects optimal strategies');
  console.log('- Fallback mechanisms: Tries multiple strategies if initial attempts fail');
  console.log('- Dynamic rendering preparation: Extracts structured data for intelligent display');
  console.log('- Performance optimization: Fast strategies for simple sites, robust approaches for complex ones');
}

// Check if axios is available
async function checkDependencies() {
  try {
    require('axios');
    return true;
  } catch (error) {
    console.log('❌ axios not found. Installing...');
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('npm install axios', (error) => {
        if (error) {
          console.log('💥 Failed to install axios. Please run: npm install axios');
          resolve(false);
        } else {
          console.log('✅ axios installed successfully');
          resolve(true);
        }
      });
    });
  }
}

// Main execution
async function main() {
  const depsOk = await checkDependencies();
  if (!depsOk) {
    process.exit(1);
  }
  
  await runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runAllTests, runTest };
