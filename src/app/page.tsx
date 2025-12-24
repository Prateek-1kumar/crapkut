'use client';

import { useState, useCallback } from 'react';
import { FiAlertTriangle, FiClock } from 'react-icons/fi';
import SearchBar from '@/components/SearchBar';
import ComparisonView from '@/components/ComparisonView';
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
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Search Section */}
      <div style={{ maxWidth: '700px', margin: '0 auto 2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          Compare Prices Across Stores
        </h1>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* Timing info */}
      {timing && !isLoading && products.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)'
        }}>
          <FiClock size={14} />
          <span>Found {products.length} products in {(timing / 1000).toFixed(1)}s</span>
        </div>
      )}

      {/* Errors (partial failures) */}
      {errors.length > 0 && !isLoading && (
        <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
          <FiAlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Some stores could not be searched:</strong> {errors.map(e => e.vendor).join(', ')}
          </div>
        </div>
      )}

      {/* Results */}
      <ComparisonView products={products} isLoading={isLoading} />

      {/* Empty state */}
      {hasSearched && !isLoading && products.length === 0 && errors.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            No products found for &ldquo;{searchQuery}&rdquo;
          </h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Try a different search term.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!hasSearched && !isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Search for any product
          </h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Enter a product name above to compare prices across stores.
          </p>
        </div>
      )}
    </div>
  );
}
