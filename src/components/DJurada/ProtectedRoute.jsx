import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../pages/declaracionJurada/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/dj/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Acceso Denegado</h2>
                    <p className="text-slate-300">
                        No tienes permisos para acceder a esta sección.
                    </p>
                    <p className="text-slate-400 mt-2">
                        Se requiere rol: {allowedRoles.join(', ')}
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;