// src/layouts/DashboardLayout.jsx
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DashboardLayout() {
    const { logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="p-4 text-lg font-bold border-b">VTU Admin</div>
                <nav className="p-4 space-y-3">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}>Overview</NavLink>
                    <NavLink to="/dashboard/wallet" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}>Wallet</NavLink>
                    <NavLink to="/dashboard/transactions" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}>Transactions</NavLink>
                    <button
                        onClick={logout}
                        className="text-red-500 hover:underline mt-4 block"
                    >
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}
