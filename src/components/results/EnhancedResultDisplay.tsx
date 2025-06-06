/**
 * Enhanced Result Display with Dynamic Rendering
 * Replaces the hardcoded component selection with intelligent adaptive rendering
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiEye, FiCode, FiZap } from 'react-icons/fi';
import type { ExtractedData } from '@/types/scraping';
import DynamicRenderer from './dynamic/DynamicRenderer';
import ResultSummary from './ResultSummary';

interface EnhancedResultDisplayProps {
  data: ExtractedData;
  onDownload: () => void;
  userQuery?: string;
}

const EnhancedResultDisplay: React.FC<EnhancedResultDisplayProps> = ({ 
  data, 
  onDownload, 
  userQuery 
}) => {
  const [viewMode, setViewMode] = React.useState<'adaptive' | 'json'>('adaptive');

  // Convert ExtractedData to array format for dynamic analysis
  const getAllDataAsArray = React.useMemo(() => {
    const allData: unknown[] = [];

    // Add products
    if (data.products && data.products.length > 0) {
      allData.push(...data.products);
    }

    // Add images
    if (data.images && data.images.length > 0) {
      allData.push(...data.images);
    }

    // Add links
    if (data.links && data.links.length > 0) {
      allData.push(...data.links);
    }

    // Add generic results
    if (data.genericResults && data.genericResults.length > 0) {
      allData.push(...data.genericResults);
    }

    // Add elements
    if (data.elements && data.elements.length > 0) {
      allData.push(...data.elements);
    }

    // If we have structured data like headings or textContent, create objects
    if (data.headings && data.headings.length > 0) {
      data.headings.forEach((heading, index) => {
        allData.push({
          id: `heading-${index}`,
          type: 'heading',
          content: heading,
          order: index
        });
      });
    }

    if (data.textContent && data.textContent.length > 0) {
      data.textContent.forEach((text, index) => {
        allData.push({
          id: `text-${index}`,
          type: 'text',
          content: text,
          order: index
        });
      });
    }

    // If no structured data, create a single object with all available data
    if (allData.length === 0) {
      const dataEntries = Object.entries(data).filter(([key]) => 
        !['extractedAt', 'sourceUrl'].includes(key)
      );
      
      if (dataEntries.length > 0) {
        allData.push({
          summary: 'Extracted data summary',
          ...Object.fromEntries(dataEntries)
        });
      }
    }

    return allData;
  }, [data]);

  const renderAdaptiveResults = () => {
    if (getAllDataAsArray.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        >
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No structured data found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            The scraper couldn&apos;t extract any recognizable data patterns from this page.
          </p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary */}
        <ResultSummary data={data} />

        {/* Dynamic Adaptive Rendering */}
        <DynamicRenderer
          data={getAllDataAsArray}
          title="Extracted Data"
          userQuery={userQuery}
          sourceUrl={data.sourceUrl}
          showAnalysis={true}
        />
      </div>
    );
  };

  const renderJsonResults = () => {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FiZap className="text-blue-500" />
          Adaptive Results
        </h3>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('adaptive')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'adaptive'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiEye className="w-4 h-4" />
              <span>Smart</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'json'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiCode className="w-4 h-4" />
              <span>Raw</span>
            </button>
          </div>

          {/* Download Button */}
          <motion.button
            onClick={onDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Download results as JSON"
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FiDownload />
            Export
          </motion.button>
        </div>
      </div>

      {/* Adaptive Indicator */}
      {viewMode === 'adaptive' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-2 text-sm">
            <FiZap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Intelligent Display Active
            </span>
            <span className="text-blue-700 dark:text-blue-300">
              • Auto-analyzing {getAllDataAsArray.length} items for optimal presentation
            </span>
          </div>
        </motion.div>
      )}

      {/* Results Content */}
      <div className="min-h-[200px]">
        {viewMode === 'adaptive' ? renderAdaptiveResults() : renderJsonResults()}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span>Source: {data.sourceUrl}</span>
        <span>•</span>
        <span>Extracted: {new Date(data.extractedAt).toLocaleString()}</span>
        {viewMode === 'adaptive' && (
          <>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400">
              Adaptive Engine: {getAllDataAsArray.length} items analyzed
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedResultDisplay;