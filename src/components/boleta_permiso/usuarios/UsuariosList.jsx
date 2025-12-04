// src/components/boleta_permiso/usuarios/UsuariosList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, User, Mail, Phone, Building, Calendar } from 'lucide-react';
import { usuarioService } from '../../../services/boleta_permiso/usuarioService';
import { UsuariosFormModal } from './UsuariosFormModal';
import { UsuariosDetailModal } from './UsuariosDetailModal';

export const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailUsuario, setDetailUsuario] = useState(null);
  const [stats, setStats] = useState(null);
  const [rolId, setRolId] = useState(null);
  const [canCreateUsuario, setCanCreateUsuario] = useState(false);

  const loadUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener rol del usuario actual para controlar permisos en la vista
      const me = await usuarioService.getMyPermissions();
      setRolId(me?.rol_id ?? null);
      // Solo RRHH (rol_id === 1 y no marcado como jefe de área) puede crear usuarios
      const esAdminRRHH = me?.rol_id === 1 && me?.es_jefe_area !== 'S';
      setCanCreateUsuario(!!esAdminRRHH);

      const data = await usuarioService.getAllUsuarios();
      setUsuarios(data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await usuarioService.getStatistics();
      setStats(data || null);
    } catch (err) {
      console.error('Error al obtener estadísticas de usuarios:', err);
    }
  }, []);

  useEffect(() => {
    loadUsuarios();
    loadStats();
  }, [loadUsuarios, loadStats]);

  useEffect(() => {
    let result = usuarios;
    
    // Filtrar por estado
    if (estadoFilter === 'activos') {
      result = result.filter((u) => u.estado === 'A');
    } else if (estadoFilter === 'inactivos') {
      result = result.filter((u) => u.estado === 'I');
    }
    
    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((u) =>
        u.nombre_completo?.toLowerCase().includes(q) ||
        u.documento?.toLowerCase().includes(q) ||
        u.area_nombre?.toLowerCase().includes(q) ||
        u.area?.nombre_area?.toLowerCase().includes(q)
      );
    }
    
    setFiltered(result);
  }, [usuarios, searchTerm, estadoFilter]);

  const handleOpenCreate = () => {
    setSelectedUsuario(null);
    setShowForm(true);
  };

  const handleOpenEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setShowForm(true);
  };

  const handleOpenDetail = (usuario) => {
    setDetailUsuario(usuario);
    setShowDetail(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUsuario(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailUsuario(null);
  };

  const handleSuccess = async () => {
    await loadUsuarios();
    await loadStats();
  };

  const handleToggleEstado = async (usuario) => {
    try {
      const accion = usuario.estado === 'A' ? 'inactivar' : 'activar';
      const confirmado = window.confirm(`¿Seguro que deseas ${accion} al usuario ${usuario.nombre_completo}?`);
      if (!confirmado) return;

      if (usuario.estado === 'A') {
        await usuarioService.deleteUsuario(usuario.id_usuario);
      } else {
        await usuarioService.restoreUsuario(usuario.id_usuario);
      }

      await loadUsuarios();
      await loadStats();
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      alert(err.message || 'Error al cambiar estado del usuario');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'No especificado';
    try {
      const d = new Date(value);
      return d.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleExportExcel = async () => {
    try {
      await usuarioService.downloadUsuariosExcel();
    } catch (err) {
      alert(err.message || 'No se pudo descargar el reporte de usuarios');
    }
  };

  const isAdmin = rolId === 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <User className="w-8 h-8 text-blue-400" />
              Usuarios
            </h1>
            <p className="text-gray-400 mt-1">
              Total: {filtered.length} de {usuarios.length} usuarios
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Botón de Excel visible solo para Admin */}
            {isAdmin && (
              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                Exportar usuarios a Excel
              </button>
            )}

            {/* Solo admin RRHH (no jefe de área) puede crear nuevos usuarios */}
            {canCreateUsuario && (
              <button
                onClick={handleOpenCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
              >
                <Plus className="w-5 h-5" />
                Nuevo Usuario
              </button>
            )}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-800/60 rounded-lg p-4 border border-gray-700 text-sm">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Total usuarios</p>
              <p className="text-white text-lg font-semibold">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Activos</p>
              <p className="text-green-400 text-lg font-semibold">{stats.activos}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Jefes de área</p>
              <p className="text-blue-400 text-lg font-semibold">{stats.jefes_area}</p>
            </div>
          </div>
        )}
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setEstadoFilter('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              estadoFilter === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setEstadoFilter('activos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              estadoFilter === 'activos'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setEstadoFilter('inactivos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              estadoFilter === 'inactivos'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Inactivos
          </button>
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
          <p className="text-gray-400 mt-2">Cargando usuarios...</p>
        </div>
      )}

      {/* Lista de usuarios */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <div key={u.id_usuario} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">
                      {u.nombre_completo}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {u.tipo_documento}: {u.documento}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  u.estado === 'A' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {u.estado === 'A' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cargo</p>
                  <p className="text-white text-sm font-medium">{u.cargo}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Área</p>
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4 text-purple-400" />
                    <p className="text-white text-sm">{u.area_nombre || u.area?.nombre_area || `Área ID: ${u.area_id}`}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1 mb-1">
                    <Mail className="w-3 h-3 text-green-400" />
                    <p className="text-gray-300 text-xs truncate">{u.correo || 'No especificado'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-green-400" />
                    <p className="text-gray-300 text-xs">{u.telefono || 'No especificado'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-orange-400" />
                    <p className="text-gray-400 text-xs">Ingreso: {formatDate(u.fecha_ingreso)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                {/* Botón de detalles disponible para todos los roles */}
                <button
                  onClick={() => handleOpenDetail(u)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  Ver detalles
                </button>

                {/* Admin: puede editar y activar/inactivar usuarios */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleEstado(u)}
                      className={`flex-1 py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm ${
                        u.estado === 'A'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {u.estado === 'A' ? 'Inactivar' : 'Activar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !filtered.length && !error && (
        <div className="text-center py-12 bg-gray-700/30 rounded-lg">
          <User className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No hay usuarios para mostrar</p>
        </div>
      )}

      {isAdmin && showForm && (
        <UsuariosFormModal
          usuario={selectedUsuario}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}

      {showDetail && detailUsuario && (
        <UsuariosDetailModal
          usuario={detailUsuario}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};
