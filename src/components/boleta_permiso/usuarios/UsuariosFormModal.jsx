// src/components/usuarios/UsuariosFormModal.jsx
// Formulario de usuario con máximo 6 campos visibles:
// nombres, apellidos, documento, correo, fecha_ingreso, area_id
import React, { useEffect, useState } from "react";
import { X, Save, Mail, Calendar, Building, User, Phone, FileText, AlertCircle } from "lucide-react"; 
import { usuarioService } from "../../../services/boleta_permiso/usuarioService";
import { areaService } from "../../../services/boleta_permiso/areaService";

export const UsuariosFormModal = ({ usuario, onClose, onSuccess }) => {
  const isEditing = !!usuario;

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    documento: '',
    correo: '',
    telefono: '',
    fecha_ingreso: '',
    area_id: '',
    es_jefe_area: 'N',
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const data = await areaService.getAllAreas();
        setAreas(data || []);
      } catch (err) {
        console.error('Error al cargar áreas:', err);
        setAreas([]);
      }
    };
    loadAreas();
  }, []);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        documento: usuario.documento || '',
        correo: usuario.correo || '',
        telefono: usuario.telefono || '',
        fecha_ingreso: usuario.fecha_ingreso
          ? usuario.fecha_ingreso.split('T')[0]
          : '',
        area_id: usuario.area_id || '',
        es_jefe_area: usuario.es_jefe_area || 'N',
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Filtrar entrada según el campo
    let filteredValue = value;
    
    if (name === 'nombres' || name === 'apellidos') {
      // Solo letras, espacios, tildes y ñ
      filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'documento') {
      // Solo números, máximo 8 dígitos
      filteredValue = value.replace(/\D/g, '').slice(0, 8);
    } else if (name === 'telefono') {
      // Solo números, máximo 9 dígitos
      filteredValue = value.replace(/\D/g, '').slice(0, 9);
    }
    
    setFormData((prev) => ({ ...prev, [name]: filteredValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validación de Nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres)) {
      newErrors.nombres = 'Los nombres solo pueden contener letras y espacios';
    }

    // Validación de Apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos)) {
      newErrors.apellidos = 'Los apellidos solo pueden contener letras y espacios';
    }

    // Validación de Documento
    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es requerido';
    } else if (!/^\d+$/.test(formData.documento)) {
      newErrors.documento = 'El documento solo puede contener números';
    } else if (formData.documento.length !== 8) {
      newErrors.documento = 'El documento debe tener exactamente 8 dígitos';
    }

    // Validación de Correo (obligatorio)
    if (!formData.correo || !formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        newErrors.correo = 'El correo debe tener un formato válido (ejemplo@dominio.com)';
      }
    }

    // Validación de Teléfono (obligatorio, exactamente 9 dígitos, debe comenzar con 9)
    if (!formData.telefono || !formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono solo puede contener números';
    } else if (formData.telefono.length !== 9) {
      newErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos';
    } else if (!formData.telefono.startsWith('9')) {
      newErrors.telefono = 'El teléfono debe comenzar con 9';
    }

    if (!formData.fecha_ingreso) {
      newErrors.fecha_ingreso = 'La fecha de ingreso es requerida';
    }
    if (!formData.area_id) {
      newErrors.area_id = 'Debe seleccionar un área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      // Payload mínimo, el backend completa el resto
      const payload = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        documento: formData.documento.trim(),
        correo: formData.correo.trim() || null,
        telefono: formData.telefono.trim() || null,
        cargo: usuario?.cargo || 'Empleado',
        area_id: Number(formData.area_id),
        empresa_id: usuario?.empresa_id || 1,
        rol_id: usuario?.rol_id || 3,
        fecha_ingreso: formData.fecha_ingreso,
        tipo_documento: usuario?.tipo_documento || 'DNI',
        es_jefe_area: formData.es_jefe_area || 'N',
        password: 'Temp1234!', // placeholder inicial, debería cambiarse luego
      };

      if (isEditing) {
        await usuarioService.updateUsuario(usuario.id_usuario, {
          nombres: payload.nombres,
          apellidos: payload.apellidos,
          telefono: payload.telefono,
          correo: payload.correo,
          cargo: payload.cargo,
          area_id: payload.area_id,
          rol_id: payload.rol_id,
          es_jefe_area: payload.es_jefe_area,
        });
      } else {
        await usuarioService.createUsuario(payload);
      }

      await onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      alert(err.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <p className="text-blue-100 text-sm">
                {isEditing ? 'Actualiza la información del usuario' : 'Completa todos los campos requeridos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">

        {/* Información de campos requeridos */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-200">
            Todos los campos marcados con <span className="text-red-400 font-bold">*</span> son obligatorios
          </p>
        </div>

        {/* Campos en grid */}
        <div className="space-y-6">
          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Nombres <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                disabled={loading}
                className={`w-full bg-gray-700/50 border ${
                  errors.nombres ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.nombres ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
                placeholder="Ej: Juan Carlos"
              />
              {errors.nombres && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.nombres}
                </p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Apellidos <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                disabled={loading}
                className={`w-full bg-gray-700/50 border ${
                  errors.apellidos ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.apellidos ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
                placeholder="Ej: Pérez García"
              />
              {errors.apellidos && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.apellidos}
                </p>
              )}
            </div>
          </div>

          {/* Documento y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                Documento <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                disabled={loading}
                maxLength={8}
                className={`w-full bg-gray-700/50 border ${
                  errors.documento ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.documento ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
                placeholder="12345678"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.documento.length}/8 dígitos
              </p>
              {errors.documento && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.documento}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" />
                Teléfono <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
                maxLength={9}
                className={`w-full bg-gray-700/50 border ${
                  errors.telefono ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.telefono ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
                placeholder="999999999"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.telefono.length}/9 dígitos
              </p>
              {errors.telefono && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.telefono}
                </p>
              )}
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-400" />
              Correo Electrónico <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              disabled={loading}
              className={`w-full bg-gray-700/50 border ${
                errors.correo ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
              } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                errors.correo ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
              } transition-all`}
              placeholder="ejemplo@correo.com"
            />
            {errors.correo && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.correo}
              </p>
            )}
          </div>

          {/* Fecha de ingreso y Área */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de ingreso */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                Fecha de Ingreso <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="fecha_ingreso"
                value={formData.fecha_ingreso}
                onChange={handleChange}
                disabled={loading}
                className={`w-full bg-gray-700/50 border ${
                  errors.fecha_ingreso ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.fecha_ingreso ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
              />
              {errors.fecha_ingreso && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fecha_ingreso}
                </p>
              )}
            </div>

            {/* Área */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                Área <span className="text-red-400">*</span>
              </label>
              <select
                name="area_id"
                value={formData.area_id}
                onChange={handleChange}
                disabled={loading}
                className={`w-full bg-gray-700/50 border ${
                  errors.area_id ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.area_id ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
              >
                <option value="">Seleccione un área</option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area}>
                    {a.nombre_area}
                  </option>
                ))}
              </select>
              {errors.area_id && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.area_id}
                </p>
              )}
            </div>
          </div>

          {/* Jefe de área */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              ¿Es jefe de área?
            </label>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="es_jefe_area"
                  value="S"
                  checked={formData.es_jefe_area === 'S'}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-200 group-hover:text-white transition-colors">Sí</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="es_jefe_area"
                  value="N"
                  checked={formData.es_jefe_area === 'N'}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-200 group-hover:text-white transition-colors">No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
              </>
            )}
          </button>
        </div>
        </div>
      </form>
    </div>
  );
};