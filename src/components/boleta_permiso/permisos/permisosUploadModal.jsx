// src/components/permisos/permisosUploadModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Save, Calendar, Clock, FileText, User, Upload, File, Building } from 'lucide-react';
import { solicitudPermisoService } from '../../../services/boleta_permiso/solicitudPermisoService';
import API_URL from '../../../services/boleta_permiso/config';
import getAuthHeaders from '../../../services/boleta_permiso/authHeaders';
import { usuarioService } from '../../../services/boleta_permiso/usuarioService';
import { areaService } from '../../../services/boleta_permiso/areaService';

export const BoletaUploadModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fecha_permiso: '',
    hora_salida: '',
    hora_retorno: '',
    tipo_motivo: 'Personal',
    motivo: '',
    requiere_prueba: 'N',
    observaciones: '',
    tipo_documento: '',
    archivo: null
  });
  const [duracionCalculada, setDuracionCalculada] = useState(0);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const loadUserAndAdminData = async () => {
      try {
        const me = await usuarioService.getMyPermissions();
        setCurrentUser(me);

        const esAdmin = me?.rol_id === 1;
        setIsAdmin(esAdmin);

        if (esAdmin) {
          // Cargar todos los usuarios empleados (no jefes de área, no admins) y excluir al propio admin
          try {
            const allUsers = await usuarioService.getAllUsuarios();
            const filtrados = (allUsers || []).filter((u) => {
              const noEsJefe = u.es_jefe_area !== 'S';
              const esEmpleado = !u.rol_id || u.rol_id === 3; // 3 = empleado (según convención del proyecto)
              const noEsActual = u.id_usuario !== me.user_id;
              return noEsJefe && esEmpleado && noEsActual;
            });
            setUsuariosDisponibles(filtrados);
          } catch (e) {
            console.error('Error al cargar usuarios para admin en formulario de permiso:', e);
          }

          // Cargar todas las áreas
          try {
            const allAreas = await areaService.getAllAreas();
            setAreas(allAreas || []);
          } catch (e) {
            console.error('Error al cargar áreas para formulario de permiso:', e);
          }
        }
      } catch (err) {
        console.error('Error al obtener datos del usuario para el formulario:', err);
      }
    };

    loadUserAndAdminData();
  }, []);

  // No necesitamos calcular duración automáticamente, el usuario la ingresa manualmente

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 20 * 1024 * 1024; // 20 MB

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        archivo: 'Formato no permitido. Solo PDF, JPG, JPEG o PNG'
      }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        archivo: 'El archivo excede el tamaño máximo de 20 MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      archivo: file
    }));
    
    setErrors(prev => ({
      ...prev,
      archivo: null
    }));
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      archivo: null
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = {
      ...formData,
      [name]: value
    };

    // Si el admin cambia el empleado solicitante, autocompletar el área con el área del empleado
    if (name === 'usuario_id' && isAdmin) {
      const seleccionado = usuariosDisponibles.find((u) => String(u.id_usuario) === String(value));
      if (seleccionado && seleccionado.area_id) {
        newFormData = {
          ...newFormData,
          area_id: String(seleccionado.area_id),
        };
        // Limpiar posible error previo de área
        if (errors.area_id) {
          setErrors((prev) => ({ ...prev, area_id: null }));
        }
      }
    }
    
    setFormData(newFormData);
    
    // Calcular duración y validar si cambia hora_salida o hora_retorno
    if (name === 'hora_salida' || name === 'hora_retorno') {
      const horaSalida = name === 'hora_salida' ? value : formData.hora_salida;
      const horaRetorno = name === 'hora_retorno' ? value : formData.hora_retorno;
      const fechaPermiso = name === 'fecha_permiso' ? value : formData.fecha_permiso;
      
      if (horaSalida && horaRetorno && fechaPermiso) {
        // Combinar fecha_permiso con las horas para crear timestamps completos
        const fechaHoraSalida = new Date(`${fechaPermiso} ${horaSalida}:00`);
        const fechaHoraRetorno = new Date(`${fechaPermiso} ${horaRetorno}:00`);
        
        // Validar en tiempo real
        if (fechaHoraRetorno <= fechaHoraSalida) {
          setErrors(prev => ({
            ...prev,
            hora_retorno: 'La hora de retorno debe ser posterior a la hora de salida'
          }));
          setDuracionCalculada(0);
        } else {
          const duracionMs = fechaHoraRetorno - fechaHoraSalida;
          const duracionHoras = duracionMs / (1000 * 60 * 60);
          
          if (duracionHoras < 1) {
            setErrors(prev => ({
              ...prev,
              hora_retorno: 'El permiso debe ser de al menos 1 hora'
            }));
            setDuracionCalculada(duracionHoras);
          } else if (duracionHoras > 4) {
            setErrors(prev => ({
              ...prev,
              hora_retorno: 'La duración no puede exceder 4 horas'
            }));
            setDuracionCalculada(duracionHoras);
          } else {
            // Limpiar error si todo está bien
            setErrors(prev => ({
              ...prev,
              hora_retorno: null
            }));
            setDuracionCalculada(duracionHoras);
          }
        }
      }
    }
    
    // También recalcular si cambia la fecha
    if (name === 'fecha_permiso') {
      const horaSalida = formData.hora_salida;
      const horaRetorno = formData.hora_retorno;
      
      if (horaSalida && horaRetorno && value) {
        const fechaHoraSalida = new Date(`${value} ${horaSalida}:00`);
        const fechaHoraRetorno = new Date(`${value} ${horaRetorno}:00`);
        
        if (fechaHoraRetorno > fechaHoraSalida) {
          const duracionMs = fechaHoraRetorno - fechaHoraSalida;
          const duracionHoras = duracionMs / (1000 * 60 * 60);
          setDuracionCalculada(duracionHoras);
        }
      }
    }
    
    // Limpiar error del campo (excepto hora_retorno que se valida arriba)
    if (errors[name] && name !== 'hora_retorno') {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Solo admin: debe seleccionar usuario y área destino
    if (isAdmin && !formData.usuario_id) {
      newErrors.usuario_id = 'Debe seleccionar el empleado que solicita el permiso';
    }
    if (isAdmin && !formData.area_id) {
      newErrors.area_id = 'Debe seleccionar el área de destino';
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
      
      // Validar que la hora de retorno sea posterior a la hora de salida
      if (fechaHoraRetorno <= fechaHoraSalida) {
        newErrors.hora_retorno = 'La hora de retorno debe ser posterior a la hora de salida';
      } else {
        // Calcular la duración en horas
        const duracionMs = fechaHoraRetorno - fechaHoraSalida;
        const duracionHoras = duracionMs / (1000 * 60 * 60);
        
        // Validar que la duración sea mayor a 1 hora
        if (duracionHoras < 1) {
          newErrors.hora_retorno = 'El permiso debe ser de al menos 1 hora';
        }
        
        // Validar que la duración no exceda 4 horas
        if (duracionHoras > 4) {
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

    // Validar documento si requiere prueba
    if (formData.requiere_prueba === 'S') {
      if (formData.archivo && !formData.tipo_documento) {
        newErrors.tipo_documento = 'Debe seleccionar el tipo de documento';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Combinar fecha_permiso con hora_salida y hora_retorno para crear TIMESTAMPS completos
      const horaSalidaTimestamp = `${formData.fecha_permiso} ${formData.hora_salida}:00`;
      const horaRetornoTimestamp = `${formData.fecha_permiso} ${formData.hora_retorno}:00`;

      // Calcular horas de duración para el backend de solicitudes
      const fechaHoraSalida = new Date(horaSalidaTimestamp);
      const fechaHoraRetorno = new Date(horaRetornoTimestamp);
      const duracionMs = fechaHoraRetorno - fechaHoraSalida;
      const duracionHoras = duracionMs / (1000 * 60 * 60);

      // Mapear tipo_motivo (texto) a código de tipo_permiso del backend
      const mapTipoPermiso = (tipo) => {
        switch (tipo) {
          case 'Salud':
            return 'SALUD';
          case 'Personal':
            return 'PERSONAL';
          case 'Familiar':
            return 'FAMILIAR';
          case 'Trámite':
            return 'TRAMITE';
          case 'Emergencia':
            return 'EMERGENCIA';
          case 'Otro':
          default:
            return 'OTRO';
        }
      };

      // Crear la solicitud primero (JSON) usando el servicio alineado a /solicitudes
      const payload = {
        // usuario_id lo setea el backend con g.user_id por defecto
        fecha_permiso: formData.fecha_permiso,
        hora_salida: horaSalidaTimestamp,
        hora_retorno: horaRetornoTimestamp,
        horas_duracion: duracionHoras,
        tipo_permiso: mapTipoPermiso(formData.tipo_motivo),
        motivo: formData.motivo,
        requiere_documento: formData.requiere_prueba,
        observaciones: formData.observaciones || null
      };

      // Si es admin y seleccionó explícitamente empleado y área, enviarlos al backend
      if (isAdmin && formData.usuario_id) {
        payload.usuario_id = Number(formData.usuario_id);
      }
      if (isAdmin && formData.area_id) {
        payload.area_id = Number(formData.area_id);
      }

      console.log('📤 Datos a enviar (solicitud):', payload);

      const nuevaSolicitud = await solicitudPermisoService.createSolicitud(payload);
      console.log('📥 Respuesta del servidor (solicitud):', nuevaSolicitud);

      const solicitudId = nuevaSolicitud?.id_solicitud;
      
      // Si hay un archivo, subirlo como documento
      if (formData.archivo && solicitudId) {
        try {
          const formDataUpload = new FormData();
          formDataUpload.append('file', formData.archivo, formData.archivo.name); // Incluir el nombre del archivo
          const mapTipoDocumento = (texto) => {
            switch (texto) {
              case 'Constancia médica':
                return 'CONSTANCIA_MEDICA';
              case 'Certificado':
                return 'CERTIFICADO';
              case 'Receta':
                return 'RECETA';
              case 'Voucher':
                return 'VOUCHER';
              case 'Comprobante':
                return 'COMPROBANTE';
              case 'Foto':
                return 'FOTO';
              case 'Otro':
              default:
                return 'OTRO';
            }
          };
          const tipoDocumentoCodigo = mapTipoDocumento(formData.tipo_documento || 'Otro');
          formDataUpload.append('tipo_documento', tipoDocumentoCodigo);
          formDataUpload.append('descripcion', `Documento de respaldo para permiso: ${formData.motivo}`);
          
          console.log('📤 Subiendo documento de solicitud...');
          console.log('📋 Datos del FormData:');
          console.log('  - Archivo:', formData.archivo.name, `(${(formData.archivo.size / 1024).toFixed(2)} KB)`);
          console.log('  - Tipo MIME:', formData.archivo.type);
          console.log('  - Solicitud ID:', solicitudId);
          console.log('  - Tipo Documento (texto):', formData.tipo_documento || 'Otro');
          console.log('  - Tipo Documento (código):', tipoDocumentoCodigo);
          
          await solicitudPermisoService.uploadDocumento(solicitudId, formDataUpload, (progress) => {
            console.log(`📊 Progreso de subida: ${progress}%`);
          });
          
          alert('✅ Solicitud de permiso creada exitosamente\n✅ Documento subido correctamente');
        } catch (docError) {
          console.error('❌ Error al subir documento:', docError);
          console.error('❌ Detalles del error:', docError.message);
          alert('✅ Solicitud de permiso creada exitosamente\n⚠️ Advertencia: No se pudo subir el documento. Puedes subirlo luego desde la sección de documentos.');
        }
      } else {
        alert('✅ Solicitud de permiso creada exitosamente');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ Error al crear boleta:', error);
      alert(`❌ Error de conexión: ${error.message}\n\nVerifica que el backend esté corriendo y que CORS esté configurado correctamente.`);
    } finally {
      setLoading(false);
    }
  };

  // Construir nombre del solicitante combinando datos de currentUser y userInfo
  let nombreSolicitante = '';
  if (currentUser) {
    nombreSolicitante = `${currentUser.nombres || ''} ${currentUser.apellidos || ''}`.trim();
  }
  if (!nombreSolicitante && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const info = JSON.parse(raw);
        const usuario = info.usuario || {};
        const nombres = info.nombres || usuario.nombres || '';
        const apellidos = info.apellidos || usuario.apellidos || '';
        nombreSolicitante = `${nombres} ${apellidos}`.trim();
      }
    } catch (e) {
      console.warn('No se pudo leer userInfo para el formulario de permisos', e);
    }
  }
  if (!nombreSolicitante) {
    nombreSolicitante = 'Empleado actual';
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header estilo 'Volver a permisos' + título */}
        <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-4"
          >
            <span className="text-lg">←</span>
            <span>Volver a permisos</span>
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Solicitud de Permiso</h2>
              <p className="text-gray-400 text-sm mb-2">
                Completa la información para solicitar tu permiso.
              </p>
              <p className="text-sm text-gray-300">
                Solicitante:{' '}
                <span className="font-semibold text-white">
                  {nombreSolicitante}
                </span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Empleado / Selección para admin */}
          <div className="bg-gray-700/40 rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Empleado</p>
                <p className="text-sm text-white font-medium">
                  {nombreSolicitante}
                </p>
                {!isAdmin && (
                  <p className="text-xs text-gray-500 mt-1">
                    La solicitud se registrará con tu usuario actual. No necesitas seleccionar tu nombre.
                  </p>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Empleado solicitante *
                  </label>
                  <select
                    name="usuario_id"
                    value={formData.usuario_id || ''}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.usuario_id ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <option value="">Seleccione un empleado...</option>
                    {usuariosDisponibles.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo}
                      </option>
                    ))}
                  </select>
                  {errors.usuario_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.usuario_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    Área destino *
                  </label>
                  <select
                    name="area_id"
                    value={formData.area_id || ''}
                    onChange={handleChange}
                    // Para admin, el área se autocompleta a partir del empleado y no es editable
                    disabled
                    className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.area_id ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <option value="">Seleccione un área...</option>
                    {areas.map((a) => (
                      <option key={a.id_area} value={a.id_area}>
                        {a.nombre_area}
                      </option>
                    ))}
                  </select>
                  {errors.area_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.area_id}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Información del Permiso */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Información del Permiso
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="md:col-span-2">
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
                    Hora de Salida * <span className="text-gray-500">(8:00 AM - 6:30 PM)</span>
                  </label>
                  <input
                    type="time"
                    name="hora_salida"
                    value={formData.hora_salida}
                    onChange={handleChange}
                    min="08:00"
                    max="18:30"
                    className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.hora_salida ? 'ring-2 ring-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                  {errors.hora_salida && (
                    <p className="text-red-400 text-xs mt-1">{errors.hora_salida}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Hora de Retorno * <span className="text-gray-500">(máx. 4 horas)</span>
                  </label>
                  <input
                    type="time"
                    name="hora_retorno"
                    value={formData.hora_retorno}
                    onChange={handleChange}
                    className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.hora_retorno ? 'ring-2 ring-red-500' : ''
                    }`}
                    disabled={loading}
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

              <div className="pt-2">
                <label className="inline-flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiere_prueba"
                    checked={formData.requiere_prueba === 'S'}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        requiere_prueba: e.target.checked ? 'S' : 'N',
                      }))
                    }
                    className="mt-1 w-4 h-4 rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div>
                    <p className="text-sm text-gray-200 font-medium">
                      Este permiso requiere documento de prueba
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Marca esta opción si deberás presentar constancia médica, cita u otro sustento.
                    </p>
                  </div>
                </label>
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

          {/* Sección de Documento (solo si requiere prueba) */}
          {formData.requiere_prueba === 'S' && (
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
              <div className="border border-blue-500/60 bg-blue-500/10 rounded-lg p-3 text-xs text-blue-100 flex gap-2">
                <span className="mt-0.5">ℹ️</span>
                <p>
                  Deberás subir un documento de prueba (constancia médica, cita, etc.) ahora o después desde la sección de documentos.
                </p>
              </div>

              <h3 className="text-white font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Documento de respaldo (opcional)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Tipo de Documento (Opcional)
                  </label>
                  <select
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    className={`w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tipo_documento ? 'ring-2 ring-red-500' : ''
                    }`}
                    disabled={loading}
                  >
                    <option value="">Seleccione un tipo...</option>
                    <option value="Constancia médica">Constancia médica</option>
                    <option value="Certificado">Certificado</option>
                    <option value="Receta">Receta</option>
                    <option value="Voucher">Voucher</option>
                    <option value="Comprobante">Comprobante</option>
                    <option value="Foto">Foto</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.tipo_documento && (
                    <p className="text-red-400 text-xs mt-1">{errors.tipo_documento}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Archivo (Opcional)
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : errors.archivo
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-600 bg-gray-700/30'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="archivo"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={loading}
                    />
                    
                    {formData.archivo ? (
                      <div className="flex items-center justify-between bg-gray-600 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <File className="w-5 h-5 text-blue-400" />
                          <div className="text-left">
                            <p className="text-white text-sm font-medium">{formData.archivo.name}</p>
                            <p className="text-gray-400 text-xs">
                              {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          disabled={loading}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="archivo" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-white mb-1">
                          Arrastra tu archivo aquí o haz clic para seleccionar
                        </p>
                        <p className="text-gray-400 text-sm">
                          PDF, JPG, JPEG o PNG (máx. 20 MB)
                        </p>
                      </label>
                    )}
                  </div>
                  {errors.archivo && (
                    <p className="text-red-400 text-xs mt-1">{errors.archivo}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    Formatos permitidos: PDF, JPG, JPEG, PNG • Tamaño máximo: 20 MB
                  </p>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading || errors.hora_retorno}
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear Boleta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
