import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/intranet/user/userService';
import Layout from './Layout';
import Modal from './Modal';
import UserForm from './UserForm';
import RoleList from '../role/RoleList';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Dashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active', 'all', 'inactive'
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRolesManager] = useState(false);

  const loadUsers = React.useCallback(async (forcedFilter) => {
    const effectiveFilter = forcedFilter || filter;
    setLoading(true);
    setError('');

    try {
      let data;
      switch (effectiveFilter) {
        case 'all':
          data = await userService.getAllUsers();
          break;
        case 'inactive':
          data = await userService.getInactiveUsers();
          break;
        default:
          data = await userService.getUsers();
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message || 'Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const filterUsers = React.useCallback(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(u =>
      u.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleCreateUser = async (userData) => {
    try {
      await userService.createUser(userData);
      setSuccess('Usuario creado exitosamente');
      setShowCreateModal(false);
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Error al crear usuario');
      throw error;
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await userService.updateUser(selectedUser.user_id, userData);
      setSuccess('Usuario actualizado exitosamente');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Error al actualizar usuario');
      throw error;
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      setSuccess('Usuario eliminado exitosamente');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Error al eliminar usuario');
    }
  };

  const handleReactivateUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas reactivar este usuario?')) {
      return;
    }

    try {
      await userService.reactivateUser(userId);
      setSuccess('Usuario reactivado exitosamente');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Error al reactivar usuario');
    }
  };

  const openEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setShowEditModal(true);
  };

  const generarReporteUsuarios = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Gestión de Usuarios", 14, 16);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 24);
    autoTable(doc, {
      head: [["ID", "Usuario", "Nombre", "Apellido", "Email", "Rol", "Estado"]],
      body: filteredUsers.map(u => [
        u.user_id,
        u.user_name,
        u.first_name,
        u.last_name,
        u.email,
        u.role || u.rol || '—',
        u.status === 1 ? 'ACTIVO' : 'INACTIVO'
      ]),
      startY: 30,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [22, 42, 58] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    doc.save("usuarios.pdf");
  };

  const generarReporteUsuariosExcel = () => {
    // Definir cabecera
    const encabezado = [["ID", "Usuario", "Nombre", "Apellido", "Email", "Rol", "Estado"]];

    // Definir cuerpo con tus usuarios filtrados
    const cuerpo = filteredUsers.map(u => [
      u.user_id,
      u.user_name,
      u.first_name,
      u.last_name,
      u.email,
      u.role || u.rol || "—",
      u.status === 1 ? "ACTIVO" : "INACTIVO"
    ]);

    // Combinar cabecera + cuerpo
    const datos = [...encabezado, ...cuerpo];

    // Crear hoja de cálculo
    const hoja = XLSX.utils.aoa_to_sheet(datos);

    // Crear libro y añadir hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Usuarios");

    // Guardar archivo
    XLSX.writeFile(libro, "usuarios.xlsx");
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="w-full min-h-screen p-6">
        {/* Dashboard Card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden w-full border border-slate-600">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-6 bg-slate-800 text-slate-200 border-b border-slate-600">
            <h1 className="text-3xl font-semibold m-0">Gestión de Usuarios</h1>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded hover:bg-white/30 transition-all duration-300 text-sm font-medium"
                onClick={() => setShowCreateModal(true)}
              >
                Crear Usuario
              </button>
              <button
                style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={generarReporteUsuarios}
              >
                Descargar PDF
              </button>
              <button
                onClick={generarReporteUsuariosExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Exportar Excel
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900 text-red-300 px-8 py-4 border-b border-slate-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900 text-green-300 px-8 py-4 border-b border-slate-600 text-sm">
              {success}
            </div>
          )}

          {/* Filters */}
          <div className="px-6 py-6 bg-slate-700 border-b border-slate-600 flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded text-sm transition-all ${filter === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-600 text-slate-200 border border-slate-500 hover:bg-slate-500'
                  }`}
                onClick={() => { setFilter('active'); loadUsers('active'); }}
              >
                Activos
              </button>
              <button
                className={`px-4 py-2 rounded text-sm transition-all ${filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-600 text-slate-200 border border-slate-500 hover:bg-slate-500'
                  }`}
                onClick={() => { setFilter('all'); loadUsers('all'); }}
              >
                Todos
              </button>
              <button
                className={`px-4 py-2 rounded text-sm transition-all ${filter === 'inactive'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-600 text-slate-200 border border-slate-500 hover:bg-slate-500'
                  }`}
                onClick={() => { setFilter('inactive'); loadUsers('inactive'); }}
              >
                Inactivos
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Buscar por nombre o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-2 py-2 border border-slate-500 rounded text-sm min-w-[250px] bg-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table or Roles manager */}
          {showRolesManager ? (
            <div style={{ padding: 16 }}>
              <RoleList />
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USUARIO</th>
                    <th>NOMBRE</th>
                    <th>APELLIDO</th>
                    <th>EMAIL</th>
                    <th>ROL</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-12 py-12 text-center text-slate-400 text-lg bg-slate-800">
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-12 py-12 text-center text-slate-400 italic bg-slate-800">
                        {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios para mostrar'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.user_id}>
                        <td>{u.user_id}</td>
                        <td>{u.user_name}</td>
                        <td>{u.first_name}</td>
                        <td>{u.last_name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${(u.role || '').toLowerCase() === 'admin' ? 'admin' :
                              (u.role || '').toLowerCase() === 'editor' ? 'editor' : 'cliente'
                            }`}>{u.role || u.rol || '—'}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${u.status === 1 ? 'active' : 'inactive'}`}>{u.status === 1 ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn-edit" onClick={() => openEditModal(u)}>Editar</button>
                            {u.status === 1 ? (
                              <button className="btn-delete" onClick={() => handleDeleteUser(u.user_id)}>Eliminar</button>
                            ) : (
                              <button className="btn-reactivate" onClick={() => handleReactivateUser(u.user_id)}>Reactivar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para crear usuario */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear Nuevo Usuario"
        >
          <UserForm
            onSave={handleCreateUser}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>

        {/* Modal para editar usuario */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          title="Editar Usuario"
        >
          <UserForm
            user={selectedUser}
            onSave={handleUpdateUser}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            isEditing={true}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default Dashboard;
