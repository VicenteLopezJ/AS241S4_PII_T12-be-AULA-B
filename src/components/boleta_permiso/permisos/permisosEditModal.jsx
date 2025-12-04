// src/components/permisos/permisosEditModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, FileText, User } from 'lucide-react';
import API_URL from '../../../services/boleta_permiso/config';
import getAuthHeaders from '../../../services/boleta_permiso/authHeaders';

export const BoletaEditModal = ({ boleta, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [formData, setFormData] = useState({
    empleado_id: '',
    fecha_permiso: '',
    hora_salida: '',
    hora_retorno: '',
    tipo_motivo: 'Personal',
    motivo: '',
    requiere_prueba: 'N',
    observaciones: '',
    estado: 'Pendiente Documento'
  });
  const [duracionCalculada, setDuracionCalculada] = useState(0);
  const [errors, setErrors] = useState({});

  // Cargar empleados y datos de la boleta al montar
  useEffect(() => {
    cargarEmpleados();
    if (boleta) {
      cargarDatosBoleta();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boleta]);

  const cargarEmpleados = async () => {
    try {
      const response = await fetch(`${API_URL}/empleados/`);
      const data = await response.json();
      setEmpleados(data.data || []);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const cargarDatosBoleta = () => {
    if (!boleta) return;

    // Extraer solo la hora de hora_salida si es un timestamp
    let horaSalida = '';
    if (boleta.hora_salida) {
      try {
        const date = new Date(boleta.hora_salida);
        horaSalida = date.toTimeString().slice(0, 5); // HH:MM
      } catch {
        horaSalida = boleta.hora_salida;
      }
    }

    // Extraer solo la hora de hora_retorno
    let horaRetorno = '';
    if (boleta.hora_retorno) {
      try {
        const date = new Date(boleta.hora_retorno);
        horaRetorno = date.toTimeString().slice(0, 5); // HH:MM
      } catch {
        horaRetorno = boleta.hora_retorno;
      }
    }

    setFormData({
      empleado_id: boleta.empleado_id || '',
      fecha_permiso: boleta.fecha_permiso ? boleta.fecha_permiso.split('T')[0] : '',
      hora_salida: horaSalida,
      hora_retorno: horaRetorno,
      tipo_motivo: boleta.tipo_motivo || 'Personal',
      motivo: boleta.motivo || '',
      requiere_prueba: boleta.requiere_prueba || 'N',
      observaciones: boleta.observaciones || '',
      estado: boleta.estado || 'Pendiente Documento'
    });
  };

  const calcularDuracion = (horaSalida, fechaRetorno) => {
    if (!horaSalida || !fechaRetorno) return 0;
    
    try {
      const salida = new Date(horaSalida);
      const retorno = new Date(fechaRetorno);
      
      if (isNaN(salida.getTime()) || isNaN(retorno.getTime())) return 0;
      
      const diferenciaMs = retorno - salida;
      const horas = diferenciaMs / (1000 * 60 * 60);
      
      return horas > 0 ? horas : 0;
    } catch {
      return 0;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Calcular duración si cambia hora_salida o hora_retorno
    if (name === 'hora_salida' || name === 'hora_retorno') {
      const horaSalida = name === 'hora_salida' ? value : formData.hora_salida;
      const horaRetorno = name === 'hora_retorno' ? value : formData.hora_retorno;
      
      if (horaSalida && horaRetorno && formData.fecha_permiso) {
        // Combinar fecha_permiso con las horas
        const fechaHoraSalida = `${formData.fecha_permiso} ${horaSalida}:00`;
        const fechaHoraRetorno = `${formData.fecha_permiso} ${horaRetorno}:00`;
        const duracion = calcularDuracion(fechaHoraSalida, fechaHoraRetorno);
        setDuracionCalculada(duracion);
      }
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar empleado
    if (!formData.empleado_id) {
      newErrors.empleado_id = 'Debe seleccionar un empleado';
    }

    // Validar fecha
    if (!formData.fecha_permiso) {
      newErrors.fecha_permiso = 'La fecha es requerida';
    } else {
      // Parsear la fecha como local para evitar problemas de zona horaria
      const [year, month, day] = formData.fecha_permiso.split('-').map(Number);
      const fechaSeleccionada = new Date(year, month - 1, day);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        newErrors.fecha_permiso = 'La fecha no puede ser anterior a hoy';
      }
      
      // Validar que no sea más de 30 días en el futuro
      const maxFecha = new Date();
      maxFecha.setDate(maxFecha.getDate() + 30);
      maxFecha.setHours(0, 0, 0, 0);
      if (fechaSeleccionada > maxFecha) {
        newErrors.fecha_permiso = 'La fecha no puede ser mayor a 30 días en el futuro';
      }
    }

    // Validar hora de salida
    if (!formData.hora_salida) {
      newErrors.hora_salida = 'La hora de salida es requerida';
    } else {
      const [hora, minuto] = formData.hora_salida.split(':').map(Number);
      if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
        newErrors.hora_salida = 'Hora inválida';
      } else {
        // Convertir a minutos desde medianoche para facilitar comparación
        const minutosDesdeMedianoche = hora * 60 + minuto;
        const horaInicio = 8 * 60; // 8:00 AM
        const horaFin = 18 * 60 + 30; // 6:30 PM
        
        if (minutosDesdeMedianoche < horaInicio || minutosDesdeMedianoche > horaFin) {
          newErrors.hora_salida = 'La hora debe estar entre 8:00 AM y 6:30 PM';
        }
      }
    }

    // Validar fecha y hora de retorno
    if (!formData.hora_retorno) {
      newErrors.hora_retorno = 'La fecha y hora de retorno es requerida';
    } else if (formData.hora_salida && formData.fecha_permiso) {
      const fechaHoraSalida = new Date(`${formData.fecha_permiso} ${formData.hora_salida}:00`);
      const fechaHoraRetorno = new Date(formData.hora_retorno);
      
      if (fechaHoraRetorno <= fechaHoraSalida) {
        newErrors.hora_retorno = 'La hora de retorno debe ser posterior a la hora de salida';
      } else {
        const duracion = (fechaHoraRetorno - fechaHoraSalida) / (1000 * 60 * 60);
        if (duracion > 4) {
          newErrors.hora_retorno = 'La duración no puede exceder 4 horas';
        }
      }
    }

    // Validar tipo de motivo
    if (!formData.tipo_motivo) {
      newErrors.tipo_motivo = 'El tipo de motivo es requerido';
    }

    // Validar motivo
    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es requerido';
    } else if (formData.motivo.trim().length < 10) {
      newErrors.motivo = 'El motivo debe tener al menos 10 caracteres';
    } else if (formData.motivo.trim().length > 500) {
      newErrors.motivo = 'El motivo no puede exceder 500 caracteres';
    }

    // Validar observaciones si existen
    if (formData.observaciones && formData.observaciones.length > 500) {
      newErrors.observaciones = 'Las observaciones no pueden exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Combinar fecha_permiso con hora_salida para crear un TIMESTAMP completo
      const horaSalidaTimestamp = `${formData.fecha_permiso} ${formData.hora_salida}:00`;
      const horaRetornoTimestamp = `${formData.fecha_permiso} ${formData.hora_retorno}:00`;
      
      const dataToSend = {
        empleado_id: parseInt(formData.empleado_id),
        fecha_permiso: formData.fecha_permiso,
        hora_salida: horaSalidaTimestamp,
        hora_retorno: horaRetornoTimestamp,
        tipo_motivo: formData.tipo_motivo,
        motivo: formData.motivo,
        requiere_prueba: formData.requiere_prueba,
        observaciones: formData.observaciones || null,
        estado: formData.estado
      };

      console.log('📤 Datos a actualizar:', dataToSend);

      const response = await fetch(`${API_URL}/boletas/${boleta.id_boleta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(dataToSend),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error al parsear respuesta JSON:', jsonError);
        data = { message: 'Error en el servidor' };
      }
      
      console.log('📥 Respuesta del servidor:', data);
      
      if (response.ok) {
        alert('✅ Boleta de permiso actualizada exitosamente');
        onSuccess?.();
        onClose();
      } else {
        const errorMsg = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
        console.error('❌ Error del servidor:', errorMsg);
        alert(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error al actualizar boleta:', error);
      alert(`❌ Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Editar Boleta #{boleta?.id_boleta}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Empleado */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Información del Empleado
            </h3>
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Empleado *
              </label>
              <select
                name="empleado_id"
                value={formData.empleado_id}
                onChange={handleChange}
                className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.empleado_id ? 'ring-2 ring-red-500' : ''
                }`}
                disabled={loading}
              >
                <option value="">Seleccione un empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombres} {emp.apellidos} - {emp.documento}
                  </option>
                ))}
              </select>
              {errors.empleado_id && (
                <p className="text-red-400 text-xs mt-1">{errors.empleado_id}</p>
              )}
            </div>
          </div>

          {/* Información del Permiso */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Información del Permiso
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Fecha del Permiso *
                  </label>
                  <input
                    type="date"
                    name="fecha_permiso"
                    value={formData.fecha_permiso}
                    onChange={handleChange}
                    className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fecha_permiso ? 'ring-2 ring-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                  {errors.fecha_permiso && (
                    <p className="text-red-400 text-xs mt-1">{errors.fecha_permiso}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Tipo de Motivo *
                  </label>
                  <select
                    name="tipo_motivo"
                    value={formData.tipo_motivo}
                    onChange={handleChange}
                    className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tipo_motivo ? 'ring-2 ring-red-500' : ''
                    }`}
                    disabled={loading}
                  >
                    <option value="Salud">Salud</option>
                    <option value="Personal">Personal</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Trámite">Trámite</option>
                    <option value="Emergencia">Emergencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.tipo_motivo && (
                    <p className="text-red-400 text-xs mt-1">{errors.tipo_motivo}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Hora de Salida * <span className="text-gray-500">(Bloqueado)</span>
                  </label>
                  <input
                    type="time"
                    name="hora_salida"
                    value={formData.hora_salida}
                    onChange={handleChange}
                    min="08:00"
                    max="18:30"
                    className="w-full bg-gray-700 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed opacity-60"
                    disabled={true}
                  />
                  {errors.hora_salida && (
                    <p className="text-red-400 text-xs mt-1">{errors.hora_salida}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Hora de Retorno * <span className="text-gray-500">(Bloqueado)</span>
                  </label>
                  <input
                    type="time"
                    name="hora_retorno"
                    value={formData.hora_retorno}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed opacity-60"
                    disabled={true}
                  />
                  {errors.hora_retorno && (
                    <p className="text-red-400 text-xs mt-1">{errors.hora_retorno}</p>
                  )}
                  {duracionCalculada > 0 && (
                    <p className="text-blue-400 text-xs mt-1">
                      Duración: {duracionCalculada.toFixed(1)} horas
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Motivo del Permiso * <span className="text-gray-500">({formData.motivo.length}/500)</span>
                </label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  rows="3"
                  maxLength="500"
                  placeholder="Describa el motivo del permiso (mínimo 10 caracteres)..."
                  className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.motivo ? 'ring-2 ring-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {errors.motivo && (
                  <p className="text-red-400 text-xs mt-1">{errors.motivo}</p>
                )}
                {!errors.motivo && formData.motivo.length > 0 && formData.motivo.length < 10 && (
                  <p className="text-yellow-400 text-xs mt-1">Faltan {10 - formData.motivo.length} caracteres</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Estado <span className="text-gray-500">(Bloqueado)</span>
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed opacity-60"
                    disabled={true}
                  >
                    <option value="Pendiente Documento">Pendiente Documento</option>
                    <option value="Pendiente Jefe">Pendiente Jefe</option>
                    <option value="Pendiente Registro">Pendiente Registro</option>
                    <option value="Registrado">Registrado</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    ¿Requiere Documento de Prueba? <span className="text-gray-500">(Bloqueado)</span>
                  </label>
                  <select
                    name="requiere_prueba"
                    value={formData.requiere_prueba}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed opacity-60"
                    disabled={true}
                  >
                    <option value="N">No</option>
                    <option value="S">Sí</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Observaciones (Opcional)
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Observaciones adicionales..."
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
