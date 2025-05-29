'use client';

import React from 'react';
import { FiLink, FiExternalLink, FiCopy, FiCheck, FiGlobe, FiCode, FiDownload, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultInterpreter } from '@/lib/result-interpreter';
import { SimpleExporter } from '@/lib/simple-export';
import type { HumanFriendlyResults } from '@/lib/result-interpreter';

interface LinkItem {
  id: number;
  url: string;
  text?: string;
  title?: string;
}

interface LinkResultsProps {
  links: LinkItem[];
  userQuery?: string;
}

const LinkResults: React.FC<LinkResultsProps> = ({ links, userQuery }) => {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<'human' | 'technical'>('human');
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [interpretation, setInterpretation] = React.useState<HumanFriendlyResults | null>(null);

  // Generate smart analysis for links
  React.useEffect(() => {
    if (links.length > 0) {
      const data = { 
        links: links.map(link => ({ 
          url: link.url, 
          text: link.text, 
          title: link.title 
        })),
        images: [],
        texts: [],
        products: []
      };
      const interpreter = new ResultInterpreter(data, userQuery ?? '');
      const result = interpreter.interpretResults();
      setInterpretation(result);
    }
  }, [links, userQuery]);

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
      const exportData = { 
        links: links.map(link => ({ 
          url: link.url, 
          text: link.text, 
          title: link.title 
        }))
      };
      
      switch (format) {
        case 'csv':
          SimpleExporter.exportToCSV(exportData, 'links.csv');
          break;
        case 'json':
          SimpleExporter.exportToJSON(exportData, 'links.json');
          break;
        case 'summary':
          SimpleExporter.exportSummary(exportData, userQuery ?? '', 'links-summary.txt');
          break;
        case 'excel':
          SimpleExporter.exportToCSV(exportData, 'links.csv');
          alert('Excel format not yet implemented. CSV file downloaded instead.');
          break;
      }
      
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const isExternalLink = (url: string) => {
    try {
      return new URL(url).hostname !== window.location.hostname;
    } catch {
      return !url.startsWith('/') && !url.startsWith('#');
    }
  };

  const formatUrl = (url: string) => {
    if (url.startsWith('/')) return `Relative: ${url}`;
    if (url.startsWith('#')) return `Anchor: ${url}`;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const getLinkIcon = (url: string) => {
    if (url.startsWith('#')) return '🔗';
    if (url.startsWith('/')) return '📁';
    if (url.includes('mailto:')) return '📧';
    if (url.includes('tel:')) return '📞';
    return '🌐';
  };

  const getLinkInsights = () => {
    if (!interpretation) return null;

    const linkAnalysis = analyzeLinks();
    const domainInsights = getDomainInsights();

    return {
      linkAnalysis,
      domainInsights,
      keyFindings: interpretation.keyFindings.filter((f) => 
        f.description?.toLowerCase().includes('link') ?? 
        f.description?.toLowerCase().includes('url') ?? false
      )
    };
  };

  const analyzeLinks = () => {
    const externalLinks = links.filter(link => isExternalLink(link.url));
    const internalLinks = links.filter(link => !isExternalLink(link.url));
    const linksWithText = links.filter(link => link.text && link.text.trim() !== '' && link.text !== 'No text');
    
    const linkTypes = {
      external: externalLinks.length,
      internal: internalLinks.length,
      anchors: links.filter(link => link.url.startsWith('#')).length,
      emails: links.filter(link => link.url.includes('mailto:')).length,
      phones: links.filter(link => link.url.includes('tel:')).length
    };

    return {
      total: links.length,
      external: externalLinks.length,
      internal: internalLinks.length,
      withText: linksWithText.length,
      types: linkTypes
    };
  };

  const getDomainInsights = () => {
    const insights = [];
    const analysis = analyzeLinks();
    
    if (analysis.external > analysis.internal) {
      insights.push('Primarily external navigation - this page connects users to other websites');
    } else if (analysis.internal > analysis.external) {
      insights.push('Primarily internal navigation - this page helps users navigate within the site');
    } else {
      insights.push('Balanced mix of internal and external links');
    }

    if (analysis.withText / analysis.total > 0.8) {
      insights.push('Excellent link accessibility: Most links have descriptive text');
    } else if (analysis.withText / analysis.total > 0.5) {
      insights.push('Good link accessibility: Many links have descriptive text');
    } else {
      insights.push('Accessibility concern: Many links lack descriptive text');
    }

    // Domain analysis
    const domains = links
      .filter(link => isExternalLink(link.url))
      .map(link => {
        try {
          return new URL(link.url).hostname;
        } catch {
          return 'unknown';
        }
      })
      .filter(domain => domain !== 'unknown');

    const domainCount = domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDomains = Object.entries(domainCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([domain]) => domain);

    if (topDomains.length > 0) {
      insights.push(`Top external domains: ${topDomains.join(', ')}`);
    }

    return insights;
  };

  // Group links by type
  const externalLinks = links.filter(link => isExternalLink(link.url));
  const internalLinks = links.filter(link => !isExternalLink(link.url));

  const renderLinkGroup = (groupLinks: LinkItem[], title: string, icon: React.ReactNode) => {
    if (groupLinks.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h5 className="font-medium text-gray-900 dark:text-gray-100">
            {title} ({groupLinks.length})
          </h5>
        </div>
        <div className="space-y-2">
          {groupLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Link text/title */}
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getLinkIcon(link.url)}</span>
                    <div className="flex-1 min-w-0">
                      <h6 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {link.text && link.text !== 'No text' ? link.text : (
                          <span className="text-gray-400 italic">No link text</span>
                        )}
                      </h6>
                      {link.title && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {link.title}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {formatUrl(link.url)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopyUrl(link.url, link.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === link.id ? (
                      <FiCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiCopy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={link.url}
                    target={isExternalLink(link.url) ? "_blank" : "_self"}
                    rel={isExternalLink(link.url) ? "noopener noreferrer" : undefined}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Open link"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const insights = getLinkInsights();

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiLink className="text-purple-600 dark:text-purple-400" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Links ({links.length})
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
            {/* Link Analysis Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                🔗 Link Analysis Overview
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {insights.linkAnalysis.total}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Total Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {insights.linkAnalysis.external}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">External</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {insights.linkAnalysis.internal}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Internal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round((insights.linkAnalysis.withText / insights.linkAnalysis.total) * 100)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">With Text</div>
                </div>
              </div>
            </div>

            {/* Domain Insights */}
            {insights.domainInsights.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  💡 Navigation Insights
                </h5>
                <ul className="space-y-2">
                  {insights.domainInsights.map((insight: string, idx: number) => (
                    <li key={`insight-${idx}-${insight.slice(0, 20)}`} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Link Type Distribution */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                📊 Link Type Distribution
              </h5>
              <div className="space-y-2">
                {Object.entries(insights.linkAnalysis.types).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {type === 'anchors' ? 'Page Anchors' : type}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full"
                          style={{
                            width: `${(count / insights.linkAnalysis.total) * 100}%`
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
            className="space-y-6"
          >
            {/* External Links */}
            {renderLinkGroup(
              externalLinks,
              'External Links',
              <FiGlobe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}

            {/* Internal Links */}
            {renderLinkGroup(
              internalLinks,
              'Internal Links',
              <FiLink className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No links found</p>
        </div>
      )}
    </div>
  );
};

export default LinkResults;
