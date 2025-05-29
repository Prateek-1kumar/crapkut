'use client';

import React from 'react';
import Image from 'next/image';
import { FiImage, FiExternalLink, FiCopy, FiCheck, FiEye, FiCode, FiDownload, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultInterpreter, HumanFriendlyResults } from '@/lib/result-interpreter';

interface ImageItem {
  id: number;
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

interface ImageResultsProps {
  images: ImageItem[];
  userQuery?: string;
}

const ImageResults: React.FC<ImageResultsProps> = ({ images, userQuery }) => {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<ImageItem | null>(null);
  const [viewMode, setViewMode] = React.useState<'human' | 'technical'>('human');
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [interpretation, setInterpretation] = React.useState<HumanFriendlyResults | null>(null);

  // Temporarily disable export functionality

  // Generate smart analysis for images
  React.useEffect(() => {
    if (images.length > 0) {
      const data = { 
        images: images.map(img => ({ 
          src: img.src, 
          alt: img.alt, 
          width: img.width,
          height: img.height
        })),
        texts: [],
        products: [],
        links: []
      };
      const interpreter = new ResultInterpreter(data, userQuery ?? '');
      const result = interpreter.interpretResults();
      setInterpretation(result);
    }
  }, [images, userQuery]);

  const handleCopyUrl = async (url: string, id: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'summary') => {
    try {
      const data = { 
        images: images.map(img => ({ 
          id: img.id,
          src: img.src, 
          alt: img.alt, 
          width: img.width,
          height: img.height
        })),
        extractedAt: new Date().toISOString(),
        sourceUrl: 'image-analysis'
      };
      
      // Temporarily disabled export functionality
      console.log('Export requested:', format, 'Data:', data);
      alert(`Export to ${format} requested - functionality temporarily disabled`);
      
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getImageInsights = () => {
    if (!interpretation) return null;

    const imageAnalysis = analyzeImages();
    const contentInsights = getContentInsights();

    return {
      imageAnalysis,
      contentInsights,
      keyFindings: interpretation.keyFindings.filter((f) => 
        f.description?.toLowerCase().includes('image') ?? 
        f.description?.toLowerCase().includes('visual') ?? false
      )
    };
  };

  const analyzeImages = () => {
    const validImages = images.filter(img => isValidImageUrl(img.src));
    const imagesWithAlt = images.filter(img => img.alt && img.alt.trim() !== '');
    const imagesWithDimensions = images.filter(img => img.width && img.height);

    const imageTypes = images.map(img => {
      const extension = img.src.split('.').pop()?.toLowerCase();
      return extension ?? 'unknown';
    });

    const typeCount = imageTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: images.length,
      valid: validImages.length,
      withAlt: imagesWithAlt.length,
      withDimensions: imagesWithDimensions.length,
      typeDistribution: typeCount
    };
  };

  const getContentInsights = () => {
    const insights = [];
    const analysis = analyzeImages();

    if (analysis.withAlt / analysis.total > 0.8) {
      insights.push('Excellent accessibility: Most images have descriptive alt text');
    } else if (analysis.withAlt / analysis.total > 0.5) {
      insights.push('Good accessibility: Many images have alt text, but some could be improved');
    } else {
      insights.push('Accessibility concern: Many images lack descriptive alt text');
    }

    if (analysis.withDimensions / analysis.total > 0.7) {
      insights.push('Well-structured: Most images have specified dimensions');
    }

    const commonTypes = Object.entries(analysis.typeDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    if (commonTypes.length > 0) {
      insights.push(`Primary image formats: ${commonTypes.join(', ')}`);
    }

    return insights;
  };

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      const imageExtensionRegex = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
      return imageExtensionRegex.exec(url) !== null;
    } catch {
      return false;
    }
  };

  const formatDimensions = (width?: string | number, height?: string | number) => {
    if (!width || !height || width === 'unknown' || height === 'unknown') {
      return 'Unknown size';
    }
    return `${width} × ${height}`;
  };

  const insights = getImageInsights();

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiImage className="text-blue-600 dark:text-blue-400" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Images ({images.length})
          </h4>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('human')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'human'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Human insights view"
            >
              🧠 Insights
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'technical'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Technical view"
            >
              <FiCode className="w-4 h-4" />
              Technical
            </button>
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <FiDownload className="w-4 h-4" />
              Export
              <FiChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('summary')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      📄 Executive Summary
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      📊 Excel Spreadsheet
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      📋 CSV Data
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      🔧 JSON Format
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'human' && insights ? (
          <motion.div
            key="human-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Image Analysis Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                🖼️ Image Analysis Overview
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {insights.imageAnalysis.total}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Total Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {insights.imageAnalysis.valid}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Valid URLs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {insights.imageAnalysis.withAlt}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">With Alt Text</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round((insights.imageAnalysis.withAlt / insights.imageAnalysis.total) * 100)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Accessibility</div>
                </div>
              </div>
            </div>

            {/* Content Insights */}
            {insights.contentInsights.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  💡 Content Insights
                </h5>
                <ul className="space-y-2">
                  {insights.contentInsights.map((insight: string, idx: number) => (
                    <li key={`insight-${idx}-${insight.slice(0, 20)}`} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Image Type Distribution */}
            {Object.keys(insights.imageAnalysis.typeDistribution).length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  📊 Image Format Distribution
                </h5>
                <div className="space-y-2">
                  {Object.entries(insights.imageAnalysis.typeDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {type === 'unknown' ? 'Unknown/Other' : `.${type}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                              style={{
                                width: `${(count / insights.imageAnalysis.total) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 min-w-[2rem] text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Key Findings */}
            {insights.keyFindings.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  🎯 Key Findings
                </h5>
                <ul className="space-y-2">
                  {insights.keyFindings.map((finding, idx: number) => (
                    <li key={`finding-${idx}-${finding.description?.slice(0, 20) ?? idx}`} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{finding.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="technical-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative group">
                    {isValidImageUrl(image.src) ? (
                      <>
                        <Image
                          src={image.src}
                          alt={image.alt ?? 'Extracted image'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <FiImage className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-2">Failed to load</span>
                        </div>
                        
                        {/* Overlay controls */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => setSelectedImage(image)}
                            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="View full size"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 text-center px-2">Invalid or broken image URL</span>
                      </div>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                        {image.alt ?? 'No alt text'}
                      </p>
                      <button
                        onClick={() => handleCopyUrl(image.src, image.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                        title="Copy image URL"
                      >
                        {copiedId === image.id ? (
                          <FiCheck className="w-3 h-3 text-green-500" />
                        ) : (
                          <FiCopy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDimensions(image.width, image.height)}
                    </div>

                    <a
                      href={image.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FiExternalLink className="w-3 h-3" />
                      Open
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image modal"
          tabIndex={-1}
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSelectedImage(null);
            }
          }}
        >
          <div className="max-w-4xl max-h-full relative">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt ?? 'Full size image'}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              priority
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No images found</p>
        </div>
      )}
    </div>
  );
};

export default ImageResults;
