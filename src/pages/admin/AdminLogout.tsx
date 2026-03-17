// src/pages/admin/AdminLogout.tsx (optional tiny page)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api/apiClient";

export default function AdminLogout() {
    const nav = useNavigate();
    useEffect(() => {
        (async () => {
            try { await API.post("/admin/auth/logout"); } catch { }
            nav("/admin/login");
        })();
    }, [nav]);
    return null;
}
