/**
 * Data Table Renderer - Displays structured data in table format
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  ExternalLink
} from 'lucide-react';
import { DataPattern } from '@/lib/data-structure-analyzer';

interface DataTableRendererProps {
  data: unknown[];
  pattern: DataPattern;
  title: string;
  userQuery?: string;
  sourceUrl?: string;
}

const DataTableRenderer: React.FC<DataTableRendererProps> = ({
  data,
  pattern,
  title
}) => {
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(25);
  const [showFilters, setShowFilters] = React.useState(false);

  const { fields } = pattern.structure;
  const displayFields = fields.filter(f => f.importance !== 'metadata').slice(0, 8); // Show max 8 columns

  // Filter and search data
  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return displayFields.some(field => {
        const value = (item as any)[field.name];
        return value && String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchTerm, displayFields]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(fieldName);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: unknown, field: typeof fields[0]) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    const str = String(value);

    switch (field.type) {
      case 'url':
        return (
          <a
            href={str}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 max-w-xs truncate"
          >
            <span className="truncate">{str}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      
      case 'email':
        return (
          <a
            href={`mailto:${str}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {str}
          </a>
        );
      
      case 'image':
        return (
          <div className="flex items-center gap-2">
            <img
              src={str}
              alt=""
              className="w-8 h-8 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-xs text-gray-500 truncate max-w-xs">
              {str.split('/').pop()}
            </span>
          </div>
        );
      
      case 'date':
        try {
          return new Date(str).toLocaleDateString();
        } catch {
          return str;
        }
      
      case 'price':
        return <span className="font-mono text-green-600 dark:text-green-400">{str}</span>;
      
      case 'rating':
        return <span className="font-mono text-yellow-600 dark:text-yellow-400">{str}</span>;
      
      default:
        return (
          <span className="max-w-xs truncate block" title={str}>
            {str.length > 50 ? `${str.substring(0, 50)}...` : str}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {sortedData.length} items
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {displayFields.map((field) => (
                <th
                  key={field.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort(field.name)}
                >
                  <div className="flex items-center gap-2">
                    <span>{field.displayName || field.name}</span>
                    {sortField === field.name && (
                      <span>
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {displayFields.map((field) => (
                  <td
                    key={field.name}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {formatCellValue((item as any)[field.name], field)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
              {sortedData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTableRenderer;
