'use client';

import React from 'react';
import { FiBox, FiTag, FiCopy, FiCheck, FiCode, FiDownload, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultInterpreter } from '@/lib/result-interpreter';
import { SimpleExporter } from '@/lib/simple-export';
import type { HumanFriendlyResults } from '@/lib/result-interpreter';

interface Product {
  id: number;
  title?: string;
  price?: string;
  element?: string;
  className?: string;
}

interface ProductResultsProps {
  products: Product[];
  userQuery?: string;
}

const ProductResults: React.FC<ProductResultsProps> = ({ products, userQuery }) => {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<'human' | 'technical'>('human');
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [interpretation, setInterpretation] = React.useState<HumanFriendlyResults | null>(null);

  // Generate smart analysis for products
  React.useEffect(() => {
    if (products.length > 0) {
      // Convert to the format expected by ResultInterpreter
      const data = { 
        products: products.map(p => ({ 
          title: p.title, 
          price: p.price,
          rating: 0 // Default rating since not available in current interface
        })),
        texts: [],
        images: [],
        links: []
      };
      const interpreter = new ResultInterpreter(data, userQuery ?? '');
      const result = interpreter.interpretResults();
      setInterpretation(result);
    }
  }, [products, userQuery]);

  const handleCopyText = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'summary') => {
    try {
      const exportData = {
        products: products.map(p => ({
          title: p.title,
          price: p.price,
          id: p.id
        }))
      };
      
      switch (format) {
        case 'csv':
          SimpleExporter.exportToCSV(exportData, 'products.csv');
          break;
        case 'json':
          SimpleExporter.exportToJSON(exportData, 'products.json');
          break;
        case 'summary':
          SimpleExporter.exportSummary(exportData, userQuery ?? '', 'products-summary.txt');
          break;
        case 'excel':
          SimpleExporter.exportToCSV(exportData, 'products.csv');
          alert('Excel format not yet implemented. CSV file downloaded instead.');
          break;
      }
      
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getProductInsights = () => {
    if (!interpretation) return null;

    const priceAnalysis = analyzePrices();
    const marketInsights = getMarketInsights();

    return {
      priceAnalysis,
      marketInsights,
      keyFindings: interpretation.keyFindings.filter((f) => {
        const hasProductContent = f.title?.toLowerCase().includes('product') ?? false;
        const hasPriceContent = f.title?.toLowerCase().includes('price') ?? false;
        return hasProductContent ? true : hasPriceContent;
      })
    };
  };

  const analyzePrices = () => {
    const prices = products
      .map(p => p.price)
      .filter(price => price && price !== 'No price found')
      .map(price => {
        const cleanPrice = price?.replace(/[^0-9.,]/g, '') ?? '';
        const numericPrice = parseFloat(cleanPrice.replace(',', '.'));
        return isNaN(numericPrice) ? null : numericPrice;
      })
      .filter(Boolean) as number[];

    if (prices.length === 0) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      count: prices.length,
      range: { min, max },
      average: avg,
      distribution: prices.length > 5 ? 'varied' : 'limited'
    };
  };

  const getMarketInsights = () => {
    const insights = [];
    const priceAnalysis = analyzePrices();

    if (priceAnalysis) {
      if (priceAnalysis.range.max / priceAnalysis.range.min > 3) {
        insights.push('Wide price range suggests diverse product tiers');
      }
      if (priceAnalysis.count > 10) {
        insights.push('Large product catalog indicates established marketplace');
      }
    }

    const titles = products.map(p => p.title).filter(Boolean);
    const commonWords = getCommonWords(titles);
    if (commonWords.length > 0) {
      insights.push(`Common product themes: ${commonWords.join(', ')}`);
    }

    return insights;
  };

  const getCommonWords = (titles: (string | undefined)[]): string[] => {
    const words: { [key: string]: number } = {};
    titles.forEach(title => {
      if (title) {
        title.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 3) {
            words[word] = (words[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(words)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
  };

  const formatPrice = (price?: string) => {
    if (!price || price === 'No price found') {
      return <span className="text-gray-400 dark:text-gray-500 italic">Price not available</span>;
    }
    
    // Try to identify currency and format nicely
    const cleanPrice = price.trim();
    if (/^\$?\d+([.,]\d{2})?$/.exec(cleanPrice)) {
      return <span className="text-green-600 dark:text-green-400 font-semibold">{cleanPrice}</span>;
    }
    
    return <span className="text-gray-700 dark:text-gray-300">{cleanPrice}</span>;
  };

  const productInsights = getProductInsights();

  return (
    <div className="space-y-4">
      {/* Header with mode toggle and export */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiBox className="text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Products ({products.length})
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('human')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'human'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              🧠 Insights
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'technical'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <FiCode className="w-4 h-4" />
              Technical
            </button>
          </div>

          {/* Export menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Export
              <FiChevronDown className="w-3 h-3" />
            </button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                >
                  <button
                    onClick={() => handleExport('summary')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    📊 Executive Summary
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    📈 Excel Spreadsheet
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    📋 CSV Data
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    💾 Structured JSON
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Human-friendly insights mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'human' && productInsights && (
          <motion.div
            key="human"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Market Analysis Panel */}
            {productInsights.priceAnalysis && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  💰 Price Analysis
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {productInsights.priceAnalysis.count}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Products with pricing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${productInsights.priceAnalysis.range.min.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Minimum price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${productInsights.priceAnalysis.range.max.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Maximum price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${productInsights.priceAnalysis.average.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average price</div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Insights */}
            {productInsights.marketInsights.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                  🎯 Market Insights
                </h5>
                <ul className="space-y-2">
                  {productInsights.marketInsights.map((insight, index) => (
                    <li key={`insight-${insight.substring(0, 20)}-${index}`} className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Findings */}
            {interpretation?.keyFindings && interpretation.keyFindings.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                  🔍 Key Findings
                </h5>
                <div className="space-y-3">
                  {interpretation.keyFindings.slice(0, 3).map((finding, index: number) => (
                    <div key={`finding-${finding.title?.substring(0, 20)}-${index}`} className="border-l-4 border-purple-400 pl-3">
                      <h6 className="font-medium text-purple-700 dark:text-purple-300">{finding.title}</h6>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{finding.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Technical/Raw data mode */}
        {viewMode === 'technical' && (
          <motion.div
            key="technical"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Product Title */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                          {product.title && product.title !== 'No title found' 
                            ? product.title 
                            : <span className="text-gray-400 italic">Title not available</span>
                          }
                        </h5>
                        <button
                          onClick={() => handleCopyText(product.title ?? '', product.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Copy title"
                        >
                          {copiedId === product.id ? (
                            <FiCheck className="w-4 h-4 text-green-500" />
                          ) : (
                            <FiCopy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <FiTag className="w-4 h-4 text-gray-400" />
                      {formatPrice(product.price)}
                    </div>

                    {/* Metadata */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Element: {product.element ?? 'Unknown'}</span>
                        <span>ID: {product.id}</span>
                      </div>
                      {product.className && (
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 truncate">
                          Class: {product.className}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiBox className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductResults;
