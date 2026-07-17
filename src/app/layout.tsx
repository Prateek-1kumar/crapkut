import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aonex Price Intelligence Engine',
  description: 'Next-generation price comparison and competitor analysis platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
