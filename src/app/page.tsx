'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiClock } from 'react-icons/fi';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import type { SearchResponse, ScrapeResult, VendorError } from '@/lib/types';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ScrapeResult[]>([]);
  const [errors, setErrors] = useState<VendorError[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timing, setTiming] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    setErrors([]);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setProducts(data.results);
        setErrors(data.errors);
        setTiming(data.timing.totalMs);
      } else {
        setProducts([]);
        setErrors([{ vendor: 'amazon', message: 'Search failed. Please try again.' }]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
      setErrors([{ vendor: 'amazon', message: 'Network error. Please check your connection.' }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Find the <span className="text-gradient">Best Prices</span>
          <br />
          Across India
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8">
          Compare prices from Amazon, Flipkart, Myntra, Croma, Ajio, and more.
          One search, all platforms, best deals.
        </p>

        {/* Vendor logos */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 opacity-60">
          {['Amazon', 'Flipkart', 'eBay', 'Myntra', 'Croma', 'Ajio', 'Snapdeal'].map((vendor) => (
            <span
              key={vendor}
              className="px-3 py-1 text-sm bg-[var(--color-bg-tertiary)] rounded-full text-[var(--color-text-muted)]"
            >
              {vendor}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} isLoading={isLoading} className="mb-12" />

      {/* Timing info */}
      <AnimatePresence>
        {timing && !isLoading && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] mb-6"
          >
            <FiClock className="w-4 h-4" />
            <span>Searched all platforms in {(timing / 1000).toFixed(1)}s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors (partial failures) */}
      <AnimatePresence>
        {errors.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-200">
                  Some platforms could not be searched: {errors.map(e => e.vendor).join(', ')}
                </p>
              </p>
              <p className="text-xs text-yellow-200/60 mt-1">
                Showing results from available platforms.
              </p>
            </div>
          </div>
          </motion.div>
        )}
    </AnimatePresence>

      {/* Results */ }
  <ProductGrid products={products} isLoading={isLoading} />

  {/* Empty state */ }
  <AnimatePresence>
    {hasSearched && !isLoading && products.length === 0 && errors.length === 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          No products found for &ldquo;{searchQuery}&rdquo;
        </h3>
        <p className="text-[var(--color-text-muted)]">
          Try searching for a different product or check your spelling.
        </p>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Initial state */ }
  <AnimatePresence>
    {!hasSearched && !isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          Start comparing prices
        </h3>
        <p className="text-[var(--color-text-muted)]">
          Enter a product name above to find the best deals across all platforms.
        </p>
      </motion.div>
    )}
  </AnimatePresence>
    </div >
  );
}
