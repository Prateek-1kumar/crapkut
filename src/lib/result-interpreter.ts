/**
 * Smart Result Interpreter for Human-Friendly Analysis
 * Converts raw scraped data into actionable business insights
 */

export interface ExtractedDataForInterpretation {
  texts?: string[];
  images?: Array<{ src: string; alt?: string; width?: string | number; height?: string | number; }>;
  links?: Array<{ url: string; text?: string; title?: string; }>;
  products?: Array<{ title?: string; price?: string; rating?: number; description?: string; }>;
  emails?: string[];
  phones?: string[];
  social?: string[];
  [key: string]: unknown;
}

export interface KeyFinding {
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  category: 'content' | 'pricing' | 'contact' | 'navigation' | 'business';
  value?: string | number;
}

export interface BusinessInsight {
  category: 'market_analysis' | 'content_strategy' | 'pricing_strategy' | 'user_experience' | 'competitive_intel';
  insight: string;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
  data_points?: string[];
}

export interface HumanFriendlyResults {
  overview: string;
  keyFindings: KeyFinding[];
  insights: BusinessInsight[];
  recommendations: string[];
  metrics: {
    totalDataPoints: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    completeness: number; // 0-100%
    relevanceScore: number; // 0-100%
  };
  exportSummary: {
    humanReadableTitle: string;
    businessValue: string;
    keyMetrics: Record<string, string | number>;
  };
}

export class ResultInterpreter {
  private data: ExtractedDataForInterpretation;
  private userQuery: string;
  private queryKeywords: string[];

  constructor(data: ExtractedDataForInterpretation, userQuery: string = '') {
    this.data = data;
    this.userQuery = userQuery.toLowerCase();
    this.queryKeywords = this.extractKeywords(userQuery);
  }

  private extractKeywords(query: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'get', 'find', 'extract', 'scrape', 'all'];
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word));
  }

  private analyzeTextContent(): { findings: KeyFinding[]; insights: BusinessInsight[] } {
    const texts = this.data.texts || [];
    const findings: KeyFinding[] = [];
    const insights: BusinessInsight[] = [];

    if (texts.length === 0) return { findings, insights };

    // Analyze text patterns
    const totalWords = texts.reduce((sum, text) => sum + text.split(/\s+/).length, 0);
    const avgLength = totalWords / texts.length;
    const longTexts = texts.filter(t => t.length > 500);
    const shortTexts = texts.filter(t => t.length < 100);

    // Content volume analysis
    findings.push({
      title: `Content Volume: ${texts.length} text blocks`,
      description: `Found ${totalWords.toLocaleString()} total words with average ${Math.round(avgLength)} words per block`,
      confidence: 'high',
      category: 'content',
      value: texts.length
    });

    // Content type analysis
    if (longTexts.length > texts.length * 0.3) {
      findings.push({
        title: 'Rich Content Detected',
        description: `${Math.round((longTexts.length / texts.length) * 100)}% of content is detailed (500+ characters)`,
        confidence: 'high',
        category: 'content'
      });

      insights.push({
        category: 'content_strategy',
        insight: 'The website contains substantial detailed content, indicating a content-rich platform suitable for information gathering.',
        impact: 'medium',
        recommendation: 'Consider extracting and categorizing this content for content analysis or competitive research.'
      });
    }

    // Query relevance analysis
    if (this.queryKeywords.length > 0) {
      const relevantTexts = texts.filter(text => 
        this.queryKeywords.some(keyword => text.toLowerCase().includes(keyword))
      );
      
      if (relevantTexts.length > 0) {
        findings.push({
          title: 'Query-Relevant Content Found',
          description: `${relevantTexts.length} text blocks contain keywords matching your search: "${this.queryKeywords.join(', ')}"`,
          confidence: 'high',
          category: 'business'
        });
      }
    }

    // Content quality insights
    const duplicateContent = this.findDuplicateContent(texts);
    if (duplicateContent > 0.2) {
      insights.push({
        category: 'content_strategy',
        insight: `High content duplication detected (${Math.round(duplicateContent * 100)}%). This may indicate template-based content or repeated navigation elements.`,
        impact: 'low',
        recommendation: 'Filter out duplicate content for cleaner analysis.'
      });
    }

    return { findings, insights };
  }

  private analyzeProducts(): { findings: KeyFinding[]; insights: BusinessInsight[] } {
    const products = this.data.products || [];
    const findings: KeyFinding[] = [];
    const insights: BusinessInsight[] = [];

    if (products.length === 0) return { findings, insights };

    // Price analysis
    const productsWithPrices = products.filter(p => p.price);
    const prices = productsWithPrices
      .map(p => this.extractPrice(p.price || ''))
      .filter(price => price > 0);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      findings.push({
        title: `Price Range: $${minPrice} - $${maxPrice}`,
        description: `Average price: $${Math.round(avgPrice)}, analyzed ${prices.length} products`,
        confidence: 'high',
        category: 'pricing',
        value: `$${minPrice}-$${maxPrice}`
      });

      insights.push({
        category: 'pricing_strategy',
        insight: `Product pricing spans ${((maxPrice - minPrice) / minPrice * 100).toFixed(0)}% range, indicating diverse product tiers.`,
        impact: 'high',
        recommendation: 'Analyze pricing distribution for market positioning insights.',
        data_points: [`Min: $${minPrice}`, `Max: $${maxPrice}`, `Average: $${Math.round(avgPrice)}`]
      });
    }

    // Product quality analysis
    const productsWithRatings = products.filter(p => p.rating && p.rating > 0);
    if (productsWithRatings.length > 0) {
      const avgRating = productsWithRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / productsWithRatings.length;
      
      findings.push({
        title: `Product Quality: ${avgRating.toFixed(1)}/5 stars`,
        description: `Average rating from ${productsWithRatings.length} rated products`,
        confidence: 'high',
        category: 'business'
      });
    }

    return { findings, insights };
  }

  private analyzeLinks(): { findings: KeyFinding[]; insights: BusinessInsight[] } {
    const links = this.data.links || [];
    const findings: KeyFinding[] = [];
    const insights: BusinessInsight[] = [];

    if (links.length === 0) return { findings, insights };

    // Link categorization
    const externalLinks = links.filter(link => {
      try {
        const url = new URL(link.url);
        return !url.hostname.includes(new URL(this.data.texts?.[0] || '').hostname || '');
      } catch {
        return false;
      }
    });

    const socialLinks = links.filter(link => 
      /facebook|twitter|instagram|linkedin|youtube|tiktok/i.test(link.url)
    );

    findings.push({
      title: `Link Analysis: ${links.length} total links`,
      description: `${externalLinks.length} external, ${socialLinks.length} social media`,
      confidence: 'high',
      category: 'navigation'
    });

    if (socialLinks.length > 0) {
      insights.push({
        category: 'competitive_intel',
        insight: `Strong social media presence detected with ${socialLinks.length} social platform links.`,
        impact: 'medium',
        recommendation: 'Monitor social media channels for competitive analysis.'
      });
    }

    return { findings, insights };
  }

  private extractPrice(priceString: string): number {
    const match = priceString.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
  }

  private findDuplicateContent(texts: string[]): number {
    const uniqueTexts = new Set(texts);
    return 1 - (uniqueTexts.size / texts.length);
  }

  private generateOverview(): string {
    const dataTypes = Object.keys(this.data).filter(key => 
      Array.isArray(this.data[key]) && (this.data[key] as unknown[]).length > 0
    );

    const totalItems = dataTypes.reduce((sum, key) => 
      sum + ((this.data[key] as unknown[])?.length || 0), 0
    );

    if (totalItems === 0) {
      return "No significant data patterns were found on this page.";
    }

    const mainDataType = dataTypes.reduce((main, current) => 
      ((this.data[current] as unknown[])?.length || 0) > ((this.data[main] as unknown[])?.length || 0) ? current : main
    );

    const queryContext = this.userQuery ? ` based on your search for "${this.userQuery}"` : '';
    
    return `Successfully analyzed ${totalItems.toLocaleString()} data points${queryContext}. Primary content type: ${mainDataType} (${(this.data[mainDataType] as unknown[])?.length || 0} items). The data shows ${this.calculateDataQuality()} quality with actionable business insights available.`;
  }

  private calculateDataQuality(): string {
    const hasStructuredData = (this.data.products?.length || 0) > 0;
    const hasRichContent = (this.data.texts?.length || 0) > 5;
    const hasMetadata = (this.data.links?.length || 0) > 0 || (this.data.images?.length || 0) > 0;

    if (hasStructuredData && hasRichContent && hasMetadata) return 'excellent';
    if ((hasStructuredData && hasRichContent) || (hasRichContent && hasMetadata)) return 'good';
    if (hasStructuredData || hasRichContent) return 'fair';
    return 'basic';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if ((this.data.products?.length || 0) > 0) {
      recommendations.push('Export product data for competitive pricing analysis');
      recommendations.push('Set up price monitoring for market intelligence');
    }

    if ((this.data.texts?.length || 0) > 10) {
      recommendations.push('Analyze content for SEO keyword opportunities');
      recommendations.push('Extract content themes for content strategy planning');
    }

    if ((this.data.links?.length || 0) > 5) {
      recommendations.push('Map link architecture for technical SEO insights');
      recommendations.push('Identify partnership and collaboration opportunities');
    }

    if (this.queryKeywords.length > 0) {
      recommendations.push(`Focus on content containing: ${this.queryKeywords.join(', ')}`);
    }

    recommendations.push('Schedule regular scraping for trend analysis');
    
    return recommendations;
  }

  public interpretResults(): HumanFriendlyResults {
    const textAnalysis = this.analyzeTextContent();
    const productAnalysis = this.analyzeProducts();
    const linkAnalysis = this.analyzeLinks();

    const allFindings = [
      ...textAnalysis.findings,
      ...productAnalysis.findings,
      ...linkAnalysis.findings
    ];

    const allInsights = [
      ...textAnalysis.insights,
      ...productAnalysis.insights,
      ...linkAnalysis.insights
    ];

    const totalDataPoints = Object.values(this.data)
      .filter(value => Array.isArray(value))
      .reduce((sum, arr) => sum + arr.length, 0);

    const dataQualityScore = this.calculateDataQuality();
    const relevanceScore = this.calculateRelevanceScore();

    return {
      overview: this.generateOverview(),
      keyFindings: allFindings,
      insights: allInsights,
      recommendations: this.generateRecommendations(),
      metrics: {
        totalDataPoints,
        dataQuality: dataQualityScore as 'excellent' | 'good' | 'fair' | 'poor',
        completeness: Math.min(100, (totalDataPoints / 10) * 100),
        relevanceScore
      },
      exportSummary: {
        humanReadableTitle: this.generateExportTitle(),
        businessValue: this.generateBusinessValue(),
        keyMetrics: this.generateKeyMetrics()
      }
    };
  }

  private calculateRelevanceScore(): number {
    if (this.queryKeywords.length === 0) return 75; // Default score when no query

    const relevantItems = Object.values(this.data)
      .flat()
      .filter(item => {
        const itemText = JSON.stringify(item).toLowerCase();
        return this.queryKeywords.some(keyword => itemText.includes(keyword));
      }).length;

    const totalItems = Object.values(this.data)
      .filter(value => Array.isArray(value))
      .reduce((sum, arr) => sum + arr.length, 0);

    return totalItems > 0 ? Math.round((relevantItems / totalItems) * 100) : 0;
  }

  private generateExportTitle(): string {
    const mainContent = this.data.products?.length ? 'Product Analysis' :
                       this.data.texts?.length ? 'Content Analysis' :
                       this.data.links?.length ? 'Link Analysis' : 'Data Analysis';
    
    const date = new Date().toLocaleDateString();
    const queryPart = this.userQuery ? ` - ${this.userQuery}` : '';
    
    return `${mainContent} Report${queryPart} (${date})`;
  }

  private generateBusinessValue(): string {
    const insights = this.interpretResults().insights;
    const highImpactInsights = insights.filter(i => i.impact === 'high').length;
    
    if (highImpactInsights > 0) {
      return `High business value: ${highImpactInsights} actionable insights for strategic decision-making.`;
    } else if (insights.length > 0) {
      return `Moderate business value: Useful data for operational improvements and market understanding.`;
    }
    
    return 'Basic business value: Raw data available for custom analysis and reporting.';
  }

  private generateKeyMetrics(): Record<string, string | number> {
    const metrics: Record<string, string | number> = {};
    
    if (this.data.products?.length) {
      metrics['Products Found'] = this.data.products.length;
      
      const prices = this.data.products
        .map(p => this.extractPrice(p.price || ''))
        .filter(p => p > 0);
      
      if (prices.length > 0) {
        metrics['Price Range'] = `$${Math.min(...prices)} - $${Math.max(...prices)}`;
      }
    }

    if (this.data.texts?.length) {
      const totalWords = this.data.texts.reduce((sum, text) => sum + text.split(/\s+/).length, 0);
      metrics['Content Blocks'] = this.data.texts.length;
      metrics['Total Words'] = totalWords.toLocaleString();
    }

    if (this.data.links?.length) {
      metrics['Links Found'] = this.data.links.length;
    }

    if (this.data.images?.length) {
      metrics['Images Found'] = this.data.images.length;
    }

    metrics['Data Quality'] = this.calculateDataQuality();
    metrics['Extraction Date'] = new Date().toLocaleDateString();

    return metrics;
  }
}