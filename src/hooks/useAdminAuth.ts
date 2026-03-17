// src/hooks/useAdminAuth.ts
import { useEffect, useState } from "react";
import API from "../services/api/apiClient";

export type AdminIdentity = {
    id: string;
    email: string;
    roles: string[];   // ["admin"], ["superAdmin"], etc.
    iat?: number;
    exp?: number;
};

export function useAdminAuth() {
    const [admin, setAdmin] = useState<AdminIdentity | null>(null);
    const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { data } = await API.get("/admin/auth/me");
                if (!alive) return;
                setAdmin(data);
                setStatus("authenticated");
            } catch {
                if (!alive) return;
                setAdmin(null);
                setStatus("unauthenticated");
            }
        })();
        return () => { alive = false; };
    }, []);

    return { admin, status, setAdmin };
}
