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
  genericData?: Array<Record<string, unknown>>; // Added for generic data
  [key: string]: unknown;
}

export class SimpleExporter {
  static exportToCSV(data: SimpleExportData, filename: string = 'export.csv'): void {
    const rows: string[] = [];
    
    // Add header - Generic header, can be improved based on actual data keys
    const headers = new Set<string>();
    if (data.products?.length) Object.keys(data.products[0]).forEach(h => headers.add(h));
    if (data.links?.length) Object.keys(data.links[0]).forEach(h => headers.add(h));
    if (data.images?.length) Object.keys(data.images[0]).forEach(h => headers.add(h));
    if (data.text?.length) Object.keys(data.text[0]).forEach(h => headers.add(h));
    if (data.headings?.length) Object.keys(data.headings[0]).forEach(h => headers.add(h));
    
    // Fallback for generic data if specific types are not present
    if (headers.size === 0 && data.genericData?.length) {
      Object.keys(data.genericData[0]).forEach(h => headers.add(h));
    }


    const headerString = Array.from(headers).join(',');
    rows.push(headerString);

    const createCsvRow = (item: Record<string, unknown> | { title?: string; price?: string; id?: number; } | { url: string; text?: string; title?: string; } | { src: string; alt?: string; } | { text?: string; element?: string; } | { text?: string; level?: number; }) => {
      return Array.from(headers).map(header => {
        const value = (item as Record<string, unknown>)[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and commas
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',');
    };
    
    // Add products
    data.products?.forEach(product => rows.push(createCsvRow(product)));
    
    // Add links
    data.links?.forEach(link => rows.push(createCsvRow(link)));
    
    // Add images
    data.images?.forEach(image => rows.push(createCsvRow(image)));
    
    // Add text
    data.text?.forEach(textItem => rows.push(createCsvRow(textItem)));
    
    // Add headings
    data.headings?.forEach(heading => rows.push(createCsvRow(heading)));

    // Add generic data if present
    data.genericData?.forEach(item => rows.push(createCsvRow(item)));
    
    const csvContent = rows.join('\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }
  
  static exportToJSON(data: SimpleExportData, filename: string = 'export.json'): void {
    const exportData = {
      exportedAt: new Date().toISOString(),
      summary: {
        products: data.products?.length ?? 0,
        links: data.links?.length ?? 0,
        images: data.images?.length ?? 0,
        text: data.text?.length ?? 0,
        headings: data.headings?.length ?? 0,
        genericData: data.genericData?.length ?? 0,
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
    lines.push(`• Other data records: ${data.genericData?.length ?? 0}`);
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

    // Generic Data section (first 10 items as sample)
    if (data.genericData && data.genericData.length > 0) {
      lines.push('OTHER DATA (SAMPLE):');
      data.genericData.slice(0, 10).forEach((item, index) => {
        lines.push(`${index + 1}. ${JSON.stringify(item)}`);
      });
      if (data.genericData.length > 10) {
        lines.push(`... and ${data.genericData.length - 10} more records`);
      }
      lines.push('');
    }
    
    const summaryContent = lines.join('\n');
    this.downloadFile(summaryContent, filename, 'text/plain');
  }
  
  static exportToPDF(data: SimpleExportData, userQuery: string = '', filename: string = 'export-summary.txt'): void {
    // For PDF, we'll provide the summary text file and instruct the user.
    this.exportSummary(data, userQuery, filename);
    alert("A summary text file has been downloaded. You can print it to PDF using your browser or a text editor.");
  }

  static exportToExcel(data: SimpleExportData, filename: string = 'export.csv'): void {
    // Excel can open CSV files directly.
    this.exportToCSV(data, filename);
    alert("A CSV file has been downloaded, which can be opened in Excel.");
  }

  static exportToWord(data: SimpleExportData, userQuery: string = '', filename: string = 'export-summary.txt'): void {
    // For Word, we'll provide the summary text file.
    this.exportSummary(data, userQuery, filename);
    alert("A summary text file has been downloaded. You can open and save it as a Word document using any text editor or Word itself.");
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
