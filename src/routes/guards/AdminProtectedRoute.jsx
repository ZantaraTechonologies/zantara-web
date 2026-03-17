import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
    const [state, setState] = useState('loading'); // 'loading' | 'ok' | 'unauth' | 'forbidden'

    useEffect(() => {
        let alive = true;
        const BASE = import.meta.env.VITE_API_URL || '/api';
        (async () => {
            try {
                const res = await fetch(`${BASE}/admin/auth/me`, { credentials: 'include' });
                if (!alive) return;
                if (res.status === 401) { setState('unauth'); return; }
                if (res.status === 403) { setState('forbidden'); return; }
                const data = await res.json();
                const roles = Array.isArray(data?.roles) ? data.roles : [];
                setState(roles.includes('admin') || roles.includes('superAdmin') ? 'ok' : 'forbidden');
            } catch {
                if (!alive) return;
                setState('unauth');
            }
        })();
        return () => { alive = false; };
    }, []);

    if (state === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    if (state === 'unauth') return <Navigate to="/admin/login" replace />;
    if (state === 'forbidden') {
        return <Navigate to="/not-authorized" replace />;
    }
    return <Outlet />;
};

export default AdminProtectedRoute;
