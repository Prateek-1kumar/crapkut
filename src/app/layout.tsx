import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="min-h-screen bg-canvas text-text-primary antialiased selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
