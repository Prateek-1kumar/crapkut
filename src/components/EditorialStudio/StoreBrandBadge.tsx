'use client';

import React, { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const brandConfig: Record<
    Vendor,
    {
      name: string;
      imageUrl: string;
      fallbackUrl: string;
      accentBg: string;
      accentBorder: string;
      accentText: string;
      fallbackSvg: React.ReactNode;
    }
  > = {
    amazon: {
      name: 'Amazon India',
      imageUrl: 'https://logo.clearbit.com/amazon.in',
      fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      accentBg: 'bg-[#FF9900]/[0.08] dark:bg-[#FF9900]/[0.12]',
      accentBorder: 'border-[#FF9900]/30 dark:border-[#FF9900]/40 hover:border-[#FF9900]/50',
      accentText: 'text-[#B86C00] dark:text-[#FFB84D]',
      fallbackSvg: (
        <span className="font-bold text-[#FF9900] text-xs tracking-tighter">a&rarr;z</span>
      ),
    },
    flipkart: {
      name: 'Flipkart',
      imageUrl: 'https://logo.clearbit.com/flipkart.com',
      fallbackUrl: 'https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png',
      accentBg: 'bg-[#2874F0]/[0.08] dark:bg-[#2874F0]/[0.15]',
      accentBorder: 'border-[#2874F0]/30 dark:border-[#2874F0]/40 hover:border-[#2874F0]/50',
      accentText: 'text-[#1A4EB0] dark:text-[#66A3FF]',
      fallbackSvg: (
        <span className="font-extrabold text-[#2874F0] dark:text-[#66A3FF] text-xs italic tracking-tighter">F</span>
      ),
    },
    myntra: {
      name: 'Myntra Fashion',
      imageUrl: 'https://logo.clearbit.com/myntra.com',
      fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
      accentBg: 'bg-[#FF3F6C]/[0.08] dark:bg-[#FF3F6C]/[0.15]',
      accentBorder: 'border-[#FF3F6C]/30 dark:border-[#FF3F6C]/40 hover:border-[#FF3F6C]/50',
      accentText: 'text-[#D62851] dark:text-[#FF809F]',
      fallbackSvg: (
        <span className="font-extrabold text-[#FF3F6C] dark:text-[#FF809F] text-xs tracking-tighter">M</span>
      ),
    },
    tatacliq: {
      name: 'Tata CLiQ Luxury',
      imageUrl: 'https://logo.clearbit.com/tatacliq.com',
      fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Tata_Logo.svg',
      accentBg: 'bg-[#800020]/[0.08] dark:bg-[#E63946]/[0.15]',
      accentBorder: 'border-[#800020]/30 dark:border-[#E63946]/40 hover:border-[#800020]/50',
      accentText: 'text-[#800020] dark:text-[#FF758F]',
      fallbackSvg: (
        <span className="font-serif font-bold text-[#800020] dark:text-[#FF758F] text-xs">CLiQ</span>
      ),
    },
    croma: {
      name: 'Croma',
      imageUrl: 'https://logo.clearbit.com/croma.com',
      fallbackUrl: 'https://www.croma.com/assets/images/croma_logo_dark.png',
      accentBg: 'bg-[#00B4AA]/[0.08] dark:bg-[#00B4AA]/[0.15]',
      accentBorder: 'border-[#00B4AA]/30 dark:border-[#00B4AA]/40 hover:border-[#00B4AA]/50',
      accentText: 'text-[#008C84] dark:text-[#4DF0E6]',
      fallbackSvg: (
        <span className="font-extrabold text-[#00B4AA] dark:text-[#4DF0E6] text-xs tracking-tighter">C</span>
      ),
    },
    nykaa: {
      name: 'Nykaa Fashion',
      imageUrl: 'https://logo.clearbit.com/nykaa.com',
      fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Nykaa_Logo.svg',
      accentBg: 'bg-[#FC2779]/[0.08] dark:bg-[#FC2779]/[0.15]',
      accentBorder: 'border-[#FC2779]/30 dark:border-[#FC2779]/40 hover:border-[#FC2779]/50',
      accentText: 'text-[#D0185E] dark:text-[#FF73AA]',
      fallbackSvg: (
        <span className="font-extrabold text-[#FC2779] dark:text-[#FF73AA] text-xs tracking-tighter">N</span>
      ),
    },
    ebay: {
      name: 'eBay',
      imageUrl: 'https://logo.clearbit.com/ebay.com',
      fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
      accentBg: 'bg-[#0064D2]/[0.08] dark:bg-[#0064D2]/[0.15]',
      accentBorder: 'border-[#0064D2]/30 dark:border-[#0064D2]/40 hover:border-[#0064D2]/50',
      accentText: 'text-[#0051A8] dark:text-[#66B2FF]',
      fallbackSvg: (
        <span className="font-extrabold text-[#0064D2] dark:text-[#66B2FF] text-xs tracking-tight">eBay</span>
      ),
    },
  };

  const cfg = brandConfig[vendor] || {
    name: vendor.toUpperCase(),
    imageUrl: `https://logo.clearbit.com/${vendor}.com`,
    fallbackUrl: '',
    accentBg: 'bg-black/[0.05] dark:bg-white/[0.08]',
    accentBorder: 'border-black/15 dark:border-white/15',
    accentText: 'text-text-primary',
    fallbackSvg: (
      <span className="w-2 h-2 rounded-full bg-text-primary shrink-0" />
    ),
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1.5 rounded-full',
    md: 'px-3 py-1 text-xs font-medium gap-2 rounded-full',
    lg: 'px-3.5 py-1.5 text-sm font-medium gap-2 rounded-full',
  }[size];

  const iconDimensions = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div
      className={`inline-flex items-center backdrop-blur-md transition-all duration-300 border ${cfg.accentBg} ${cfg.accentBorder} ${cfg.accentText} ${sizeClasses} ${className} shadow-2xs`}
    >
      <div className={`${iconDimensions} shrink-0 flex items-center justify-center overflow-hidden rounded-sm bg-white/95 p-0.5 border border-black/5 dark:border-white/20 shadow-2xs`}>
        {!imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cfg.imageUrl}
            alt={cfg.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              if (cfg.fallbackUrl && e.currentTarget.src !== cfg.fallbackUrl) {
                e.currentTarget.src = cfg.fallbackUrl;
              } else {
                setImgError(true);
              }
            }}
          />
        ) : (
          cfg.fallbackSvg
        )}
      </div>
      <span className="font-medium tracking-tight whitespace-nowrap">{cfg.name}</span>
    </div>
  );
}
