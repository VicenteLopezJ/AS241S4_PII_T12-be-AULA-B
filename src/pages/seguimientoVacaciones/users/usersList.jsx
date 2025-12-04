import React, { useState, useEffect } from 'react';
import { Search, User, Trash2, RefreshCw, Users, UserCheck, UserX, Edit, Plus, FilterX, FileText, Download } from 'lucide-react';
import UsersFormModal from './usersForm';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';
import { listarUsers, eliminarUser, restaurarUser } from '../../../services/seguimientoVacaciones/usersService';

const UsersList = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showPasswords, setShowPasswords] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [filterUserType, setFilterUserType] = useState('todos');

  const handleAddUser = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  const handleSuccess = () => {
    cargarUsers();
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      cargarUsers();
    }
  }, [authLoading, isAuthenticated]);
  useEffect(() => { filtrarUsers(); }, [users, searchTerm, filterStatus, filterUserType]);

  const cargarUsers = async () => {
    try {
      setLoading(true);
      const data = await listarUsers();
      setUsers(data);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    } finally { setLoading(false); }
  };

  const calcularEstadisticas = (data) => {
    const activos = data.filter(u => u.state === 'A').length;
    const inactivos = data.filter(u => u.state === 'I').length;
    setStats({ total: data.length, activos, inactivos });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  const filtrarUsers = () => {
    let filtered = [...users];

    if (filterStatus === 'activos') filtered = filtered.filter(u => u.state === 'A');
    else if (filterStatus === 'inactivos') filtered = filtered.filter(u => u.state === 'I');

    if (filterUserType !== 'todos') {
      filtered = filtered.filter(u => u.user_type === filterUserType);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u =>
        (u.username && u.username.toLowerCase().includes(searchLower)) ||
        (u.first_name && u.first_name.toLowerCase().includes(searchLower)) ||
        (u.last_name && u.last_name.toLowerCase().includes(searchLower)) ||
        (u.email && u.email.toLowerCase().includes(searchLower))
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFilterStatus('todos');
    setFilterUserType('todos');
    setCurrentPage(1);
  };

  const getUserTypeStyle = (userType) => {
    const styles = {
      'Empleado Comun': 'bg-blue-500 bg-opacity-20 text-blue-100 border-blue-500 border-opacity-30',
      'Jefe de Area': 'bg-purple-500 bg-opacity-20 text-purple-100 border-purple-500 border-opacity-30',
      'Admin': 'bg-amber-500 bg-opacity-20 text-amber-100 border-amber-500 border-opacity-30'
    };
    return styles[userType] || 'bg-slate-500 bg-opacity-20 text-slate-400 border-slate-500 border-opacity-30';
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text('Reporte de Usuarios', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 30);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total de usuarios: ${stats.total}`, 14, 40);
    doc.text(`Usuarios activos: ${stats.activos}`, 14, 46);
    doc.text(`Usuarios inactivos: ${stats.inactivos}`, 14, 52);

    autoTable(doc, {
      startY: 60,
      head: [['Username', 'Nombres', 'Apellidos', 'Cargo', 'Tipo', 'Estado']],
      body: filteredUsers.map(u => [
        u.username,
        u.first_name,
        u.last_name,
        u.employee_position,
        u.user_type,
        u.state === 'A' ? 'Activo' : 'Inactivo'
      ]),
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });

    doc.save(`usuarios_${new Date().toISOString().split('T')[0]}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: 'El reporte se ha descargado correctamente',
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff',
      timer: 2000
    });
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredUsers.map(u => ({
        'Username': u.username,
        'Nombres': u.first_name,
        'Apellidos': u.last_name,
        'Email': u.email,
        'Cargo': u.employee_position,
        'Tipo de Usuario': u.user_type,
        'Fecha de Registro': new Date(u.creation_date).toLocaleDateString(),
        'Estado': u.state === 'A' ? 'Activo' : 'Inactivo'
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 }
    ];

    XLSX.writeFile(workbook, `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Excel Generado',
      text: 'El reporte se ha descargado correctamente',
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff',
      timer: 2000
    });
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el usuario',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#243447',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await eliminarUser(id);
        await cargarUsers();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El usuario ha sido eliminado correctamente',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          timer: 2000
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario',
          confirmButtonColor: '#ef4444',
          background: '#243447',
          color: '#fff'
        });
      }
    }
  };

  const handleRestaurar = async (id) => {
    const result = await Swal.fire({
      title: '¿Restaurar usuario?',
      text: 'El usuario volverá a estar activo',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
      background: '#24344',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await restaurarUser(id);
        await cargarUsers();
        Swal.fire({
          icon: 'success',
          title: 'Restaurado',
          text: 'El usuario ha sido restaurado correctamente',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          timer: 2000
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo restaurar el usuario',
          confirmButtonColor: '#ef4444',
          background: '#243447',
          color: '#fff'
        });
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              Gestión de Usuarios
            </h1>
            <p className="text-slate-400 mt-2 ml-1">Administra los usuarios del sistema</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="px-5 py-2.5 bg-[#243447] border-2 border-red-500 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 shadow-md font-medium"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-5 py-2.5 bg-[#243447] border-2 border-green-500 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 shadow-md font-medium"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleAddUser}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Agregar Usuario
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-cyan-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Usuarios</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.total}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Registrados en el sistema</p>
              </div>
              <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
                <Users className="w-8 h-8 text-cyan-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Usuarios Activos</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.activos}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Con acceso al sistema</p>
              </div>
              <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                <UserCheck className="w-8 h-8 text-emerald-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-red-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Usuarios Inactivos</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.inactivos}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Sin acceso</p>
              </div>
              <div className="bg-red-500 bg-opacity-20 p-3 rounded-xl">
                <UserX className="w-8 h-8 text-red-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Search y filtros */}
        <div className="bg-[#243447] rounded-2xl shadow-xl p-5 mb-6 border border-slate-700">
          <div className="flex flex-col gap-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por username, nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3 items-center flex-wrap">
              <button
                onClick={() => setFilterStatus(filterStatus === 'activos' ? 'todos' : 'activos')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filterStatus === 'activos'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-600 hover:border-emerald-500'
                  }`}
              >
                <UserCheck className="w-4 h-4 inline mr-2" /> Activos
              </button>

              <button
                onClick={() => setFilterStatus(filterStatus === 'inactivos' ? 'todos' : 'inactivos')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filterStatus === 'inactivos'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-600 hover:border-red-500'
                  }`}
              >
                <UserX className="w-4 h-4 inline mr-2" /> Inactivos
              </button>

              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                className="px-5 py-2.5 rounded-xl bg-[#1a2332] border border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="todos">Todos los tipos</option>
                <option value="Empleado Comun">Empleado Común</option>
                <option value="Jefe de Area">Jefe de Área</option>
                <option value="Admin">Admin</option>
              </select>

              <button
                onClick={limpiarFiltros}
                className="p-2.5 rounded-xl bg-[#1a2332] text-slate-400 hover:text-red-400 border border-slate-600 hover:border-red-500 transition-all"
                title="Limpiar filtros"
              >
                <FilterX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#243447] rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-[#1a2332]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombres</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Apellidos</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha Registro</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>

                <tbody className="bg-[#243447] divide-y divide-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-16 text-center text-slate-400">
                        <Users className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                        <p className="text-lg font-medium">No se encontraron usuarios</p>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map(user => (
                      <tr key={user.users_id} className="hover:bg-[#2a3f5f] transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-medium">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{user.first_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{user.last_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{user.employee_position}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-lg border ${getUserTypeStyle(user.user_type)}`}>
                            {user.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(user.creation_date).toLocaleDateString('es-PE')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${user.state === 'A'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${user.state === 'A' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {user.state === 'A' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 bg-blue-500/20 text-blue-100 rounded-lg transition-all hover:bg-blue-500 hover:text-blue-50 hover:-translate-y-0.5"
                              title="Editar usuario"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {user.state === 'A' ? (
                              <button
                                onClick={() => handleEliminar(user.users_id)}
                                className="p-2 bg-red-500/20 text-red-100 rounded-lg transition-all hover:bg-red-500 hover:text-red-50 hover:-translate-y-0.5"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestaurar(user.users_id)}
                                className="p-2 bg-emerald-500/20 text-emerald-100 rounded-lg transition-all hover:bg-emerald-500 hover:text-emerald-50 hover:-translate-y-0.5"
                                title="Restaurar usuario"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center py-4 border-t border-slate-700 bg-[#1a2332] gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-[#243447] text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <UsersFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        userToEdit={userToEdit}
      />
    </div>
  );
};

export default UsersList;