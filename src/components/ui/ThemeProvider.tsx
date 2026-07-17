'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isTransitioning: false,
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check saved theme or system preference
    const saved = localStorage.getItem('dossier_theme') as 'light' | 'dark' | null;
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('dossier_theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
      {/* Bottom-to-Top Full Screen Transition Fill Wave */}
      {isTransitioning && (
        <div
          className={`fixed inset-0 pointer-events-none z-[100] animate-bottom-fill ${
            theme === 'dark' ? 'bg-[#0E0E0D]' : 'bg-[#faf8f5]'
          }`}
        />
      )}
      {/* Fixed Sexy Floating Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        className="fixed bottom-6 right-6 z-50 group overflow-hidden rounded-full border border-black/15 dark:border-white/20 bg-surface-elevated/85 backdrop-blur-2xl px-5 py-3 shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2.5 text-xs font-semibold text-text-primary"
      >
        {/* Bottom to top fill layer inside button */}
        <span className="absolute inset-0 bg-[#1A1918] dark:bg-[#F9F8F6] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full" />
        
        <span className="relative z-10 flex items-center gap-2 group-hover:text-[#F9F8F6] dark:group-hover:text-[#1A1918] transition-colors duration-300">
          {theme === 'light' ? (
            <>
              <FiMoon size={15} className="text-indigo-600 dark:text-indigo-400 group-hover:text-amber-400 transition-colors" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <FiSun size={15} className="text-amber-400 group-hover:text-amber-600 transition-colors animate-spin-slow" />
              <span>Light Mode</span>
            </>
          )}
        </span>
      </button>
    </ThemeContext.Provider>
  );
}
