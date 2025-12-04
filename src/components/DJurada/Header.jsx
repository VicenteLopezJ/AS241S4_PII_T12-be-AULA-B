import React from 'react';
import { User, LogOut, Home, Building2, FolderKanban, FileText, CheckSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../pages/declaracionJurada/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth(); // ✅ Obtener usuario y logout

    // 🔍 DEBUG: Ver qué datos tiene el usuario
    React.useEffect(() => {
        console.log('🔍 DEBUG Header - Usuario completo:', user);
        console.log('🔍 DEBUG Header - Rol del usuario:', user?.role);
        console.log('🔍 DEBUG Header - Tipo de rol:', typeof user?.role);
    }, [user]);

    // ✅ Menú completo con permisos por rol
    const allMenuItems = [
        { 
            icon: FileText, 
            label: 'Declaraciones', 
            path: '/',
            roles: ['ADMIN', 'APROBADOR', 'SUPERVISOR', 'TRABAJADOR', 'USUARIO'] // ✅ Agregado TRABAJADOR
        },
        { 
            icon: CheckSquare, 
            label: 'Aprobaciones', 
            path: '/aprobaciones',
            roles: ['ADMIN', 'APROBADOR', 'SUPERVISOR']
        },
        { 
            icon: Building2, 
            label: 'Centros de Costos', 
            path: '/centros-costos',
            roles: ['ADMIN']
        },
        { 
            icon: FolderKanban, 
            label: 'Proyectos', 
            path: '/proyectos',
            roles: ['ADMIN']
        }
    ];

    // ✅ Filtrar menú según el rol del usuario (con fallback a TRABAJADOR)
    const userRole = user?.role || user?.rol || 'TRABAJADOR'; // Intentar role o rol
    const menuItems = allMenuItems.filter(item => 
        item.roles.includes(userRole)
    );

    // 🔍 DEBUG: Ver menú filtrado
    React.useEffect(() => {
        console.log('🔍 DEBUG Header - Rol detectado:', userRole);
        console.log('🔍 DEBUG Header - Items de menú filtrados:', menuItems.length);
        console.log('🔍 DEBUG Header - Menú completo:', menuItems.map(i => i.label));
    }, [userRole, menuItems]);

    const isActive = (path) => {
        return location.pathname === path;
    };

    // ✅ Función para cerrar sesión
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
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
            'ADMIN': 'bg-red-500',
            'APROBADOR': 'bg-blue-500',
            'SUPERVISOR': 'bg-purple-500',
            'TRABAJADOR': 'bg-green-500',
            'USUARIO': 'bg-gray-500'
        };
        return colors[role] || 'bg-gray-500';
    };

    return (
        <header className="sticky top-0 z-40 border-b shadow-lg bg-slate-800 border-slate-700">
            <div className="px-6 mx-auto max-w-7xl">
                <div className="flex items-center justify-between h-16">
                    {/* Logo y Título */}
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-500 p-2.5 rounded-lg">
                            <FileText className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">Gestión Administrativa</h1>
                            <p className="text-xs text-slate-400">Declaraciones Juradas</p>
                        </div>
                    </div>

                    {/* Navigation Menu - Dinámico por rol */}
                    <nav className="items-center hidden gap-2 md:flex">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                                        active
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRoleBadgeColor(userRole)}`}>
                                <User className="text-white" size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">
                                    {user?.nombre || user?.name || user?.email || 'Usuario'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {getRoleLabel(userRole)}
                                </p>
                            </div>
                        </div>
                        {/* ✅ Botón de logout funcional */}
                        <button 
                            onClick={handleLogout}
                            className="p-2 transition-colors rounded-lg hover:bg-slate-700 group"
                            title="Cerrar sesión"
                        >
                            <LogOut className="transition-colors text-slate-400 group-hover:text-red-400" size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - También dinámico */}
            <div className="border-t md:hidden border-slate-700 bg-slate-800">
                <div className="flex gap-2 px-4 py-2 overflow-x-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
                                    active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 bg-slate-700'
                                }`}
                            >
                                <Icon size={14} />
                                <span className="text-xs">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};

export default Header;