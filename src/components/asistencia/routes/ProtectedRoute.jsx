// src/components/asistencia/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Protege rutas basándose en el rol del usuario
 * @param {string[]} allowedRoles - Array de roles permitidos ['admin', 'teacher', 'student']
 * @param {JSX.Element} children - Componente hijo a renderizar si tiene acceso
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Obtener el rol del usuario en minúsculas
  const userRole = user.role?.toLowerCase();

  // Verificar si el rol del usuario está en los roles permitidos
  const hasAccess = allowedRoles.some(
    role => role.toLowerCase() === userRole
  );

  // Si no tiene acceso, redirigir a su dashboard correspondiente
  if (!hasAccess) {
    console.warn(`⚠️ Acceso denegado: Usuario con rol "${userRole}" intentó acceder a ruta permitida solo para: ${allowedRoles.join(', ')}`);
    
    // Redirigir según el rol del usuario
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin/initial" replace />;
      case 'teacher':
        return <Navigate to="/teacher/inicial" replace />;
      case 'student':
        return <Navigate to="/student/cursos" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Si tiene acceso, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;