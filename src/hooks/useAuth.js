// src/hooks/useAuth.js
import { useContext } from 'react';
import AuthContext from '../services/auth/authContext';

export function useAuth() {
    return useContext(AuthContext);
}
