import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Users, 
  IdCard,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import '../../../styles/valeProvisional/Applicant/applicantForm.css';

const ApplicantForm = ({ initialData, onSubmit, onCancel, areas, loadingAreas }) => {
  const [formData, setFormData] = useState({
    FIRST_NAME: '',
    LAST_NAME: '',
    IDENTIFICATION_TYPE: 'DNI',
    IDENTIFICATION_NUMBER: '',
    EMAIL: '',
    PHONE: '',
    COMPANY: '',
    AREA_ID: '',
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opciones para el desplegable de empresa
  const companyOptions = [
    { value: 'Valle Grande', label: 'Valle Grande' },
    { value: 'PROSIP', label: 'PROSIP' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        FIRST_NAME: initialData.FIRST_NAME || '',
        LAST_NAME: initialData.LAST_NAME || '',
        IDENTIFICATION_TYPE: initialData.IDENTIFICATION_TYPE || 'DNI',
        IDENTIFICATION_NUMBER: initialData.IDENTIFICATION_NUMBER || '',
        EMAIL: initialData.EMAIL || '',
        PHONE: initialData.PHONE || '',
        COMPANY: initialData.COMPANY || '',
        AREA_ID: initialData.AREA_ID || '',
      });
    }
  }, [initialData]);

  // 🔥 VALIDACIONES COMPLETAS Y ESPECÍFICAS
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'FIRST_NAME':
        if (!value.trim()) {
          newErrors[name] = '❌ Los nombres son obligatorios';
        } else if (value.length < 2) {
          newErrors[name] = '❌ Los nombres deben tener al menos 2 caracteres';
        } else if (value.length > 50) {
          newErrors[name] = '❌ Los nombres no pueden exceder 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors[name] = '❌ Los nombres solo pueden contener letras y espacios';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'LAST_NAME':
        if (!value.trim()) {
          newErrors[name] = '❌ Los apellidos son obligatorios';
        } else if (value.length < 2) {
          newErrors[name] = '❌ Los apellidos deben tener al menos 2 caracteres';
        } else if (value.length > 50) {
          newErrors[name] = '❌ Los apellidos no pueden exceder 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors[name] = '❌ Los apellidos solo pueden contener letras y espacios';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'EMAIL':
        if (!value.trim()) {
          newErrors[name] = '❌ El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = '❌ Formato de email inválido (ej: usuario@correo.com)';
        } else if (value.length > 100) {
          newErrors[name] = '❌ El email no puede exceder 100 caracteres';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'IDENTIFICATION_NUMBER':
        if (!value.trim()) {
          newErrors[name] = '❌ El número de documento es obligatorio';
        } else {
          const docType = formData.IDENTIFICATION_TYPE;
          let isValid = true;
          
          switch (docType) {
            case 'DNI':
              if (!/^\d{8}$/.test(value)) {
                newErrors[name] = '❌ El DNI debe tener 8 dígitos numéricos';
                isValid = false;
              }
              break;
            case 'CE':
              if (!/^[a-zA-Z0-9]{9,12}$/.test(value)) {
                newErrors[name] = '❌ El CE debe tener entre 9 y 12 caracteres alfanuméricos';
                isValid = false;
              }
              break;
            case 'PASAPORTE':
              if (!/^[a-zA-Z0-9]{6,12}$/.test(value)) {
                newErrors[name] = '❌ El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos';
                isValid = false;
              }
              break;
            default:
              break;
          }
          
          if (isValid) {
            delete newErrors[name];
          }
        }
        break;
      
      case 'PHONE':
        if (!value.trim()) {
          newErrors[name] = '❌ El teléfono es obligatorio';
        } else if (!/^[9]\d{8}$/.test(value.replace(/\s/g, ''))) {
          newErrors[name] = '❌ El teléfono debe empezar con 9 y tener 9 dígitos (ej: 912345678)';
        } else if (value.length > 15) {
          newErrors[name] = '❌ El teléfono no puede exceder 15 caracteres';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'COMPANY':
        if (!value) {
          newErrors[name] = '❌ Debe seleccionar una empresa';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'AREA_ID':
        if (!value) {
          newErrors[name] = '❌ Debe seleccionar un área';
        } else {
          delete newErrors[name];
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name]; // Retorna true si no hay error
  };

  // Validar todo el formulario
  const validateForm = () => {
    const fieldsToValidate = [
      'FIRST_NAME',
      'LAST_NAME',
      'EMAIL',
      'IDENTIFICATION_NUMBER',
      'PHONE',
      'COMPANY',
      'AREA_ID'
    ];
    
    let isValid = true;
    const newErrors = {};
    
    fieldsToValidate.forEach(field => {
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      if (!fieldIsValid) {
        isValid = false;
        newErrors[field] = errors[field] || 'Campo inválido';
      }
    });
    
    setErrors(newErrors);
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
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Marcar todos los campos como tocados
    const allFields = [
      'FIRST_NAME',
      'LAST_NAME',
      'EMAIL',
      'IDENTIFICATION_NUMBER',
      'PHONE',
      'COMPANY',
      'AREA_ID'
    ];
    
    const newTouchedFields = {};
    allFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);

    // Validar todo el formulario
    if (!validateForm()) {
      setIsSubmitting(false);
      
      // Scroll al primer error
      const firstErrorField = document.querySelector('.applicant-form__input--error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      return;
    }

    try {
      console.log("📤 Datos a enviar:", formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    let baseClass = 'applicant-form__input';
    
    if (errors[fieldName]) {
      baseClass += ' applicant-form__input--error';
    } else if (touchedFields[fieldName] && formData[fieldName]) {
      baseClass += ' applicant-form__input--success';
    }
    
    return baseClass;
  };

  // Contadores de caracteres
  const firstNameCount = formData.FIRST_NAME.length;
  const lastNameCount = formData.LAST_NAME.length;
  const emailCount = formData.EMAIL.length;
  const phoneCount = formData.PHONE.length;

  return (
    <form onSubmit={handleSubmit} className="applicant-form">
      {/* Header del Formulario */}
      <div className="applicant-form__header">
        <div className="applicant-form__icon">
          <User size={28} />
        </div>
        <div className="applicant-form__header-content">
          <h2 className="applicant-form__title">
            {initialData ? 'Editar Solicitante' : 'Nuevo Solicitante'}
          </h2>
          <p className="applicant-form__subtitle">
            {initialData 
              ? 'Actualiza la información del solicitante' 
              : 'Completa los datos para registrar un nuevo solicitante'
            }
          </p>
        </div>
      </div>

      {/* Indicador de campos requeridos */}


      {/* Grid de Campos */}
      <div className="applicant-form__grid">
        {/* Nombres */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <User size={16} />
            Nombres <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            name="FIRST_NAME"
            value={formData.FIRST_NAME}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('FIRST_NAME')}
            placeholder="Ingrese los nombres completos"
            required
            maxLength={50}
          />
          <div className="applicant-form__field-info">
            <small>Solo letras y espacios | Mín: 2 | Máx: 50</small>
            <div className="applicant-form__char-counter">
              <small className={firstNameCount > 45 ? 'text-warning' : ''}>
                {firstNameCount} / 50
              </small>
            </div>
          </div>
          {errors.FIRST_NAME && (
            <div className="applicant-form__error-message">
              <AlertCircle size={12} />
              <span>{errors.FIRST_NAME}</span>
            </div>
          )}
          {touchedFields.FIRST_NAME && !errors.FIRST_NAME && formData.FIRST_NAME && (
            <div className="applicant-form__success-message">
              <CheckCircle size={12} />
              <span>Nombres válidos</span>
            </div>
          )}
        </div>

        {/* Apellidos */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <User size={16} />
            Apellidos <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            name="LAST_NAME"
            value={formData.LAST_NAME}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('LAST_NAME')}
            placeholder="Ingrese los apellidos completos"
            required
            maxLength={50}
          />
          <div className="applicant-form__field-info">
            <small>Solo letras y espacios | Mín: 2 | Máx: 50</small>
            <div className="applicant-form__char-counter">
              <small className={lastNameCount > 45 ? 'text-warning' : ''}>
                {lastNameCount} / 50
              </small>
            </div>
          </div>
          {errors.LAST_NAME && (
            <div className="applicant-form__error-message">
              <AlertCircle size={12} />
              <span>{errors.LAST_NAME}</span>
            </div>
          )}
          {touchedFields.LAST_NAME && !errors.LAST_NAME && formData.LAST_NAME && (
            <div className="applicant-form__success-message">
              <CheckCircle size={12} />
              <span>Apellidos válidos</span>
            </div>
          )}
        </div>

        {/* Tipo de Documento */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <IdCard size={16} />
            Tipo de Documento <span className="required-asterisk">*</span>
          </label>
          <select
            name="IDENTIFICATION_TYPE"
            value={formData.IDENTIFICATION_TYPE}
            onChange={handleChange}
            className="applicant-form__input applicant-form__select"
            required
          >
            <option value="DNI">DNI</option>
            <option value="CE">Carnet de Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
          <div className="applicant-form__field-info">
            <small>
              {formData.IDENTIFICATION_TYPE === 'DNI' && '8 dígitos numéricos'}
              {formData.IDENTIFICATION_TYPE === 'CE' && '9-12 caracteres alfanuméricos'}
              {formData.IDENTIFICATION_TYPE === 'PASAPORTE' && '6-12 caracteres alfanuméricos'}
            </small>
          </div>
        </div>

        {/* Número de Documento */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <IdCard size={16} />
            Número de Documento <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            name="IDENTIFICATION_NUMBER"
            value={formData.IDENTIFICATION_NUMBER}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('IDENTIFICATION_NUMBER')}
            placeholder={
              formData.IDENTIFICATION_TYPE === 'DNI' ? '12345678' :
              formData.IDENTIFICATION_TYPE === 'CE' ? 'CE123456789' :
              'P12345678'
            }
            required
            maxLength={12}
          />
          {errors.IDENTIFICATION_NUMBER && (
            <div className="applicant-form__error-message">
              <AlertCircle size={12} />
              <span>{errors.IDENTIFICATION_NUMBER}</span>
            </div>
          )}
          {touchedFields.IDENTIFICATION_NUMBER && !errors.IDENTIFICATION_NUMBER && formData.IDENTIFICATION_NUMBER && (
            <div className="applicant-form__success-message">
              <CheckCircle size={12} />
              <span>Documento válido</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <Mail size={16} />
            Email <span className="required-asterisk">*</span>
          </label>
          <input
            type="email"
            name="EMAIL"
            value={formData.EMAIL}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('EMAIL')}
            placeholder="ejemplo@correo.com"
            required
            maxLength={100}
          />
          <div className="applicant-form__field-info">
            <small>Formato: usuario@dominio.com | Máx: 100 caracteres</small>
            <div className="applicant-form__char-counter">
              <small className={emailCount > 90 ? 'text-warning' : ''}>
                {emailCount} / 100
              </small>
            </div>
          </div>
          {errors.EMAIL && (
            <div className="applicant-form__error-message">
              <AlertCircle size={12} />
              <span>{errors.EMAIL}</span>
            </div>
          )}
          {touchedFields.EMAIL && !errors.EMAIL && formData.EMAIL && (
            <div className="applicant-form__success-message">
              <CheckCircle size={12} />
              <span>Email válido</span>
            </div>
          )}
        </div>

        {/* Teléfono */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <Phone size={16} />
            Teléfono <span className="required-asterisk">*</span>
          </label>
          <input
            type="tel"
            name="PHONE"
            value={formData.PHONE}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('PHONE')}
            placeholder="912345678"
            required
            maxLength={15}
          />
          <div className="applicant-form__field-info">
            <small>Debe empezar con 9 | 9 dígitos | Máx: 15 caracteres</small>
            <div className="applicant-form__char-counter">
              <small className={phoneCount > 12 ? 'text-warning' : ''}>
                {phoneCount} / 15
              </small>
            </div>
          </div>
          {errors.PHONE && (
            <div className="applicant-form__error-message">
              <AlertCircle size={12} />
              <span>{errors.PHONE}</span>
            </div>
          )}
          {touchedFields.PHONE && !errors.PHONE && formData.PHONE && (
            <div className="applicant-form__success-message">
              <CheckCircle size={12} />
              <span>Teléfono válido</span>
            </div>
          )}
        </div>

        {/* Empresa */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <Building size={16} />
            Empresa <span className="required-asterisk">*</span>
          </label>
          <select
            name="COMPANY"
            value={formData.COMPANY}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('COMPANY')}
            required
          >
            <option value="">Seleccionar empresa</option>
            {companyOptions.map((company) => (
              <option key={company.value} value={company.value}>
                {company.label}
              </option>
            ))}
          </select>
          {errors.COMPANY && (
            <div className="applicant-form__error-message">
              <AlertCircle size={12} />
              <span>{errors.COMPANY}</span>
            </div>
          )}
          {touchedFields.COMPANY && !errors.COMPANY && formData.COMPANY && (
            <div className="applicant-form__success-message">
              <CheckCircle size={12} />
              <span>Empresa seleccionada</span>
            </div>
          )}
        </div>

        {/* Área */}
        <div className="applicant-form__group">
          <label className="applicant-form__label">
            <Users size={16} />
            Área <span className="required-asterisk">*</span>
          </label>
          <select
            name="AREA_ID"
            value={formData.AREA_ID}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('AREA_ID')}
            required
            disabled={loadingAreas}
          >
            <option value="">Seleccionar área</option>
            {loadingAreas ? (
              <option disabled>Cargando áreas...</option>
            ) : (
              areas.map((area) => (
                <option key={area.ID_AREA} value={area.ID_AREA}>
                  {area.NAME_AREA || area.AREA_NAME || `Área ${area.ID_AREA}`}
                </option>
              ))
            )}
          </select>
          {loadingAreas && (
            <div className="applicant-form__loading">Cargando áreas disponibles...</div>
          )}
          {errors.AREA_ID && (
            <div className="applicant-form__error-message">
              <AlertCircle size={12} />
              <span>{errors.AREA_ID}</span>
            </div>
          )}
          {touchedFields.AREA_ID && !errors.AREA_ID && formData.AREA_ID && (
            <div className="applicant-form__success-message">
              <CheckCircle size={12} />
              <span>Área seleccionada</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de validación */}
      <div className="applicant-form__validation-summary">
        <div className={`applicant-form__summary-card ${Object.keys(errors).length === 0 ? 'valid' : 'invalid'}`}>
          {Object.keys(errors).length === 0 ? (
            <>
              <CheckCircle size={16} />
              <span>✅ Todos los campos están correctamente completados</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} />
              <span>❌ Hay {Object.keys(errors).length} campo(s) que requieren atención</span>
            </>
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="applicant-form__info">
        <div className="applicant-form__info-item">
          💡 Todos los campos marcados con * son obligatorios
        </div>
        <div className="applicant-form__info-item">
          ✅ La información será validada antes del registro
        </div>
      </div>

      {/* Acciones del Formulario */}
      <div className="applicant-form__actions">
        <button 
          type="button" 
          onClick={onCancel} 
          className="applicant-form__btn applicant-form__btn--cancel"
          disabled={isSubmitting}
        >
          <X size={18} />
          Cancelar
        </button>
        <button 
          type="submit" 
          className="applicant-form__btn applicant-form__btn--submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          title={Object.keys(errors).length > 0 ? "Corrija los errores antes de enviar" : ""}
        >
          {isSubmitting ? (
            <>
              <div className="applicant-form__spinner"></div>
              Procesando...
            </>
          ) : (
            <>
              <Save size={18} />
              {initialData ? 'Actualizar Solicitante' : 'Crear Solicitante'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ApplicantForm;