/**
 * Vendor display information - shared between client and server
 * This file should NOT import any server-only modules
 */

import type { Vendor } from './types';

export const vendorInfo: Record<Vendor, { name: string; color: string }> = {
    'amazon': { name: 'Amazon', color: '#FF9900' },
    'flipkart': { name: 'Flipkart', color: '#2874F0' },
    'ebay': { name: 'eBay', color: '#E53238' },
    'myntra': { name: 'Myntra', color: '#FF3F6C' },
    'croma': { name: 'Croma', color: '#00B140' },
    'ajio': { name: 'Ajio', color: '#41494F' },
    'snapdeal': { name: 'Snapdeal', color: '#E40046' },
    'tatacliq': { name: 'Tata CLiQ', color: '#8B008B' },
    'nykaa': { name: 'Nykaa', color: '#FC2779' },
    'meesho': { name: 'Meesho', color: '#570A57' },
    'jiomart': { name: 'JioMart', color: '#0052A1' },
    'reliance-digital': { name: 'Reliance Digital', color: '#E42529' },
    'vijay-sales': { name: 'Vijay Sales', color: '#FF6600' },
    'aliexpress': { name: 'AliExpress', color: '#FF4747' },
};

/**
 * Default vendors to search when none specified
 */
export const defaultVendors: Vendor[] = [
    'amazon',
    'flipkart',
    'ebay',
    'myntra',
    'croma',
    'ajio',
    'snapdeal',
];
