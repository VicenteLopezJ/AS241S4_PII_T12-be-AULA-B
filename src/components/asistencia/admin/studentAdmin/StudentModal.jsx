// src/components/asistencia/admin/studentAdmin/StudentModal.jsx
import React, { useState, useEffect } from 'react';
import '../../../../styles/asistencia/admin/studentAdmin/studentManagement.css';

const StudentModal = ({ isOpen, onClose, onSubmit, student, careers }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    address: '',
    birthDate: '',
    careerId: '',
    currentSemester: 1,
    academicStatus: 'active'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dni: student.dni || '',
        phone: student.phone || '',
        address: student.address || '',
        birthDate: student.birthDate || '',
        careerId: student.careerId || '',
        currentSemester: student.currentSemester || 1,
        academicStatus: student.academicStatus || 'active',
        email: student.email || '' 
      });
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        dni: '',
        phone: '',
        address: '',
        birthDate: '',
        careerId: '',
        currentSemester: 1,
        academicStatus: 'active'
      });
    }
    setErrors({});
    setTouched({});
  }, [student, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validación de Email (solo para nuevos estudiantes)
    if (!student) {
      if (!formData.email?.trim()) {
        newErrors.email = 'Email es requerido';
      } else if (!/^[^\s@]+@vallegrande\.edu\.pe$/.test(formData.email)) {
        newErrors.email = 'El email debe terminar en @vallegrande.edu.pe';
      }
    }

    // Validación de Nombre (solo letras y espacios)
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'El nombre solo puede contener letras';
    }

    // Validación de Apellido (solo letras y espacios)
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Apellido es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'El apellido solo puede contener letras';
    }

    // Validación de DNI (exactamente 8 dígitos)
    if (!formData.dni?.trim()) {
      newErrors.dni = 'DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'DNI debe tener exactamente 8 dígitos';
    }

    // Validación de Teléfono (exactamente 9 dígitos y debe empezar con 9)
    if (formData.phone && !/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener exactamente 9 dígitos';
    } else if (formData.phone && !formData.phone.startsWith('9')) {
      newErrors.phone = 'El teléfono debe empezar con 9';
    }

    // Validación de Carrera
    if (!formData.careerId) {
      newErrors.careerId = 'Carrera es requerida';
    }

    // Validación de Semestre
    if (!formData.currentSemester || formData.currentSemester < 1 || formData.currentSemester > 6) {
      newErrors.currentSemester = 'Semestre debe estar entre 1 y 6';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!student) {
          if (!value?.trim()) {
            error = 'Email es requerido';
          } else if (!/^[^\s@]+@vallegrande\.edu\.pe$/.test(value)) {
            error = 'El email debe terminar en @vallegrande.edu.pe';
          }
        }
        break;
      
      case 'dni':
        if (!value?.trim()) {
          error = 'DNI es requerido';
        } else if (!/^\d{8}$/.test(value)) {
          error = 'El DNI debe tener exactamente 8 dígitos';
        }
        break;
      
      case 'phone':
        if (value && !/^\d{9}$/.test(value)) {
          error = 'El teléfono debe tener exactamente 9 dígitos';
        } else if (value && !value.startsWith('9')) {
          error = 'El teléfono debe empezar con 9';
        }
        break;
      
      case 'firstName':
        if (!value?.trim()) {
          error = 'Nombre es requerido';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'El nombre solo puede contener letras';
        }
        break;
      
      case 'lastName':
        if (!value?.trim()) {
          error = 'Apellido es requerido';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'El apellido solo puede contener letras';
        }
        break;
      
      case 'careerId':
        if (!value) {
          error = 'Carrera es requerida';
        }
        break;
      
      default:
        break;
    }

    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = student ? formData : {
        ...formData,
        password: formData.dni  
      };
      
      onSubmit(dataToSubmit);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Restricciones de longitud y formato mientras escribe
    switch (name) {
      case 'dni':
        // Solo números, máximo 8 dígitos
        newValue = value.replace(/\D/g, '').slice(0, 8);
        break;
      
      case 'phone':
        // Solo números, máximo 9 dígitos
        newValue = value.replace(/\D/g, '').slice(0, 9);
        break;
      
      default:
        newValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Marcar el campo como tocado
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar el campo individual
    const error = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{student ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          
          {/* Email Field */}
          {!student ? (
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="estudiante@vallegrande.edu.pe"
                className={touched.email && errors.email ? 'error' : ''}
              />
              {touched.email && errors.email && <span className="error-message">{errors.email}</span>}
              <small className="help-text">
                Solo se permiten correos con dominio @vallegrande.edu.pe
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label>Email (Solo lectura)</label>
              <div className="read-only-field">
                <input
                  type="email"
                  value={formData.email || 'Sin email asignado'}
                  disabled
                  className="read-only-input"
                />
                <span className="read-only-icon">🔒</span>
              </div>
              <small className="help-text">
                El email no se puede cambiar desde aquí. Edítalo desde la gestión de usuarios.
              </small>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>DNI <span className="required">*</span></label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="12345678"
                disabled={student}
                className={touched.dni && errors.dni ? 'error' : ''}
              />
              {touched.dni && errors.dni && <span className="error-message">{errors.dni}</span>}
              <small className="help-text">Solo números, 8 dígitos</small>
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="999888777"
                className={touched.phone && errors.phone ? 'error' : ''}
              />
              {touched.phone && errors.phone && <span className="error-message">{errors.phone}</span>}
              <small className="help-text">Solo números, exactamente 9 dígitos, debe empezar con 9</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre <span className="required">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Juan"
                className={touched.firstName && errors.firstName ? 'error' : ''}
              />
              {touched.firstName && errors.firstName && <span className="error-message">{errors.firstName}</span>}
              <small className="help-text">Solo letras</small>
            </div>

            <div className="form-group">
              <label>Apellido <span className="required">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Pérez"
                className={touched.lastName && errors.lastName ? 'error' : ''}
              />
              {touched.lastName && errors.lastName && <span className="error-message">{errors.lastName}</span>}
              <small className="help-text">Solo letras</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Carrera <span className="required">*</span></label>
              <select
                name="careerId"
                value={formData.careerId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.careerId && errors.careerId ? 'error' : ''}
              >
                <option value="">Seleccionar carrera</option>
                {careers.map(career => (
                  <option key={career.careerId} value={career.careerId}>
                    {career.name}
                  </option>
                ))}
              </select>
              {touched.careerId && errors.careerId && <span className="error-message">{errors.careerId}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Av. Principal 123"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Semestre Actual <span className="required">*</span></label>
              <select
                name="currentSemester"
                value={formData.currentSemester}
                onChange={handleChange}
                className={errors.currentSemester ? 'error' : ''}
              >
                {[1, 2, 3, 4, 5, 6].map(sem => (
                  <option key={sem} value={sem}>{sem}° Semestre</option>
                ))}
              </select>
              {errors.currentSemester && <span className="error-message">{errors.currentSemester}</span>}
            </div>

            <div className="form-group">
              <label>Estado Académico</label>
              <select
                name="academicStatus"
                value={formData.academicStatus}
                onChange={handleChange}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="graduated">Graduado</option>
                <option value="withdrawn">Retirado</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {student ? 'Guardar Cambios' : 'Crear Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;