'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch,  
  FiLoader, 
  FiCheck, 
  FiX, 
  FiExternalLink 
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import type {  ExtractedData, ScrapeResponse } from '@/types/scraping';
import ResultDisplay from './results/ResultDisplay';

interface ScrapingInterfaceProps {
  className?: string;
}

type ScrapeStatus = 'idle' | 'validating' | 'scraping' | 'completed' | 'error';

const ScrapingInterface: React.FC<ScrapingInterfaceProps> = ({ className }) => {
  const [url, setUrl] = useState<string>('');
  const [extractionSpec, setExtractionSpec] = useState<string>('');
  const [status, setStatus] = useState<ScrapeStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<ExtractedData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setErrorMessage('');
  }, []);

  const handleExtractionSpecChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtractionSpec(event.target.value);
  }, []);

  const handleUrlKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Call handleStartScraping directly without dependencies
      if (!url.trim() || !extractionSpec.trim()) {
        setErrorMessage('Please provide both URL and extraction specification');
        return;
      }

      try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
          setErrorMessage('Please enter a valid URL');
          return;
        }
      } catch {
        setErrorMessage('Please enter a valid URL');
        return;
      }

      setStatus('validating');
      setProgress(10);
      setResult(null);
      setErrorMessage('');

      // Start the scraping process
      fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          extractionSpec: extractionSpec.trim(),
        }),
      })
      .then(async (response) => {
        setProgress(80);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          setResult(data.data);
          setStatus('completed');
          setProgress(100);
        } else {
          throw new Error(data.error ?? 'Scraping failed');
        }
      })
      .catch((error) => {
        setStatus('error');
        setProgress(0);
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      });
    }
  }, [url, extractionSpec]);

  const handleSpecKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.metaKey) {
      event.preventDefault();
      // Call the same logic as handleUrlKeyDown for consistency
      if (!url.trim() || !extractionSpec.trim()) {
        setErrorMessage('Please provide both URL and extraction specification');
        return;
      }

      try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
          setErrorMessage('Please enter a valid URL');
          return;
        }
      } catch {
        setErrorMessage('Please enter a valid URL');
        return;
      }

      setStatus('validating');
      setProgress(10);
      setResult(null);
      setErrorMessage('');

      // Start the scraping process
      fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          extractionSpec: extractionSpec.trim(),
        }),
      })
      .then(async (response) => {
        setProgress(80);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          setResult(data.data);
          setStatus('completed');
          setProgress(100);
        } else {
          throw new Error(data.error ?? 'Scraping failed');
        }
      })
      .catch((error) => {
        setStatus('error');
        setProgress(0);
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      });
    }
  }, [url, extractionSpec]);

  const validateUrl = useCallback((urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  const handleStartScraping = useCallback(async () => {
    if (!url.trim() || !extractionSpec.trim()) {
      setErrorMessage('Please provide both URL and extraction specification');
      return;
    }

    if (!validateUrl(url)) {
      setErrorMessage('Please enter a valid URL');
      return;
    }

    setStatus('validating');
    setProgress(10);
    setResult(null);
    setErrorMessage('');

    try {
      setStatus('scraping');
      setProgress(30);

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          extractionSpec: extractionSpec.trim(),
        }),
      });

      setProgress(80);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ScrapeResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
        setStatus('completed');
        setProgress(100);
      } else {
        throw new Error(data.error ?? 'Scraping failed');
      }
    } catch (error) {
      setStatus('error');
      setProgress(0);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }, [url, extractionSpec, validateUrl]);

  const handleDownloadResults = useCallback(() => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `scrape-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result]);

  const getStatusIcon = useCallback(() => {
    switch (status) {
      case 'validating':
      case 'scraping':
        return <FiLoader className="animate-spin" />;
      case 'completed':
        return <FiCheck className="text-green-500" />;
      case 'error':
        return <FiX className="text-red-500" />;
      default:
        return <FiSearch />;
    }
  }, [status]);

  const getStatusText = useCallback(() => {
    switch (status) {
      case 'validating':
        return 'Validating URL...';
      case 'scraping':
        return 'Extracting data...';
      case 'completed':
        return 'Scraping completed successfully';
      case 'error':
        return 'Scraping failed';
      default:
        return 'Ready to scrape';
    }
  }, [status]);

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Real-time Web Scraping
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Just dont tell your friends about this
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span>Real-time mode: Results are not saved, refresh to start over</span>
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6"
      >
        {/* URL Input */}
        <div className="space-y-2">
          <label 
            htmlFor="url-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Target Website URL
          </label>
          <div className="relative">
            <FiExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={handleUrlKeyDown}
              placeholder="https://example.com"
              aria-label="Enter the website URL to scrape"
              tabIndex={0}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Extraction Specification */}
        <div className="space-y-2">
          <label 
            htmlFor="extraction-spec"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            What do you want to extract?
          </label>
          <textarea
            id="extraction-spec"
            value={extractionSpec}
            onChange={handleExtractionSpecChange}
            onKeyDown={handleSpecKeyDown}
            placeholder="Describe what data you want to extract, e.g., 'Extract all product titles and prices' or 'Get all image URLs from the gallery'"
            aria-label="Describe what data you want to extract from the website"
            tabIndex={0}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press Cmd+Enter to start scraping
          </p>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleStartScraping}
          disabled={status === 'validating' || status === 'scraping' || !url.trim() || !extractionSpec.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Start scraping the website"
          tabIndex={0}
          className={cn(
            'w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200',
            status === 'validating' || status === 'scraping'
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
            !url.trim() || !extractionSpec.trim()
              ? 'opacity-50 cursor-not-allowed'
              : ''
          )}
        >
          {getStatusIcon()}
          <span>
            {status === 'validating' || status === 'scraping' ? 'Processing...' : 'Start Scraping'}
          </span>
        </motion.button>
      </motion.div>

      {/* Progress Bar */}
      <AnimatePresence>
        {(status === 'validating' || status === 'scraping') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getStatusText()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <FiX className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">
                {errorMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Display */}
      <AnimatePresence>
        {result && status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <ResultDisplay 
              data={result} 
              onDownload={handleDownloadResults}
              userQuery={extractionSpec}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrapingInterface;
