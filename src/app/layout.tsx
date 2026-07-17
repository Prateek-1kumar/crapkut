import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'Price Intelligence Dossier | Editorial Comparison Studio',
  description: 'Next-generation universal price comparison and specification parity dossier.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="transition-colors duration-500">
      <body className="min-h-screen bg-canvas text-text-primary antialiased selection:bg-accent selection:text-white transition-colors duration-500">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
