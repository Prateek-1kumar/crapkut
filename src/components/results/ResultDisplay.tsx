'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiEye, FiCode } from 'react-icons/fi';
import type { ExtractedData } from '@/types/scraping';
import ProductResults from './ProductResults';
import ImageResults from './ImageResults';
import LinkResults from './LinkResults';
import TextResults from './TextResults';
import HeadingResults from './HeadingResults';
import GenericResults from './GenericResults';
import ResultSummary from './ResultSummary';

interface ResultDisplayProps {
  data: ExtractedData;
  onDownload: () => void;
  userQuery?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onDownload, userQuery }) => {
  const [viewMode, setViewMode] = React.useState<'visual' | 'json'>('visual');

  // Determine what types of data we have
  const hasProducts = data.products && data.products.length > 0;
  const hasImages = data.images && data.images.length > 0;
  const hasLinks = data.links && data.links.length > 0;
  const hasHeadings = data.headings && data.headings.length > 0;
  const hasTextContent = data.textContent && data.textContent.length > 0;
  const hasGenericResults = data.genericResults && data.genericResults.length > 0;
  const hasElements = data.elements && data.elements.length > 0;

  const renderVisualResults = () => {
    return (
      <div className="space-y-6">
        {/* Summary */}
        <ResultSummary data={data} />

        {/* Products */}
        {hasProducts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProductResults products={data.products ?? []} userQuery={userQuery} />
          </motion.div>
        )}

        {/* Images */}
        {hasImages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ImageResults images={data.images ?? []} userQuery={userQuery} />
          </motion.div>
        )}

        {/* Links */}
        {hasLinks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LinkResults links={data.links ?? []} userQuery={userQuery} />
          </motion.div>
        )}

        {/* Headings */}
        {hasHeadings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <HeadingResults data={data.headings ?? []} userQuery={userQuery} />
          </motion.div>
        )}

        {/* Text Content */}
        {hasTextContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TextResults data={data.textContent ?? []} userQuery={userQuery} />
          </motion.div>
        )}

        {/* Generic Results */}
        {(hasGenericResults || hasElements) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GenericResults 
              data={data.genericResults ?? data.elements ?? []}
              title="Other Results"
              dataType="items"
              userQuery={userQuery}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {!hasProducts && !hasImages && !hasLinks && !hasHeadings && !hasTextContent && !hasGenericResults && !hasElements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No structured data found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              The scraper couldn&apos;t extract any recognizable data patterns from this page.
            </p>
          </motion.div>
        )}
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
          <FiEye />
          Extraction Results
        </h3>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'json'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiCode className="w-4 h-4" />
            </button>
          </div>

          {/* Download Button */}
          <motion.button
            onClick={onDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Download results as JSON"
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <FiDownload />
            Download
          </motion.button>
        </div>
      </div>

      {/* Results Content */}
      <div className="min-h-[200px]">
        {viewMode === 'visual' ? renderVisualResults() : renderJsonResults()}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span>Source: {data.sourceUrl}</span>
        <span>•</span>
        <span>Extracted: {new Date(data.extractedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ResultDisplay;
