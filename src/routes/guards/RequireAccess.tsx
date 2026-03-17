// src/components/RequireAccess.tsx
import { Outlet } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { hasAnyRole } from "../../utils/access";
import NotAuthenticated from "../../pages/system/NotAuthenticated";
import NotAuthorized from "../../pages/system/NotAuthorized";

type Props = {
    anyRole?: string[];        // default: ["admin","superAdmin"]
    loadingText?: string;
};

export default function RequireAccess({ anyRole = ["admin", "superAdmin"], loadingText = "Checking access…" }: Props) {
    const { admin, status } = useAdminAuth();

    if (status === "loading") {
        return <div className="min-h-[50vh] grid place-items-center text-slate-600">{loadingText}</div>;
    }
    if (status === "unauthenticated" || !admin) {
        return <NotAuthenticated />;
    }
    if (!hasAnyRole(admin, anyRole)) {
        return <NotAuthorized requiredRoles={anyRole} />;
    }
    return <Outlet />;
}
