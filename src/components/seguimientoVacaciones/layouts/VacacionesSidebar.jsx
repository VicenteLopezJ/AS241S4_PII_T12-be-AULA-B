import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  Home,
  Users,
  Building2,
  Calendar,
  UserCog,
  ClipboardList,
  LayoutGrid,
  FileText,
  CheckSquare,
  ArrowLeft,
  RefreshCw,
  User,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, permissions, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Definir items del menú para administradores
  const adminMenuItems = [
    {
      id: 'panel',
      label: 'Panel',
      icon: Home,
      requiredPermission: 'can_manage_areas',
    },
    {
      id: 'areas',
      label: 'Áreas',
      icon: Building2,
      requiredPermission: 'can_manage_areas',
    },
    {
      id: 'trabajadores',
      label: 'Trabajadores',
      icon: Users,
      requiredPermission: 'can_manage_employees',
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: UserCog,
      requiredPermission: 'can_manage_users',
    },
    {
      id: 'periodosVacacionales',
      label: 'Períodos Vacacionales',
      icon: Calendar,
      requiredPermission: 'can_manage_periods',
    },
    {
      id: 'empleadoPeriodo',
      label: 'Control de Días',
      icon: ClipboardList,
      requiredPermission: 'can_manage_periods',
    }
  ];

  // Definir items del menú para jefes
  const managerMenuItems = [
    {
      id: 'solicitudJefe',
      label: 'Aprobar Solicitudes',
      icon: CheckSquare,
      requiredPermission: 'can_approve_requests',
    },
    {
      id: 'miSaldoVacaciones',
      label: 'Mi Saldo de Vacaciones',
      icon: Wallet,
      requiredPermission: 'can_approve_requests',
    }
  ];

  // Definir items del menú para empleados
  const employeeMenuItems = [
    {
      id: 'solicitudEmpleado',
      label: 'Mis Solicitudes',
      icon: FileText,
      requiredPermission: 'can_create_request',
    },
    {
      id: 'miSaldoVacaciones',
      label: 'Mi Saldo de Vacaciones',
      icon: Wallet,
      requiredPermission: 'can_create_request',
    }
  ];

  // Determinar qué menú mostrar según el tipo de usuario
  let allMenuItems = [];

  // Si es administrador, mostrar menú de administrador
  if (hasPermission('can_manage_areas') || hasPermission('can_manage_users')) {
    allMenuItems = [...adminMenuItems];
  }
  // Si es jefe, mostrar menú de jefe
  else if (hasPermission('can_approve_requests')) {
    allMenuItems = [...managerMenuItems];
  }
  // Si es empleado, mostrar menú de empleado
  else if (hasPermission('can_create_request')) {
    allMenuItems = [...employeeMenuItems];
  }

  // Filtrar items del menú basados en permisos
  const menuItems = allMenuItems.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  }).map(item => {
    const path = `/vacaciones/${item.id === 'panel' ? 'panel' : item.id}`;
    const isActive = location.pathname.startsWith(path);

    return {
      ...item,
      isActive,
      onClick: () => navigate(path)
    };
  });

  // ⬇️ NUEVA FUNCIÓN: Regresar al dashboard principal
  const handleGoBack = () => {
    console.log('🔙 Regresando al dashboard principal...');
    navigate('/dashboard'); // Ajusta esta ruta según tu dashboard principal
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-[#1A212D] text-white flex flex-col shadow-xl z-50">

      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Sistema</h1>
            <p className="text-xs text-slate-400 font-medium">Administrativo</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.user_type}
            </p>
            {user?.area_name && (
              <div className="flex items-center gap-1.5 mt-1.5 bg-teal-500/10 rounded-md px-2 py-1">
                <Building2 className="w-3 h-3 text-teal-400 flex-shrink-0" />
                <span className="text-xs text-teal-300 font-medium truncate">
                  {user.area_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 overflow-y-auto px-3 
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-slate-900
  [&::-webkit-scrollbar-thumb]:bg-slate-800
  [&::-webkit-scrollbar-thumb]:rounded
  [&::-webkit-scrollbar-thumb]:hover:bg-teal-500">
        {menuItems.length > 0 ? (
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${item.isActive
                    ? 'bg-gradient-to-r from-teal-500/10 to-teal-600/10 text-teal-400 shadow-sm border border-teal-500/20'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${item.isActive
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'text-slate-400 group-hover:text-teal-400 group-hover:bg-slate-700/50'
                    }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-slate-500 text-sm px-4">
            No hay opciones disponibles
          </div>
        )}
      </nav>

      {/* ⬇️ BOTÓN REGRESAR */}
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        <button
          onClick={handleGoBack}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-slate-300 hover:bg-teal-500/10 hover:text-teal-400 group"
        >
          <div className="p-1.5 rounded-lg transition-colors text-slate-400 group-hover:text-teal-400 group-hover:bg-teal-500/20">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Regresar</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300">Sistema activo</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Gestión de Recursos Humanos
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;