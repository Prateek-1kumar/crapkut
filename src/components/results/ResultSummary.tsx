'use client';

import React from 'react';
import { FiBox, FiImage, FiLink, FiType, FiFileText, FiGrid } from 'react-icons/fi';
import type { ExtractedData } from '@/types/scraping';

interface ResultSummaryProps {
  data: ExtractedData;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ data }) => {
  const stats = [
    {
      label: 'Products',
      count: data.products?.length || 0,
      icon: FiBox,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Images',
      count: data.images?.length || 0,
      icon: FiImage,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      label: 'Links',
      count: data.links?.length || 0,
      icon: FiLink,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      label: 'Headings',
      count: data.headings?.length || 0,
      icon: FiType,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      label: 'Text Blocks',
      count: data.textContent?.length || 0,
      icon: FiFileText,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20'
    },
    {
      label: 'Other Elements',
      count: (data.genericResults?.length || 0) + (data.elements?.length || 0),
      icon: FiGrid,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
    }
  ];

  const totalItems = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Extraction Summary
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span> items
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-3 text-center transition-transform hover:scale-105`}
          >
            <div className={`${stat.color} flex justify-center mb-2`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stat.count}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {data.searchTerms && data.searchTerms.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Search Terms:</div>
          <div className="flex flex-wrap gap-2">
            {(data.searchTerms as string[]).map((term: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultSummary;
