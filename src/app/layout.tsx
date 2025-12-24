import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PriceHunt - Compare Prices Across India',
  description: 'Find the best deals on products by comparing prices across Amazon, Flipkart, Myntra, Croma, and more. Real-time price comparison made simple.',
  keywords: ['price comparison', 'best deals', 'Amazon', 'Flipkart', 'online shopping', 'India'],
  authors: [{ name: 'PriceHunt' }],
  openGraph: {
    title: 'PriceHunt - Compare Prices Across India',
    description: 'Find the best deals by comparing prices across top e-commerce platforms.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-[var(--color-border)]">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">🔍</span>
              <span className="text-gradient">PriceHunt</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
              <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">How it works</a>
              <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Supported stores</a>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] py-8 mt-16">
          <div className="container text-center text-sm text-[var(--color-text-muted)]">
            <p>
              © {new Date().getFullYear()} PriceHunt. Compare prices across Amazon, Flipkart, Myntra, Croma & more.
            </p>
            <p className="mt-2">
              ⚠️ For personal use only. Prices are fetched in real-time and may change.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
