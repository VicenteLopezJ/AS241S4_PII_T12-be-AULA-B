import React, { useState, useEffect } from 'react';
import { AreaService } from "../../../services/valeProvisional/areaApi";
import { 
  AlertCircle, 
  CheckCircle, 
  Building,
  Tag
} from 'lucide-react';
import '../../../styles/valeProvisional/area/areaForm.css';

const AreaForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    areaName: '',
    areaType: '',
    ...initialData
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    // Si hay datos iniciales (modo edición), cargarlos
    if (initialData) {
      setFormData({
        areaName: initialData.AREA_NAME || initialData.areaName || '',
        areaType: initialData.AREA_TYPE || initialData.areaType || '',
      });
    }
  }, [initialData]);

  // 🔥 VALIDACIONES COMPLETAS
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'areaName':
        if (!value || value.trim() === '') {
          errors.areaName = '🏢 El nombre del área es requerido';
        } else if (value.trim().length < 3) {
          errors.areaName = '🏢 El nombre debe tener al menos 3 caracteres';
        } else if (value.trim().length > 50) {
          errors.areaName = '🏢 El nombre no puede exceder los 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-&]+$/.test(value.trim())) {
          errors.areaName = '🏢 El nombre solo puede contener letras, espacios, guiones y &';
        } else {
          delete errors.areaName;
        }
        break;
        
      case 'areaType':
        if (!value || value === '') {
          errors.areaType = '📋 Debe seleccionar un tipo de área';
        } else {
          delete errors.areaType;
        }
        break;
        
      default:
        if (!value || value.toString().trim() === '') {
          errors[name] = 'Este campo es requerido';
        } else {
          delete errors[name];
        }
    }
    
    setFieldErrors(errors);
    return !errors[name];
  };

  // Validar todo el formulario
  const validateForm = () => {
    const fieldsToValidate = ['areaName', 'areaType'];
    
    let isValid = true;
    const newErrors = {};
    
    fieldsToValidate.forEach(field => {
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      if (!fieldIsValid) {
        isValid = false;
        newErrors[field] = fieldErrors[field] || 'Campo inválido';
      }
    });
    
    setFieldErrors(newErrors);
    return isValid;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error general cuando el usuario empiece a escribir
    if (error) setError('');
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allFields = ['areaName', 'areaType'];
    const newTouchedFields = {};
    allFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);

    setLoading(true);
    setError('');

    // 🔥 VALIDACIÓN COMPLETA DEL FORMULARIO
    if (!validateForm()) {
      setError('❌ Por favor corrija los errores marcados en rojo antes de enviar el formulario');
      setLoading(false);
      
      // Scroll al primer error
      const firstErrorField = document.querySelector('.area-form-field-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      return;
    }

    try {
      // Preparar datos para el backend
      const submitData = {
        area_name: formData.areaName.trim(),
        area_type: formData.areaType,
      };

      // Si estamos en modo edición, agregar el ID
      if (initialData?.ID_AREA || initialData?.idArea) {
        submitData.id_area = initialData.ID_AREA || initialData.idArea;
      }

      console.log('Enviando datos al backend:', submitData);

      // Llamar a la función onSubmit que manejará la comunicación con el backend
      await onSubmit(submitData);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al procesar la solicitud';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    setFieldErrors({});
    setTouchedFields({});
    onCancel();
  };

  // Tipos de áreas disponibles
  const areaTypes = [
    { value: 'Administrativa', label: 'Administrativa' },
    { value: 'Operativa', label: 'Operativa' },
    { value: 'Comercial', label: 'Comercial' },
    { value: 'Técnica', label: 'Técnica' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Producción', label: 'Producción' },
    { value: 'Calidad', label: 'Calidad' },
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
    { value: 'Finanzas', label: 'Finanzas' },
    { value: 'TI', label: 'TI' },
    { value: 'Gerencia', label: 'Gerencia' },
    { value: 'Dirección', label: 'Dirección' }
  ];

  // Contador de caracteres para el nombre del área
  const areaNameCharCount = formData.areaName.length;
  const areaNameMaxChars = 50;

  return (
    <form onSubmit={handleSubmit} className="area-form-container">
      {/* Header del formulario */}
      <div className="area-form-header">
        <h2>
          <Building size={24} />
          {initialData ? 'Editar Área' : 'Nueva Área'}
        </h2>
        <p>Complete los campos requeridos (*) para {initialData ? 'actualizar' : 'crear'} el área</p>
      </div>

      {/* Mostrar errores generales */}
      {error && (
        <div className="area-form-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Indicador de campos requeridos */}

      {/* Grid de campos */}
      <div className="area-form-fields">
        {/* Nombre del Área */}
        <div className={`area-form-field area-form-field-full ${fieldErrors.areaName ? 'area-form-field-error' : ''} ${touchedFields.areaName && !fieldErrors.areaName && formData.areaName ? 'area-form-field-success' : ''}`}>
          <label className="area-form-label">
            <Building size={16} />
            Nombre del Área <span className="area-form-required-asterisk">*</span>
          </label>
          <input
            type="text"
            name="areaName"
            value={formData.areaName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ingrese nombre del área"
            className="area-form-input"
            disabled={loading}
            required
            maxLength={50}
          />
          <div className="area-form-field-info">
            <small>Ej: Recursos Humanos, Contabilidad, Logística | Solo letras, espacios, guiones y &</small>
            <div className="area-form-char-counter">
              <small className={areaNameCharCount > 45 ? 'area-form-text-warning' : ''}>
                {areaNameCharCount} / {areaNameMaxChars} caracteres
                {areaNameCharCount < 3 && ` (mínimo ${3 - areaNameCharCount} más)`}
              </small>
            </div>
          </div>
          {fieldErrors.areaName && (
            <div className="area-form-error-message">
              <AlertCircle size={12} />
              <span>{fieldErrors.areaName}</span>
            </div>
          )}
          {touchedFields.areaName && !fieldErrors.areaName && formData.areaName && (
            <div className="area-form-success-message">
              <CheckCircle size={12} />
              <span>Nombre válido</span>
            </div>
          )}
        </div>

        {/* Tipo de Área */}
        <div className={`area-form-field ${fieldErrors.areaType ? 'area-form-field-error' : ''} ${touchedFields.areaType && !fieldErrors.areaType && formData.areaType ? 'area-form-field-success' : ''}`}>
          <label className="area-form-label">
            <Tag size={16} />
            Tipo de Área <span className="area-form-required-asterisk">*</span>
          </label>
          <select
            name="areaType"
            value={formData.areaType}
            onChange={handleChange}
            onBlur={handleBlur}
            className="area-form-input area-form-select"
            disabled={loading}
            required
          >
            <option value="">Seleccionar tipo</option>
            {areaTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {fieldErrors.areaType && (
            <div className="area-form-error-message">
              <AlertCircle size={12} />
              <span>{fieldErrors.areaType}</span>
            </div>
          )}
          {touchedFields.areaType && !fieldErrors.areaType && formData.areaType && (
            <div className="area-form-success-message">
              <CheckCircle size={12} />
              <span>Tipo de área seleccionado</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de validación */}
      <div className="area-form-validation-summary">
        <div className={`area-form-summary-card ${Object.keys(fieldErrors).length === 0 ? 'area-form-summary-valid' : 'area-form-summary-invalid'}`}>
          {Object.keys(fieldErrors).length === 0 ? (
            <>
              <CheckCircle size={16} />
              <span>✅ Todos los campos están correctamente completados</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} />
              <span>❌ Hay {Object.keys(fieldErrors).length} campo(s) que requieren atención</span>
            </>
          )}
        </div>
      </div>

      {/* Información del estado */}
      <div className="area-form-info">
        <p className="area-form-info-text">
          💡 El área se creará automáticamente con estado <strong>ACTIVO</strong>
        </p>
        {initialData && (
          <p className="area-form-info-text">
            📝 <strong>Modo edición:</strong> Actualizando área existente
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="area-form-actions">
        <button
          type="button"
          onClick={handleCancel}
          className="area-form-btn area-form-btn-cancel"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="area-form-btn area-form-btn-submit"
          disabled={loading || Object.keys(fieldErrors).length > 0}
          title={Object.keys(fieldErrors).length > 0 ? "Corrija los errores antes de enviar" : ""}
        >
          {loading ? 'Procesando...' : (initialData ? 'Actualizar Área' : 'Guardar Área')}
        </button>
      </div>
    </form>
  );
};

export default AreaForm;