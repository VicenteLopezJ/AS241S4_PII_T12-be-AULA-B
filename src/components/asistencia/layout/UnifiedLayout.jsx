// src/components/asistencia/layout/UnifiedLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileText,
  Bell,
  Home,
  Users,
  Calendar,
  BarChart3,
  GraduationCap,
  LogOut,
  Menu,
  X,
  KeyRound,
  UserCog,
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const UnifiedLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Colores del nuevo diseño
  const activeBg = "bg-[#C8FAD6]";
  const activeTextColor = "text-black";
  const hoverBg = "hover:bg-[#C8FAD6]";
  const hoverTextColor = "hover:text-[#007867]";
  const defaultLetterColor = "text-white";
  const defaultIconColor = "text-[#637381]";

  const menusByRole = {
    student: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/asistencia/student/dashboard" },
      { name: "Mis Cursos", icon: BookOpen, path: "/asistencia/student/cursos" },
      { name: "Asistencias", icon: ClipboardCheck, path: "/asistencia/student/asistencias" },
      { name: "Justificaciones", icon: FileText, path: "/asistencia/student/justificaciones" },
      { name: "Alertas", icon: Bell, path: "/asistencia/student/alertas" },
    ],
    estudiante: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/asistencia/student/dashboard" },
      { name: "Mis Cursos", icon: BookOpen, path: "/asistencia/student/cursos" },
      { name: "Asistencias", icon: ClipboardCheck, path: "/asistencia/student/asistencias" },
      { name: "Justificaciones", icon: FileText, path: "/asistencia/student/justificaciones" },
      { name: "Alertas", icon: Bell, path: "/asistencia/student/alertas" },
    ],
    teacher: [
      { name: "Dashboard", icon: Home, path: "/asistencia/teacher/inicial" },
      { name: "Tomar Asistencia", icon: Calendar, path: "/asistencia/teacher/attendance" },
      { name: "Justificaciones", icon: FileText, path: "/asistencia/teacher/justifications" },
      { name: "Reportes", icon: BarChart3, path: "/asistencia/teacher/reports" },
    ],
    profesor: [
      { name: "Dashboard", icon: Home, path: "/asistencia/teacher/inicial" },
      { name: "Tomar Asistencia", icon: Calendar, path: "/asistencia/teacher/attendance" },
      { name: "Justificaciones", icon: FileText, path: "/asistencia/teacher/justifications" },
      { name: "Reportes", icon: BarChart3, path: "/asistencia/teacher/reports" },
    ],
    admin: [
      { name: "Dashboard", icon: Home, path: "/asistencia/admin/initial" },
      { name: "Usuarios", icon: UserCog, path: "/asistencia/admin/usuarios" },
      { name: "Maestros", icon: BookOpen, path: "/asistencia/admin/manage-teacher" },
      { name: "Estudiantes", icon: Users, path: "/asistencia/admin/estudiantes" },
      { name: "Asistencias", icon: Calendar, path: "/asistencia/admin/contro-asistencias" },
    ],
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setIsCheckingAuth(false);
      }, 500);
    }
  }, [loading]);

  useEffect(() => {
    if (!isCheckingAuth && !loading && !user) {
      console.log('No hay usuario del módulo de asistencias después de cargar, redirigiendo...');
      navigate("/asistencia/login", { replace: true });
    }
  }, [isCheckingAuth, loading, user, navigate]);

  const userRole = (user?.role || "student").toLowerCase();
  const navItems = menusByRole[userRole] || menusByRole.student;
  const getIsActive = (path) => location.pathname.startsWith(path);
  const userEmail = user?.email || "usuario@vallegrande.edu.pe";

  const getRoleLabel = () => {
    const roleLabels = {
      admin: "Administrador",
      teacher: "Profesor",
      profesor: "Profesor",
      student: "Estudiante",
      estudiante: "Estudiante",
    };
    return roleLabels[userRole] || "Usuario";
  };

  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#161C24]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A76F] mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    console.log('Volver a Módulos desde el módulo de asistencias...');
    
    logout();
    
    const mainUser = localStorage.getItem('user');
    const mainToken = localStorage.getItem('token');
    
    console.log('Verificando sesión principal:', {
      mainUser: mainUser ? 'Existe' : 'No existe',
      mainToken: mainToken ? 'Existe' : 'No existe'
    });
    
    if (mainUser && mainToken &&
        mainUser !== 'undefined' &&
        mainToken !== 'undefined' &&
        mainUser !== 'null' &&
        mainToken !== 'null') {
      
      try {
        const parsedUser = JSON.parse(mainUser);
        const roleLower = (parsedUser.role || '').toLowerCase();
        
        console.log('Sesión principal encontrada, rol:', roleLower);
        
        if (roleLower === 'estudiante' || 
            roleLower === 'student' || 
            roleLower === 'profesor' || 
            roleLower === 'teacher') {
          console.log('Redirigiendo a /academic');
          window.location.href = '/academic';
        } else if (roleLower === 'empleado') {
          console.log('Redirigiendo a /empleado');
          window.location.href = '/empleado';
        } else {
          console.log('Redirigiendo a /dashboard');
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Error al parsear usuario principal:', error);
        window.location.href = '/dashboard';
      }
    } else {
      console.log('No hay sesión principal, redirigiendo a /login');
      window.location.href = '/login';
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-[#161C24] relative">
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-[#1A212D] text-white rounded-lg shadow-lg hover:bg-[#2a3544] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed top-0 left-0 z-40
          w-64 bg-[#1A212D] text-white flex flex-col shadow-2xl h-screen
          transition-transform duration-300 ease-in-out
          overflow-y-auto
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-[#2a3544] flex-shrink-0">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[#00A76F] flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xl font-bold leading-none truncate text-[#00A76F]">Valle Grande</h4>
              <p className="text-xs text-gray-400 truncate">{getRoleLabel()}</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = getIsActive(item.path);
              const IconComponent = item.icon;

              const itemLetterColor = isActive ? activeTextColor : defaultLetterColor;
              const itemIconColor = isActive ? activeTextColor : defaultIconColor;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`
                      flex items-center gap-4 py-3 px-3 font-medium text-sm rounded-lg transition-all duration-200
                      ${isActive
                        ? `${activeBg} font-semibold`
                        : `${hoverBg} text-white`
                      }
                    `}
                  >
                    <IconComponent
                      className={`w-5 h-5 flex-shrink-0 ${itemIconColor} ${!isActive ? hoverTextColor : ''}`}
                    />
                    <span className={`truncate ${itemLetterColor} ${!isActive ? hoverTextColor : ''}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700 flex-shrink-0 space-y-3">
          <div className="p-3 bg-[#161C24] rounded-lg">
            <p className="text-sm font-semibold text-white truncate">{userEmail}</p>
            <p className="text-xs text-[#00A76F] mt-2 uppercase tracking-wide font-semibold">
              {getRoleLabel()}
            </p>
          </div>

          {(userRole === 'student' || userRole === 'estudiante') && (
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-3 py-2 px-3 text-white hover:text-[#007867] hover:bg-[#C8FAD6] transition-colors w-full rounded-md font-medium"
            >
              <KeyRound className="w-5 h-5 flex-shrink-0 text-[#637381]" />
              <span>Cambiar Contraseña</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2 px-3 bg-red-600 text-white hover:bg-red-700 transition-colors w-full rounded-md font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transform rotate-180" />
            <span>Volver a Módulos</span>
          </button>
        </div>
      </aside>

      <main
        className={`
          flex-1 min-h-screen overflow-y-auto bg-[#161C24] w-full
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-64' : 'ml-0'}
        `}
      >
        <div className="h-full w-full p-4 sm:p-6">
          <Outlet />
        </div>
      </main>

      {(userRole === 'student' || userRole === 'estudiante') && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userId={user?.userId}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default UnifiedLayout;