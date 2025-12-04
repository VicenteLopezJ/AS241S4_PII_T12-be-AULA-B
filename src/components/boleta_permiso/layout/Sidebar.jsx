// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileCheck, 
  FileText,
  ClipboardList,
  Clock,
  CheckCircle
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/rrhh/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      key: 'dashboard',
      // Dashboard visible para todos los roles autenticados
      requiredPermissions: [],
    },
    // Gestión de permisos (boletas)
    {
      path: '/rrhh/permisos',
      icon: ClipboardList,
      label: 'Permisos (Boletas)',
      key: 'permisos',
      // Crear y ver solicitudes propias
      requiredPermissions: ['crear_solicitud', 'ver_solicitud_propia'],
    },
    {
      path: '/rrhh/jefe/permisos/revision',
      icon: FileCheck,
      label: 'Revisar Permisos',
      key: 'revisar-permisos',
      // Ver / aprobar solicitudes de su área
      requiredPermissions: ['ver_solicitudes_area', 'aprobar_solicitud'],
    },
    {
      path: '/rrhh/jefe/permisos/aprobados',
      icon: CheckCircle,
      label: 'Aprobaciones',
      key: 'aprobaciones',
      // Ver solicitudes aprobadas / reportes
      requiredPermissions: ['ver_reportes', 'ver_estadisticas'],
    },
    // Registros de asistencia (RRHH)
    {
      path: '/rrhh/registros',
      icon: Clock,
      label: 'Registros de Asistencia',
      key: 'registros',
      requiredPermissions: ['ver_toda_asistencia', 'ver_asistencia_area'],
    },
    {
      path: '/rrhh/registros/historial',
      icon: Clock,
      label: 'Registros en el sistema',
      key: 'registros-historial',
      requiredPermissions: ['ver_toda_asistencia', 'ver_reportes'],
    },
    // Organización y personas
    {
      path: '/rrhh/usuarios',
      icon: Users,
      label: 'Usuarios',
      key: 'usuarios',
      requiredPermissions: ['ver_todos_usuarios', 'ver_usuarios_area'],
    },
    {
      path: '/rrhh/areas',
      icon: FileText,
      label: 'Áreas',
      key: 'areas',
      requiredPermissions: ['ver_area'],
    },
    {
      path: '/rrhh/empresa',
      icon: Building2,
      label: 'Empresa',
      key: 'empresa',
      requiredPermissions: ['ver_reportes'],
    },
    // Vista personal
    {
      path: '/rrhh/mi-asistencia',
      icon: Clock,
      label: 'Mi Asistencia',
      key: 'mi-asistencia',
      requiredPermissions: ['ver_asistencia_propia'],
    },
  ];

  let rolId = null;
  let permisos = [];
  let nombres = '';
  let apellidos = '';
  let cargo = '';
  let rrhhEntry = null;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const info = JSON.parse(raw);
        const usuario = info.usuario || {};

        rolId = info.rol_id ?? info.rolId ?? usuario.rol_id ?? null;
        permisos = info.permisos || [];

        // Priorizar nombres y apellidos directos; si no, tomar de usuario
        nombres = info.nombres || usuario.nombres || '';
        apellidos = info.apellidos || usuario.apellidos || '';
        cargo = info.cargo || usuario.cargo || '';
      }

      try {
        rrhhEntry = sessionStorage.getItem('rrhhEntry');
      } catch (e) {
        console.warn('No se pudo leer rrhhEntry desde sessionStorage', e);
      }
    } catch (e) {
      console.warn('No se pudo leer userInfo desde localStorage', e);
    }
  }

  const isAdmin = rolId === 1;
  const isJefe = rolId === 2;
  const isEmpleado = rolId === 3;

  const filteredMenuItems = menuItems.filter((item) => {
    // Admin RRHH: ve todo el menú excepto 'Revisar Permisos'
    if (isAdmin) {
      return item.key !== 'revisar-permisos';
    }

    // Si no conocemos el rol, solo dashboard
    if (!rolId) {
      return item.key === 'dashboard';
    }

    // Reglas por rol (sin depender de la lista de permisos)
    if (isJefe) {
      // Jefe: Panel, Permisos, Revisar Permisos, Aprobaciones y Usuarios
      return ['dashboard', 'permisos', 'revisar-permisos', 'aprobaciones', 'usuarios'].includes(item.key);
    }

    if (isEmpleado) {
      // Empleado: solo panel, permisos y su propia asistencia
      return ['dashboard', 'permisos', 'mi-asistencia'].includes(item.key);
    }

    // Cualquier otro rol desconocido: solo dashboard
    return item.key === 'dashboard';
  });

  const nombreCompleto = `${nombres} ${apellidos}`.trim() || 'Usuario';
  const iniciales = (nombres && apellidos)
    ? `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
    : nombreCompleto.slice(0, 2).toUpperCase();

  const isEmpleadoEntry = rrhhEntry === 'empleado';

  const handleLogout = () => {
    if (isEmpleadoEntry) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          sessionStorage.removeItem('rrhhEntry');
        }
      } catch (e) {
        console.warn('Error al limpiar sesión RRHH para empleado:', e);
      }

      navigate('/empleado', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="bg-gray-900 w-64 min-h-screen flex flex-col border-r border-gray-800 print:hidden">
      {/* Encabezado de la aplicación */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Sistema de Permisos</p>
          <p className="text-xs text-gray-400">Gestión Empresarial</p>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const label = item.label === 'Dashboard'
            ? 'Panel'
            : isJefe && item.key === 'usuarios'
            ? 'Mi Equipo'
            : isJefe && item.key === 'revisar-permisos'
            ? 'Revisar Permisos'
            : isJefe && item.key === 'aprobaciones'
            ? 'Aprobaciones'
            : item.label;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/rrhh/registros'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Información de usuario y cerrar sesión */}
      <div className="border-t border-gray-800 px-4 py-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-sm font-semibold text-white">
            {iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{nombreCompleto}</p>
            {cargo && (
              <p className="text-xs text-gray-400 truncate">{cargo}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <span className="text-base rotate-180">↩</span>
          <span>{isEmpleadoEntry ? 'Cerrar sesión' : 'Volver'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
