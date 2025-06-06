/**
 * List Group Renderer - Simple list display for data
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DataPattern } from '@/lib/data-structure-analyzer';

interface ListGroupRendererProps {
  data: unknown[];
  pattern: DataPattern;
  title: string;
  userQuery?: string;
  sourceUrl?: string;
}

const ListGroupRenderer: React.FC<ListGroupRendererProps> = ({
  data,
  pattern,
  title
}) => {
  const { fields } = pattern.structure;
  const primaryField = fields.find(f => f.importance === 'primary');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="text-gray-900 dark:text-gray-100">
              {primaryField ? (
                String((item as any)[primaryField.name] || '')
              ) : (
                JSON.stringify(item).substring(0, 100) + '...'
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ListGroupRenderer;
