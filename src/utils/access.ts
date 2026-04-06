// src/utils/access.ts
import type { AdminIdentity } from "../hooks/useAdminAuth";

export function hasAnyRole(user: any, roles: string[]) {
    if (!user) return false;
    const userRoleString = user.role ? [user.role] : [];
    const userRolesArray = Array.isArray(user.roles) ? user.roles : [];
    const combinedRoles = [...userRoleString, ...userRolesArray];
    return combinedRoles.some(r => roles.includes(r));
}
