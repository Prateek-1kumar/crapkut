'use client';

import { useMemo } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import type { ScrapeResult } from '@/lib/types';
import { groupSimilarProducts, ProductGroup } from '@/lib/comparison';
import VendorBadge from './VendorBadge';

interface ComparisonViewProps {
    products: ScrapeResult[];
    isLoading?: boolean;
}

export default function ComparisonView({ products, isLoading = false }: ComparisonViewProps) {
    const groups = useMemo(() => groupSimilarProducts(products), [products]);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (products.length === 0) {
        return null;
    }

    const formatPrice = (amount: number, currency: string = 'INR') => {
        if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
        if (currency === 'USD') return `$${amount.toLocaleString('en-US')}`;
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // Separate groups with multiple vendors (true comparisons) from single-vendor
    const multiVendorGroups = groups.filter(g => g.vendorCount > 1);
    const singleVendorGroups = groups.filter(g => g.vendorCount === 1);

    return (
        <div>
            {/* Stats bar */}
            <div style={{
                display: 'flex',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                flexWrap: 'wrap'
            }}>
                <span><strong>{products.length}</strong> products found</span>
                <span><strong>{multiVendorGroups.length}</strong> comparable across stores</span>
                <span><strong>{groups.length}</strong> product groups</span>
            </div>

            {/* Multi-vendor comparison groups - these are the valuable comparisons */}
            {multiVendorGroups.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                        🔥 Compare Prices Across Stores
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {multiVendorGroups.slice(0, 15).map((group, idx) => (
                            <ComparisonCard key={idx} group={group} formatPrice={formatPrice} />
                        ))}
                    </div>
                </div>
            )}

            {/* Single vendor products */}
            {singleVendorGroups.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                        Other Products
                    </h2>
                    <div className="results-card">
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Store</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {singleVendorGroups.flatMap(g => g.products).slice(0, 30).map((product, idx) => (
                                        <tr key={product.id || idx}>
                                            <td>
                                                <div className="product-title" title={product.title}>{product.title}</div>
                                            </td>
                                            <td>
                                                <span className="price">{formatPrice(product.price, product.currency)}</span>
                                            </td>
                                            <td><VendorBadge vendor={product.vendor} /></td>
                                            <td>
                                                <a href={product.url} target="_blank" rel="noopener noreferrer"
                                                    className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                                                    View <FiExternalLink size={12} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ComparisonCard({ group, formatPrice }: { group: ProductGroup, formatPrice: (n: number, c?: string) => string }) {
    const bestDeal = group.products[0];
    const otherDeals = group.products.slice(1, 4); // Show up to 3 alternatives

    return (
        <div className="results-card" style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.938rem', fontWeight: 500, marginBottom: '0.25rem', lineHeight: 1.4 }}>
                    {group.name}
                </h3>
                {group.savings > 0 && (
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-success)',
                        fontWeight: 600,
                        background: '#DCFCE7',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px'
                    }}>
                        Save up to {formatPrice(group.savings)}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Best deal - highlighted */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#F0FDF4',
                    borderRadius: '0.5rem',
                    border: '1px solid #BBF7D0',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>BEST PRICE</span>
                        <VendorBadge vendor={bestDeal.vendor} />
                        <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{formatPrice(bestDeal.price, bestDeal.currency)}</span>
                    </div>
                    <a href={bestDeal.url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary" style={{ fontSize: '0.813rem' }}>
                        Buy Now <FiExternalLink size={14} />
                    </a>
                </div>

                {/* Alternative prices */}
                {otherDeals.map((deal, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--color-bg-secondary)',
                        borderRadius: '0.375rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <VendorBadge vendor={deal.vendor} />
                            <span style={{ fontWeight: 600 }}>{formatPrice(deal.price, deal.currency)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>
                                +{formatPrice(deal.price - bestDeal.price)}
                            </span>
                        </div>
                        <a href={deal.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.813rem' }}>
                            View <FiExternalLink size={12} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="skeleton" style={{ width: '100px', height: '16px' }} />
                <div className="skeleton" style={{ width: '150px', height: '16px' }} />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="results-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <div className="skeleton" style={{ width: '70%', height: '20px', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ width: '100%', height: '60px', borderRadius: '0.5rem' }} />
                </div>
            ))}
        </div>
    );
}
