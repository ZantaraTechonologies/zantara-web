import React, { useEffect, useState } from 'react';

export const LOCAL_SITE_LOGO = '/app_store_icon.webp';

export function getSafeSiteLogoUrl(value?: string): string {
    const candidate = value?.trim();
    if (!candidate) return LOCAL_SITE_LOGO;
    if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;

    try {
        const url = new URL(candidate);
        return url.protocol === 'https:' || url.protocol === 'http:' ? candidate : LOCAL_SITE_LOGO;
    } catch {
        return LOCAL_SITE_LOGO;
    }
}

export function getSafeSiteUrl(value?: string): string {
    const candidate = value?.trim();
    if (!candidate) return '';

    try {
        const url = new URL(candidate);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
    } catch {
        return '';
    }
}

interface SiteLogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src?: string;
    siteName: string;
}

export default function SiteLogo({ src, siteName, alt, onError, ...props }: SiteLogoProps) {
    const safeSource = getSafeSiteLogoUrl(src);
    const [currentSource, setCurrentSource] = useState(safeSource);

    useEffect(() => {
        setCurrentSource(safeSource);
    }, [safeSource]);

    return (
        <img
            {...props}
            src={currentSource}
            alt={alt || `${siteName} logo`}
            onError={(event) => {
                onError?.(event);
                if (event.defaultPrevented) return;
                if (currentSource !== LOCAL_SITE_LOGO) {
                    setCurrentSource(LOCAL_SITE_LOGO);
                } else {
                    event.currentTarget.hidden = true;
                }
            }}
        />
    );
}
