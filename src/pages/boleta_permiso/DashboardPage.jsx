// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Users,
  Clock,
  CheckCircle,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { usuarioService } from '../../services/boleta_permiso/usuarioService';
import { solicitudPermisoService } from '../../services/boleta_permiso/solicitudPermisoService';
import { empresaService } from '../../services/boleta_permiso/empresaService';
import { areaService } from '../../services/boleta_permiso/areaService';
import { registroAsistenciaService } from '../../services/boleta_permiso/registroAsistenciaService';

const DashboardPage = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [misBoletas, setMisBoletas] = useState([]);
  const [solicitudesArea, setSolicitudesArea] = useState([]);
  const [empleadosArea, setEmpleadosArea] = useState([]);
  const [adminSummary, setAdminSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  // Datos exactos para las estadísticas mensuales (ADMIN / JEFE)
  const monthlyStats = [
    { month: 'Ene', requests: 45, approved: 38, rejected: 7, percentage: 84 },
    { month: 'Feb', requests: 52, approved: 46, rejected: 6, percentage: 88 },
    { month: 'Mar', requests: 48, approved: 41, rejected: 7, percentage: 85 },
    { month: 'Abr', requests: 61, approved: 53, rejected: 8, percentage: 87 },
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const info = await usuarioService.getMyPermissions();
        setMe(info);

        if (info?.rol_id === 3) {
          // EMPLEADO: obtener sus propias solicitudes para el panel
          const solicitudes = await solicitudPermisoService.getMisSolicitudes(info.user_id);
          const boletasMapeadas = (solicitudes || []).map((s) => ({
            id_boleta: s.id_solicitud,
            fecha_permiso: s.fecha_permiso,
            tipo_motivo: s.tipo_permiso_texto || s.tipo_permiso,
            motivo: s.motivo,
            estado_codigo: s.estado_solicitud,
            estado_texto: s.estado_solicitud_texto || s.estado_solicitud,
          }));

          // Ordenar por fecha descendente
          boletasMapeadas.sort((a, b) => {
            const fa = a.fecha_permiso || '';
            const fb = b.fecha_permiso || '';
            return fb.localeCompare(fa);
          });

          setMisBoletas(boletasMapeadas);
        } else if (info?.rol_id === 2) {
          // JEFE DE ÁREA: cargar solicitudes y empleados de su área
          if (info.area_id) {
            try {
              const solicitudesAreaResp = await solicitudPermisoService.getSolicitudesByArea(info.area_id);
              const boletasAreaMapeadas = (solicitudesAreaResp || []).map((s) => ({
                id_boleta: s.id_solicitud,
                empleado_id: s.usuario_id,
                fecha_permiso: s.fecha_permiso,
                horas_duracion: s.horas_duracion,
                tipo_motivo: s.tipo_permiso_texto || s.tipo_permiso,
                motivo: s.motivo,
                estado_codigo: s.estado_solicitud,
                estado_texto: s.estado_solicitud_texto || s.estado_solicitud,
              }));

              boletasAreaMapeadas.sort((a, b) => {
                const fa = a.fecha_permiso || '';
                const fb = b.fecha_permiso || '';
                return fb.localeCompare(fa);
              });

              setSolicitudesArea(boletasAreaMapeadas);
            } catch (e) {
              console.error('Error al cargar solicitudes del área para el dashboard de jefe:', e);
            }

            try {
              const empleadosResp = await usuarioService.getUsuariosByArea(info.area_id);
              setEmpleadosArea(empleadosResp || []);
            } catch (e) {
              console.error('Error al cargar empleados del área para el dashboard de jefe:', e);
            }
          }
        } else if (info?.rol_id === 1) {
          // ADMIN: cargar resumen global
          try {
            const [empresas, areas, usuarios, pendientesDocs, pendientesRev, pendientesRegistro, pendientesProcesar] =
              await Promise.all([
                empresaService.getAllEmpresasConInactivas(),
                areaService.getAllAreas(),
                usuarioService.getAllUsuarios(),
                solicitudPermisoService.getPendientesDocumentos(),
                solicitudPermisoService.getPendientesRevision(),
                registroAsistenciaService.getPendientesRegistro(),
                registroAsistenciaService.getPendientesProcesar(),
              ]);

            setAdminSummary({
              totalEmpresas: (empresas || []).length,
              totalAreas: (areas || []).length,
              totalEmpleados: (usuarios || []).length,
              permisosPendientesDocs: (pendientesDocs || []).length,
              permisosPendientesJefe: (pendientesRev || []).length,
              registrosPendientesRegistro: (pendientesRegistro || []).length,
              registrosPendientesProcesar: (pendientesProcesar || []).length,
            });
          } catch (e) {
            console.error('Error al cargar resumen admin:', e);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const rolId = me?.rol_id ?? null;

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return 'N/A';
    const fechaStr = String(fecha).split('T')[0];
    const [year, month, day] = fechaStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderAdminDashboard = () => {
    const resumen = adminSummary || {
      totalEmpleados: 0,
      totalEmpresas: 0,
      totalAreas: 0,
      permisosPendientesDocs: 0,
      permisosPendientesJefe: 0,
      registrosPendientesRegistro: 0,
      registrosPendientesProcesar: 0,
    };

    const totalPendientesTotales =
      resumen.permisosPendientesDocs +
      resumen.permisosPendientesJefe +
      resumen.registrosPendientesRegistro +
      resumen.registrosPendientesProcesar;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Panel de Administración RRHH</h1>
          <p className="text-gray-400 text-sm">
            Controla empresas, áreas, empleados, permisos y asistencia desde un solo lugar.
          </p>
        </div>

        {/* Resumen global */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Empleados</p>
              <p className="text-2xl font-bold text-white mt-1">{resumen.totalEmpleados}</p>
              <p className="text-xs text-gray-500 mt-1">Registrados en la empresa</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Empresas</p>
              <p className="text-2xl font-bold text-white mt-1">{resumen.totalEmpresas}</p>
              <p className="text-xs text-gray-500 mt-1">Entidades registradas</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-900/40 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Áreas</p>
              <p className="text-2xl font-bold text-white mt-1">{resumen.totalAreas}</p>
              <p className="text-xs text-gray-500 mt-1">Organización interna</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-900/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendientes Totales</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{totalPendientesTotales}</p>
              <p className="text-xs text-gray-500 mt-1">Permisos y registros por atender</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Permisos y aprobaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h2 className="text-sm font-semibold text-white mb-2">Permisos y Aprobaciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/rrhh/permisos')}
                className="w-full bg-gray-900/60 hover:bg-gray-900 text-left rounded-lg p-3 border border-gray-700 flex items-center gap-3 text-sm text-gray-200"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Gestionar Permisos</p>
                  <p className="text-xs text-gray-400">Ver y administrar todas las boletas</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/rrhh/jefe/permisos/aprobados')}
                className="w-full bg-gray-900/60 hover:bg-gray-900 text-left rounded-lg p-3 border border-gray-700 flex items-center gap-3 text-sm text-gray-200"
              >
                <div className="w-9 h-9 rounded-lg bg-green-600/20 flex items_center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Ver Aprobaciones</p>
                  <p className="text-xs text-gray-400">Monitorear decisiones de jefes</p>
                </div>
              </button>
            </div>
          </div>

          {/* Asistencia y registros */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h2 className="text-sm font-semibold text-white mb-2">Asistencia y Registros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Pendientes de Registro</p>
                  <p className="text-2xl font-bold text-white">{resumen.registrosPendientesRegistro}</p>
                  <p className="text-xs text-gray-500 mt-1">Boletas aún no registradas en asistencia</p>
                </div>
              </div>

              <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Pendientes de Procesar</p>
                  <p className="text-2xl font-bold text-white">{resumen.registrosPendientesProcesar}</p>
                  <p className="text-xs text-gray-500 mt-1">Registros listos para planilla</p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => navigate('/rrhh/registros')}
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
              >
                <Clock className="w-4 h-4" />
                Ver detalle de registros
              </button>
            </div>
          </div>

        </div>

        {/* Gestión de organización */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-3">Gestión de Organización</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => navigate('/rrhh/empresa')}
              className="w-full bg-gray-900/60 hover:bg-gray-900 text-left rounded-lg p-3 border border-gray-700 flex items-center gap-3 text-sm text-gray-200"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Empresas</p>
                <p className="text-xs text-gray-400">Configurar razón social y datos</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/rrhh/areas')}
              className="w-full bg-gray-900/60 hover:bg-gray-900 text-left rounded-lg p-3 border border-gray-700 flex items-center gap-3 text-sm text-gray-200"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="font-medium">Áreas</p>
                <p className="text-xs text-gray-400">Definir estructura organizacional</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/rrhh/usuarios')}
              className="w-full bg-gray-900/60 hover:bg-gray-900 text-left rounded-lg p-3 border border-gray-700 flex items-center gap-3 text-sm text-gray-200"
            >
              <div className="w-9 h-9 rounded-lg bg-green-600/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="font-medium">Empleados</p>
                <p className="text-xs text-gray-400">Registrar y administrar usuarios</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmpleadoDashboard = () => {
    // Construir nombre usando primero los datos de la API y, si faltan,
    // completar con lo que está en localStorage.userInfo
    let nombres = me?.nombres || '';
    let apellidos = me?.apellidos || '';

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('userInfo');
        if (raw) {
          const info = JSON.parse(raw);
          const usuario = info.usuario || {};

          if (!nombres && (info.nombres || usuario.nombres)) {
            nombres = info.nombres || usuario.nombres;
          }
          if (!apellidos && (info.apellidos || usuario.apellidos)) {
            apellidos = info.apellidos || usuario.apellidos;
          }
        }
      } catch (e) {
        console.warn('No se pudo leer userInfo para el dashboard', e);
      }
    }

    const nombreBase = `${nombres} ${apellidos}`.trim();
    const nombreCompleto = nombreBase || 'Empleado';

    const total = misBoletas.length;
    const totalAprobadas = misBoletas.filter((b) => b.estado_codigo === 'APROBADA').length;
    const totalRechazadas = misBoletas.filter((b) => b.estado_codigo === 'RECHAZADA').length;
    const totalPendientes = misBoletas.filter(
      (b) => !['APROBADA', 'RECHAZADA', 'CANCELADA'].includes(b.estado_codigo)
    ).length;

    const recientes = misBoletas.slice(0, 5);

    return (
      <div className="space-y-8">
        {/* Header de bienvenida */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido, {nombreCompleto}</h1>
          <p className="text-gray-400 text-sm">
            Consulta tus permisos y solicita nuevos según sea necesario.
          </p>
        </div>

        {/* Tarjetas de resumen superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <p className="text-xs text-gray-500 mt-1">Confirmados</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{totalPendientes}</p>
              <p className="text-xs text-gray-500 mt-1">En espera</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Botón grande para solicitar permiso */}
        <button
          onClick={() => navigate('/rrhh/permisos?nueva=1')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>Solicitar Permiso</span>
        </button>

        {/* Tarjetas de resumen intermedias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Aprobados</p>
            <p className="text-3xl font-bold text-green-400">{totalAprobadas}</p>
            <p className="text-xs text-gray-500 mt-1">Permisos confirmados</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-400">{totalPendientes}</p>
            <p className="text-xs text-gray-500 mt-1">Esperando aprobación</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Rechazados</p>
            <p className="text-3xl font-bold text-red-400">{totalRechazadas}</p>
            <p className="text-xs text-gray-500 mt-1">No aprobados</p>
          </div>
        </div>

        {/* Permisos recientes */}
        <section className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Tus Permisos Recientes</h2>
              <p className="text-xs text-gray-400">Últimas solicitudes enviadas</p>
            </div>
          </div>

          {recientes.length === 0 && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <AlertCircle className="w-4 h-4" />
              <span>No tienes solicitudes registradas aún.</span>
            </div>
          )}

          {recientes.length > 0 && (
            <div className="space-y-2">
              {recientes.map((b) => (
                <div
                  key={b.id_boleta}
                  className="flex items-center justify-between bg-gray-900/40 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.tipo_motivo || 'Permiso'}</p>
                    <p className="text-xs text-gray-400">{formatearFechaCorta(b.fecha_permiso)}</p>
                    {b.motivo && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{b.motivo}</p>
                    )}
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-200 border border-gray-600">
                    {b.estado_texto || b.estado_codigo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderJefeDashboard = () => {
    let nombres = me?.nombres || '';
    let apellidos = me?.apellidos || '';

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('userInfo');
        if (raw) {
          const info = JSON.parse(raw);
          const usuario = info.usuario || {};

          if (!nombres && (info.nombres || usuario.nombres)) {
            nombres = info.nombres || usuario.nombres;
          }
          if (!apellidos && (info.apellidos || usuario.apellidos)) {
            apellidos = info.apellidos || usuario.apellidos;
          }
        }
      } catch (e) {
        console.warn('No se pudo leer userInfo para el dashboard de jefe', e);
      }
    }

    const nombreCompleto = `${nombres} ${apellidos}`.trim() || 'Jefe de área';

    const totalEmpleados = empleadosArea.length;
    const pendientes = solicitudesArea.filter(
      (s) => s.estado_codigo === 'PENDIENTE_DOCUMENTOS' || s.estado_codigo === 'EN_REVISION_JEFE'
    );
    const totalPendientes = pendientes.length;
    const totalAprobados = solicitudesArea.filter((s) => s.estado_codigo === 'APROBADA').length;

    const empleadosConPermisos = empleadosArea.map((emp) => {
      const count = solicitudesArea.filter((s) => s.empleado_id === emp.id_usuario).length;
      return {
        ...emp,
        permisosCount: count,
      };
    });

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido, {nombreCompleto}</h1>
          <p className="text-gray-400 text-sm">
            Supervisa tu área y aprueba solicitudes de permisos de tus empleados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Empleados</p>
              <p className="text-2xl font-bold text-white mt-1">{totalEmpleados}</p>
              <p className="text-xs text-gray-500 mt-1">En tu área</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{totalPendientes}</p>
              <p className="text-xs text-gray-500 mt-1">Requieren aprobación</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Aprobados</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{totalAprobados}</p>
              <p className="text-xs text-gray-500 mt-1">Por ti</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h2 className="text-sm font-semibold text-white mb-2">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/rrhh/jefe/permisos/revision')}
                className="w-full bg-gray-900/60 hover:bg-gray-900 text-left rounded-lg p-3 border border-gray-700 flex items-center gap-3 text-sm text-gray-200"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-600/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">Revisar Permisos</p>
                  <p className="text-xs text-gray-400">Aprobar los permisos de tu área</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/rrhh/usuarios')}
                className="w-full bg-gray-900/60 hover:bg-gray-900 text-left rounded-lg p-3 border border-gray-700 flex items-center gap-3 text-sm text-gray-200"
              >
                <div className="w-9 h-9 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Ver Empleados</p>
                  <p className="text-xs text-gray-400">Tu equipo en esta área</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Permisos Pendientes</p>
              <p className="text-3xl font-bold text-yellow-400">{totalPendientes}</p>
              <p className="text-xs text-gray-500 mt-1">Requieren tu aprobación</p>
            </div>
          </div>
        </div>

        <section className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Empleados en tu Área</h2>
              <p className="text-xs text-gray-400">{totalEmpleados} empleado(s) bajo tu supervisión</p>
            </div>
          </div>

          {empleadosArea.length === 0 && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <AlertCircle className="w-4 h-4" />
              <span>No hay empleados registrados en tu área.</span>
            </div>
          )}

          {empleadosArea.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {empleadosConPermisos.map((emp) => (
                <div key={emp.id_usuario} className="bg-gray-900/40 rounded-lg px-4 py-3 flex flex-col gap-1 border border-gray-700">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{emp.nombres} {emp.apellidos}</p>
                      <p className="text-xs text-gray-400">DNI: {emp.dni}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">Permisos solicitados: {emp.permisosCount}</p>
                    <button
                      type="button"
                      onClick={() => navigate('/rrhh/permisos')}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Ver Permisos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  };

  if (loading && !me) {
    return <div className="text-gray-300">Cargando panel...</div>;
  }

  // EMPLEADO
  if (rolId === 3) {
    return renderEmpleadoDashboard();
  }

  // JEFE DE ÁREA
  if (rolId === 2) {
    return renderJefeDashboard();
  }

  // ADMIN o JEFE usan el dashboard administrativo actual
  return renderAdminDashboard();
};

export default DashboardPage;