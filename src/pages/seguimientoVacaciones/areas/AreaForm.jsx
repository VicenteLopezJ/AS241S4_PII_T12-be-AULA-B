import React, { useState, useEffect } from 'react';
import { Building2, FileText, Check, X } from 'lucide-react';
import { areaValidations } from '../../../services/seguimientoVacaciones/areasService';


const AreaForm = ({
  area = null,
  onSave,
  onCancel,
  submitting = false
}) => {
  const [formData, setFormData] = useState({
    area_name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos del área cuando se pasa un área para editar
  useEffect(() => {
    if (area) {
      setFormData({
        area_name: area.area_name || '',
        description: area.description || ''
      });
    } else {
      setFormData({
        area_name: '',
        description: ''
      });
    }
    setFormErrors({});
  }, [area]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const validation = areaValidations.validateArea(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    // Llamar a la función onSave pasada como prop
    await onSave(formData);
  };

  return (
    <div className="text-white bg-slate-800">
      <form onSubmit={handleSubmit} className="p-5 bg-slate-800">
        <div className="space-y-4">
          {/* Nombre del Área */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <Building2 className="w-3 h-3 text-blue-400" />
              Nombre del Área <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="area_name"
              value={formData.area_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm placeholder-slate-400 transition-all ${
                formErrors.area_name 
                  ? 'border-red-500' 
                  : formData.area_name 
                    ? 'border-blue-500' 
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              placeholder="Ingresa el nombre del área"
              maxLength={30}
            />
            {formErrors.area_name && (
              <p className="text-red-400 text-xs mt-1">{formErrors.area_name}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">
              {formData.area_name.length}/30 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <FileText className="w-3 h-3 text-blue-400" />
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm placeholder-slate-400 resize-none transition-all ${
                formErrors.description 
                  ? 'border-red-500' 
                  : formData.description 
                    ? 'border-blue-500' 
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              placeholder="Descripción del área (opcional)"
              maxLength={70}
            />
            {formErrors.description && (
              <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">
              {formData.description.length}/70 caracteres
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-slate-600 my-6"></div>

        {/* Form Footer */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            {submitting
              ? 'Guardando...'
              : area
                ? 'Actualizar Área'
                : 'Guardar Área'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default AreaForm;