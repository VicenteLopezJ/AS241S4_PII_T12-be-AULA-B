// src/components/boleta_permiso/empresa/empresaList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Building2,
  RotateCcw,
  Users,
  MapPin
} from 'lucide-react';
import { empresaService } from '../../../services/boleta_permiso/empresaService';
import { EmpresaFormModal } from './EmpresaFormModal';
import { EmpresaViewModal } from './EmpresaViewModal';

export const EmpresaList = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('activas');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  const cargarEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      let datos;
      if (selectedEstado === 'activas') {
        datos = await empresaService.getAllEmpresas();
      } else if (selectedEstado === 'inactivas') {
        datos = await empresaService.getEmpresasInactivas();
      } else {
        datos = await empresaService.getAllEmpresasConInactivas();
      }
      setEmpresas(datos || []);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      alert('Error al cargar las empresas');
    } finally {
      setLoading(false);
    }
  }, [selectedEstado]);

  const aplicarFiltros = useCallback(() => {
    let resultado = empresas;

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const busqueda = searchTerm.toLowerCase();
      resultado = resultado.filter(e => 
        e.nombre_empresa.toLowerCase().includes(busqueda) ||
        (e.ruc && e.ruc.toLowerCase().includes(busqueda)) ||
        (e.direccion && e.direccion.toLowerCase().includes(busqueda)) ||
        (e.telefono && e.telefono.toLowerCase().includes(busqueda))
      );
    }

    setFilteredEmpresas(resultado);
  }, [empresas, searchTerm]);

  // Cargar empresas al montar
  useEffect(() => {
    cargarEmpresas();
  }, [cargarEmpresas]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const handleNuevaEmpresa = () => {
    setEmpresaSeleccionada(null);
    setMostrarFormulario(true);
  };

  const handleVerDetalle = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setMostrarDetalle(true);
  };

  const handleEditarEmpresa = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setMostrarFormulario(true);
  };

  const handleEliminarEmpresa = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar esta empresa?')) {
      try {
        await empresaService.deleteEmpresa(id);
        alert('✅ Empresa desactivada correctamente');
        cargarEmpresas();
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
        alert('Error al desactivar la empresa');
      }
    }
  };

  const handleRestaurarEmpresa = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas restaurar esta empresa?')) {
      try {
        await empresaService.restoreEmpresa(id);
        alert('✅ Empresa restaurada correctamente');
        cargarEmpresas();
      } catch (error) {
        console.error('Error al restaurar empresa:', error);
        alert('Error al restaurar la empresa');
      }
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  // ✅ Función helper para verificar si está activa
  const estaActiva = (empresa) => {
    return empresa.estado === 'A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-400" />
              Empresas
            </h1>
            <p className="text-gray-400 mt-1">
              Total: {filteredEmpresas.length} de {empresas.length} empresas
            </p>
          </div>
          <button 
            onClick={handleNuevaEmpresa}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Empresa
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Búsqueda */}
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

        {/* Filtro de Estado */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="activas">Empresas Activas</option>
            <option value="inactivas">Empresas Inactivas</option>
            <option value="todas">Todas las Empresas</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="text-gray-400 mt-2">Cargando empresas...</p>
        </div>
      )}

      {/* Cards de Empresas */}
      {!loading && filteredEmpresas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmpresas.map((empresa) => (
            <div key={empresa.id_empresa} className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition-colors border border-gray-700">
              {/* Header del Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">ID</p>
                    <p className="text-white font-bold text-lg">#{empresa.id_empresa}</p>
                  </div>
                </div>
                {/* ✅ CORREGIDO: Ahora usa empresa.estado === 'A' */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                  estaActiva(empresa)
                    ? 'bg-green-900/30 text-green-400 border-green-600' 
                    : 'bg-gray-700/30 text-gray-400 border-gray-600'
                }`}>
                  {estaActiva(empresa) ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Inactiva
                    </>
                  )}
                </span>
              </div>

              {/* Información Principal */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Nombre</p>
                  <p className="text-white text-lg font-semibold">{empresa.nombre_empresa}</p>
                </div>

                {empresa.ruc && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">RUC</p>
                    <p className="text-white text-sm">{empresa.ruc}</p>
                  </div>
                )}

                {empresa.direccion && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Dirección</p>
                    <p className="text-white text-sm line-clamp-2">{empresa.direccion}</p>
                  </div>
                )}

                {empresa.telefono && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Teléfono</p>
                    <p className="text-white text-sm">{empresa.telefono}</p>
                  </div>
                )}

                {empresa.fecha_registro && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-gray-400 text-xs mb-1">Fecha de Registro</p>
                    <p className="text-white text-xs">{formatearFecha(empresa.fecha_registro)}</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => handleVerDetalle(empresa)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                {estaActiva(empresa) ? (
                  <>
                    <button
                      onClick={() => handleEditarEmpresa(empresa)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                      title="Editar empresa"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarEmpresa(empresa.id_empresa)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                      title="Desactivar empresa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestaurarEmpresa(empresa.id_empresa)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                    title="Restaurar empresa"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-12 bg-gray-700/30 rounded-lg">
          <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No hay empresas para mostrar</p>
        </div>
      )}

      {/* Modal de Formulario (Crear/Editar) */}
      {mostrarFormulario && (
        <EmpresaFormModal
          empresa={empresaSeleccionada}
          onClose={() => {
            setMostrarFormulario(false);
            setEmpresaSeleccionada(null);
          }}
          onSuccess={cargarEmpresas}
        />
      )}

      {/* Modal de Detalle (Ver) */}
      {mostrarDetalle && empresaSeleccionada && (
        <EmpresaViewModal
          empresaId={empresaSeleccionada.id_empresa}
          onClose={() => {
            setMostrarDetalle(false);
            setEmpresaSeleccionada(null);
          }}
          onEdit={(empresa) => {
            setMostrarDetalle(false);
            handleEditarEmpresa(empresa);
          }}
        />
      )}
    </div>
  );
};