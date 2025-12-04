import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../services/declaracionJurada/declaracionJurada';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

// Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authAPI.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authAPI.login(email, password);
            setUser(data.usuario);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            return await authAPI.register(userData);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        login,
        logout,
        register,
        loading,
        isAuthenticated: !!user
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};