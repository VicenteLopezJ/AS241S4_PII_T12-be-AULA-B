
import React, { useState } from 'react';
import { User, LogOut, Building2, FolderKanban, FileText, CheckSquare, Menu, X, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../pages/declaracionJurada/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // ✅ Menú completo con permisos por rol
    const allMenuItems = [
        { 
            icon: FileText, 
            label: 'Declaraciones', 
            path: '/dj/dashboard',
            roles: ['ADMIN', 'APROBADOR', 'SUPERVISOR', 'TRABAJADOR', 'USUARIO'],
            color: 'text-blue-400'
        },
        { 
            icon: CheckSquare, 
            label: 'Aprobaciones', 
            path: '/dj/aprobaciones',
            roles: ['ADMIN', 'APROBADOR', 'SUPERVISOR'],
            color: 'text-purple-400'
        },
        { 
            icon: Building2, 
            label: 'Centros de Costos', 
            path: '/dj/centros-costos',
            roles: ['ADMIN'],
            color: 'text-teal-400'
        },
        { 
            icon: FolderKanban, 
            label: 'Proyectos', 
            path: '/dj/proyectos',
            roles: ['ADMIN'],
            color: 'text-orange-400'
        }
    ];

    // ✅ Filtrar menú según el rol del usuario
    const userRole = user?.role || user?.rol || 'TRABAJADOR';
const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

    const isActive = (path) => location.pathname === path;

    // ✅ Función para cerrar sesión
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/dj/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    // ✅ Obtener nombre de rol legible
    const getRoleLabel = (role) => {
        const roleLabels = {
            'ADMIN': 'Administrador',
            'APROBADOR': 'Aprobador',
            'SUPERVISOR': 'Supervisor',
            'TRABAJADOR': 'Trabajador',
            'USUARIO': 'Usuario'
        };
        return roleLabels[role] || 'Usuario';
    };

    // ✅ Obtener color del badge según rol
    const getRoleBadgeColor = (role) => {
        const colors = {
            'ADMIN': 'bg-gradient-to-br from-red-500 to-red-600',
            'APROBADOR': 'bg-gradient-to-br from-blue-500 to-blue-600',
            'SUPERVISOR': 'bg-gradient-to-br from-purple-500 to-purple-600',
            'TRABAJADOR': 'bg-gradient-to-br from-green-500 to-green-600',
            'USUARIO': 'bg-gradient-to-br from-gray-500 to-gray-600'
        };
        return colors[role] || 'bg-gradient-to-br from-gray-500 to-gray-600';
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed z-50 p-3 text-white transition-all rounded-lg shadow-lg top-4 left-4 lg:hidden bg-slate-800 hover:bg-slate-700"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay para mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-in-out
                    bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                    border-r border-slate-700 shadow-2xl
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header del Sidebar */}
                    <div className={`p-4 border-b border-slate-700 ${isCollapsed ? 'px-2' : ''}`}>
                        <div className="flex items-center justify-between">
                            {!isCollapsed && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600">
                                        <FileText className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h1 className="text-sm font-bold text-white">Gestión Admin</h1>
                                        <p className="text-xs text-slate-400">Declaraciones</p>
                                    </div>
                                </div>
                            )}
                            {isCollapsed && (
                                <div className="p-2 mx-auto rounded-lg bg-gradient-to-br from-teal-500 to-blue-600">
                                    <FileText className="text-white" size={20} />
                                </div>
                            )}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="hidden p-1.5 text-slate-400 transition-colors rounded-lg lg:block hover:bg-slate-700 hover:text-white"
                            >
                                <ChevronLeft
                                    size={18}
                                    className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Perfil de Usuario */}
                    <div className={`p-4 border-b border-slate-700 ${isCollapsed ? 'px-2' : ''}`}>
                        {!isCollapsed ? (
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${getRoleBadgeColor(userRole)} shadow-lg`}>
                                    <User className="text-white" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {user?.nombre || user?.name || user?.email || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {getRoleLabel(userRole)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={`w-10 h-10 mx-auto rounded-xl ${getRoleBadgeColor(userRole)} shadow-lg flex items-center justify-center`}>
                                <User className="text-white" size={18} />
                            </div>
                        )}
                    </div>

                    {/* Navegación */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        <p className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'text-center' : 'px-3'}`}>
                            {isCollapsed ? '•••' : 'Menú Principal'}
                        </p>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsMobileOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                        ${active
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }
                                        ${isCollapsed ? 'justify-center px-2' : ''}
                                    `}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <Icon 
                                        size={20} 
                                        className={active ? 'text-white' : item.color}
                                    />
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium">{item.label}</span>
                                    )}
                                    {!isCollapsed && active && (
                                        <div className="w-2 h-2 ml-auto bg-white rounded-full animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer con Logout */}
                    <div className={`p-4 border-t border-slate-700 ${isCollapsed ? 'px-2' : ''}`}>
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full flex items-center gap-3 px-3 py-3 rounded-xl
                                text-slate-300 transition-all duration-200
                                hover:bg-red-500/10 hover:text-red-400 
                                border border-slate-700 hover:border-red-500/50
                                ${isCollapsed ? 'justify-center px-2' : ''}
                            `}
                            title={isCollapsed ? 'Cerrar Sesión' : ''}
                        >
                            <LogOut size={20} />
                            {!isCollapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
