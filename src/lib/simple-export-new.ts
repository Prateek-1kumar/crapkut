/**
 * Simple Export Utility
 * Provides basic export functionality without complex interface dependencies
 */

export interface SimpleExportData {
  products?: Array<{ title?: string; price?: string; id?: number; }>;
  links?: Array<{ url: string; text?: string; title?: string; }>;
  images?: Array<{ src: string; alt?: string; }>;
  text?: Array<{ text?: string; element?: string; }>;
  headings?: Array<{ text?: string; level?: number; }>;
  [key: string]: unknown;
}

export class SimpleExporter {
  static exportToCSV(data: SimpleExportData, filename: string = 'export.csv'): void {
    const rows: string[] = [];
    
    // Add header
    rows.push('Type,Content,Metadata,URL');
    
    // Add products
    data.products?.forEach(product => {
      const content = product.title ?? 'No title';
      const price = product.price ?? 'No price';
      rows.push(`Product,"${content}","Price: ${price}",`);
    });
    
    // Add links
    data.links?.forEach(link => {
      const content = link.text ?? 'No text';
      rows.push(`Link,"${content}","${link.title ?? ''}","${link.url}"`);
    });
    
    // Add images
    data.images?.forEach(image => {
      const content = image.alt ?? 'No alt text';
      rows.push(`Image,"${content}",,"${image.src}"`);
    });
    
    // Add text
    data.text?.forEach(textItem => {
      const content = textItem.text ?? 'No text';
      const element = textItem.element ?? 'text';
      rows.push(`Text,"${content}","Element: ${element}",`);
    });
    
    // Add headings
    data.headings?.forEach(heading => {
      const content = heading.text ?? 'No text';
      const level = heading.level ?? 1;
      rows.push(`Heading,"${content}","Level: ${level}",`);
    });
    
    const csvContent = rows.join('\n');
    this.downloadFile(csvContent, filename, 'text/csv');
  }
  
  static exportToJSON(data: SimpleExportData, filename: string = 'export.json'): void {
    const exportData = {
      exportedAt: new Date().toISOString(),
      summary: {
        products: data.products?.length ?? 0,
        links: data.links?.length ?? 0,
        images: data.images?.length ?? 0,
        text: data.text?.length ?? 0,
        headings: data.headings?.length ?? 0
      },
      data: data
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }
  
  static exportSummary(data: SimpleExportData, userQuery: string = '', filename: string = 'summary.txt'): void {
    const lines: string[] = [];
    
    lines.push(`DATA EXTRACTION SUMMARY`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Query: ${userQuery}`);
    lines.push('');
    
    // Summary stats
    lines.push('SUMMARY STATISTICS:');
    lines.push(`• Products found: ${data.products?.length ?? 0}`);
    lines.push(`• Links found: ${data.links?.length ?? 0}`);
    lines.push(`• Images found: ${data.images?.length ?? 0}`);
    lines.push(`• Text blocks found: ${data.text?.length ?? 0}`);
    lines.push(`• Headings found: ${data.headings?.length ?? 0}`);
    lines.push('');
    
    // Products section
    if (data.products && data.products.length > 0) {
      lines.push('PRODUCTS:');
      data.products.slice(0, 10).forEach((product, index) => {
        lines.push(`${index + 1}. ${product.title ?? 'No title'} - ${product.price ?? 'No price'}`);
      });
      if (data.products.length > 10) {
        lines.push(`... and ${data.products.length - 10} more products`);
      }
      lines.push('');
    }
    
    // Links section
    if (data.links && data.links.length > 0) {
      lines.push('TOP LINKS:');
      data.links.slice(0, 5).forEach((link, index) => {
        lines.push(`${index + 1}. ${link.text ?? 'No text'} -> ${link.url}`);
      });
      if (data.links.length > 5) {
        lines.push(`... and ${data.links.length - 5} more links`);
      }
      lines.push('');
    }
    
    const summaryContent = lines.join('\n');
    this.downloadFile(summaryContent, filename, 'text/plain');
  }
  
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
