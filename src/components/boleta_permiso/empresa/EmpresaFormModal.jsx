// src/components/empresa/EmpresaFormModal.jsx
import { useState, useEffect } from 'react';
import { X, Building2, Save, FileText, MapPin, Phone, AlertCircle } from "lucide-react";
import { empresaService } from "../../../services/boleta_permiso/empresaService";

export const EmpresaFormModal = ({ empresa, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    ruc: '',
    direccion: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre_empresa: empresa.nombre_empresa || '',
        ruc: empresa.ruc || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || ''
      });
    }
  }, [empresa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Filtrar entrada según el campo
    let filteredValue = value;
    
    if (name === 'ruc') {
      // Solo números, máximo 11 dígitos
      filteredValue = value.replace(/\D/g, '').slice(0, 11);
    } else if (name === 'telefono') {
      // Solo números, máximo 9 dígitos
      filteredValue = value.replace(/\D/g, '').slice(0, 9);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    // Validación de Nombre de Empresa (obligatorio)
    if (!formData.nombre_empresa.trim()) {
      newErrors.nombre_empresa = 'El nombre de la empresa es requerido';
    } else if (formData.nombre_empresa.trim().length < 3) {
      newErrors.nombre_empresa = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validación de RUC (obligatorio, exactamente 11 dígitos)
    if (!formData.ruc || !formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es requerido';
    } else if (!/^\d+$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC solo puede contener números';
    } else if (formData.ruc.length !== 11) {
      newErrors.ruc = 'El RUC debe tener exactamente 11 dígitos';
    }

    // Validación de Dirección (obligatorio)
    if (!formData.direccion || !formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    } else if (formData.direccion.trim().length < 5) {
      newErrors.direccion = 'La dirección debe tener al menos 5 caracteres';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      if (empresa) {
        // Editar empresa existente
        await empresaService.updateEmpresa(empresa.id_empresa, formData);
        alert('✅ Empresa actualizada correctamente');
      } else {
        // Crear nueva empresa
        await empresaService.createEmpresa(formData);
        alert('✅ Empresa creada correctamente');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar empresa:', error);
      alert(`❌ Error: ${error.message || 'No se pudo guardar la empresa'}`);
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
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {empresa ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <p className="text-blue-100 text-sm">
                {empresa ? 'Actualiza la información de la empresa' : 'Completa todos los campos requeridos'}
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

          <div className="space-y-6">
            {/* Nombre de la Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Nombre de la Empresa <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={handleChange}
                disabled={loading}
                className={`w-full bg-gray-700/50 border ${
                  errors.nombre_empresa ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.nombre_empresa ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all`}
                placeholder="Ej: Empresa ABC S.A.C."
              />
              {errors.nombre_empresa && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.nombre_empresa}
                </p>
              )}
            </div>

            {/* RUC y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RUC */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  RUC <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={11}
                  className={`w-full bg-gray-700/50 border ${
                    errors.ruc ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                  } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.ruc ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                  } transition-all`}
                  placeholder="12345678901"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.ruc.length}/11 dígitos
                </p>
                {errors.ruc && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.ruc}
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

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                Dirección <span className="text-red-400">*</span>
              </label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                className={`w-full bg-gray-700/50 border ${
                  errors.direccion ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                } rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.direccion ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                } transition-all resize-none`}
                placeholder="Ej: Av. Principal 123, Lima, Perú"
              />
              {errors.direccion && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.direccion}
                </p>
              )}
            </div>

            {/* Información adicional (solo edición) */}
            {empresa && (
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 space-y-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Información del Sistema</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID de Empresa */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      ID de Empresa
                    </label>
                    <input
                      type="number"
                      value={empresa.id_empresa}
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
                        empresa.estado === 'A' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {empresa.estado === 'A' ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fecha de registro */}
                {empresa.fecha_registro && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Fecha de Registro
                    </label>
                    <input
                      type="date"
                      value={new Date(empresa.fecha_registro).toISOString().slice(0, 10)}
                      readOnly
                      disabled
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            )}

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
                  {empresa ? 'Actualizar' : 'Crear'} Empresa
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
