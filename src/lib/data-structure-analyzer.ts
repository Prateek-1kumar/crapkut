/**
 * Advanced Data Structure Analyzer
 * Intelligently analyzes scraped data to determine optimal display components
 * and data organization patterns
 */

export interface DataPattern {
  type: 'tabular' | 'list' | 'card' | 'text' | 'media' | 'hierarchical' | 'key-value' | 'timeline' | 'mixed';
  confidence: number;
  structure: DataStructure;
  visualization: VisualizationConfig;
  metadata: PatternMetadata;
}

export interface DataStructure {
  fields: FieldDefinition[];
  primaryField?: string;
  relationships: FieldRelationship[];
  dataTypes: Record<string, DataType>;
  schema: DataSchema;
}

export interface FieldDefinition {
  name: string;
  type: DataType;
  format?: string;
  importance: 'primary' | 'secondary' | 'metadata';
  displayName?: string;
  description?: string;
  examples: string[];
}

export interface FieldRelationship {
  source: string;
  target: string;
  type: 'parent-child' | 'reference' | 'grouping' | 'ordering';
}

export interface VisualizationConfig {
  component: ComponentType;
  layout: LayoutType;
  styling: StylingOptions;
  interactions: InteractionConfig[];
}

export interface PatternMetadata {
  sampleSize: number;
  consistency: number;
  completeness: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  domainHints: DomainHint[];
  suggestedName: string;
}

export type DataType = 
  | 'string' | 'number' | 'boolean' | 'date' | 'url' | 'email' | 'phone'
  | 'price' | 'rating' | 'image' | 'video' | 'html' | 'json' | 'array' | 'object';

export type ComponentType = 
  | 'DataTable' | 'CardGrid' | 'ListGroup' | 'MediaGallery' | 'KeyValuePairs'
  | 'Timeline' | 'Hierarchy' | 'TextBlock' | 'StatsSummary' | 'CustomRenderer';

export type LayoutType = 
  | 'grid' | 'list' | 'masonry' | 'columns' | 'tabs' | 'accordion' | 'carousel';

export interface StylingOptions {
  density: 'compact' | 'comfortable' | 'spacious';
  emphasis: 'data' | 'visual' | 'balanced';
  grouping?: string;
  sorting?: string;
}

export interface InteractionConfig {
  type: 'sort' | 'filter' | 'search' | 'group' | 'expand' | 'select';
  field?: string;
  enabled: boolean;
}

export interface DomainHint {
  domain: string;
  confidence: number;
  patterns: string[];
}

export interface DataSchema {
  title: string;
  description: string;
  required: string[];
  optional: string[];
  validation: Record<string, ValidationRule>;
}

export interface ValidationRule {
  type: string;
  pattern?: string;
  min?: number;
  max?: number;
  options?: string[];
}

export class DataStructureAnalyzer {
  private patterns: Map<string, DataPattern> = new Map();
  private cache: Map<string, DataPattern> = new Map();

  /**
   * Analyze data structure and determine optimal display pattern
   */
  analyzeData(data: Record<string, unknown>[] | unknown[], context?: AnalysisContext): DataPattern {
    if (!data || data.length === 0) {
      return this.createEmptyPattern();
    }

    const cacheKey = this.generateCacheKey(data, context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const pattern = this.performAnalysis(data, context);
    this.cache.set(cacheKey, pattern);
    
    return pattern;
  }

  /**
   * Perform comprehensive data analysis
   */
  private performAnalysis(data: unknown[], context?: AnalysisContext): DataPattern {
    const samples = data.slice(0, Math.min(50, data.length)); // Analyze up to 50 items
    
    // Detect data structure
    const structure = this.analyzeStructure(samples);
    
    // Determine visualization pattern
    const visualizationPattern = this.determineVisualizationPattern(structure, samples, context);
    
    // Calculate metadata
    const metadata = this.calculateMetadata(samples, structure);
    
    // Generate visualization config
    const visualization = this.generateVisualizationConfig(visualizationPattern, structure, metadata);

    const pattern: DataPattern = {
      type: visualizationPattern,
      confidence: this.calculateConfidence(structure, metadata),
      structure,
      visualization,
      metadata
    };

    return pattern;
  }

  /**
   * Analyze the structure of data items
   */
  private analyzeStructure(samples: unknown[]): DataStructure {
    const fields: FieldDefinition[] = [];
    const dataTypes: Record<string, DataType> = {};
    const fieldFrequency: Record<string, number> = {};
    const fieldExamples: Record<string, string[]> = {};

    // Analyze each sample
    samples.forEach(sample => {
      if (typeof sample === 'object' && sample !== null) {
        Object.entries(sample as Record<string, unknown>).forEach(([key, value]) => {
          fieldFrequency[key] = (fieldFrequency[key] || 0) + 1;
          
          if (!fieldExamples[key]) {
            fieldExamples[key] = [];
          }
          
          const strValue = this.valueToString(value);
          if (strValue && !fieldExamples[key].includes(strValue) && fieldExamples[key].length < 5) {
            fieldExamples[key].push(strValue);
          }

          if (!dataTypes[key]) {
            dataTypes[key] = this.detectDataType(value);
          }
        });
      }
    });

    // Create field definitions
    Object.keys(fieldFrequency).forEach(fieldName => {
      const frequency = fieldFrequency[fieldName];
      const importance = this.determineFieldImportance(fieldName, frequency, samples.length, fieldExamples[fieldName]);
      
      fields.push({
        name: fieldName,
        type: dataTypes[fieldName],
        importance,
        displayName: this.generateDisplayName(fieldName),
        description: this.generateFieldDescription(fieldName, dataTypes[fieldName]),
        examples: fieldExamples[fieldName] || []
      });
    });

    // Sort fields by importance
    fields.sort((a, b) => {
      const importanceOrder = { primary: 0, secondary: 1, metadata: 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });

    // Detect relationships
    const relationships = this.detectFieldRelationships(fields, samples);

    // Generate schema
    const schema = this.generateSchema(fields);

    // Determine primary field
    const primaryField = fields.find(f => f.importance === 'primary')?.name;

    return {
      fields,
      primaryField,
      relationships,
      dataTypes,
      schema
    };
  }

  /**
   * Determine the best visualization pattern for the data
   */
  private determineVisualizationPattern(
    structure: DataStructure, 
    samples: unknown[], 
    context?: AnalysisContext
  ): DataPattern['type'] {
    const { fields } = structure;
    const sampleCount = samples.length;

    // Check for specific patterns
    if (this.isTabularData(fields, samples)) {
      return 'tabular';
    }

    if (this.isMediaGalleryData(fields)) {
      return 'media';
    }

    if (this.isTimelineData(fields)) {
      return 'timeline';
    }

    if (this.isHierarchicalData(fields, samples)) {
      return 'hierarchical';
    }

    if (this.isKeyValueData(fields, samples)) {
      return 'key-value';
    }

    // Default patterns based on field count and data complexity
    const primaryFields = fields.filter(f => f.importance === 'primary').length;
    const totalFields = fields.length;

    if (totalFields <= 2 && sampleCount > 10) {
      return 'list';
    }

    if (primaryFields >= 3 && totalFields >= 5) {
      return 'card';
    }

    if (totalFields === 1) {
      return 'text';
    }

    // Mixed pattern for complex data
    return 'mixed';
  }

  /**
   * Detect data type of a value
   */
  private detectDataType(value: unknown): DataType {
    if (value === null || value === undefined) {
      return 'string';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    if (typeof value === 'number') {
      return 'number';
    }

    if (Array.isArray(value)) {
      return 'array';
    }

    if (typeof value === 'object') {
      return 'object';
    }

    const str = String(value);

    // URL detection
    if (/^https?:\/\/.+/i.test(str)) {
      return 'url';
    }

    // Email detection
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
      return 'email';
    }

    // Phone detection
    if (/^[\d\s\-\+\(\)]{10,}$/.test(str)) {
      return 'phone';
    }

    // Price detection
    if (/^[\$€£¥₹][\d,]+\.?\d*$|^\d+\.?\d*\s*[\$€£¥₹]$/.test(str)) {
      return 'price';
    }

    // Rating detection
    if (/^\d+(\.\d+)?\s*\/\s*\d+$|^\d+(\.\d+)?\s*stars?$/i.test(str)) {
      return 'rating';
    }

    // Date detection
    if (!isNaN(Date.parse(str))) {
      return 'date';
    }

    // Image detection
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(str)) {
      return 'image';
    }

    // Video detection
    if (/\.(mp4|avi|mov|wmv|flv|webm)$/i.test(str)) {
      return 'video';
    }

    // HTML detection
    if (/<[^>]+>/.test(str)) {
      return 'html';
    }

    // JSON detection
    if (str.startsWith('{') || str.startsWith('[')) {
      try {
        JSON.parse(str);
        return 'json';
      } catch {
        // Not JSON
      }
    }

    return 'string';
  }

  /**
   * Pattern detection methods
   */
  private isTabularData(fields: FieldDefinition[], samples: unknown[]): boolean {
    return fields.length >= 3 && 
           samples.length >= 5 && 
           fields.filter(f => f.importance !== 'metadata').length >= 3;
  }

  private isMediaGalleryData(fields: FieldDefinition[]): boolean {
    return fields.some(f => f.type === 'image' || f.type === 'video') &&
           fields.filter(f => f.type === 'image' || f.type === 'video').length >= 2;
  }

  private isTimelineData(fields: FieldDefinition[]): boolean {
    return fields.some(f => f.type === 'date') &&
           fields.some(f => f.name.toLowerCase().includes('event') || 
                           f.name.toLowerCase().includes('title') ||
                           f.name.toLowerCase().includes('description'));
  }

  private isHierarchicalData(fields: FieldDefinition[], samples: unknown[]): boolean {
    return fields.some(f => f.name.toLowerCase().includes('parent') ||
                           f.name.toLowerCase().includes('child') ||
                           f.name.toLowerCase().includes('level') ||
                           f.name.toLowerCase().includes('category'));
  }

  private isKeyValueData(fields: FieldDefinition[], samples: unknown[]): boolean {
    return fields.length <= 3 && samples.length <= 20 &&
           fields.some(f => f.name.toLowerCase().includes('key') ||
                           f.name.toLowerCase().includes('name') ||
                           f.name.toLowerCase().includes('property'));
  }

  /**
   * Helper methods
   */
  private determineFieldImportance(
    fieldName: string, 
    frequency: number, 
    totalSamples: number, 
    examples: string[]
  ): FieldDefinition['importance'] {
    const completeness = frequency / totalSamples;
    const name = fieldName.toLowerCase();

    // Primary field indicators
    if (completeness >= 0.8 && (
      name.includes('title') || name.includes('name') || name.includes('id') ||
      name.includes('heading') || name.includes('subject')
    )) {
      return 'primary';
    }

    // Metadata field indicators
    if (name.includes('timestamp') || name.includes('created') || name.includes('modified') ||
        name.includes('id') || name.includes('url') || name.includes('link') ||
        completeness < 0.3) {
      return 'metadata';
    }

    return 'secondary';
  }

  private generateDisplayName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  private generateFieldDescription(fieldName: string, dataType: DataType): string {
    const descriptions: Record<string, string> = {
      string: 'Text content',
      number: 'Numeric value',
      boolean: 'True/false value',
      date: 'Date and time',
      url: 'Web address',
      email: 'Email address',
      phone: 'Phone number',
      price: 'Price information',
      rating: 'Rating or score',
      image: 'Image content',
      video: 'Video content'
    };

    return descriptions[dataType] || 'Data field';
  }

  private detectFieldRelationships(fields: FieldDefinition[], samples: unknown[]): FieldRelationship[] {
    const relationships: FieldRelationship[] = [];
    
    // Simple relationship detection based on naming patterns
    fields.forEach(field => {
      const name = field.name.toLowerCase();
      
      if (name.includes('parent') || name.includes('category')) {
        const childField = fields.find(f => 
          f.name.toLowerCase().includes('child') || 
          f.name.toLowerCase().includes('item')
        );
        
        if (childField) {
          relationships.push({
            source: field.name,
            target: childField.name,
            type: 'parent-child'
          });
        }
      }
    });

    return relationships;
  }

  private generateSchema(fields: FieldDefinition[]): DataSchema {
    const required = fields.filter(f => f.importance === 'primary').map(f => f.name);
    const optional = fields.filter(f => f.importance !== 'primary').map(f => f.name);
    
    const validation: Record<string, ValidationRule> = {};
    fields.forEach(field => {
      validation[field.name] = {
        type: field.type,
        ...(field.format && { pattern: field.format })
      };
    });

    return {
      title: 'Extracted Data Schema',
      description: 'Automatically generated schema for extracted data',
      required,
      optional,
      validation
    };
  }

  private generateVisualizationConfig(
    pattern: DataPattern['type'],
    structure: DataStructure,
    metadata: PatternMetadata
  ): VisualizationConfig {
    const componentMap: Record<DataPattern['type'], ComponentType> = {
      'tabular': 'DataTable',
      'card': 'CardGrid',
      'list': 'ListGroup',
      'media': 'MediaGallery',
      'key-value': 'KeyValuePairs',
      'timeline': 'Timeline',
      'hierarchical': 'Hierarchy',
      'text': 'TextBlock',
      'mixed': 'CustomRenderer'
    };

    const layoutMap: Record<DataPattern['type'], LayoutType> = {
      'tabular': 'list',
      'card': 'grid',
      'list': 'list',
      'media': 'masonry',
      'key-value': 'columns',
      'timeline': 'list',
      'hierarchical': 'accordion',
      'text': 'list',
      'mixed': 'tabs'
    };

    return {
      component: componentMap[pattern],
      layout: layoutMap[pattern],
      styling: {
        density: metadata.sampleSize > 50 ? 'compact' : 'comfortable',
        emphasis: pattern === 'media' ? 'visual' : 'data'
      },
      interactions: this.generateInteractions(structure, pattern)
    };
  }

  private generateInteractions(structure: DataStructure, pattern: DataPattern['type']): InteractionConfig[] {
    const interactions: InteractionConfig[] = [];

    // Always enable search for large datasets
    interactions.push({ type: 'search', enabled: true });

    // Add sorting for tabular and list views
    if (pattern === 'tabular' || pattern === 'list') {
      interactions.push({ type: 'sort', enabled: true });
    }

    // Add filtering for structured data
    if (structure.fields.length >= 3) {
      interactions.push({ type: 'filter', enabled: true });
    }

    // Add grouping for categorical data
    const categoricalFields = structure.fields.filter(f => 
      f.name.toLowerCase().includes('category') ||
      f.name.toLowerCase().includes('type') ||
      f.name.toLowerCase().includes('group')
    );

    if (categoricalFields.length > 0) {
      interactions.push({ 
        type: 'group', 
        field: categoricalFields[0].name, 
        enabled: true 
      });
    }

    return interactions;
  }

  private calculateMetadata(samples: unknown[], structure: DataStructure): PatternMetadata {
    const sampleSize = samples.length;
    const fieldCount = structure.fields.length;
    
    // Calculate completeness
    let totalFields = 0;
    let populatedFields = 0;

    samples.forEach(sample => {
      if (typeof sample === 'object' && sample !== null) {
        structure.fields.forEach(field => {
          totalFields++;
          if ((sample as any)[field.name] !== null && (sample as any)[field.name] !== undefined) {
            populatedFields++;
          }
        });
      }
    });

    const completeness = totalFields > 0 ? populatedFields / totalFields : 0;
    
    // Calculate consistency (simplified)
    const consistency = completeness > 0.8 ? 0.9 : completeness > 0.5 ? 0.7 : 0.5;

    // Determine quality
    let quality: PatternMetadata['quality'] = 'poor';
    if (completeness >= 0.8 && consistency >= 0.8) quality = 'excellent';
    else if (completeness >= 0.6 && consistency >= 0.6) quality = 'good';
    else if (completeness >= 0.4) quality = 'fair';

    // Generate domain hints
    const domainHints = this.generateDomainHints(structure);

    // Suggest name
    const suggestedName = this.suggestDataName(structure, domainHints);

    return {
      sampleSize,
      completeness,
      consistency,
      quality,
      domainHints,
      suggestedName
    };
  }

  private generateDomainHints(structure: DataStructure): DomainHint[] {
    const hints: DomainHint[] = [];
    
    const fieldNames = structure.fields.map(f => f.name.toLowerCase());
    const fieldTypes = structure.fields.map(f => f.type);

    // E-commerce patterns
    if (fieldNames.some(n => n.includes('price')) && 
        fieldNames.some(n => n.includes('product') || n.includes('title'))) {
      hints.push({
        domain: 'e-commerce',
        confidence: 0.8,
        patterns: ['price', 'product', 'title']
      });
    }

    // News/Blog patterns
    if (fieldNames.some(n => n.includes('title')) && 
        fieldNames.some(n => n.includes('date') || n.includes('published'))) {
      hints.push({
        domain: 'news',
        confidence: 0.7,
        patterns: ['title', 'date', 'content']
      });
    }

    // Contact/Directory patterns
    if (fieldTypes.includes('email') || fieldTypes.includes('phone')) {
      hints.push({
        domain: 'contact',
        confidence: 0.9,
        patterns: ['email', 'phone', 'contact']
      });
    }

    return hints;
  }

  private suggestDataName(structure: DataStructure, hints: DomainHint[]): string {
    if (hints.length > 0) {
      const topHint = hints[0];
      return `${topHint.domain} data`;
    }

    const primaryField = structure.primaryField;
    if (primaryField) {
      return `${this.generateDisplayName(primaryField)} collection`;
    }

    return 'Extracted data';
  }

  private calculateConfidence(structure: DataStructure, metadata: PatternMetadata): number {
    let confidence = 0.5;

    // Boost confidence based on data quality
    if (metadata.quality === 'excellent') confidence += 0.3;
    else if (metadata.quality === 'good') confidence += 0.2;
    else if (metadata.quality === 'fair') confidence += 0.1;

    // Boost confidence based on field structure
    if (structure.fields.length >= 3) confidence += 0.1;
    if (structure.primaryField) confidence += 0.1;

    // Boost confidence based on domain recognition
    if (metadata.domainHints.length > 0) {
      confidence += metadata.domainHints[0].confidence * 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private valueToString(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private generateCacheKey(data: unknown[], context?: AnalysisContext): string {
    const sampleKeys = data.slice(0, 5).map(item => {
      if (typeof item === 'object' && item !== null) {
        return Object.keys(item).sort().join(',');
      }
      return typeof item;
    }).join('|');

    const contextKey = context ? JSON.stringify(context) : '';
    return `${sampleKeys}:${contextKey}`;
  }

  private createEmptyPattern(): DataPattern {
    return {
      type: 'text',
      confidence: 0,
      structure: {
        fields: [],
        relationships: [],
        dataTypes: {},
        schema: {
          title: 'Empty Data',
          description: 'No data available',
          required: [],
          optional: [],
          validation: {}
        }
      },
      visualization: {
        component: 'TextBlock',
        layout: 'list',
        styling: { density: 'comfortable', emphasis: 'data' },
        interactions: []
      },
      metadata: {
        sampleSize: 0,
        completeness: 0,
        consistency: 0,
        quality: 'poor',
        domainHints: [],
        suggestedName: 'No data'
      }
    };
  }
}

export interface AnalysisContext {
  sourceUrl?: string;
  userQuery?: string;
  expectedDataType?: string;
  domainHints?: string[];
}

// Export singleton instance
export const dataStructureAnalyzer = new DataStructureAnalyzer();