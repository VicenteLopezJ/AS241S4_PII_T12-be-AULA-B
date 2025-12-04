import React, { useState, useEffect } from "react";
import "../../styles/kardex/attention/AttentionForm.css";

export default function AttentionForm({ onClose, onSave, initialData, readOnly = false }) {
  const [form, setForm] = useState({
    id: null,
    dateAttended: "",
    timeAttended: "",
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    occupation: "",
    program: "",
    dni: "",
    address: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    status: "P"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("📝 AttentionForm - initialData:", initialData);
    console.log("🔒 Modo solo lectura:", readOnly);
    
    if (initialData) {
      if (initialData.dateAttended) {
        try {
          const dateObj = new Date(initialData.dateAttended);
          if (!isNaN(dateObj.getTime())) {
            const dateStr = dateObj.toISOString().split('T')[0];
            const timeStr = dateObj.toTimeString().slice(0, 5);
            
            setForm({
              ...initialData,
              dateAttended: dateStr,
              timeAttended: timeStr,
              status: initialData.status || "P"
            });
          } else {
            throw new Error("Fecha inválida");
          }
        } catch (error) {
          const now = new Date();
          setForm({
            ...initialData,
            dateAttended: now.toISOString().split('T')[0],
            timeAttended: now.toTimeString().slice(0, 5),
            status: initialData.status || "P"
          });
        }
      } else {
        setForm({
          ...initialData,
          status: initialData.status || "P"
        });
      }
    } else {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);
      
      setForm(prev => ({ 
        ...prev, 
        dateAttended: today,
        timeAttended: currentTime,
        status: "P"
      }));
    }
  }, [initialData, readOnly]);

  const handleChange = (key) => (e) => {
    if (readOnly) return;
    
    const value = e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    if (readOnly) return true;
    
    const newErrors = {};

    if (!form.dateAttended.trim()) {
      newErrors.dateAttended = "La fecha es obligatoria";
    }

    if (!form.timeAttended.trim()) {
      newErrors.timeAttended = "La hora es obligatoria";
    }

    if (!form.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    }

    if (form.age && (parseInt(form.age) < 0 || parseInt(form.age) > 150)) {
      newErrors.age = "Edad inválida (0-150)";
    }

    if (form.dni && !/^\d{8,15}$/.test(form.dni)) {
      newErrors.dni = "DNI inválido (8-15 dígitos)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (readOnly) {
      onClose();
      return;
    }
    
    if (!validate()) {
      return;
    }
    
    try {
      const dateTime = new Date(`${form.dateAttended}T${form.timeAttended}:00`);
      const isoDateTime = dateTime.toISOString();
      
      const dataToSave = {
        ...form,
        dateAttended: isoDateTime
      };
      
      onSave(dataToSave);
    } catch (error) {
      console.error("Error combinando fecha y hora:", error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="inv-modal-overlay">
      <div className="inv-modal attention-modal">
        <button className="inv-close-btn" onClick={handleClose}>
          ✖
        </button>
        
        <h2>
          {readOnly ? "Detalles de la Atención" : 
           form.id ? "Editar Atención" : "Nueva Atención"}
        </h2>
        
        {form.id && (
          <div className="form-id-info">
            <small>ID: #{form.id}</small>
            {readOnly && <span className="read-only-badge">🔒 Solo lectura</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Fila 1: Fecha y Hora */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Fecha de Atención *</label>
              <input
                type="date"
                value={form.dateAttended}
                onChange={handleChange("dateAttended")}
                className={errors.dateAttended ? "input-error" : ""}
                disabled={readOnly}
                readOnly={readOnly}
              />
              {errors.dateAttended && <small className="error-text">{errors.dateAttended}</small>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Hora de Atención *</label>
              <input
                type="time"
                value={form.timeAttended}
                onChange={handleChange("timeAttended")}
                className={errors.timeAttended ? "input-error" : ""}
                disabled={readOnly}
                readOnly={readOnly}
              />
              {errors.timeAttended && <small className="error-text">{errors.timeAttended}</small>}
            </div>
          </div>

          {/* Fila 2: Nombres */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nombres *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={handleChange("firstName")}
                className={errors.firstName ? "input-error" : ""}
                placeholder="Ingrese nombres"
                disabled={readOnly}
                readOnly={readOnly}
              />
              {errors.firstName && <small className="error-text">{errors.firstName}</small>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Apellidos *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={handleChange("lastName")}
                className={errors.lastName ? "input-error" : ""}
                placeholder="Ingrese apellidos"
                disabled={readOnly}
                readOnly={readOnly}
              />
              {errors.lastName && <small className="error-text">{errors.lastName}</small>}
            </div>
          </div>

          {/* Fila 3: DNI, Género, Edad */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>DNI</label>
              <input
                type="text"
                value={form.dni}
                onChange={handleChange("dni")}
                className={errors.dni ? "input-error" : ""}
                placeholder="87654321"
                disabled={readOnly}
                readOnly={readOnly}
              />
              {errors.dni && <small className="error-text">{errors.dni}</small>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Género</label>
              <select 
                value={form.gender} 
                onChange={handleChange("gender")}
                disabled={readOnly}
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Edad</label>
              <input
                type="number"
                value={form.age}
                onChange={handleChange("age")}
                className={errors.age ? "input-error" : ""}
                placeholder="25"
                min="0"
                max="150"
                disabled={readOnly}
                readOnly={readOnly}
              />
              {errors.age && <small className="error-text">{errors.age}</small>}
            </div>
          </div>

          {/* Fila 4: Ocupación, Programa, Estado */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Ocupación</label>
              <input
                type="text"
                value={form.occupation}
                onChange={handleChange("occupation")}
                placeholder="Ej: Estudiante, Profesor"
                disabled={readOnly}
                readOnly={readOnly}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Programa</label>
              <input
                type="text"
                value={form.program}
                onChange={handleChange("program")}
                placeholder="Ej: Programa Social"
                disabled={readOnly}
                readOnly={readOnly}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Estado *</label>
              <select 
                value={form.status} 
                onChange={handleChange("status")}
                disabled={readOnly}
              >
                <option value="P">Pendiente</option>
                <option value="A">Activo</option>
                <option value="C">Completado</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Dirección */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={handleChange("address")}
              placeholder="Ingrese dirección completa"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>

          {/* Diagnóstico */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Diagnóstico</label>
            <textarea
              value={form.diagnosis}
              onChange={handleChange("diagnosis")}
              placeholder="Ingrese diagnóstico médico..."
              rows="3"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>

          {/* Tratamiento */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Tratamiento</label>
            <textarea
              value={form.treatment}
              onChange={handleChange("treatment")}
              placeholder="Ingrese tratamiento prescrito..."
              rows="3"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>

          {/* Notas */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Notas Adicionales</label>
            <textarea
              value={form.notes}
              onChange={handleChange("notes")}
              placeholder="Observaciones adicionales..."
              rows="2"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleClose}
            >
              {readOnly ? "Cerrar" : "Cancelar"}
            </button>
            
            {!readOnly && (
              <button type="submit" className="save-btn">
                {form.id ? "Actualizar" : "Guardar"}
              </button>
            )}
          </div>
          
          {/* INFORMACIÓN */}
          <div className="form-info">
            <small>
              {readOnly 
                ? "🔒 Modo solo lectura - Los datos no se pueden modificar"
                : "* Campos obligatorios"}
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}