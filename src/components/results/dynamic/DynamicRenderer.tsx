/**
 * Dynamic Renderer - Automatically selects and renders appropriate components
 * based on data structure analysis
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Grid, 
  List, 
  Image, 
  Calendar, 
  TreePine, 
  FileText, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { 
  DataPattern, 
  dataStructureAnalyzer, 
  AnalysisContext 
} from '@/lib/data-structure-analyzer';
import DataTableRenderer from './DataTableRenderer';
import CardGridRenderer from './CardGridRenderer';
import ListGroupRenderer from './ListGroupRenderer';
import AnalysisDisplay from './AnalysisDisplay';

// Placeholder renderers that fall back to ListGroupRenderer
const MediaGalleryRenderer = ListGroupRenderer;
const KeyValueRenderer = ListGroupRenderer;
const TimelineRenderer = ListGroupRenderer;
const HierarchyRenderer = ListGroupRenderer;
const TextBlockRenderer = ListGroupRenderer;
const CustomRenderer = ListGroupRenderer;

interface DynamicRendererProps {
  data: unknown[];
  title?: string;
  userQuery?: string;
  sourceUrl?: string;
  showAnalysis?: boolean;
  className?: string;
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({
  data,
  title,
  userQuery,
  sourceUrl,
  showAnalysis = true,
  className = ''
}) => {
  const [pattern, setPattern] = React.useState<DataPattern | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const analyzeData = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);

        const context: AnalysisContext = {
          sourceUrl,
          userQuery,
          domainHints: sourceUrl ? [new URL(sourceUrl).hostname] : undefined
        };

        const analyzedPattern = dataStructureAnalyzer.analyzeData(data, context);
        setPattern(analyzedPattern);
      } catch (err) {
        console.error('Data analysis failed:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (data && data.length > 0) {
      analyzeData();
    } else {
      setIsAnalyzing(false);
      setPattern(null);
    }
  }, [data, sourceUrl, userQuery]);

  if (isAnalyzing) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center space-y-4 py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-blue-500"
          >
            <Database className="w-8 h-8" />
          </motion.div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Analyzing data structure...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Determining optimal display format
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-medium">Analysis Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pattern || !data || data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No data to display
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No structured data was found to analyze
          </p>
        </div>
      </div>
    );
  }

  const renderComponent = () => {
    const commonProps = {
      data,
      pattern,
      title: title ?? pattern.metadata.suggestedName,
      userQuery,
      sourceUrl
    };

    switch (pattern.visualization.component) {
      case 'DataTable':
        return <DataTableRenderer {...commonProps} />;
      case 'CardGrid':
        return <CardGridRenderer {...commonProps} />;
      case 'ListGroup':
        return <ListGroupRenderer {...commonProps} />;
      case 'MediaGallery':
        return <MediaGalleryRenderer {...commonProps} />;
      case 'KeyValuePairs':
        return <KeyValueRenderer {...commonProps} />;
      case 'Timeline':
        return <TimelineRenderer {...commonProps} />;
      case 'Hierarchy':
        return <HierarchyRenderer {...commonProps} />;
      case 'TextBlock':
        return <TextBlockRenderer {...commonProps} />;
      case 'CustomRenderer':
        return <CustomRenderer {...commonProps} />;
      default:
        return <ListGroupRenderer {...commonProps} />;
    }
  };

  const getPatternIcon = () => {
    switch (pattern.type) {
      case 'tabular': return <Grid className="w-5 h-5" />;
      case 'card': return <BarChart3 className="w-5 h-5" />;
      case 'list': return <List className="w-5 h-5" />;
      case 'media': return <Image className="w-5 h-5" />;
      case 'timeline': return <Calendar className="w-5 h-5" />;
      case 'hierarchical': return <TreePine className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Analysis Display */}
      {showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center space-x-3">
            <div className="text-blue-600 dark:text-blue-400">
              {getPatternIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Adaptive Display: {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} View
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Auto-detected from {pattern.metadata.sampleSize} items • 
                {pattern.metadata.quality} quality • 
                {Math.round(pattern.confidence * 100)}% confidence
              </p>
            </div>
            <AnalysisDisplay pattern={pattern} compact />
          </div>
        </motion.div>
      )}

      {/* Dynamic Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {renderComponent()}
      </motion.div>
    </div>
  );
};

export default DynamicRenderer;
