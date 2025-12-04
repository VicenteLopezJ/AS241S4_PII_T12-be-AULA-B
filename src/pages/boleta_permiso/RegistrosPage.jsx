// src/pages/boleta_permiso/RegistrosPage.jsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, X, Clock, FileText, AlertCircle } from 'lucide-react';
import { registroAsistenciaService } from '../../services/boleta_permiso/registroAsistenciaService';
import { usuarioService } from '../../services/boleta_permiso/usuarioService';

const RegistrosPage = () => {
  const [pendientesRegistro, setPendientesRegistro] = useState([]);
  const [pendientesProcesar, setPendientesProcesar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);

  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [detalleForm, setDetalleForm] = useState({
    fecha_dia: '',
    hora_inicio: '',
    hora_fin: '',
    horas_ausencia: 0,
    horas_descuento: 0,
    justificacion: '',
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [me, pendReg, pendProc] = await Promise.all([
        usuarioService.getMyPermissions(),
        registroAsistenciaService.getPendientesRegistro(),
        registroAsistenciaService.getPendientesProcesar(),
      ]);

      // Guardar admin_id (user_id del usuario actual)
      setAdminId(me?.user_id || null);

      setPendientesRegistro(pendReg || []);
      setPendientesProcesar(pendProc || []);
    } catch (e) {
      console.error('Error al cargar registros de asistencia', e);
      alert('Error al cargar registros de asistencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleRegistrar = async (item) => {
    if (!adminId) {
      alert('No se pudo determinar el administrador actual (admin_id). Intenta recargar la página.');
      return;
    }

    if (!window.confirm(`¿Registrar en asistencia la boleta #${item.id_solicitud}?`)) return;
    try {
      await registroAsistenciaService.registrarPermiso({
        id_solicitud: item.id_solicitud,
        admin_id: adminId,
      });
      alert('Permiso registrado en asistencia');
      cargarDatos();
    } catch (e) {
      console.error('Error al registrar permiso en asistencia', e);
      alert('Error al registrar permiso en asistencia');
    }
  };

  const handleAbrirModalProcesar = (registro) => {
    setRegistroSeleccionado(registro);

    const hoy = new Date();
    const yyyyMmDd = hoy.toISOString().slice(0, 10);

    setDetalleForm({
      fecha_dia: yyyyMmDd,
      hora_inicio: `${yyyyMmDd}T09:00:00`,
      hora_fin: `${yyyyMmDd}T13:00:00`,
      horas_ausencia: 4,
      horas_descuento: 0,
      justificacion: '',
    });

    setMostrarModalDetalle(true);
  };

  const handleCerrarModal = () => {
    setMostrarModalDetalle(false);
    setRegistroSeleccionado(null);
  };

  const handleChangeDetalle = (field, value) => {
    setDetalleForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmarProcesar = async () => {
    if (!registroSeleccionado) return;

    const registroId = registroSeleccionado.id_registro;

    try {
      await registroAsistenciaService.addDetalle(registroId, detalleForm);
      await registroAsistenciaService.procesarRegistro(registroId);
      alert('Registro procesado correctamente');
      handleCerrarModal();
      cargarDatos();
    } catch (e) {
      console.error('Error al procesar registro con detalle', e);
      alert(e.message || 'Error al procesar registro');
    }
  };

  const handleAnular = async (registro) => {
    const motivo = window.prompt('Motivo de anulación:', 'Error en los datos del permiso');
    if (motivo === null || motivo.trim() === '') return;
    try {
      await registroAsistenciaService.anularRegistro(registro.id_registro, motivo);
      alert('Registro anulado correctamente');
      cargarDatos();
    } catch (e) {
      console.error('Error al anular registro', e);
      alert('Error al anular registro');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Registros de Asistencia</h1>
        <p className="text-gray-400 text-sm">
          Registra permisos aprobados en asistencia y procesa registros para planilla.
        </p>
      </div>

      {/* Pendientes de registro */}
      <section className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Pendientes de Registro</h2>
            <p className="text-xs text-gray-400">
              Boletas aprobadas que aún no se han registrado en asistencia.
            </p>
          </div>
        </div>

        {!loading && pendientesRegistro.length === 0 && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <AlertCircle className="w-4 h-4" />
            <span>No hay permisos pendientes de registro.</span>
          </div>
        )}

        {!loading && pendientesRegistro.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {pendientesRegistro.map((item) => {
              // Datos de usuario vienen anidados en item.usuario
              const usuario = item.usuario || {};

              // Nombre completo prioritario desde usuario.nombre_completo
              const nombresBase =
                usuario.nombres ||
                item.empleado_nombres ||
                item.nombres ||
                null;

              const apellidosBase =
                usuario.apellidos ||
                item.empleado_apellidos ||
                item.apellidos ||
                null;

              const nombreCompuesto =
                nombresBase && apellidosBase
                  ? `${nombresBase} ${apellidosBase}`
                  : nombresBase || apellidosBase || null;

              const nombreEmpleado =
                usuario.nombre_completo ||
                nombreCompuesto ||
                item.nombre_empleado ||
                item.empleado_nombre ||
                item.empleado ||
                item.empleado_nombre_completo ||
                item.nombre_usuario ||
                item.nombre_completo ||
                'Empleado sin nombre';

              const area = usuario.area_nombre || item.area_nombre || item.area || null;
              const cargo = usuario.cargo || item.cargo_empleado || item.cargo || null;
              const motivo = item.motivo || item.tipo_motivo || null;
              const horas = item.horas_duracion || item.horas || null;

              return (
                <div
                  key={item.id_solicitud || item.id_registro}
                  className="bg-gray-900/40 rounded-lg px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-gray-700"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white">
                      Boleta #{item.id_solicitud}{' '}
                      <span className="text-blue-300">· {nombreEmpleado}</span>
                    </p>

                    {(area || cargo) && (
                      <p className="text-xs text-gray-400">
                        {area && <span>Área: {area}</span>}
                        {area && cargo && <span className="mx-1">·</span>}
                        {cargo && <span>Cargo: {cargo}</span>}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.fecha_permiso || item.fecha || 'Sin fecha'}
                      </span>
                      {horas && (
                        <span className="inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {horas} h
                        </span>
                      )}
                      {motivo && (
                        <span className="truncate max-w-xs" title={motivo}>
                          Motivo: {motivo}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRegistrar(item)}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center gap-2 self-stretch md:self-auto"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Registrar en Asistencia
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pendientes de procesar */}
      <section className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Pendientes de Procesar</h2>
            <p className="text-xs text-gray-400">
              Registros listos para planilla (procesar o anular según corresponda).
            </p>
          </div>
        </div>

        {!loading && pendientesProcesar.length === 0 && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <AlertCircle className="w-4 h-4" />
            <span>No hay registros pendientes de procesar.</span>
          </div>
        )}

        {!loading && pendientesProcesar.length > 0 && (
          <div className="space-y-2">
            {pendientesProcesar.map((reg) => {
              const periodoTexto = reg.periodo_texto || `${reg.periodo_mes || reg.mes}/${reg.periodo_anio || reg.anio}`;
              const afectaPlanilla = reg.afecta_planilla_texto || reg.afecta_planilla || 'N/A';
              const tipoDescuento = reg.tipo_descuento_texto || reg.tipo_descuento || 'N/A';
              const monto = typeof reg.monto_descuento === 'number' ? reg.monto_descuento : null;
              const detalles = typeof reg.total_detalles === 'number' ? reg.total_detalles : null;

              return (
                <div
                  key={reg.id_registro}
                  className="bg-gray-900/40 rounded-lg px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-gray-700"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      Registro #{reg.id_registro}
                      {reg.numero_registro && (
                        <span className="text-gray-300"> · {reg.numero_registro}</span>
                      )}
                      {reg.estado_registro_texto && (
                        <span className="text-green-400 text-xs ml-2">({reg.estado_registro_texto})</span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Periodo: {periodoTexto}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        Afecta planilla: {afectaPlanilla}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        Tipo desc.: {tipoDescuento}
                      </span>
                      {monto !== null && (
                        <span className="inline-flex items-center gap-1">
                          Monto: {monto}
                        </span>
                      )}
                      {detalles !== null && (
                        <span className="inline-flex items-center gap-1">
                          Detalles: {detalles}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 self-stretch md:self-auto">
                    <button
                      type="button"
                      onClick={() => handleAbrirModalProcesar(reg)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Procesar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnular(reg)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-xs sm:text-sm flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                      <X className="w-4 h-4" />
                      Anular
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {mostrarModalDetalle && registroSeleccionado && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Procesar Registro #{registroSeleccionado.id_registro}
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-300 mb-1">Fecha del día</label>
                <input
                  type="date"
                  value={detalleForm.fecha_dia}
                  onChange={(e) => handleChangeDetalle('fecha_dia', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Hora inicio (ISO)</label>
                  <input
                    type="text"
                    value={detalleForm.hora_inicio}
                    onChange={(e) => handleChangeDetalle('hora_inicio', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Hora fin (ISO)</label>
                  <input
                    type="text"
                    value={detalleForm.hora_fin}
                    onChange={(e) => handleChangeDetalle('hora_fin', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Horas de ausencia</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={detalleForm.horas_ausencia}
                    onChange={(e) => handleChangeDetalle('horas_ausencia', Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Horas de descuento</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={detalleForm.horas_descuento}
                    onChange={(e) => handleChangeDetalle('horas_descuento', Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Justificación</label>
                <textarea
                  rows={3}
                  value={detalleForm.justificacion}
                  onChange={(e) => handleChangeDetalle('justificacion', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCerrarModal}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarProcesar}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar y Procesar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrosPage;
