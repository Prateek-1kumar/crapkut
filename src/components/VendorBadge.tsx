import type { Vendor } from '@/lib/types';
import { vendorInfo } from '@/lib/vendors';

interface VendorBadgeProps {
    vendor: Vendor;
    className?: string;
}

export default function VendorBadge({ vendor, className = '' }: VendorBadgeProps) {
    const info = vendorInfo[vendor];

    return (
        <span
            className={`badge vendor-${vendor} ${className}`}
            style={{ backgroundColor: info.color }}
        >
            {info.name}
        </span>
    );
}
