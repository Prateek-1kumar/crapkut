'use client';

import React from 'react';
import type { Vendor } from '@/lib/engine/types';

interface StoreBrandBadgeProps {
  vendor: Vendor;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StoreBrandBadge({
  vendor,
  className = '',
  size = 'md',
}: StoreBrandBadgeProps) {
  const brandConfig: Record<
    Vendor,
    {
      name: string;
      accentBg: string;
      accentBorder: string;
      accentText: string;
      logoSvg: React.ReactNode;
    }
  > = {
    amazon: {
      name: 'Amazon India',
      accentBg: 'bg-[#FF9900]/[0.08]',
      accentBorder: 'border-[#FF9900]/25 hover:border-[#FF9900]/45',
      accentText: 'text-[#C27200]',
      logoSvg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#FF9900]">
          <path d="M13.88 12.33c-.66.86-1.5 1.57-2.6 2.06-1.12.49-2.38.74-3.75.74-2.02 0-3.66-.54-4.88-1.61-1.21-1.07-1.83-2.58-1.83-4.5 0-1.78.58-3.19 1.73-4.2 1.15-1.02 2.68-1.53 4.56-1.53 1.15 0 2.22.21 3.19.64.98.42 1.83 1.04 2.53 1.84V4.54h2.7v10.3c0 .88.16 1.55.49 2.02.32.47.8.7 1.45.7.53 0 1.01-.17 1.44-.52.43-.35.68-.82.74-1.42l2.35.43c-.22 1.15-.75 2.07-1.6 2.76-.84.69-1.87 1.04-3.07 1.04-1.39 0-2.48-.41-3.26-1.24-.77-.83-1.16-1.95-1.18-3.32zm-.22-2.73c-.02-.8-.28-1.46-.77-1.99-.49-.53-1.15-.79-1.99-.79-.9 0-1.63.28-2.18.85-.56.57-.84 1.34-.84 2.3 0 .97.28 1.73.84 2.29.56.56 1.31.84 2.25.84.86 0 1.54-.28 2.02-.85.49-.57.71-1.45.67-2.65zM20.21 19.34c-2.34 1.73-5.32 2.62-8.84 2.62-3.74 0-6.88-.95-9.33-2.82-.26-.2-.29-.53-.08-.77.19-.22.5-.24.75-.05 2.27 1.73 5.17 2.6 8.62 2.6 3.23 0 5.97-.81 8.16-2.41.26-.19.58-.15.76.1.18.26.13.56-.04.73zm-1.05-.62c-.17-.37-.73-.55-1.38-.63-.28-.03-.38-.17-.26-.41.22-.44.75-1.28 1.38-1.57.17-.08.35-.04.42.12.33.72.68 1.83.62 2.37-.03.22-.57.57-.78.12z" />
        </svg>
      ),
    },
    flipkart: {
      name: 'Flipkart',
      accentBg: 'bg-[#2874F0]/[0.08]',
      accentBorder: 'border-[#2874F0]/25 hover:border-[#2874F0]/45',
      accentText: 'text-[#1D58BA]',
      logoSvg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#2874F0]">
          <path d="M16.5 4.5h-9A1.5 1.5 0 006 6v12a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5zM12 16.5l-3.5-2.5 1.5-4.5 4 3-2 4zm1.5-6.5l-2-2 3.5-1.5-.5 3.5z" />
        </svg>
      ),
    },
    myntra: {
      name: 'Myntra Fashion',
      accentBg: 'bg-[#FF3F6C]/[0.08]',
      accentBorder: 'border-[#FF3F6C]/25 hover:border-[#FF3F6C]/45',
      accentText: 'text-[#D62851]',
      logoSvg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#FF3F6C]">
          <path d="M13.2 4.2L8.5 18H5.8L10.5 4.2h2.7zm5 0L13.5 18h-2.7L15.5 4.2h2.7zM6.5 4.2C4.5 4.2 3 5.8 3 7.8v8.4c0 2 1.5 3.6 3.5 3.6s3.5-1.6 3.5-3.6V7.8c0-2-1.5-3.6-3.5-3.6z" />
        </svg>
      ),
    },
    tatacliq: {
      name: 'Tata CLiQ Luxury',
      accentBg: 'bg-[#800020]/[0.08]',
      accentBorder: 'border-[#800020]/25 hover:border-[#800020]/45',
      accentText: 'text-[#800020]',
      logoSvg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#800020]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v4h-2zm0 6h2v2h-2z" />
        </svg>
      ),
    },
    croma: {
      name: 'Croma',
      accentBg: 'bg-[#00B4AA]/[0.08]',
      accentBorder: 'border-[#00B4AA]/25 hover:border-[#00B4AA]/45',
      accentText: 'text-[#008C84]',
      logoSvg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#00B4AA]">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    nykaa: {
      name: 'Nykaa Fashion',
      accentBg: 'bg-[#FC2779]/[0.08]',
      accentBorder: 'border-[#FC2779]/25 hover:border-[#FC2779]/45',
      accentText: 'text-[#D0185E]',
      logoSvg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#FC2779]">
          <path d="M17 5H7v14h2V9h6v10h2V5z" />
        </svg>
      ),
    },
    ebay: {
      name: 'eBay',
      accentBg: 'bg-[#0064D2]/[0.08]',
      accentBorder: 'border-[#0064D2]/25 hover:border-[#0064D2]/45',
      accentText: 'text-[#0051A8]',
      logoSvg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#0064D2]">
          <path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-5a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ),
    },
  };

  const cfg = brandConfig[vendor] || {
    name: vendor.toUpperCase(),
    accentBg: 'bg-black/[0.05]',
    accentBorder: 'border-black/15',
    accentText: 'text-text-primary',
    logoSvg: (
      <span className="w-2 h-2 rounded-full bg-text-primary shrink-0" />
    ),
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-full',
    md: 'px-3.5 py-1.5 text-xs font-medium gap-2 rounded-full',
    lg: 'px-4 py-2 text-sm font-medium gap-2.5 rounded-full',
  }[size];

  return (
    <div
      className={`inline-flex items-center backdrop-blur-md transition-all duration-300 border ${cfg.accentBg} ${cfg.accentBorder} ${cfg.accentText} ${sizeClasses} ${className}`}
    >
      {cfg.logoSvg}
      <span className="font-medium tracking-tight">{cfg.name}</span>
    </div>
  );
}
