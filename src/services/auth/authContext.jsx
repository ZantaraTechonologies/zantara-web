// src/services/auth/authContext.jsx
import { createContext, useEffect, useContext } from "react";
import { useAuthStore } from "../../store/auth/authStore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const { user, isAuthenticated, login, logout, fetchMe, loading } = useAuthStore();

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;