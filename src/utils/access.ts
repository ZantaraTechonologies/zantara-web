// src/utils/access.ts
import type { AdminIdentity } from "../hooks/useAdminAuth";

export function hasAnyRole(user: any, roles: string[]) {
    if (!user) return false;
    const rolesArray = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
    return rolesArray.some(r => roles.includes(r));
}
