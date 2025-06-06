/**
 * Analysis Display Component - Shows data structure analysis results
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  TrendingUp,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DataPattern } from '@/lib/data-structure-analyzer';

interface AnalysisDisplayProps {
  pattern: DataPattern;
  compact?: boolean;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ pattern, compact = false }) => {
  const [expanded, setExpanded] = React.useState(!compact);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'fair': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
      >
        <Info className="w-4 h-4" />
        <span>Details</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: expanded ? 1 : 0, height: expanded ? 'auto' : 0 }}
      className="overflow-hidden"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Structure Analysis
          </h4>
          
          <div className={`flex items-center gap-2 ${getQualityColor(pattern.metadata.quality)}`}>
            {getQualityIcon(pattern.metadata.quality)}
            <span className="font-medium capitalize">{pattern.metadata.quality}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {pattern.metadata.sampleSize}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Items</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {pattern.structure.fields.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Fields</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(pattern.metadata.completeness * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(pattern.confidence * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
          </div>
        </div>

        {/* Field Analysis */}
        <div>
          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Field Structure</h5>
          <div className="space-y-2">
            {pattern.structure.fields.slice(0, 8).map((field) => (
              <div key={field.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    field.importance === 'primary' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : field.importance === 'secondary'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                  }`}>
                    {field.importance}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {field.displayName || field.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {field.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Hints */}
        {pattern.metadata.domainHints.length > 0 && (
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Domain Recognition</h5>
            <div className="flex flex-wrap gap-2">
              {pattern.metadata.domainHints.map((hint, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-900 dark:text-blue-100 font-medium">
                    {hint.domain}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 text-sm">
                    {Math.round(hint.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualization Config */}
        <div>
          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Display Configuration</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Component</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {pattern.visualization.component}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Layout</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {pattern.visualization.layout}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Density</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {pattern.visualization.styling.density}
              </div>
            </div>
          </div>
        </div>

        {/* Interactions */}
        {pattern.visualization.interactions.length > 0 && (
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Available Interactions</h5>
            <div className="flex flex-wrap gap-2">
              {pattern.visualization.interactions.map((interaction, index) => (
                <div 
                  key={index} 
                  className={`px-3 py-1 rounded-full text-sm ${
                    interaction.enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                  }`}
                >
                  {interaction.type}
                  {interaction.field && ` (${interaction.field})`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalysisDisplay;
