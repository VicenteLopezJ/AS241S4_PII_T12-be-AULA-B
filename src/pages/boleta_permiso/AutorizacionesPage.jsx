// src/pages/AutorizacionesPage.jsx
import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  FileCheck,
  Filter,
  Search,
  Download,
  X,
  FileSpreadsheet
} from "lucide-react";
import { AutorizacionCard } from "../../components/boleta_permiso/autorizaciones/AutorizacionCard";
import { AutorizacionDetailsModal } from "../../components/boleta_permiso/autorizaciones/AutorizacionDetailsModal";
import { AprobacionModal } from "../../components/boleta_permiso/autorizaciones/AprobacionModal";
import { RegistroModal } from "../../components/boleta_permiso/autorizaciones/RegistroModal";
import { autorizacionService } from "../../services/boleta_permiso/autorizacionService";
import { usuarioService } from "../../services/boleta_permiso/usuarioService";

const AutorizacionesPage = () => {
  const [autorizaciones, setAutorizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [showDetails, setShowDetails] = useState(false);
  const [showAprobacion, setShowAprobacion] = useState(false);
  const [showRegistro, setShowRegistro] = useState(false);
  const [selectedAutorizacion, setSelectedAutorizacion] = useState(null);
  
  // Estados para modal de descarga Excel
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [excelFilters, setExcelFilters] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Cargar autorizaciones
  useEffect(() => {
    loadAutorizaciones();
  }, []);

  const loadAutorizaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener información del usuario actual para decidir qué ver
      const me = await usuarioService.getMyPermissions();
      const rolId = me.rol_id;
      const empleadoId = me.user_id;
      
      let data = [];
      if (rolId === 1) {
        // Admin RRHH: ve todas las autorizaciones
        data = await autorizacionService.getAllAutorizaciones();
      } else if (rolId === 2) {
        // Jefe de área: ve solo sus pendientes de aprobación
        data = await autorizacionService.getPendientesJefe(empleadoId);
      } else {
        // Otros roles: por ahora no muestran autorizaciones
        data = [];
      }
      
      setAutorizaciones(data || []);
      console.log(`📋 Autorizaciones cargadas (${rolId === 2 ? 'jefe' : 'admin/otros'}): ${data?.length || 0}`);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar autorizaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar autorizaciones
  const autorizacionesFiltradas = autorizaciones.filter(auth => {
    if (filtroEstado !== "todos" && auth.estado !== filtroEstado) {
      return false;
    }
    
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return (
        auth.boleta?.empleado_nombre?.toLowerCase().includes(searchLower) ||
        auth.boleta?.area_nombre?.toLowerCase().includes(searchLower) ||
        auth.boleta?.tipo_motivo?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Handlers de modales
  const handleViewDetails = (autorizacion) => {
    setSelectedAutorizacion(autorizacion);
    setShowDetails(true);
  };

  const handleAprobar = (autorizacion) => {
    setSelectedAutorizacion(autorizacion);
    setShowAprobacion(true);
  };

  const handleRegistrar = (autorizacion) => {
    setSelectedAutorizacion(autorizacion);
    setShowRegistro(true);
  };

  const handleAprobacionSuccess = () => {
    setShowAprobacion(false);
    setSelectedAutorizacion(null);
    loadAutorizaciones();
  };

  const handleRegistroSuccess = () => {
    setShowRegistro(false);
    setSelectedAutorizacion(null);
    loadAutorizaciones();
  };

  // Handler para descargar Excel
  const handleDescargarExcel = async () => {
    try {
      setDownloadingExcel(true);
      
      const filtros = {};
      if (excelFilters.estado) filtros.estado = excelFilters.estado;
      if (excelFilters.fecha_desde) filtros.fecha_desde = excelFilters.fecha_desde;
      if (excelFilters.fecha_hasta) filtros.fecha_hasta = excelFilters.fecha_hasta;
      
      await autorizacionService.descargarReporteExcel(filtros);
      
      setShowExcelModal(false);
      setExcelFilters({ estado: '', fecha_desde: '', fecha_hasta: '' });
    } catch (err) {
      alert(`Error al descargar reporte: ${err.message}`);
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Estadísticas
  const stats = {
    total: autorizaciones.length,
    pendientesJefe: autorizaciones.filter(a => a.estado === 'Pendiente Jefe').length,
    pendientesRegistro: autorizaciones.filter(a => a.estado === 'Pendiente Registro').length,
    registrados: autorizaciones.filter(a => a.estado === 'Registrado').length,
    rechazados: autorizaciones.filter(a => a.estado === 'Rechazado').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Autorizaciones</h1>
          <p className="text-gray-400 text-sm mt-1">
            Flujo de aprobación y registro de boletas de permiso
          </p>
        </div>
        
        <button
          onClick={() => setShowExcelModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="w-5 h-5" />
          Descargar Excel
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileCheck className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pendiente Jefe</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendientesJefe}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pendiente Registro</p>
              <p className="text-2xl font-bold text-blue-400">{stats.pendientesRegistro}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Registrados</p>
              <p className="text-2xl font-bold text-green-400">{stats.registrados}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rechazados</p>
              <p className="text-2xl font-bold text-red-400">{stats.rechazados}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por empleado, área o tipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="Pendiente Jefe">Pendiente Jefe</option>
              <option value="Pendiente Registro">Pendiente Registro</option>
              <option value="Registrado">Registrado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Autorizaciones */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-400">Cargando autorizaciones...</span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Error al cargar autorizaciones</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={loadAutorizaciones}
                className="mt-3 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {autorizacionesFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No se encontraron autorizaciones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {autorizacionesFiltradas.map((autorizacion) => (
                    <AutorizacionCard
                      key={autorizacion.id_autorizacion}
                      autorizacion={autorizacion}
                      onViewDetails={handleViewDetails}
                      onAprobar={handleAprobar}
                      onRegistrar={handleRegistrar}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Descarga Excel */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-700 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-green-400" />
                  Descargar Reporte Excel
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Aplica filtros opcionales al reporte
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExcelModal(false);
                  setExcelFilters({ estado: '', fecha_desde: '', fecha_hasta: '' });
                }}
                disabled={downloadingExcel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado de Aprobación
                </label>
                <select
                  value={excelFilters.estado}
                  onChange={(e) => setExcelFilters({...excelFilters, estado: e.target.value})}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={downloadingExcel}
                >
                  <option value="">Todos</option>
                  <option value="S">Aprobadas</option>
                  <option value="R">Rechazadas</option>
                  <option value="N">Pendientes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={excelFilters.fecha_desde}
                  onChange={(e) => setExcelFilters({...excelFilters, fecha_desde: e.target.value})}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={downloadingExcel}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={excelFilters.fecha_hasta}
                  onChange={(e) => setExcelFilters({...excelFilters, fecha_hasta: e.target.value})}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={downloadingExcel}
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3 flex items-start gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-400 text-sm font-medium">Información</p>
                  <p className="text-gray-300 text-xs mt-1">
                    El reporte incluirá todas las autorizaciones que cumplan con los filtros seleccionados.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowExcelModal(false);
                  setExcelFilters({ estado: '', fecha_desde: '', fecha_hasta: '' });
                }}
                disabled={downloadingExcel}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDescargarExcel}
                disabled={downloadingExcel}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {downloadingExcel ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales Existentes */}
      {showDetails && (
        <AutorizacionDetailsModal
          autorizacion={selectedAutorizacion}
          onClose={() => {
            setShowDetails(false);
            setSelectedAutorizacion(null);
          }}
        />
      )}

      {showAprobacion && (
        <AprobacionModal
          autorizacion={selectedAutorizacion}
          onClose={() => {
            setShowAprobacion(false);
            setSelectedAutorizacion(null);
          }}
          onSuccess={handleAprobacionSuccess}
        />
      )}

      {showRegistro && (
        <RegistroModal
          autorizacion={selectedAutorizacion}
          onClose={() => {
            setShowRegistro(false);
            setSelectedAutorizacion(null);
          }}
          onSuccess={handleRegistroSuccess}
        />
      )}
    </div>
  );
};

export default AutorizacionesPage;