import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PriceHunt - Compare Prices',
  description: 'Compare product prices across Flipkart, eBay, Snapdeal and more. Find the best deals instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="header">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" className="header-logo">
              🔍 PriceHunt
            </a>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Price Comparison Tool
            </span>
          </div>
        </header>

        {/* Main content */}
        <main style={{ minHeight: 'calc(100vh - 120px)', paddingBottom: '2rem' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 0' }}>
          <div className="container" style={{ textAlign: 'center', fontSize: '0.813rem', color: 'var(--color-text-muted)' }}>
            Prices are fetched in real-time. Results may vary.
          </div>
        </footer>
      </body>
    </html>
  );
}
