import { FileText, Quote, AlignLeft, Brain, TrendingUp, Target, Download } from "lucide-react";
import { useState } from "react";
import { ResultInterpreter } from "@/lib/result-interpreter";

interface TextResultsProps {
  readonly data: readonly string[];
  readonly userQuery?: string;
}

export default function TextResults({ data, userQuery = '' }: Readonly<TextResultsProps>) {
  const [viewMode, setViewMode] = useState<'human' | 'technical'>('human');
  
  const isHumanMode = viewMode === 'human';
  const isTechnicalMode = !isHumanMode;

  // Helper functions for rendering
  const getConfidenceBadgeClasses = (confidence: string) => {
    if (confidence === 'high') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    if (confidence === 'medium') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getFindingCardClasses = (confidence: string) => {
    if (confidence === 'high') {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    if (confidence === 'medium') {
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
    return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
  };

  const getImpactBadgeClasses = (impact: string) => {
    if (impact === 'high') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
    if (impact === 'medium') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  const getLengthBadgeClasses = (textLength: number) => {
    if (textLength <= 100) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
    if (textLength <= 500) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  const getLengthLabel = (textLength: number) => {
    if (textLength <= 100) return 'Short';
    if (textLength <= 500) return 'Medium';
    return 'Long';
  };
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Text Content
          </h3>
          <p className="text-gray-500 dark:text-gray-400">No text content found</p>
        </div>
      </div>
    );
  }

  // Convert data to ExtractedData format for interpretation
  const extractedData = {
    texts: [...data],
    images: [],
    links: [],
    products: [],
    emails: [],
    phones: [],
    social: []
  };

  const interpreter = new ResultInterpreter(extractedData, userQuery);
  const humanResults = interpreter.interpretResults();

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'json' | 'txt') => {
    // Temporarily disabled export functionality
    console.log('Export requested:', format, 'Data:', data.length, 'items');
    alert(`Export to ${format} requested - functionality temporarily disabled`);
  };

  if (isHumanMode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Header with mode toggle */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Text Content Analysis
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('human')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    isHumanMode
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Insights
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    isTechnicalMode
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Technical
                </button>
              </div>
              
              {/* Export Menu */}
              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleExport('txt')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Text Summary (.txt)
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Business Report (.pdf)
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Data Analysis (.csv)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Content Overview
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {humanResults.overview}
            </p>
          </div>

          {/* Key Findings */}
          {humanResults.keyFindings.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Key Findings
              </h4>
              <div className="space-y-3">
                {humanResults.keyFindings.map((finding, index) => (
                  <div
                    key={`finding-${finding.title}-${index}`}
                    className={`p-3 rounded-lg border-l-4 ${getFindingCardClasses(finding.confidence)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {finding.title}
                      </h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceBadgeClasses(finding.confidence)}`}>
                        {finding.confidence}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {finding.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Insights */}
          {humanResults.insights.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Business Insights
              </h4>
              <div className="space-y-3">
                {humanResults.insights.map((insight, index) => (
                  <div
                    key={`insight-${insight.category}-${index}`}
                    className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                        {insight.category.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactBadgeClasses(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {insight.insight}
                    </p>
                    {insight.recommendation && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {humanResults.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {humanResults.recommendations.map((rec, index) => (
                  <li
                    key={`recommendation-${index}-${rec.slice(0, 20)}`}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-500 mt-1">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Technical view (original format with enhancements)

  // Filter and categorize text content
  const shortTexts = data.filter(text => text.length <= 100);
  const mediumTexts = data.filter(text => text.length > 100 && text.length <= 500);
  const longTexts = data.filter(text => text.length > 500);

  const renderTextItem = (text: string, index: number) => {
    const isQuote = text.includes('"') || text.includes("'");
    const wordCount = text.split(/\s+/).length;
    const lengthLabel = getLengthLabel(text.length);
    const lengthBadgeClasses = getLengthBadgeClasses(text.length);
    
    return (
      <div
        key={`text-${index}-${text.slice(0, 20)}`}
        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1">
            {isQuote ? (
              <Quote className="w-4 h-4 text-blue-500" />
            ) : (
              <AlignLeft className="w-4 h-4 text-green-500" />
            )}
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
              {wordCount} words
            </span>
          </div>
          <span className={`px-2 py-1 text-xs rounded ${lengthBadgeClasses}`}>
            {lengthLabel}
          </span>
        </div>
        <p className="text-sm leading-relaxed line-clamp-4">
          {text.trim()}
        </p>
        {text.length > 200 && (
          <details className="mt-2">
            <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
              Show full text...
            </summary>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Text Content ({data.length} items)
        </h3>
        <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
          {shortTexts.length > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded">
              {shortTexts.length} short
            </span>
          )}
          {mediumTexts.length > 0 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
              {mediumTexts.length} medium
            </span>
          )}
          {longTexts.length > 0 && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded">
              {longTexts.length} long
            </span>
          )}
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.slice(0, 20).map(renderTextItem)}
          {data.length > 20 && (
            <div className="text-center p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing first 20 of {data.length} text items
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
