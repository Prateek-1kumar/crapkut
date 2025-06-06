/**
 * Placeholder renderers for other component types
 */

'use client';

import React from 'react';
import { DataPattern } from '@/lib/data-structure-analyzer';
import ListGroupRenderer from './ListGroupRenderer';

interface RendererProps {
  data: unknown[];
  pattern: DataPattern;
  title: string;
  userQuery?: string;
  sourceUrl?: string;
}

// Media Gallery Renderer
export const MediaGalleryRenderer: React.FC<RendererProps> = (props) => {
  return <ListGroupRenderer {...props} />;
};

// Key Value Renderer
export const KeyValueRenderer: React.FC<RendererProps> = (props) => {
  return <ListGroupRenderer {...props} />;
};

// Timeline Renderer
export const TimelineRenderer: React.FC<RendererProps> = (props) => {
  return <ListGroupRenderer {...props} />;
};

// Hierarchy Renderer
export const HierarchyRenderer: React.FC<RendererProps> = (props) => {
  return <ListGroupRenderer {...props} />;
};

// Text Block Renderer
export const TextBlockRenderer: React.FC<RendererProps> = (props) => {
  return <ListGroupRenderer {...props} />;
};

// Custom Renderer
export const CustomRenderer: React.FC<RendererProps> = (props) => {
  return <ListGroupRenderer {...props} />;
};
