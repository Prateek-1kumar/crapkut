/**
 * Domain-Aware Renderer
 * Adapts data presentation based on website category and data patterns
 */

import { DataPattern, ComponentType } from './data-structure-analyzer';

// Define missing types locally
type SemanticDataType = 
  | 'product-catalog' | 'article-content' | 'contact-information' | 'navigation-menu'
  | 'search-results' | 'social-media' | 'financial-data' | 'events' | 'reviews' | 'generic-content';

type VisualizationType = 
  | 'table' | 'cards' | 'gallery' | 'list' | 'hierarchy' | 'timeline' 
  | 'statistics' | 'text-summary' | 'mixed-layout';

export interface RenderingContext {
  siteCategory?: string; // From adaptive config
  userQuery?: string;
  dataPattern: DataPattern;
  totalItems: number;
  sourceUrl: string;
}

export interface RenderingStrategy {
  componentType: 'table' | 'cards' | 'gallery' | 'list' | 'hierarchy' | 'timeline' | 'statistics' | 'summary' | 'mixed';
  layout: LayoutConfig;
  styling: StylingConfig;
  interactions: InteractionConfig;
  priority: number; // 1-10, higher = better match
}

export interface LayoutConfig {
  columns?: number;
  spacing: 'compact' | 'comfortable' | 'spacious';
  grouping?: GroupingStrategy;
  sorting?: SortingStrategy;
  pagination?: PaginationConfig;
}

export interface StylingConfig {
  theme: 'minimal' | 'rich' | 'professional' | 'playful';
  density: 'dense' | 'normal' | 'loose';
  emphasis: EmphasisConfig;
  responsiveness: ResponsivenessConfig;
}

export interface InteractionConfig {
  expandable: boolean;
  filterable: boolean;  
  searchable: boolean;
  exportable: boolean;
  selectable: boolean;
}

export interface GroupingStrategy {
  enabled: boolean;
  field?: string;
  method: 'category' | 'alphabetical' | 'numerical' | 'date' | 'semantic';
}

export interface SortingStrategy {
  enabled: boolean;
  defaultField?: string;
  defaultOrder: 'asc' | 'desc';
  options: string[];
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  showNumbers: boolean;
  showInfo: boolean;
}

export interface EmphasisConfig {
  primaryFields: string[];
  secondaryFields: string[];
  hiddenFields: string[];
}

export interface ResponsivenessConfig {
  mobile: 'stack' | 'scroll' | 'collapse';
  tablet: 'adapt' | 'maintain';
  desktop: 'full' | 'centered';
}

export class DomainAwareRenderer {
  static determineRenderingStrategy(context: RenderingContext): RenderingStrategy {
    // Simple fallback implementation
    return {
      componentType: 'cards',
      layout: {
        spacing: 'comfortable',
        pagination: { enabled: true, pageSize: 20, showNumbers: true, showInfo: true }
      },
      styling: {
        theme: 'minimal',
        density: 'normal',
        emphasis: { primaryFields: [], secondaryFields: [], hiddenFields: [] },
        responsiveness: { mobile: 'stack', tablet: 'adapt', desktop: 'full' }
      },
      interactions: {
        expandable: true,
        filterable: false,
        searchable: true,
        exportable: true,
        selectable: false
      },
      priority: 5
    };
  }

  static getComponentProps(strategy: RenderingStrategy, data: unknown[]) {
    return {
      componentType: strategy.componentType,
      data,
      layout: strategy.layout,
      styling: strategy.styling,
      interactions: strategy.interactions,
      priority: strategy.priority
    };
  }
}
