import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Folder,
  Building,
  DollarSign,
  FileSignature,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  KeyRound,
} from 'lucide-react';

/**
 * UnifiedLayout - Layout unificado con nuevo diseño inspirado en el segundo sidebar
 */
const UnifiedLayout = ({ user = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 🎯 Definir menús por rol para el sistema de vales
  const menusByRole = {
    admin: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/valeProvisional/dashboard" },
      { name: "Gestión de Vales", icon: FileText, path: "/valeProvisional/vales" },
      { name: "Documentos", icon: Folder, path: "/valeProvisional/documentos" },
      { name: "Solicitantes", icon: Users, path: "/valeProvisional/solicitantes" },
      { name: "Administración", icon: Settings, path: "/valeProvisional/administracion" },
    ],
    manager: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/valeProvisional/dashboard" },
      { name: "Gestión de Vales", icon: FileText, path: "/valeProvisional/vales" },
      { name: "Documentos", icon: Folder, path: "/valeProvisional/documentos" },
      { name: "Solicitantes", icon: Users, path: "/valeProvisional/solicitantes" },
      { name: "Administración", icon: Settings, path: "/valeProvisional/administracion" },
    ],
    user: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/valeProvisional/dashboard" },
      { name: "Mis Vales", icon: FileText, path: "/valeProvisional/vales" },
      { name: "Mis Documentos", icon: Folder, path: "/valeProvisional/documentos" },
    ],
    applicant: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/valeProvisional/dashboard" },
      { name: "Solicitar Vale", icon: FileText, path: "/valeProvisional/solicitar-vale" },
      { name: "Mis Solicitudes", icon: Folder, path: "/valeProvisional/mis-solicitudes" },
    ],
  };

  // 🎯 Submenús para el módulo de Administración
  const adminSubMenus = [
    { name: "Áreas", icon: Building, path: "/valeProvisional/administracion/areas" },
    { name: "Centros de Costo", icon: DollarSign, path: "/valeProvisional/administracion/centros-costo" },
    { name: "Firmas Autorizadas", icon: FileSignature, path: "/valeProvisional/administracion/firmas" },
  ];

  const userRole = user?.role || "admin";
  const navItems = menusByRole[userRole] || menusByRole.admin;
  const getIsActive = (path) => location.pathname.startsWith(path);
  const userEmail = user?.email || "admin@sistema-vales.com";

  const getRoleLabel = () => {
    const roleLabels = {
      admin: "Administrador",
      manager: "Gestor",
      user: "Usuario",
      applicant: "Solicitante",
    };
    return roleLabels[userRole] || "Administrador";
  };

  // Verificar si estamos en una subpágina de administración
  const isAdminSubpage = location.pathname.startsWith("/valeProvisional/administracion/");

  const handleLogout = () => {
    // Redirigir al dashboard principal del sistema
    navigate("/dashboard");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChangePassword = () => {
    // Función temporal - puedes implementar el modal más tarde
    alert("Función de cambio de contraseña - Próximamente");
  };

  // Colores del nuevo diseño
  const activeBg = "bg-[#C8FAD6]";  
  const activeTextColor = "text-black"; 
  const hoverBg = "hover:bg-[#C8FAD6]"; 
  const hoverTextColor = "hover:text-black";
  const defaultLetterColor = "text-white"; 
  const defaultIconColor = "text-[#637381]"; 

  return (
    <div className="flex min-h-screen bg-gray-800 relative">
      {/* Botón Hamburguesa */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-[#1A212D] text-white rounded-lg shadow-lg hover:bg-[#2a3544] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar con nuevo diseño */}
      <aside
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed left-0 top-0 h-full w-64 bg-[#1A212D] z-40 p-2 min-h-screen flex flex-col
          transition-transform duration-300 ease-in-out
          overflow-y-auto
        `}
      >
        
        {/* Encabezado */}
        <div className="p-1.5 flex-1">
          <div className="flex items-center mb-2 border-b border-[#2a3544] p-1">
            <div className="w-8 h-8 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#00A76F]" />
            </div>
            <span className="text-[#00A76F] font-bold text-lg ml-2">
              Sistema Vales
            </span>
            <button
              onClick={toggleSidebar}
              className="ml-auto text-gray-400 hover:text-white transition-colors lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación Principal */}
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = getIsActive(item.path);
              const IconComponent = item.icon;

              const itemLetterColor = isActive ? activeTextColor : defaultLetterColor;
              const itemIconColor = isActive ? activeTextColor : defaultIconColor;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 
                    px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group
                    ${isActive ? `${activeBg} ${activeTextColor}` : `${defaultLetterColor} ${hoverBg} ${hoverTextColor}`}
                  `}
                >
                  <IconComponent 
                    className={`w-5 h-5 ${isActive ? activeTextColor : `${defaultIconColor} ${hoverTextColor}`}`} 
                  />
                  <span 
                    className={isActive ? activeTextColor : `${defaultLetterColor} ${hoverTextColor}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Submenús de Administración */}
            {(userRole === 'admin' && getIsActive('/valeProvisional/administracion')) && (
              <div className="mt-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Módulos Admin
                </div>
                <div className="mt-1 space-y-1">
                  {adminSubMenus.map((subItem) => {
                    const isSubActive = getIsActive(subItem.path);
                    const SubIconComponent = subItem.icon;

                    const subItemLetterColor = isSubActive ? activeTextColor : defaultLetterColor;
                    const subItemIconColor = isSubActive ? activeTextColor : defaultIconColor;

                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`
                          w-full flex items-center gap-3 pl-8
                          px-4 py-2 rounded-md transition-colors duration-200 font-semibold shadow group
                          ${isSubActive ? `${activeBg} ${activeTextColor}` : `${defaultLetterColor} ${hoverBg} ${hoverTextColor}`}
                        `}
                      >
                        <SubIconComponent 
                          className={`w-4 h-4 ${isSubActive ? activeTextColor : `${defaultIconColor} ${hoverTextColor}`}`} 
                        />
                        <span 
                          className={isSubActive ? activeTextColor : `${defaultLetterColor} ${hoverTextColor}`}
                        >
                          {subItem.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Sección de Perfil y Acciones */}
        <div className="px-4 py-4 border-t border-[#2a3544] space-y-3">
          <div className="text-xs text-white mb-2">
            Conectado como{" "}
            <span className="text-white font-semibold">
              {userEmail}
            </span>
            <div className="text-[#00A76F] mt-1 uppercase tracking-wide font-semibold">
              {getRoleLabel()}
            </div>
          </div>

          {/* Cambio de Contraseña */}
          <button
            onClick={handleChangePassword}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-[#2a3544] text-white transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>Cambiar contraseña</span>
          </button>

          {/* Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 bg-red-600 text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main 
        className={`
          flex-1 min-h-screen overflow-y-auto bg-gray-800 w-full
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-64' : 'ml-0'}
        `}
      >
        {/* Breadcrumb para subpáginas de administración */}
        {isAdminSubpage && (
          <div className="bg-gray-700 border-b border-gray-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2 py-3 text-sm">
                <Link 
                  to="/valeProvisional/administracion" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Administración
                </Link>
                <span className="text-gray-500">/</span>
                <span className="text-white font-medium">
                  {adminSubMenus.find(item => getIsActive(item.path))?.name || 'Módulo'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="h-full w-full p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UnifiedLayout;