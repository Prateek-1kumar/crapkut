import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Real-Time Web Scraper',
  description: 'Extract data from websites instantly with intelligent parsing - no storage, just real-time results',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 dark:bg-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
