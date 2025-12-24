'use client';

import { FiExternalLink } from 'react-icons/fi';
import type { ScrapeResult } from '@/lib/types';
import VendorBadge from './VendorBadge';

interface ProductTableProps {
    products: ScrapeResult[];
    isLoading?: boolean;
}

export default function ProductTable({ products, isLoading = false }: ProductTableProps) {
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (products.length === 0) {
        return null;
    }

    const formatPrice = (amount: number, currency: string) => {
        if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
        if (currency === 'USD') return `$${amount.toLocaleString('en-US')}`;
        if (currency === 'GBP') return `£${amount.toLocaleString('en-GB')}`;
        return `€${amount.toLocaleString('en-DE')}`;
    };

    return (
        <div className="results-card">
            <div className="results-header">
                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                    {products.length} products found
                </h2>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Sorted by price: lowest first
                </span>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}></th>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Store</th>
                            <th style={{ width: '100px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product.id || index}>
                                <td>
                                    {product.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={product.image}
                                            alt=""
                                            className="product-image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                            📦
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div className="product-title" title={product.title}>
                                        {product.title}
                                    </div>
                                    {product.rating && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                            ⭐ {product.rating.toFixed(1)}
                                            {product.reviews && ` (${product.reviews.toLocaleString()} reviews)`}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <span className="price">{formatPrice(product.price, product.currency)}</span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <div className="original-price">
                                            {formatPrice(product.originalPrice, product.currency)}
                                        </div>
                                    )}
                                    {product.discount && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--color-success)',
                                            fontWeight: 500,
                                            marginLeft: '0.5rem'
                                        }}>
                                            {product.discount}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <VendorBadge vendor={product.vendor} />
                                </td>
                                <td>
                                    <a
                                        href={product.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                    >
                                        View <FiExternalLink size={12} />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="results-card">
            <div className="results-header">
                <div className="skeleton" style={{ width: '150px', height: '20px' }} />
                <div className="skeleton" style={{ width: '120px', height: '16px' }} />
            </div>
            <div style={{ padding: '1rem' }}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div className="skeleton" style={{ width: '48px', height: '48px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '0.5rem' }} />
                            <div className="skeleton" style={{ width: '40%', height: '12px' }} />
                        </div>
                        <div className="skeleton" style={{ width: '60px', height: '16px' }} />
                        <div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: '9999px' }} />
                        <div className="skeleton" style={{ width: '60px', height: '28px', borderRadius: '0.5rem' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
