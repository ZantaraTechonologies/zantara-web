import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import apiClient from '../services/api/apiClient';

interface SiteSettings {
    SITE_NAME: string;
    SUPPORT_EMAIL: string;
    SUPPORT_PHONE: string;
    SITE_URL: string;
    SITE_LOGO: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
    SITE_NAME: 'Zantara',
    SUPPORT_EMAIL: '',
    SUPPORT_PHONE: '',
    SITE_URL: '',
    SITE_LOGO: '',
};

interface SiteSettingsContextType {
    settings: SiteSettings;
    loading: boolean;
    refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(false);
    const requestRef = useRef(0);

    const refetch = useCallback(async () => {
        const requestId = ++requestRef.current;
        try {
            const res = await apiClient.get('/settings/public');
            if (mountedRef.current && requestId === requestRef.current && res.data.success) {
                setSettings({
                    SITE_NAME: res.data.data?.SITE_NAME || DEFAULT_SETTINGS.SITE_NAME,
                    SUPPORT_EMAIL: res.data.data?.SUPPORT_EMAIL || '',
                    SUPPORT_PHONE: res.data.data?.SUPPORT_PHONE || '',
                    SITE_URL: res.data.data?.SITE_URL || '',
                    SITE_LOGO: res.data.data?.SITE_LOGO || '',
                });
            }
        } catch {
            console.error('Failed to fetch public settings');
        } finally {
            if (mountedRef.current && requestId === requestRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        void refetch();
        return () => {
            mountedRef.current = false;
            requestRef.current += 1;
        };
    }, [refetch]);

    useEffect(() => {
        document.title = settings.SITE_NAME;
        document.querySelector('meta[name="description"]')?.setAttribute('content', `${settings.SITE_NAME} digital services`);
        document.querySelector('meta[name="author"]')?.setAttribute('content', settings.SITE_NAME);
    }, [settings.SITE_NAME]);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refetch }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => {
    const context = useContext(SiteSettingsContext);
    if (context === undefined) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
};
