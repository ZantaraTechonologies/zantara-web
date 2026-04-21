import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api/apiClient';

interface SiteSettings {
    SITE_NAME: string;
}

interface SiteSettingsContextType {
    settings: SiteSettings;
    loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>({
        SITE_NAME: 'Zantara'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await apiClient.get('/settings/public');
                if (res.data.success) {
                    setSettings(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch public settings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading }}>
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
