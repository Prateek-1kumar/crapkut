'use client';

import { motion } from 'framer-motion';
import { FiExternalLink, FiStar } from 'react-icons/fi';
import type { ScrapeResult } from '@/lib/types';
import VendorBadge from './VendorBadge';

interface ProductCardProps {
    product: ScrapeResult;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const {
        title,
        price,
        originalPrice,
        currency,
        vendor,
        url,
        image,
        rating,
        reviews,
        discount,
    } = product;

    const formatPrice = (amount: number, curr: string) => {
        const symbol = curr === 'INR' ? '₹' : curr === 'USD' ? '$' : curr === 'GBP' ? '£' : '€';
        return `${symbol}${amount.toLocaleString('en-IN')}`;
    };

    const hasDiscount = originalPrice && originalPrice > price;
    const calculatedDiscount = hasDiscount
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="card group overflow-hidden"
        >
            {/* Image */}
            <div className="relative aspect-square bg-[var(--color-bg-tertiary)] overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                        <span className="text-4xl">📦</span>
                    </div>
                )}

                {/* Discount badge */}
                {(discount || calculatedDiscount) && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">
                        {discount || `${calculatedDiscount}% OFF`}
                    </div>
                )}

                {/* Vendor badge */}
                <div className="absolute top-3 right-3">
                    <VendorBadge vendor={vendor} />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-[var(--color-text-primary)] font-medium line-clamp-2 min-h-[3rem]">
                    {title}
                </h3>

                {/* Rating */}
                {rating && (
                    <div className="flex items-center gap-1 text-sm">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-[var(--color-text-secondary)]">
                            {rating.toFixed(1)}
                            {reviews && <span className="text-[var(--color-text-muted)]"> ({reviews.toLocaleString()})</span>}
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {formatPrice(price, currency)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-[var(--color-text-muted)] line-through">
                            {formatPrice(originalPrice, currency)}
                        </span>
                    )}
                </div>

                {/* CTA */}
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-4 btn btn-secondary text-center"
                >
                    <span>View Deal</span>
                    <FiExternalLink className="w-4 h-4" />
                </a>
            </div>
        </motion.div>
    );
}
