import React, { useState } from "react";
import { Heading, Hash, FileText, Sparkles, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Download, ChevronDown } from "lucide-react";
import { SimpleExporter } from "@/lib/simple-export";

interface HeadingResultsProps {
  data: string[];
  userQuery?: string;
}

interface ParsedHeading {
  text: string;
  level: number;
  id?: string;
}

interface ContentStructureInsights {
  hierarchy: string;
  accessibility: string;
  seoOptimization: string;
  contentOrganization: string;
  readability: string;
  recommendations: string[];
}

export default function HeadingResults({ data, userQuery = "" }: Readonly<HeadingResultsProps>) {
  const [viewMode, setViewMode] = useState<'human' | 'technical'>('human');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const isHumanMode = viewMode === 'human';
  const isTechnicalMode = viewMode === 'technical';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Heading className="w-5 h-5" />
            Content Structure Analysis
          </h3>
          <p className="text-gray-500 dark:text-gray-400">No headings found</p>
        </div>
      </div>
    );
  }

  // Helper function to determine heading level from HTML tags
  const getHeadingLevelFromTags = (heading: string): number => {
    const tagMatches = [
      { regex: /<h1[^>]*>/i, level: 1 },
      { regex: /<h2[^>]*>/i, level: 2 },
      { regex: /<h3[^>]*>/i, level: 3 },
      { regex: /<h4[^>]*>/i, level: 4 },
      { regex: /<h5[^>]*>/i, level: 5 },
      { regex: /<h6[^>]*>/i, level: 6 }
    ];

    for (const { regex, level } of tagMatches) {
      if (regex.exec(heading)) {
        return level;
      }
    }
    return 0; // No tag found
  };

  // Helper function to infer heading level from content patterns
  const inferHeadingLevel = (text: string): number => {
    if (text.length < 30 && text.toUpperCase() === text) {
      return 1;
    }
    if (text.length < 50) return 2;
    if (text.length < 80) return 3;
    return 4;
  };

  // Parse heading levels and create structure
  const parseHeadings = (headings: string[]): ParsedHeading[] => {
    return headings.map((heading, index) => {
      const text = heading.replace(/<[^>]*>/g, '').trim();
      const tagLevel = getHeadingLevelFromTags(heading);
      const level = tagLevel > 0 ? tagLevel : inferHeadingLevel(text);
      
      return {
        text,
        level,
        id: `heading-${index}`
      };
    });
  };

  const parsedHeadings = parseHeadings(data);

  // Helper function to get accessibility status
  const getAccessibilityStatus = (hasH1: boolean, h1Count: number): string => {
    if (hasH1 && h1Count === 1) {
      return "Good: Single H1 tag provides clear page structure";
    }
    if (h1Count === 0) {
      return "Poor: Missing H1 tag for main page title";
    }
    return "Warning: Multiple H1 tags detected";
  };

  // Helper function to generate recommendations
  const generateRecommendations = (hasH1: boolean, h1Count: number, hasProperHierarchy: boolean, avgLength: number, headingCount: number): string[] => {
    const recommendations: string[] = [];
    if (!hasH1) recommendations.push("Add an H1 tag for the main page title");
    if (h1Count > 1) recommendations.push("Use only one H1 tag per page");
    if (!hasProperHierarchy) recommendations.push("Create a logical heading hierarchy (H1 → H2 → H3)");
    if (avgLength > 80) recommendations.push("Shorten overly long headings");
    if (headingCount < 3) recommendations.push("Add more headings to improve content structure");
    return recommendations;
  };

  // Generate content structure insights
  const generateContentInsights = (): ContentStructureInsights => {
    const levelCounts = parsedHeadings.reduce((acc, heading) => {
      acc[heading.level] = (acc[heading.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const hasH1 = levelCounts[1] > 0;
    const hasProperHierarchy = Object.keys(levelCounts).length > 1;
    const h1Count = levelCounts[1] || 0;
    const avgLength = parsedHeadings.reduce((sum, h) => sum + h.text.length, 0) / parsedHeadings.length;

    const hierarchy = hasProperHierarchy 
      ? `Well-structured with ${Object.keys(levelCounts).length} heading levels`
      : "Limited hierarchy - consider adding subheadings";

    const accessibility = getAccessibilityStatus(hasH1, h1Count);

    const seoOptimization = hasH1 && hasProperHierarchy
      ? "Good: Clear heading hierarchy supports SEO"
      : "Needs improvement: Add proper heading structure";

    const contentOrganization = parsedHeadings.length > 3
      ? "Well-organized with multiple content sections"
      : "Minimal organization - consider adding more structure";

    const readability = avgLength < 60
      ? "Good: Concise and scannable headings"
      : "Consider shortening headings for better readability";

    const recommendations = generateRecommendations(hasH1, h1Count, hasProperHierarchy, avgLength, parsedHeadings.length);

    return {
      hierarchy,
      accessibility,
      seoOptimization,
      contentOrganization,
      readability,
      recommendations
    };
  };

  const insights = generateContentInsights();

  // Group by levels for statistics
  const levelCounts = parsedHeadings.reduce((acc, heading) => {
    acc[heading.level] = (acc[heading.level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const getLevelColor = (level: number) => {
    const colors = {
      1: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300",
      2: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300",
      3: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300",
      4: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300",
      5: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
      6: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300";
  };

  const getLevelIcon = (level: number) => {
    return (
      <div className="flex items-center gap-1">
        <Hash className="w-3 h-3" />
        <span className="text-xs font-mono">H{level}</span>
      </div>
    );
  };

  const handleExport = async (format: string) => {
    try {
      const exportData = {
        headings: data.map((heading, index) => ({
          text: heading.replace(/<[^>]*>/g, '').trim(),
          level: 1, // Default level, could be parsed better
          id: index
        }))
      };

      switch (format) {
        case 'csv':
          SimpleExporter.exportToCSV(exportData, 'headings.csv');
          break;
        case 'json':
          SimpleExporter.exportToJSON(exportData, 'headings.json');
          break;
        case 'summary':
          SimpleExporter.exportSummary(exportData, userQuery, 'headings-summary.txt');
          break;
        default:
          console.log(`Export format ${format} not yet implemented`);
          alert(`Export format ${format} will be available soon`);
      }
      
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getHierarchyScore = () => {
    const hasH1 = levelCounts[1] > 0;
    const hasProperHierarchy = Object.keys(levelCounts).length > 1;
    const h1Count = levelCounts[1] || 0;
    
    let score = 0;
    if (hasH1 && h1Count === 1) score += 40;
    if (hasProperHierarchy) score += 30;
    if (parsedHeadings.length >= 3) score += 20;
    if (Object.keys(levelCounts).length >= 3) score += 10;
    
    return Math.min(score, 100);
  };

  // Helper function to get score rating
  const getScoreRating = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs work';
  };

  // Helper function to get heading text size based on level
  const getHeadingTextSize = (level: number): string => {
    if (level === 1) return 'text-lg';
    if (level === 2) return 'text-base';
    return 'text-sm';
  };

  const hierarchyScore = getHierarchyScore();

  if (isHumanMode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Content Structure Insights
            </h3>
            <div className="flex items-center gap-2">
              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-2">
                      {['summary', 'pdf', 'excel', 'csv', 'word', 'json'].map((format) => (
                        <button
                          key={format}
                          onClick={() => handleExport(format)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          Export as {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('human')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isHumanMode
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Insights
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isTechnicalMode
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  Technical
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Structure Score</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{hierarchyScore}%</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {getScoreRating(hierarchyScore)}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900 dark:text-green-100">Total Headings</span>
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{parsedHeadings.length}</div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {Object.keys(levelCounts).length} levels used
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Hierarchy Depth</span>
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                H1-H{Math.max(...Object.keys(levelCounts).map(Number))}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {Object.keys(levelCounts).length > 2 ? 'Well structured' : 'Limited depth'}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Content Structure Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Hash className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Hierarchy Quality</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.hierarchy}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Accessibility</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.accessibility}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">SEO Optimization</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.seoOptimization}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Content Organization</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.contentOrganization}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Readability</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.readability}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation) => (
                  <div key={recommendation} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-amber-800 dark:text-amber-200">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level Distribution */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Heading Level Distribution</h4>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(levelCounts).map(([level, count]) => (
                <div key={level} className={`px-3 py-2 rounded-lg border ${getLevelColor(Number(level))}`}>
                  <div className="flex items-center gap-2">
                    {getLevelIcon(Number(level))}
                    <span className="font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Technical mode
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Heading className="w-5 h-5" />
            Headings Structure ({parsedHeadings.length} headings)
          </h3>
          <div className="flex items-center gap-2">
            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="p-2">
                    {['json'].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        Export as {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('human')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isHumanMode
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                Insights
              </button>
              <button
                onClick={() => setViewMode('technical')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isTechnicalMode
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Technical
              </button>
            </div>
          </div>
        </div>

        {/* Level Statistics */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(levelCounts).map(([level, count]) => (
            <span key={level} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
              H{level}: {count}
            </span>
          ))}
        </div>

        {/* Headings List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {parsedHeadings.map((heading) => (
            <div
              key={heading.id}
              className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              style={{ marginLeft: `${(heading.level - 1) * 16}px` }}
            >
              <div className={`px-2 py-1 rounded text-xs border ${getLevelColor(heading.level)}`}>
                {getLevelIcon(heading.level)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium leading-tight ${getHeadingTextSize(heading.level)}`}>
                  {heading.text}
                </p>
                {heading.text.length > 60 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {heading.text.length} characters
                  </p>
                )}
              </div>
            </div>
          ))}
          {parsedHeadings.length > 50 && (
            <div className="text-center p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing all {parsedHeadings.length} headings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
