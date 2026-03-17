// ---------------------------------------------
// src/pages/admin/StatusPage.tsx (quick smoke test)
// ---------------------------------------------
import React, { useEffect, useState } from "react";
import API from "../../services/api/apiClient";

export function StatusPage() {
    const [msg, setMsg] = useState("…");
    const [ms, setMs] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            const t0 = performance.now();
            try {
                const { data } = await API.get("/");
                setMsg(data?.message ?? JSON.stringify(data));
            } catch (e) {
                setMsg("Error");
            } finally {
                setMs(Math.round(performance.now() - t0));
            }
        })();
    }, []);

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">System Status</h1>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="text-slate-700">API: {msg}</div>
                <div className="text-slate-500 text-sm">Round-trip: {ms ?? "—"} ms</div>
            </div>
        </div>
    );
}