'use client';

import { motion } from 'framer-motion';
import type { ScrapeResult } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
    products: ScrapeResult[];
    isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    Found {products.length} products
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Sorted by price: lowest first
                </p>
            </div>

            {/* Grid */}
            <div className="product-grid">
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                ))}
            </div>
        </motion.div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="skeleton h-7 w-48" />
                <div className="skeleton h-5 w-36" />
            </div>

            <div className="product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="card overflow-hidden">
                        <div className="aspect-square skeleton" />
                        <div className="p-4 space-y-3">
                            <div className="skeleton h-12 w-full" />
                            <div className="skeleton h-5 w-24" />
                            <div className="skeleton h-8 w-32" />
                            <div className="skeleton h-10 w-full mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
