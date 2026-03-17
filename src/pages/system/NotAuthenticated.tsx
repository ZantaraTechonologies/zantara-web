// src/pages/NotAuthenticated.tsx
export default function NotAuthenticated() {
    return (
        <div className="min-h-[60vh] grid place-items-center px-4">
            <div className="max-w-md text-center">
                <h1 className="text-2xl font-bold mb-2">Not authenticated</h1>
                <p className="text-slate-600 mb-4">Please sign in to access the admin console.</p>
                <a href="/admin/login" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white">Go to Admin Sign In</a>
            </div>
        </div>
    );
}
