import React, { useState, useEffect } from "react";
import "../../styles/kardex/proveedor/Proveedorform.css";

export default function ProveedorForm({ onClose, onSave, initialData, readOnly = false }) {
  const [form, setForm] = useState({
    id: null,
    razonSocial: "",
    telefono: "",
    direccion: "",
    ruc: "", 
    correo: "",
    estado: "A",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("📝 ProveedorForm - initialData:", initialData);
    console.log("🔒 Modo solo lectura:", readOnly);
    
    if (initialData) {
      const transformedData = {
        ...initialData,
        estado: initialData.estado === 'Activo' || initialData.estado === 'A' ? 'A' : 'I'
      };
      setForm(transformedData);
    }
  }, [initialData, readOnly]);

  const isOnlySpaces = (value) => !value.trim().length;

  const validate = () => {
    if (readOnly) return true;
    
    const newErrors = {};

    if (!form.razonSocial || isOnlySpaces(form.razonSocial)) {
      newErrors.razonSocial = "La razón social es obligatoria.";
    } else if (form.razonSocial.length < 3) {
      newErrors.razonSocial = "Debe tener al menos 3 caracteres.";
    }

    if (!form.telefono || isOnlySpaces(form.telefono)) {
      newErrors.telefono = "El teléfono es obligatorio.";
    } else if (!/^9\d{8}$/.test(form.telefono)) {
      newErrors.telefono = "Debe tener exactamente 9 dígitos y comenzar con 9.";
    }

    if (!form.direccion || isOnlySpaces(form.direccion)) {
      newErrors.direccion = "La dirección es obligatoria.";
    } else if (form.direccion.length < 5) {
      newErrors.direccion = "Debe tener al menos 5 caracteres.";
    }

    if (!form.ruc || isOnlySpaces(form.ruc)) {
      newErrors.ruc = "El RUC es obligatorio.";
    } else if (!/^\d{11}$/.test(form.ruc)) {
      newErrors.ruc = "Debe tener exactamente 11 dígitos.";
    }

    if (!form.correo || isOnlySpaces(form.correo)) {
      newErrors.correo = "El correo es obligatorio.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.correo)
    ) {
      newErrors.correo = "Debe tener un formato válido (ejemplo@correo.com).";
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
    
    if (validate()) onSave(form);
  };

  const handleChange = (key) => (e) => {
    if (readOnly) return;
    
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="inv-modal-overlay">
      <div className="inv-modal">
        <button className="inv-close-btn" onClick={handleClose}>
          ✖
        </button>

        <h2>
          {readOnly ? "Detalles del Proveedor" : 
           form.id ? "Editar Proveedor" : "Nuevo Proveedor"}
        </h2>
        
        {form.id && (
          <div className="form-id-info">
            <small>ID: #{form.id}</small>
            {readOnly && <span className="read-only-badge">🔒 Solo lectura</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* RAZÓN SOCIAL */}
          <div className="form-group">
            <label>Razón Social</label>
            <input
              type="text"
              value={form.razonSocial}
              onChange={handleChange("razonSocial")}
              className={errors.razonSocial ? "input-error" : ""}
              placeholder="Ingrese la razón social"
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.razonSocial && (
              <small className="error-text">{errors.razonSocial}</small>
            )}
          </div>

          {/* TELÉFONO */}
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={form.telefono}
              onChange={handleChange("telefono")}
              className={errors.telefono ? "input-error" : ""}
              placeholder="Ej: 987654321"
              maxLength={9}
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.telefono && (
              <small className="error-text">{errors.telefono}</small>
            )}
          </div>

          {/* DIRECCIÓN */}
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={handleChange("direccion")}
              className={errors.direccion ? "input-error" : ""}
              placeholder="Ingrese dirección completa"
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.direccion && (
              <small className="error-text">{errors.direccion}</small>
            )}
          </div>

          {/* RUC */}
          <div className="form-group">
            <label>RUC</label>
            <input
              type="text"
              value={form.ruc}
              onChange={handleChange("ruc")}
              className={errors.ruc ? "input-error" : ""}
              placeholder="11 dígitos (ej: 20123456789)"
              maxLength={11}
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.ruc && (
              <small className="error-text">{errors.ruc}</small>
            )}
          </div>

          {/* CORREO */}
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={form.correo}
              onChange={handleChange("correo")}
              className={errors.correo ? "input-error" : ""}
              placeholder="ejemplo@correo.com"
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.correo && (
              <small className="error-text">{errors.correo}</small>
            )}
          </div>

          {/* ESTADO */}
          <div className="form-group">
            <label>Estado</label>
            <select 
              value={form.estado} 
              onChange={handleChange("estado")}
              disabled={readOnly}
            >
              <option value="A">A (Activo)</option>
              <option value="I">I (Inactivo)</option>
            </select>
          </div>

          {/* BOTONES */}
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
                {form.id ? "Guardar Cambios" : "Agregar"}
              </button>
            )}
          </div>
          
          {/* INFORMACIÓN */}
          <div className="form-info">
            <small>
              {readOnly 
                ? "🔒 Modo solo lectura - Los datos no se pueden modificar"
                : "* Todos los campos son obligatorios"}
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}