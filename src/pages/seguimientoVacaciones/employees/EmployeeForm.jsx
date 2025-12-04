import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  User,
  Users,
  FileText,
  Hash,
  Briefcase,
  Building2,
  Mail,
  X,
  Check
} from 'lucide-react';
import { useAreas } from '../../../components/seguimientoVacaciones/hooks/useArea';
import { DOCUMENT_TYPES } from '../../../services/seguimientoVacaciones/employeesService';

// Debounce helper function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ============================================
// VALIDACIONES CENTRALIZADAS
// ============================================

// Validación de DNI
const validateDNI = (numero) => {
  if (!/^\d{8}$/.test(numero)) {
    return 'El DNI debe tener exactamente 8 dígitos';
  }
  
  if (/^0+$/.test(numero)) {
    return 'El DNI no puede ser todo ceros';
  }
  
  if (/^(\d)\1+$/.test(numero)) {
    return 'El DNI no puede tener todos los dígitos iguales';
  }
  
  return null;
};

// Validación de Carné de Extranjería
const validateCNE = (numero) => {
  if (!/^\d{9}$/.test(numero)) {
    return 'El Carné de Extranjería debe tener exactamente 9 dígitos';
  }

  if (/^0+$/.test(numero)) {
    return 'El Carné de Extranjería no puede ser todo ceros';
  }

  if (/^(\d)\1+$/.test(numero)) {
    return 'El Carné de Extranjería no puede tener todos los dígitos iguales';
  }

  return null;
};

// Validación de número de documento según tipo
const validateDocumentNumber = (tipo, numero) => {
  if (!numero || numero.trim() === '') {
    return 'El número de documento es requerido';
  }

  if (!/^\d+$/.test(numero)) {
    return 'El número de documento solo puede contener números';
  }

  if (numero.length > 20) {
    return 'El número de documento no puede exceder 20 caracteres';
  }

  const validators = {
    DNI: validateDNI,
    CNE: validateCNE
  };

  return validators[tipo]?.(numero) || null;
};

// Validación de nombres y apellidos
const validateName = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido`;
  }

  if (/\d/.test(value)) {
    return `${fieldName} no puede contener números`;
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(value)) {
    return `${fieldName} solo puede contener letras, espacios, apostrofes y guiones`;
  }

  if (value.length > 60) {
    return `${fieldName} no puede exceder 60 caracteres`;
  }

  return null;
};

// Validación de email
const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Gmail es requerido';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Gmail no tiene un formato válido';
  }

  if (email.length > 120) {
    return 'Gmail no puede exceder 120 caracteres';
  }

  return null;
};

// Validación de cargo
const validatePosition = (value) => {
  if (!value || value.trim() === '') {
    return 'Cargo es requerido';
  }

  if (/\d/.test(value)) {
    return 'El cargo no puede contener números';
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(value)) {
    return 'El cargo solo puede contener letras, espacios, apostrofes y guiones';
  }

  if (value.length > 40) {
    return 'El cargo no puede exceder 40 caracteres';
  }

  return null;
};

// Validación completa del formulario
const validateEmployeeForm = (formData) => {
  const errors = {};

  const firstNameError = validateName(formData.first_name, 'Nombres');
  if (firstNameError) errors.first_name = firstNameError;

  const lastNameError = validateName(formData.last_name, 'Apellidos');
  if (lastNameError) errors.last_name = lastNameError;

  const gmailError = validateEmail(formData.gmail);
  if (gmailError) errors.gmail = gmailError;

  if (!formData.document_type) {
    errors.document_type = 'Tipo de documento es requerido';
  }

  const docError = validateDocumentNumber(formData.document_type, formData.document_number);
  if (docError) errors.document_number = docError;

  const positionError = validatePosition(formData.employee_position);
  if (positionError) errors.employee_position = positionError;

  if (!formData.area_id) {
    errors.area_id = 'Área es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const EmployeeForm = ({
  employee = null,
  onSave,
  onCancel,
  submitting = false
}) => {
  const { activeAreas, loading: areasLoading } = useAreas();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gmail: '',
    document_type: 'DNI', // Valor por defecto
    document_number: '',
    employee_position: '',
    area_id: ''  // String vacío en lugar de null para el select
  });
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos del empleado cuando se pasa un empleado para editar
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        gmail: employee.gmail || employee.email || '', // Usar gmail o email como fallback
        document_type: employee.document_type || '',
        document_number: employee.document_number || '',
        employee_position: employee.employee_position || '',
        area_id: employee.area_id || null
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        gmail: '',
        document_type: 'DNI', // Valor por defecto
        document_number: '',
        employee_position: '',
        area_id: ''  // String vacío para el select
      });
    }
    setFormErrors({});
  }, [employee]);

  // Validación en tiempo real con debounce
  const debouncedValidation = useCallback(
    debounce((name, value, documentType) => {
      let error = null;

      if (name === 'first_name') {
        error = validateName(value, 'Nombres');
      } else if (name === 'last_name') {
        error = validateName(value, 'Apellidos');
      } else if (name === 'gmail') {
        error = validateEmail(value);
      } else if (name === 'employee_position') {
        error = validatePosition(value);
      } else if (name === 'document_number') {
        error = validateDocumentNumber(documentType, value);
      }

      setFormErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error immediately when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Special case: document type change - validate document number immediately
    if (name === 'document_type' && formData.document_number) {
      const documentNumber = formData.document_number;

      if (value === 'DNI' && documentNumber.length !== 8) {
        setFormErrors(prev => ({
          ...prev,
          document_number: 'El DNI debe tener exactamente 8 dígitos'
        }));
      } else if (value === 'CNE' && documentNumber.length !== 9) {
        setFormErrors(prev => ({
          ...prev,
          document_number: 'El Carné de Extranjería debe tener exactamente 9 dígitos'
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          document_number: ''
        }));
      }
    }

    // Debounced validation for all fields
    if (name === 'first_name' || name === 'last_name' || name === 'gmail' || name === 'document_number' || name === 'employee_position') {
      debouncedValidation(name, value, name === 'document_number' ? formData.document_type : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario completo
    const validation = validateEmployeeForm(formData);
    
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Nombres */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <User className="w-3 h-3 text-blue-400" />
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm placeholder-slate-400 transition-all ${
                formErrors.first_name 
                  ? 'border-red-500' 
                  : formData.first_name 
                    ? 'border-blue-500' 
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              placeholder="Ingresa el nombre"
            />
            {formErrors.first_name && (
              <p className="text-red-400 text-xs mt-1">{formErrors.first_name}</p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <Users className="w-3 h-3 text-blue-400" />
              Apellido <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm placeholder-slate-400 transition-all ${
                formErrors.last_name 
                  ? 'border-red-500' 
                  : formData.last_name 
                    ? 'border-blue-500' 
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              placeholder="Ingresa el apellido"
            />
            {formErrors.last_name && (
              <p className="text-red-400 text-xs mt-1">{formErrors.last_name}</p>
            )}
          </div>

          {/* Gmail */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <Mail className="w-3 h-3 text-blue-400" />
              Gmail <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="gmail"
              value={formData.gmail}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm placeholder-slate-400 transition-all ${
                formErrors.gmail 
                  ? 'border-red-500' 
                  : formData.gmail 
                    ? 'border-blue-500' 
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              placeholder="ejemplo@gmail.com"
            />
            {formErrors.gmail && (
              <p className="text-red-400 text-xs mt-1">{formErrors.gmail}</p>
            )}
          </div>

          {/* Tipo de Documento */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <FileText className="w-3 h-3 text-blue-400" />
              Tipo de Documento <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm appearance-none cursor-pointer transition-all ${
                  formErrors.document_type 
                    ? 'border-red-500' 
                    : formData.document_type 
                      ? 'border-blue-500' 
                      : 'border-slate-500 hover:border-slate-400'
                  }`}
              >
                <option value="" className="bg-slate-800 text-slate-400">Seleccionar tipo</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value} className="bg-slate-800 text-white">
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            {formErrors.document_type && (
              <p className="text-red-400 text-xs mt-1">{formErrors.document_type}</p>
            )}
          </div>

          {/* Número de Documento */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <Hash className="w-3 h-3 text-blue-400" />
              Número de Documento <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="document_number"
              value={formData.document_number}
              onChange={handleInputChange}
              maxLength={
                formData.document_type === 'DNI' ? 8 :
                formData.document_type === 'CNE' ? 9 : 20
              }
              pattern='[0-9]*'
              inputMode='numeric'
              className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm placeholder-slate-400 transition-all ${
                formErrors.document_number
                  ? 'border-red-500'
                  : formData.document_number
                    ? 'border-blue-500'
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              placeholder={
                formData.document_type === 'DNI' ? 'Ingresa 8 dígitos' :
                formData.document_type === 'CNE' ? 'Ingresa 9 dígitos' :
                'Ingresa el número'
              }
            />
            {formErrors.document_number && (
              <p className="text-red-400 text-xs mt-1">{formErrors.document_number}</p>
            )}
            {formData.document_number && (
              <p className="text-slate-400 text-xs mt-1">
                {formData.document_number.length}/
                {formData.document_type === 'DNI' ? '8' :
                 formData.document_type === 'CNE' ? '9' : '20'} caracteres
              </p>
            )}
          </div>

          {/* Cargo */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <Briefcase className="w-3 h-3 text-blue-400" />
              Cargo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="employee_position"
              value={formData.employee_position}
              onChange={handleInputChange}
              maxLength={40}
              className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm placeholder-slate-400 transition-all ${
                formErrors.employee_position 
                  ? 'border-red-500' 
                  : formData.employee_position 
                    ? 'border-blue-500' 
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              placeholder="Ingresa el cargo"
            />
            {formErrors.employee_position && (
              <p className="text-red-400 text-xs mt-1">{formErrors.employee_position}</p>
            )}
            {formData.employee_position && (
              <p className="text-slate-400 text-xs mt-1">
                {formData.employee_position.length}/40 caracteres
              </p>
            )}
          </div>

          {/* Área */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
              <Building2 className="w-3 h-3 text-blue-400" />
              Área <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                name="area_id"
                value={formData.area_id || ''}
                onChange={handleInputChange}
                disabled={areasLoading}
                className={`w-full px-3 py-2 bg-slate-700 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm appearance-none cursor-pointer transition-all ${
                  formErrors.area_id 
                    ? 'border-red-500' 
                    : formData.area_id 
                      ? 'border-blue-500' 
                      : 'border-slate-500 hover:border-slate-400'
                  } ${areasLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="" className="bg-slate-800 text-slate-400">
                  {areasLoading ? 'Cargando áreas...' : 'Seleccionar área'}
                </option>
                {activeAreas.map(area => (
                  <option key={area.id} value={area.id} className="bg-slate-800 text-white">
                    {area.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            {formErrors.area_id && (
              <p className="text-red-400 text-xs mt-1">{formErrors.area_id}</p>
            )}
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
              : employee
                ? 'Actualizar Empleado'
                : 'Guardar Empleado'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;