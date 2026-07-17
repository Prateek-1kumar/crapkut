'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
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

const SPILL_DURATION = 1300;

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  const toggleTheme = useCallback(() => {
    if (isTransitioning || !btnRef.current) return;
    setIsTransitioning(true);

    const rect = btnRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const targetColor = nextTheme === 'dark' ? '#0E0E0D' : '#faf8f5';

    const overlay = overlayRef.current;
    if (!overlay) {
      // Fallback if ref is missing
      setTheme(nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setIsTransitioning(false);
      return;
    }

    overlay.style.display = 'block';
    overlay.style.backgroundColor = targetColor;
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.style.opacity = '1';

    // Force reflow before triggering CSS transition
    void overlay.offsetHeight;

    overlay.style.transition = `clip-path ${SPILL_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    overlay.style.clipPath = `circle(150vmax at ${x}px ${y}px)`;

    // At 75%: switch the theme underneath the fully-covering overlay circle
    const themeTimeout = setTimeout(() => {
      document.documentElement.classList.add('theme-transitioning');
      setTheme(nextTheme);
      localStorage.setItem('dossier_theme', nextTheme);

      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Let the browser paint the new theme instantaneously without transition lag, then dissolve overlay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('theme-transitioning');
          overlay.style.transition = 'opacity 800ms cubic-bezier(0.4, 0, 0, 1)';
          overlay.style.opacity = '0';
        });
      });
    }, SPILL_DURATION * 0.75);

    // Cleanup after dissolve finishes
    const cleanupTimeout = setTimeout(() => {
      overlay.style.display = 'none';
      overlay.style.transition = '';
      overlay.style.clipPath = '';
      overlay.style.opacity = '';
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, SPILL_DURATION * 0.5 + 850);

    return () => {
      clearTimeout(themeTimeout);
      clearTimeout(cleanupTimeout);
    };
  }, [isTransitioning, theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {/* Full screen high-precision circular spill overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[999] pointer-events-none"
        style={{ display: 'none' }}
      />

      {children}

      {/* Fixed Sexy Floating Theme Toggle Button with Bottom-to-Top Fill */}
      <button
        type="button"
        ref={btnRef}
        onClick={toggleTheme}
        disabled={isTransitioning}
        aria-label="Toggle Theme"
        className="fixed bottom-6 right-6 z-50 group overflow-hidden rounded-full border border-black/15 dark:border-white/20 bg-surface-elevated/85 backdrop-blur-2xl px-5 py-3 shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-wait flex items-center gap-2.5 text-xs font-semibold text-text-primary"
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
