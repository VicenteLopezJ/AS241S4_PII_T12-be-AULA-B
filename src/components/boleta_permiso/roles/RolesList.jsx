// src/components/roles/RolesList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Shield, ShieldCheck, Users, Plus, Search, Filter } from 'lucide-react';
import { rolService } from '../../services/rolService';
import { RoleFormModal } from './RoleFormModal';
import { RoleViewModal } from './RoleViewModal';

export const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('activos'); // activos | todos
  const [selectedRole, setSelectedRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [stats, setStats] = useState(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const all = await rolService.getAllRoles();
      setRoles(all || []);
    } catch (err) {
      console.error('Error al cargar roles:', err);
      setError(err.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await rolService.getStatistics();
      setStats(data || null);
    } catch (err) {
      console.error('Error al obtener estadísticas de roles:', err);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadStats();
  }, [loadRoles, loadStats]);

  useEffect(() => {
    let result = roles;

    if (estadoFilter === 'activos') {
      result = result.filter((r) => r.estado === 'A');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) =>
        r.nombre_rol.toLowerCase().includes(q) ||
        (r.descripcion && r.descripcion.toLowerCase().includes(q))
      );
    }

    setFilteredRoles(result);
  }, [roles, estadoFilter, searchTerm]);

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setShowForm(true);
  };

  const handleOpenEdit = (role) => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleOpenView = (role) => {
    setSelectedRole(role);
    setShowView(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedRole(null);
  };

  const handleCloseView = () => {
    setShowView(false);
    setSelectedRole(null);
  };

  const handleSuccess = async () => {
    await loadRoles();
    await loadStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-400" />
              Roles
            </h1>
            <p className="text-gray-400 mt-1">
              Total: {filteredRoles.length} de {roles.length} roles
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Rol
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-800/60 rounded-lg p-4 border border-gray-700 text-sm">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Total de roles</p>
              <p className="text-white text-lg font-semibold">{stats.total_roles}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Roles activos</p>
              <p className="text-green-400 text-lg font-semibold">{stats.roles_activos}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Roles del sistema</p>
              <p className="text-blue-400 text-lg font-semibold">{stats.roles_sistema}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="activos">Roles Activos</option>
            <option value="todos">Todos los Roles</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="text-gray-400 mt-2">Cargando roles...</p>
        </div>
      )}

      {/* Lista de roles */}
      {!loading && filteredRoles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((rol) => (
            <div key={rol.id_rol} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">ID</p>
                    <p className="text-white font-bold text-lg">#{rol.id_rol}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                  rol.estado === 'A'
                    ? 'bg-green-900/30 text-green-400 border-green-600'
                    : 'bg-gray-700/30 text-gray-400 border-gray-600'
                }`}>
                  {rol.estado === 'A' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Nombre</p>
                  <p className="text-white text-sm font-semibold">{rol.nombre_rol_texto || rol.nombre_rol}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Nivel de acceso</p>
                  <p className="text-white text-sm">{rol.nivel_acceso_texto || `Nivel ${rol.nivel_acceso}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-300 text-xs">
                    {rol.estadisticas?.total_usuarios ?? 0} usuarios
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => handleOpenView(rol)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
                >
                  Ver
                </button>
                <button
                  onClick={() => handleOpenEdit(rol)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !filteredRoles.length && !error && (
        <div className="text-center py-12 bg-gray-700/30 rounded-lg">
          <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No hay roles para mostrar</p>
        </div>
      )}

      {showForm && (
        <RoleFormModal
          rol={selectedRole}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}

      {showView && selectedRole && (
        <RoleViewModal
          rolId={selectedRole.id_rol}
          onClose={handleCloseView}
        />
      )}
    </div>
  );
};
