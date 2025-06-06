/**
 * Card Grid Renderer - Displays data in card format with visual emphasis
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Eye, 
  Star, 
  Calendar, 
  DollarSign,
  Mail,
  Phone,
  Image as ImageIcon,
  Search,
  Grid,
  List
} from 'lucide-react';
import { DataPattern } from '@/lib/data-structure-analyzer';

interface CardGridRendererProps {
  data: unknown[];
  pattern: DataPattern;
  title: string;
}

const CardGridRenderer: React.FC<CardGridRendererProps> = ({
  data,
  pattern,
  title
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedCard, setSelectedCard] = React.useState<number | null>(null);

  const { fields } = pattern.structure;
  const primaryFields = fields.filter(f => f.importance === 'primary');
  const secondaryFields = fields.filter(f => f.importance === 'secondary');

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return fields.some(field => {
        const value = (item as any)[field.name];
        return value && String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchTerm, fields]);

  const getFieldIcon = (field: typeof fields[0]) => {
    switch (field.type) {
      case 'url': return <ExternalLink className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'price': return <DollarSign className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatFieldValue = (value: unknown, field: typeof fields[0]) => {
    if (value === null || value === undefined) {
      return null;
    }

    const str = String(value);

    switch (field.type) {
      case 'url':
        return (
          <a
            href={str}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">{str.length > 30 ? `${str.substring(0, 30)}...` : str}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      
      case 'email':
        return (
          <a
            href={`mailto:${str}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            {str}
          </a>
        );
      
      case 'image':
        return (
          <div className="relative group">
            <img
              src={str}
              alt=""
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      
      case 'date':
        try {
          return new Date(str).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch {
          return str;
        }
      
      case 'price':
        return <span className="font-semibold text-green-600 dark:text-green-400">{str}</span>;
      
      case 'rating':
        const rating = parseFloat(str);
        if (!isNaN(rating)) {
          return (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{rating}</span>
            </div>
          );
        }
        return str;
      
      default:
        return (
          <span className="text-gray-900 dark:text-gray-100">
            {str.length > 100 ? `${str.substring(0, 100)}...` : str}
          </span>
        );
    }
  };

  const renderCard = (item: unknown, index: number) => {
    const isSelected = selectedCard === index;
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2
          ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
        `}
        onClick={() => setSelectedCard(isSelected ? null : index)}
      >
        <div className="p-6">
          {/* Primary Fields */}
          <div className="space-y-3 mb-4">
            {primaryFields.slice(0, 2).map((field) => {
              const value = (item as any)[field.name];
              if (!value) return null;

              return (
                <div key={field.name}>
                  {field.type === 'image' ? (
                    formatFieldValue(value, field)
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {formatFieldValue(value, field)}
                      </h3>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Secondary Fields */}
          <div className="space-y-2">
            {secondaryFields.slice(0, 4).map((field) => {
              const value = (item as any)[field.name];
              if (!value) return null;

              return (
                <div key={field.name} className="flex items-start gap-2">
                  <div className="text-gray-400 mt-1">
                    {getFieldIcon(field)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {field.displayName || field.name}
                    </div>
                    <div className="mt-1">
                      {formatFieldValue(value, field)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded View */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.filter(f => !primaryFields.slice(0, 2).includes(f) && !secondaryFields.slice(0, 4).includes(f)).map((field) => {
                  const value = (item as any)[field.name];
                  if (!value) return null;

                  return (
                    <div key={field.name} className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {field.displayName || field.name}:
                      </span>
                      <div className="mt-1">
                        {formatFieldValue(value, field)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderListItem = (item: unknown, index: number) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Image if available */}
            {fields.find(f => f.type === 'image') && (
              <div className="flex-shrink-0">
                {formatFieldValue(
                  (item as any)[fields.find(f => f.type === 'image')!.name],
                  fields.find(f => f.type === 'image')!
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {primaryFields.slice(0, 1).map((field) => {
                    const value = (item as any)[field.name];
                    if (!value) return null;
                    
                    return (
                      <h3 key={field.name} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {formatFieldValue(value, field)}
                      </h3>
                    );
                  })}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {secondaryFields.slice(0, 6).map((field) => {
                      const value = (item as any)[field.name];
                      if (!value) return null;
                      
                      return (
                        <div key={field.name} className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {field.displayName || field.name}:
                          </span>
                          <div className="mt-1">
                            {formatFieldValue(value, field)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {filteredData.length} items
            </span>
            
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No items found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredData.map((item, index) => 
            viewMode === 'grid' ? renderCard(item, index) : renderListItem(item, index)
          )}
        </div>
      )}
    </div>
  );
};

export default CardGridRenderer;
