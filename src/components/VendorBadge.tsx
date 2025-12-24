import type { Vendor } from '@/lib/types';
import { vendorInfo } from '@/lib/vendors';

interface VendorBadgeProps {
    vendor: Vendor;
}

export default function VendorBadge({ vendor }: VendorBadgeProps) {
    const info = vendorInfo[vendor];

    return (
        <span className={`badge vendor-${vendor}`}>
            {info.name}
        </span>
    );
}
