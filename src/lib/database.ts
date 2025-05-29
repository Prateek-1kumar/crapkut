// Database operations are disabled - this is now a real-time scraper without persistence

export const initializeDatabase = async (): Promise<void> => {
  // No-op: Database initialization is not needed for real-time scraping
  console.log('Database operations disabled - running in real-time mode');
};

export const saveScrapeResult = async (
  _url: string,
  _extractionSpec: string,
  _extractedData: Record<string, unknown>,
  _metadata: Record<string, unknown>
): Promise<string> => {
  // No-op: Data is not saved, just returned to the client
  console.log('Data persistence disabled - results returned directly to client', {
    url: _url, 
    spec: _extractionSpec,
    dataKeys: Object.keys(_extractedData),
    metadataKeys: Object.keys(_metadata)
  });
  return 'no-persistence-mode';
};

export const getScrapeResults = async (_limit: number = 10): Promise<Record<string, unknown>[]> => {
  // No-op: No historical data available in real-time mode
  console.log(`History disabled - no stored results available (requested limit: ${_limit})`);
  return [];
};

// Placeholder export for backward compatibility
export const sql = null;
