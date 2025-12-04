import { useState, useEffect } from "react";
import { X, User, Building, FileText, AlignLeft, AlertCircle, Save } from "lucide-react";

export const AreaFormModal = ({ onClose, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState({
    codigo_area: "",
    nombre_area: "",
    descripcion: "",
    id_jefe_area: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Validar que editData sea un objeto válido
  const isEditing = editData && typeof editData === 'object' && editData.id_area;

  // ✅ Llenar formData cuando editData cambie
  useEffect(() => {
    console.log('🔄 editData cambió:', editData, 'Tipo:', typeof editData);
    
    if (isEditing) {
      console.log('✏️ Modo edición - Cargando datos:', editData);
      setFormData({
        codigo_area: editData.codigo_area || "",
        nombre_area: editData.nombre_area || "",
        descripcion: editData.descripcion || "",
        id_jefe_area: editData.jefe_area?.id_usuario || null,
      });
    } else {
      console.log('➕ Modo creación - Formulario vacío');
      setFormData({
        codigo_area: "",
        nombre_area: "",
        descripcion: "",
        id_jefe_area: null,
      });
    }
  }, [editData, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    // Validación de Código de Área (opcional pero si se ingresa debe ser válido)
    if (formData.codigo_area && formData.codigo_area.trim()) {
      if (formData.codigo_area.trim().length < 2) {
        newErrors.codigo_area = 'El código debe tener al menos 2 caracteres';
      } else if (!/^[A-Z0-9]+$/.test(formData.codigo_area.trim())) {
        newErrors.codigo_area = 'El código solo puede contener letras mayúsculas y números';
      }
    }

    // Validación de Nombre de Área (obligatorio)
    if (!formData.nombre_area.trim()) {
      newErrors.nombre_area = 'El nombre del área es requerido';
    } else if (formData.nombre_area.trim().length < 3) {
      newErrors.nombre_area = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre_area.trim().length > 100) {
      newErrors.nombre_area = 'El nombre no puede exceder 100 caracteres';
    }

    // Validación de Descripción (opcional pero si se ingresa debe ser válida)
    if (formData.descripcion && formData.descripcion.trim()) {
      if (formData.descripcion.trim().length < 10) {
        newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
      } else if (formData.descripcion.trim().length > 200) {
        newErrors.descripcion = 'La descripción no puede exceder 200 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        codigo_area: formData.codigo_area.trim() || null,
        nombre_area: formData.nombre_area.trim(),
        descripcion: formData.descripcion.trim() || null,
        id_jefe_area: formData.id_jefe_area ? Number(formData.id_jefe_area) : null,
      };

      console.log("📤 Enviando JSON al backend:", payload);
      console.log("🔍 Modo:", isEditing ? 'Actualizar' : 'Crear');

      if (isEditing) {
        console.log("🔄 Actualizando área ID:", editData.id_area);
        await onSubmit(editData.id_area, payload);
      } else {
        console.log("➕ Creando nueva área");
        await onSubmit(payload);
      }

      onClose();
    } catch (err) {
      console.error("❌ Error al enviar el formulario:", err);
      setError(err.message || "Error al enviar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    let filteredValue = value;

    // Filtrar entrada según el campo
    if (field === 'codigo_area') {
      // Solo letras mayúsculas y números
      filteredValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    setFormData({ ...formData, [field]: filteredValue });
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Editar Área" : "Nueva Área"}
              </h2>
              <p className="text-blue-100 text-sm">
                {isEditing ? 'Actualiza la información del área' : 'Completa los campos requeridos'}
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
              Los campos marcados con <span className="text-red-400 font-bold">*</span> son obligatorios
            </p>
          </div>

          {/* ERROR GENERAL */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-6 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* CAMPOS */}
          <div className="space-y-6">

            {/* Código del área */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                Código del Área
              </label>
              <input
                type="text"
                value={formData.codigo_area}
                onChange={(e) => handleChange('codigo_area', e.target.value)}
                disabled={loading}
                maxLength={10}
                className={`w-full bg-gray-700/50 border ${
                  errors.codigo_area ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.codigo_area ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all uppercase`}
                placeholder="Ej: CONT, RRHH"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.codigo_area.length}/10 caracteres (solo letras mayúsculas y números)
              </p>
              {errors.codigo_area && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.codigo_area}
                </p>
              )}
            </div>

            {/* Nombre del área */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                Nombre del Área <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre_area}
                onChange={(e) => handleChange('nombre_area', e.target.value)}
                disabled={loading}
                maxLength={100}
                className={`w-full bg-gray-700/50 border ${
                  errors.nombre_area ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.nombre_area ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
                placeholder="Ej: Recursos Humanos, Tecnología, etc."
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.nombre_area.length}/100 caracteres
              </p>
              {errors.nombre_area && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.nombre_area}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-purple-400" />
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                disabled={loading}
                rows="4"
                maxLength={200}
                className={`w-full bg-gray-700/50 border ${
                  errors.descripcion ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.descripcion ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all resize-none`}
                placeholder="Ingrese una descripción detallada del área (opcional)"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.descripcion.length}/200 caracteres
              </p>
              {errors.descripcion && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.descripcion}
                </p>
              )}
            </div>

            {/* ID de Área (solo creación - automático) */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ID de Área
                </label>
                <input
                  type="text"
                  value=""
                  readOnly
                  disabled
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
                  placeholder="Se generará automáticamente"
                />
              </div>
            )}

            {/* Estado del Área (solo creación - automático) */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado del Área
                </label>
                <div className="flex items-center gap-3 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    disabled
                    className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-300">Activa (por defecto)</span>
                </div>
              </div>
            )}

            {/* Fecha de Registro (solo creación - automático) */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Registro
                </label>
                <input
                  type="date"
                  value={new Date().toISOString().slice(0, 10)}
                  readOnly
                  disabled
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Se generará automáticamente al crear el área.
                </p>
              </div>
            )}

            {/* Jefe de área */}
            {isEditing && editData.jefe_area ? (
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center mb-3">
                  <User className="w-5 h-5 text-blue-400 mr-2" />
                  <p className="text-gray-200 font-medium">Jefe de Área Asignado</p>
                </div>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    <span className="text-gray-400">Nombre:</span>{" "}
                    <span className="font-medium">{editData.jefe_area.nombre_completo}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Cargo:</span>{" "}
                    <span className="font-medium">{editData.jefe_area.cargo}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Correo:</span>{" "}
                    <span className="font-medium">{editData.jefe_area.correo || "Sin correo"}</span>
                  </p>
                </div>
              </div>
            ) : isEditing ? (
              <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm italic flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sin jefe de área asignado
                </p>
              </div>
            ) : (
              <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm italic flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sin jefe de área asignado
                </p>
              </div>
            )}

            {/* Información del sistema */}
            {isEditing && (
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 space-y-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Información del Sistema</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID de Área */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      ID de Área
                    </label>
                    <input
                      type="number"
                      value={editData.id_area}
                      readOnly
                      disabled
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        editData.estado === 'A' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {editData.estado === 'A' ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fecha de registro */}
                {editData.fecha_registro && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Fecha de Registro
                    </label>
                    <input
                      type="text"
                      value={new Date(editData.fecha_registro).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                      readOnly
                      disabled
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTONES */}
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
              disabled={loading || !formData.nombre_area.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Actualizar Área' : 'Crear Área'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
