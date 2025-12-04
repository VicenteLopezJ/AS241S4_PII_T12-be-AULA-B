import React, { useState, useEffect } from "react";
import "../../styles/kardex/medicamentos/Medicamentosform.css";

export default function MedicationForm({ onClose, onSave, initialData, readOnly = false }) {
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    presentacion: "",
    descripcion: "",
    categoria: "",
    estado: "A",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("📝 MedicationForm - initialData:", initialData);
    console.log("🔒 Modo solo lectura:", readOnly);
    
    if (initialData) setForm(initialData);
  }, [initialData, readOnly]);

  const validate = () => {
    if (readOnly) return true;
    
    const newErrors = {};

    if (!form.nombre || form.nombre.trim() === "") {
      newErrors.nombre = "El nombre es obligatorio.";
    } else if (form.nombre.length < 3) {
      newErrors.nombre = "Debe tener al menos 3 caracteres.";
    }

    if (!form.presentacion || form.presentacion.trim() === "") {
      newErrors.presentacion = "La presentación es obligatoria.";
    }

    if (!form.categoria || form.categoria.trim() === "") {
      newErrors.categoria = "La categoría es obligatoria.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key) => (e) => {
    if (readOnly) return;
    
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (readOnly) {
      onClose();
      return;
    }
    
    if (validate()) onSave(form);
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
          {readOnly ? "Detalles del Medicamento" : 
           form.id ? "Editar Medicamento" : "Nuevo Medicamento"}
        </h2>
        
        {form.id && (
          <div className="form-id-info">
            <small>ID: #{form.id}</small>
            {readOnly && <span className="read-only-badge">🔒 Solo lectura</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* NOMBRE */}
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              placeholder="Ejemplo: Paracetamol"
              value={form.nombre}
              onChange={handleChange("nombre")}
              className={errors.nombre ? "input-error" : ""}
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.nombre && (
              <small className="error-text">{errors.nombre}</small>
            )}
          </div>

          {/* PRESENTACIÓN */}
          <div className="form-group">
            <label>Presentación *</label>
            <input
              type="text"
              placeholder="Ejemplo: Tabletas 500mg"
              value={form.presentacion}
              onChange={handleChange("presentacion")}
              className={errors.presentacion ? "input-error" : ""}
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.presentacion && (
              <small className="error-text">{errors.presentacion}</small>
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              placeholder="Describe brevemente el medicamento..."
              rows={3}
              value={form.descripcion}
              onChange={handleChange("descripcion")}
              disabled={readOnly}
              readOnly={readOnly}
            ></textarea>
          </div>

          {/* CATEGORÍA */}
          <div className="form-group">
            <label>Categoría *</label>
            <input
              type="text"
              placeholder="Ejemplo: Analgésico"
              value={form.categoria}
              onChange={handleChange("categoria")}
              className={errors.categoria ? "input-error" : ""}
              disabled={readOnly}
              readOnly={readOnly}
            />
            {errors.categoria && (
              <small className="error-text">{errors.categoria}</small>
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
              <option value="A">A (Activo / Disponible)</option>
              <option value="I">I (Inactivo / Agotado)</option>
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
                : "* Campos obligatorios"}
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}