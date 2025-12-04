// src/components/permisos/permisosList.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  X,
  Download
} from 'lucide-react';
import { BoletaDetallesModal } from './permisosDetailsModal';
import { BoletaUploadModal } from './permisosUploadModal';
import { BoletaEditModal } from './permisosEditModal';
import { solicitudPermisoService } from '../../../services/boleta_permiso/solicitudPermisoService';
import { usuarioService } from '../../../services/boleta_permiso/usuarioService';
import { boletaPermisoService } from '../../../services/boleta_permiso/boletaPermiso';

export const PermisosList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [boletas, setBoletas] = useState([]);
  const [filteredBoletas, setFilteredBoletas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolId, setRolId] = useState(null);
  const [empleados, setEmpleados] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarNuevaBoleta, setMostrarNuevaBoleta] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);

  // Cargar todas las boletas al montar
  useEffect(() => {
    cargarBoletas();

    // Si viene con ?nueva=1 desde el dashboard, abrir automáticamente el formulario
    const params = new URLSearchParams(location.search);
    if (params.get('nueva') === '1') {
      setMostrarNuevaBoleta(true);
      // Limpiar el query param en la URL, manteniendo el prefijo /rrhh
      navigate('/rrhh/permisos', { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boletas, searchTerm, selectedEstado]);

  const cargarBoletas = async () => {
    setLoading(true);
    try {
      // Obtener permisos del usuario actual para decidir qué ver
      const me = await usuarioService.getMyPermissions();
      const rolIdActual = me.rol_id;
      const userId = me.user_id;
      const areaId = me.area_id;

      setRolId(rolIdActual);

      let solicitudes = [];

      if (rolIdActual === 1) {
        // Admin RRHH: todas las solicitudes
        solicitudes = await solicitudPermisoService.getAllSolicitudes();
      } else if (rolIdActual === 2) {
        // Jefe de área: solicitudes de su área
        solicitudes = await solicitudPermisoService.getSolicitudesByArea(areaId);
      } else {
        // Empleado: solo sus propias solicitudes
        solicitudes = await solicitudPermisoService.getMisSolicitudes(userId);
      }

      // Mapear solicitudes al formato que la UI espera como "boletas"
      const boletasMapeadas = (solicitudes || []).map((s) => ({
        id_boleta: s.id_solicitud,
        empleado_id: s.usuario_id,
        fecha_permiso: s.fecha_permiso,
        horas_duracion: s.horas_duracion,
        // Timestamps completos para mostrar en el modal de detalles
        hora_salida: s.hora_salida,
        hora_retorno: s.hora_retorno,
        fecha_solicitud: s.fecha_solicitud || s.fecha_registro || s.created_at,
        tipo_motivo: s.tipo_permiso_texto || s.tipo_permiso,
        motivo: s.motivo,
        // Estado: guardar código y texto legible del backend
        estado_codigo: s.estado_solicitud,
        estado_texto: s.estado_solicitud_texto || s.estado_solicitud,
      }));

      setBoletas(boletasMapeadas);

      // Cargar información de empleados únicos
      if (boletasMapeadas && boletasMapeadas.length > 0) {
        const empleadosIds = [...new Set(boletasMapeadas.map(b => b.empleado_id))];
        cargarEmpleados(empleadosIds);
      }
    } catch (error) {
      console.error('❌ Error al cargar boletas:', error);
      alert('Error al cargar las boletas');

    } finally {
      setLoading(false);
    }
  };

  const cargarEmpleados = async (empleadosIds) => {
    try {
      const empleadosData = {};
      await Promise.all(
        empleadosIds.map(async (id) => {
          try {
            const data = await usuarioService.getUsuarioById(id);
            if (data) {
              empleadosData[id] = data;
            }
          } catch (err) {
            console.error(`Error al cargar empleado ${id}:`, err);
          }
        })
      );

      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const getNombreEmpleado = (empleadoId) => {
    const empleado = empleados[empleadoId];
    if (empleado) {
      return `${empleado.nombres} ${empleado.apellidos}`;
    }
    return `ID: ${empleadoId}`;
  };

  const aplicarFiltros = () => {
    let resultado = boletas;

    // Filtrar por estado
    if (selectedEstado !== 'todos') {
      // Usamos el código de estado del backend (PENDIENTE_DOCUMENTOS, APROBADA, etc.)
      resultado = resultado.filter(b => b.estado_codigo === selectedEstado);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const busqueda = searchTerm.toLowerCase();
      resultado = resultado.filter(b => {
        // Obtener nombre del empleado
        const nombreEmpleado = getNombreEmpleado(b.empleado_id).toLowerCase();

        return (
          b.id_boleta.toString().includes(busqueda) ||
          b.empleado_id.toString().includes(busqueda) ||
          nombreEmpleado.includes(busqueda) ||
          (b.motivo && b.motivo.toLowerCase().includes(busqueda)) ||
          (b.tipo_motivo && b.tipo_motivo.toLowerCase().includes(busqueda))
        );
      });
    }

    setFilteredBoletas(resultado);
  };

  const handleVerDetalles = (boleta) => {
    setBoletaSeleccionada(boleta);
    setMostrarDetalles(true);
  };

  const handleEditar = (boleta) => {
    // Validar que solo se puedan editar boletas en estados tempranos
    // Debe coincidir con lo que permite el backend en update_solicitud:
    // ['PENDIENTE_DOCUMENTOS', 'DOCUMENTOS_COMPLETOS']
    const estadosEditables = ['PENDIENTE_DOCUMENTOS', 'DOCUMENTOS_COMPLETOS'];
    if (!estadosEditables.includes(boleta.estado_codigo)) {
      alert(`⚠️ No se puede editar una boleta en estado "${boleta.estado_texto}".\n\nSolo se pueden editar boletas pendientes (con documentos por completar o completos).`);
      return;
    }
    setBoletaSeleccionada(boleta);
    setMostrarEditar(true);
  };

  const handleCerrarDetalles = () => {
    setMostrarDetalles(false);
    setBoletaSeleccionada(null);
  };

  const handleCerrarEditar = () => {
    setMostrarEditar(false);
    setMostrarNuevaBoleta(false);
    setBoletaSeleccionada(null);
    // Recargar boletas al cerrar para asegurar que se muestren los cambios
    cargarBoletas();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta boleta?')) {
      try {
        await solicitudPermisoService.cancelarSolicitud(id);
        alert('✅ Solicitud cancelada correctamente');
        cargarBoletas();
      } catch (error) {
        console.error('❌ Error al cancelar:', error);
        alert('Error al cancelar la boleta');
      }
    }
  };

  const handleGenerarPDF = (id) => {
    const url = `/rrhh/boletas/${id}/print`;
    window.open(url, '_blank');
  };

  const getEstadoColor = (estado) => {
    // Recibimos el texto legible; contemplamos los textos reales del backend
    switch (estado) {
      case 'Pendiente de Documentos':
      case 'PENDIENTE_DOCUMENTOS':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-600';
      case 'Documentos Completos':
      case 'DOCUMENTOS_COMPLETOS':
        return 'bg-orange-900/30 text-orange-400 border-orange-600';
      case 'En Revisión del Jefe':
      case 'EN_REVISION_JEFE':
        return 'bg-blue-900/30 text-blue-400 border-blue-600';
      case 'Aprobada':
      case 'APROBADA':
        return 'bg-green-900/30 text-green-400 border-green-600';
      case 'Rechazada':
      case 'RECHAZADA':
        return 'bg-red-900/30 text-red-400 border-red-600';
      case 'Cancelada':
      case 'CANCELADA':
        return 'bg-gray-700/30 text-gray-400 border-gray-600';
      default:
        return 'bg-gray-700/30 text-gray-400 border-gray-600';
    }
  };

  const getEstadoIcon = (estado) => {
    // Mismo criterio que getEstadoColor: soportar textos y códigos
    switch (estado) {
      case 'Aprobada':
      case 'APROBADA':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pendiente de Documentos':
      case 'PENDIENTE_DOCUMENTOS':
      case 'Documentos Completos':
      case 'DOCUMENTOS_COMPLETOS':
      case 'En Revisión del Jefe':
      case 'EN_REVISION_JEFE':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTipoMotivoColor = (tipo) => {
    switch (tipo) {
      case 'Salud':
        return 'bg-red-900/30 text-red-400';
      case 'Personal':
        return 'bg-purple-900/30 text-purple-400';
      case 'Familiar':
        return 'bg-pink-900/30 text-pink-400';
      case 'Trámite':
        return 'bg-blue-900/30 text-blue-400';
      case 'Emergencia':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    // Parsear la fecha como local para evitar problemas de zona horaria
    const fechaStr = fecha.split('T')[0]; // Obtener solo la parte de la fecha (YYYY-MM-DD)
    const [year, month, day] = fechaStr.split('-');
    const date = new Date(year, month - 1, day); // Crear fecha local (mes es 0-indexed)
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleExportarCSV = () => {
    const dataset = filteredBoletas.length > 0 ? filteredBoletas : boletas;

    if (!dataset || dataset.length === 0) {
      alert('No hay solicitudes para exportar.');
      return;
    }

    const headers = ['ID', 'Empleado', 'Fecha', 'Horas', 'Tipo', 'Motivo', 'Estado'];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = dataset.map((b) => [
      b.id_boleta,
      getNombreEmpleado(b.empleado_id),
      formatearFecha(b.fecha_permiso),
      b.horas_duracion,
      b.tipo_motivo,
      b.motivo,
      b.estado_texto || b.estado_codigo || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `reporte_permisos_${fecha}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const total = boletas.length;
  const totalAprobadas = boletas.filter(b => b.estado_codigo === 'APROBADA').length;
  const totalRechazadas = boletas.filter(b => b.estado_codigo === 'RECHAZADA').length;
  const totalPendientes = boletas.filter(b => !['APROBADA', 'RECHAZADA', 'CANCELADA'].includes(b.estado_codigo)).length;
  const isAdmin = rolId === 1;
  const isJefe = rolId === 2;

  return (
    <div className="space-y-8">
      {/* Encabezado tipo panel */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-400" />
            {isJefe ? 'Gestión de Permisos del Área' : 'Gestión de Permisos'}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {isJefe
              ? 'Administra y revisa las solicitudes de permiso de tu área.'
              : 'Administra tus solicitudes de permiso y revisa su estado.'}
          </p>
        </div>

        {/* Botón para agregar nueva boleta */}
        <button
          onClick={() => setMostrarNuevaBoleta(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Solicitar Permiso
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Tus Permisos</p>
            <p className="text-2xl font-bold text-white mt-1">{total}</p>
            <p className="text-xs text-gray-500 mt-1">Solicitudes totales</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Aprobados</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{totalAprobadas}</p>
            <p className="text-xs text-gray-500 mt-1">Permisos confirmados</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{totalPendientes}</p>
            <p className="text-xs text-gray-500 mt-1">En espera de aprobación</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Rechazados</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{totalRechazadas}</p>
            <p className="text-xs text-gray-500 mt-1">No aprobados</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <section className="space-y-4">
        {/* Filtro de búsqueda */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
          <div className="flex-1">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, empleado, motivo o fecha"
              className="w-full py-2 pl-10 text-sm text-gray-400 rounded-lg bg-gray-800/60 border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
          </div>

          {/* Filtro por estado */}
          <div className="flex-1">
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full py-2 pl-10 text-sm text-gray-400 rounded-lg bg-gray-800/60 border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="PENDIENTE_DOCUMENTOS">Pendiente de documentos</option>
              <option value="DOCUMENTOS_COMPLETOS">Documentos completos</option>
              <option value="EN_REVISION_JEFE">En revisión del jefe</option>
              <option value="APROBADA">Aprobada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Filter className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Listado de boletas */}
        {!loading && filteredBoletas.length === 0 && (
          <div className="text-center py-12 bg-gray-800/60 border border-gray-700 rounded-xl">
            <AlertCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 font-medium">No tienes solicitudes registradas aún.</p>
            <p className="text-gray-500 text-sm mt-1">Crea tu primer permiso haciendo clic en "Solicitar Permiso".</p>
          </div>
        )}

        {!loading && filteredBoletas.length > 0 && (
          <div className="space-y-3">
            {filteredBoletas.map((boleta) => (
              <div
                key={boleta.id_boleta}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/70 hover:bg-gray-800/90 transition-colors flex flex-col md:flex-row gap-4"
              >
                {/* Columna principal con datos */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center text-sm font-semibold text-blue-200">
                        {getNombreEmpleado(boleta.empleado_id).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{getNombreEmpleado(boleta.empleado_id)}</p>
                        <p className="text-xs text-gray-400">Boleta #{boleta.id_boleta}</p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getEstadoColor(
                        boleta.estado_texto || boleta.estado
                      )}`}
                    >
                      {getEstadoIcon(boleta.estado_texto || boleta.estado)}
                      {boleta.estado_texto || boleta.estado}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">{boleta.motivo || 'Sin motivo detallado'}</p>
                    <p className="text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1 mr-3">
                        <Calendar className="w-3 h-3" />
                        {formatearFecha(boleta.fecha_permiso)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {boleta.horas_duracion}h
                      </span>
                    </p>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getTipoMotivoColor(
                          boleta.tipo_motivo
                        )}`}
                      >
                        {boleta.tipo_motivo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Columna de acciones */}
                <div className="flex md:flex-col gap-2 md:items-end">
                  <button
                    onClick={() => handleVerDetalles(boleta)}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleGenerarPDF(boleta.id_boleta)}
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>

                  {/* Solo empleados (no admin ni jefe) pueden editar o cancelar
                      y solo si la boleta NO está aprobada ni cancelada */}
                  {!isJefe && !isAdmin && !['APROBADA', 'CANCELADA'].includes(boleta.estado_codigo) && (
                    <>
                      <button
                        onClick={() => handleEditar(boleta)}
                        disabled={!['PENDIENTE_DOCUMENTOS', 'DOCUMENTOS_COMPLETOS'].includes(boleta.estado_codigo)}
                        className={`flex-1 md:flex-none py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 ${
                          ['PENDIENTE_DOCUMENTOS', 'DOCUMENTOS_COMPLETOS'].includes(boleta.estado_codigo)
                            ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(boleta.id_boleta)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg flex items-center justify-center"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Detalles */}
      {mostrarDetalles && (
        <BoletaDetallesModal 
          boleta={boletaSeleccionada}
          onClose={handleCerrarDetalles}
        />
      )}

      {/* Modal de Nueva Boleta */}
      {mostrarNuevaBoleta && (
        <BoletaUploadModal 
          onClose={() => setMostrarNuevaBoleta(false)}
          onSuccess={cargarBoletas}
        />
      )}

      {/* Modal de Editar Boleta */}
      {mostrarEditar && boletaSeleccionada && (
        <BoletaEditModal 
          boleta={boletaSeleccionada}
          onClose={handleCerrarEditar}
          onSuccess={cargarBoletas}
        />
      )}
    </div>
  );
};