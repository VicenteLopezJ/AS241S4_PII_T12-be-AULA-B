import React, { useState, useEffect } from 'react';
import { userService } from '../../services/user/userService';
import Layout from './Layout';
import Modal from './Modal';
import UserForm from './UserForm';

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

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      let data;
      switch (filter) {
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
      u.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="w-full min-h-screen p-6">
        {/* Dashboard Card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden w-full border border-slate-600">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-6 bg-slate-800 text-slate-200 border-b border-slate-600">
            <h1 className="text-3xl font-semibold m-0">Gestión de Usuarios</h1>
            <div>
              <button 
                className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded hover:bg-white/30 transition-all duration-300 text-sm font-medium"
                onClick={() => setShowCreateModal(true)}
              >
                Crear Usuario
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
                className={`px-4 py-2 rounded text-sm transition-all ${
                  filter === 'active' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-600 text-slate-200 border border-slate-500 hover:bg-slate-500'
                }`}
                onClick={() => setFilter('active')}
              >
                Activos
              </button>
              <button 
                className={`px-4 py-2 rounded text-sm transition-all ${
                  filter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-600 text-slate-200 border border-slate-500 hover:bg-slate-500'
                }`}
                onClick={() => setFilter('all')}
              >
                Todos
              </button>
              <button 
                className={`px-4 py-2 rounded text-sm transition-all ${
                  filter === 'inactive' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-600 text-slate-200 border border-slate-500 hover:bg-slate-500'
                }`}
                onClick={() => setFilter('inactive')}
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

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-700">
                  <th className="px-4 py-4 text-left border-b border-slate-600 font-semibold text-slate-200 text-sm uppercase tracking-wide">ID</th>
                  <th className="px-4 py-4 text-left border-b border-slate-600 font-semibold text-slate-200 text-sm uppercase tracking-wide">USUARIO</th>
                  <th className="px-4 py-4 text-left border-b border-slate-600 font-semibold text-slate-200 text-sm uppercase tracking-wide">ROL</th>
                  <th className="px-4 py-4 text-left border-b border-slate-600 font-semibold text-slate-200 text-sm uppercase tracking-wide">ESTADO</th>
                  <th className="px-4 py-4 text-left border-b border-slate-600 font-semibold text-slate-200 text-sm uppercase tracking-wide">ACCIONES</th>
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
                    <tr key={u.user_id} className="bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors">
                      <td className="px-4 py-4 border-b border-slate-600">{u.user_id}</td>
                      <td className="px-4 py-4 border-b border-slate-600">{u.user_name}</td>
                      <td className="px-4 py-4 border-b border-slate-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                          u.rol === 'admin' ? 'bg-red-200 text-red-800' :
                          u.rol === 'editor' ? 'bg-blue-200 text-blue-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-b border-slate-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                          u.status === 1 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {u.status === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-b border-slate-600">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                            onClick={() => openEditModal(u)}
                          >
                            Editar
                          </button>
                          {u.status === 1 ? (
                            <button
                              className="bg-red-500 text-white px-4 py-2 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                              onClick={() => handleDeleteUser(u.user_id)}
                            >
                              Eliminar
                            </button>
                          ) : (
                            <button
                              className="bg-blue-500 text-white px-4 py-2 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                              onClick={() => handleReactivateUser(u.user_id)}
                            >
                              Reactivar
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