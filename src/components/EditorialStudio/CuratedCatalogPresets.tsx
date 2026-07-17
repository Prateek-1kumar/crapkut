'use client';

import { FiArrowUpRight, FiCompass } from 'react-icons/fi';

interface CuratedCatalogPresetsProps {
  onSelectPreset: (query: string) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    title: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics & Audio',
    baselinePrice: '₹29,990',
    query: 'Sony WH-1000XM5 Noise Canceling Headphones',
  },
  {
    title: 'Apple iPhone 16 Pro (256GB, Natural Titanium)',
    category: 'Electronics & Mobile',
    baselinePrice: '₹1,29,900',
    query: 'Apple iPhone 16 Pro 256GB Natural Titanium',
  },
  {
    title: 'Dyson Airwrap Complete Long Multi-Styler',
    category: 'Beauty & Personal Care',
    baselinePrice: '₹49,900',
    query: 'Dyson Airwrap Complete Long Multi Styler',
  },
  {
    title: 'MacBook Air M3 (16GB RAM, 512GB SSD)',
    category: 'Computing & Hardware',
    baselinePrice: '₹1,34,900',
    query: 'MacBook Air M3 16GB RAM 512GB SSD',
  },
];

export default function CuratedCatalogPresets({ onSelectPreset, isLoading }: CuratedCatalogPresetsProps) {
  return (
    <section className="my-10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4">
        <FiCompass size={14} />
        <span>Curated Benchmark Dossiers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectPreset(preset.query)}
            className="bg-surface-elevated border border-border-subtle hover:border-border-strong rounded-2xl p-6 text-left transition-all flex flex-col justify-between gap-6 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                {preset.category}
              </span>
              <h3 className="font-serif text-xl font-normal text-text-primary mt-1 leading-snug">
                {preset.title}
              </h3>
            </div>

            <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs">
              <span className="text-text-secondary">
                Reference MSRP: <strong className="font-mono text-text-primary">{preset.baselinePrice}</strong>
              </span>
              <span className="flex items-center gap-1 font-medium text-text-primary">
                Explore Dossier
                <FiArrowUpRight size={14} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
