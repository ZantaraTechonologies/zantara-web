// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import AppRoutes from './routes/AppRoutes';

import { SiteSettingsProvider } from './app/SiteSettingsContext';
import { ThemeProvider } from './app/ThemeContext';
import { queryClient } from './app/queryClient';
import { installSessionStorageSync } from './app/sessionLifecycle';

installSessionStorageSync();

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root not found');

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SiteSettingsProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </SiteSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
