// src/pages/NotAuthorized.tsx
export default function NotAuthorized({ requiredRoles = ["admin"] }: { requiredRoles?: string[] }) {
    return (
        <div className="min-h-[60vh] grid place-items-center px-4">
            <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-2">Not authorized</h1>
                <p className="text-slate-600 mb-4">
                    You’re signed in, but your account doesn’t have the required access:
                    <b> {requiredRoles.join(", ")} </b>.
                </p>
                <div className="mt-4 flex gap-2">
                    <a href="/" className="px-4 py-2 rounded-lg border border-slate-300">Back to Home</a>
                    <a href="/admin/logout" className="px-4 py-2 rounded-lg bg-slate-900 text-white">Sign out</a>
                </div>
            </div>
        </div>
    );
}
