import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Search, ChevronDown, Plus, Edit2, Trash2, UserX, UserCheck,
    GraduationCap, BookOpen, User, Users, TriangleAlert, ShieldCheck, X
} from 'lucide-react';
import { userService } from '../../../services/asistencia/admin/userAdmin/userService';

// --- Datos iniciales ---
const initialStats = {
    total: { title: 'Total Usuarios', count: 0, color: 'border-blue-600', iconColor: 'text-blue-400', bgColor: 'bg-blue-900/20', icon: Users, key: 'totalUsers' },
    students: { title: 'Estudiantes', count: 0, color: 'border-green-600', iconColor: 'text-green-400', bgColor: 'bg-green-900/20', icon: User, key: 'students' },
    teachers: { title: 'Docentes', count: 0, color: 'border-purple-600', iconColor: 'text-purple-400', bgColor: 'bg-purple-900/20', icon: BookOpen, key: 'teachers' },
    inactive: { title: 'Inactivos', count: 0, color: 'border-red-600', iconColor: 'text-red-400', bgColor: 'bg-red-900/20', icon: TriangleAlert, key: 'inactive' },
    admin: { title: 'Administradores', count: 0, color: 'border-yellow-600', iconColor: 'text-yellow-400', bgColor: 'bg-yellow-900/20', icon: ShieldCheck, key: 'admins' },
};

// --- Componentes ---
const StatCard = ({ title, count, color, iconColor, bgColor, icon: Icon, onClick }) => {
    const clickable = !!onClick;
    return (
        <div
            className={`flex flex-col p-4 sm:p-5 ${bgColor} border-2 ${color} rounded-xl shadow-lg ${
                clickable ? 'cursor-pointer hover:scale-[1.03] transition-transform' : ''
            }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-2xl font-bold text-white">{count}</span>
                    <span className="block text-sm text-gray-200">{title}</span>
                </div>
                <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
        </div>
    );
};

const RoleChip = ({ role }) => {
    const styles = {
        student: "bg-blue-700 border-blue-800",
        teacher: "bg-green-700 border-green-800",
        admin: "bg-purple-700 border-purple-800",
        default: "bg-gray-700 border-gray-800"
    };
    const IconMap = { student: GraduationCap, teacher: BookOpen, admin: ShieldCheck, default: User };
    const IconComp = IconMap[role] || IconMap.default;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white rounded-md border ${styles[role] || styles.default}`}>
            <IconComp className="w-3.5 h-3.5" /> {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
    );
};

const StateChip = ({ state }) => (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md ${state === 'active' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
        {state === 'active' ? 'Activo' : 'Inactivo'}
    </span>
);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric' });
    } catch {
        return '-';
    }
};

const UserRow = ({ user, toggleUserState, onEdit, onDelete }) => {
    const isInactive = user.status === 'inactive';
    const ActionIcon = isInactive ? UserCheck : UserX;
    const actionColor = isInactive ? 'text-green-400' : 'text-red-600';
    const base = "p-2 rounded-md bg-slate-500/80 hover:bg-slate-600/90";

    return (
        <tr className="border-b border-gray-400/50 hover:bg-slate-400/50">
            <td className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white">
                    {user.email?.slice(0, 2).toUpperCase()}
                </div>
                <div><p className="font-medium text-gray-900">{user.email}</p></div>
            </td>
            <td className="p-4 text-gray-800 font-mono text-sm">{user.userId}</td>
            <td className="p-4"><RoleChip role={user.role} /></td>
            <td className="p-4"><StateChip state={user.status} /></td>
            <td className="p-4 text-sm text-gray-700">{formatDate(user.createdAt)}</td>
            <td className="p-4 text-sm text-gray-700">{formatDate(user.updatedAt)}</td>
            <td className="p-4">
                <div className="flex space-x-2">
                    <button className={`${base} text-blue-600`} onClick={() => onEdit(user)}><Edit2 className="w-4 h-4" /></button>
                    <button className={`${base} ${actionColor}`} onClick={() => toggleUserState(user.userId, isInactive)}><ActionIcon className="w-4 h-4" /></button>
                    <button className={`${base} text-red-600`} onClick={() => onDelete(user.userId)}><Trash2 className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

const UserFormModal = ({ userData, onClose, onSave }) => {
    const [form, setForm] = useState(userData || { email: '', password: '', role: 'student', status: 'active' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    {userData ? 'Editar Usuario' : 'Crear Usuario'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded-md focus:ring focus:ring-blue-400" />
                    </div>

                    {!userData && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Contraseña</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full p-2 border rounded-md focus:ring focus:ring-blue-400" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Rol</label>
                        <select name="role" value={form.role} onChange={handleChange} className="w-full p-2 border rounded-md">
                            <option value="student">Estudiante</option>
                            <option value="teacher">Docente</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Estado</label>
                        <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded-md">
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Componente Principal ---
const App = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(initialStats);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('Todos');
    const [stateFilter, setStateFilter] = useState('Todos');
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await userService.getUsers(roleFilter, stateFilter);
            setUsers(data);
        } catch {
            Swal.fire('Error', 'No se pudo cargar la lista de usuarios', 'error');
        }
    }, [roleFilter, stateFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await userService.getUserStats();
            setStats({
                total: { ...initialStats.total, count: data.totalUsers },
                students: { ...initialStats.students, count: data.byRole.students },
                teachers: { ...initialStats.teachers, count: data.byRole.teachers },
                inactive: { ...initialStats.inactive, count: data.byStatus.inactive },
                admin: { ...initialStats.admin, count: data.byRole.admins },
            });
        } catch {
            Swal.fire('Error', 'Error al obtener estadísticas', 'error');
        }
    }, []);

    useEffect(() => { fetchUsers(); fetchStats(); }, [fetchUsers, fetchStats]);

    const toggleUserState = async (id, inactive) => {
        try {
            if (inactive) await userService.restoreUser(id);
            else await userService.deactivateUser(id);
            Swal.fire('Éxito', 'Estado del usuario actualizado', 'success');
            await fetchUsers(); await fetchStats();
        } catch {
            Swal.fire('Error', 'No se pudo cambiar el estado del usuario', 'error');
        }
    };

    const handleSaveUser = async (form) => {
        try {
            if (form.userId) {
                await userService.updateUser(form.userId, form);
                Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
            } else {
                await userService.createUser(form);
                Swal.fire('Creado', 'Usuario creado correctamente', 'success');
            }
            await fetchUsers();
            await fetchStats();
        } catch {
            Swal.fire('Error', 'No se pudo guardar el usuario', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: '¿Eliminar usuario?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        });

        if (!result.isConfirmed) return;

        try {
            await userService.deleteUser(userId);
            Swal.fire('Eliminado', 'El usuario fue eliminado permanentemente', 'success');
            await fetchUsers();
            await fetchStats();
        } catch {
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
        }
    };

    const handleTeacherClick = () => navigate('/admin/manage-teacher');
    const handleStudentClick = () => navigate('/admin/estudiantes'); // ✨ NUEVO HANDLER PARA ESTUDIANTES

    const finalFiltered = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-800 p-4 sm:p-8 font-inter">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-gray-400 mt-1">Administra estudiantes, docentes y personal del sistema.</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {Object.values(stats).map(s => (
                    <StatCard 
                        key={s.title} 
                        {...s} 
                        onClick={
                            s.key === 'teachers' 
                                ? handleTeacherClick 
                                : s.key === 'students' // ✨ CONDICIÓN AÑADIDA
                                    ? handleStudentClick 
                                    : undefined
                        } 
                    />
                ))}
            </div>

            <div className="bg-slate-300 p-6 rounded-xl shadow-lg mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-3 py-2 w-full rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="relative w-full md:w-48">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Rol</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none w-full p-2 border rounded-md bg-gray-800 text-gray-200 border-gray-700 focus:ring-1 focus:ring-blue-500"
                        >
                            {["Todos", "student", "teacher", "admin"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 mt-2.5 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>

                    <div className="relative w-full md:w-48">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Estado</label>
                        <select
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className="appearance-none w-full p-2 border rounded-md bg-gray-800 text-gray-200 border-gray-700 focus:ring-1 focus:ring-blue-500"
                        >
                            {["Todos", "active", "inactive"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 mt-2.5 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>

                    <div className="w-full md:w-auto mt-7 md:mt-0">
                        <button
                            onClick={() => { setSelectedUser(null); setShowForm(true); }}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-md shadow-lg shadow-blue-500/30 transition-colors w-full md:w-auto"
                        >
                            <Plus className="w-4 h-4" /> Crear Nuevo Usuario
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-300 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Lista de Usuarios</h2>
                    <p className="text-sm text-gray-700">{finalFiltered.length} usuarios encontrados</p>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-400">
                    <table className="min-w-full table-auto">
                        <thead className="bg-slate-400 text-xs text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                                <th className="px-4 py-3 text-left font-semibold">Código</th>
                                <th className="px-4 py-3 text-left font-semibold">Rol</th>
                                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                                <th className="px-4 py-3 text-left font-semibold">Fecha Creación</th>
                                <th className="px-4 py-3 text-left font-semibold">Última Modificación</th>
                                <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {finalFiltered.length > 0 ? (
                                finalFiltered.map(u => (
                                    <UserRow
                                        key={u.userId}
                                        user={u}
                                        toggleUserState={toggleUserState}
                                        onEdit={(usr) => { setSelectedUser(usr); setShowForm(true); }}
                                        onDelete={handleDeleteUser}
                                    />
                                ))
                            ) : (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-600">No se encontraron usuarios.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <UserFormModal
                    userData={selectedUser}
                    onClose={() => setShowForm(false)}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};

export default App;