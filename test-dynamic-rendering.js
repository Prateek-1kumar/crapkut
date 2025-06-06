/**
 * Test script to verify the dynamic rendering system functionality
 */

// Test data samples for different types of content
const testDatasets = {
  // E-commerce product data
  products: [
    {
      name: "Premium Wireless Headphones",
      price: "$199.99",
      rating: "4.5/5",
      image: "https://example.com/headphones.jpg",
      url: "https://example.com/products/headphones",
      description: "High-quality wireless headphones with noise cancellation"
    },
    {
      name: "Smart Watch Series X",
      price: "$299.99", 
      rating: "4.8/5",
      image: "https://example.com/watch.jpg",
      url: "https://example.com/products/watch",
      description: "Advanced fitness tracking and smart notifications"
    }
  ],

  // News articles
  articles: [
    {
      title: "Breaking: Tech Innovation Reaches New Heights",
      author: "Jane Smith",
      date: "2025-06-06",
      url: "https://example.com/news/tech-innovation",
      summary: "Latest developments in artificial intelligence and machine learning"
    },
    {
      title: "Market Analysis: Future Trends in Technology",
      author: "John Doe", 
      date: "2025-06-05",
      url: "https://example.com/news/market-analysis",
      summary: "Expert predictions for the technology sector in 2025"
    }
  ],

  // Contact information
  contacts: [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1-555-0123",
      company: "Tech Solutions Inc",
      role: "Senior Developer"
    },
    {
      name: "Bob Wilson",
      email: "bob@example.com", 
      phone: "+1-555-0456",
      company: "Design Studio Pro",
      role: "Creative Director"
    }
  ],

  // Mixed tabular data
  employees: [
    {
      id: 1,
      name: "Sarah Connor",
      department: "Engineering",
      salary: 95000,
      hire_date: "2023-01-15",
      email: "sarah@company.com",
      status: "Active"
    },
    {
      id: 2,
      name: "Mike Davis",
      department: "Marketing", 
      salary: 75000,
      hire_date: "2023-03-22",
      email: "mike@company.com",
      status: "Active"
    }
  ]
};

console.log('Dynamic Rendering Test Data Generated');
console.log('Available test datasets:', Object.keys(testDatasets));
console.log('\nTo test:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to http://localhost:3002');
console.log('3. Try scraping sites with different data structures');
console.log('4. Observe how the system adapts rendering based on content');

// Export for potential use in other test scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testDatasets;
}
