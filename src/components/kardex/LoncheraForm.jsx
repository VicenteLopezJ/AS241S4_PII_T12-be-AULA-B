import React, { useState, useEffect } from "react";
import "../../styles/kardex/lonchera/LoncheraForm.css";

export default function LoncheraForm({ onClose, onSave, initialData, readOnly = false }) {
  const [form, setForm] = useState({
    id: null,
    idLonchera: null,
    nombreLonchera: "",
    item: "",
    cantidadActual: "",
    cantidadMinima: "",
    ciclo: "",
    escuela: "",
    estado: "A",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("📝 LoncheraForm - initialData recibido:", initialData);
    console.log("🔒 Modo solo lectura:", readOnly);
    
    if (initialData) {
      const id = initialData.idLonchera || initialData.id;
      
      let estado = "A";
      if (initialData.estado) {
        const estadoUpper = String(initialData.estado).toUpperCase();
        if (estadoUpper === "I" || estadoUpper === "INACTIVO") {
          estado = "I";
        }
      }
      
      setForm({
        id: id,
        idLonchera: id,
        nombreLonchera: initialData.nombreLonchera || "",
        item: initialData.item || "",
        cantidadActual: initialData.cantidadActual !== undefined ? String(initialData.cantidadActual) : "",
        cantidadMinima: initialData.cantidadMinima !== undefined ? String(initialData.cantidadMinima) : "",
        ciclo: initialData.ciclo || "",
        escuela: initialData.escuela || "",
        estado: estado
      });
    } else {
      setForm({
        id: null,
        idLonchera: null,
        nombreLonchera: "",
        item: "",
        cantidadActual: "",
        cantidadMinima: "",
        ciclo: "",
        escuela: "",
        estado: "A"
      });
    }
    
    setErrors({});
  }, [initialData, readOnly]);

  // Agrega esta validación para modo solo lectura
  const validate = () => {
    if (readOnly) {
      // En modo solo lectura, siempre es válido (no se envía)
      return true;
    }
    
    const newErrors = {};
    // ... tu validación normal ...
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key) => (e) => {
    // En modo solo lectura, no permitir cambios
    if (readOnly) return;
    
    const value = e.target.value;
    
    if (key === "cantidadActual" || key === "cantidadMinima") {
      if (value === "" || /^\d*$/.test(value)) {
        setForm(prev => ({ ...prev, [key]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // En modo solo lectura, solo cerrar el modal
    if (readOnly) {
      console.log("🔒 Modo solo lectura - cerrando formulario");
      onClose();
      return;
    }
    
    if (isSubmitting) return;
    
    console.log("📤 LoncheraForm - Enviando formulario:", form);
    
    if (!validate()) {
      console.log("❌ Validación fallida:", errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = {
        ...form,
        id: form.idLonchera || form.id,
        idLonchera: form.idLonchera || form.id,
        cantidadActual: parseInt(form.cantidadActual) || 0,
        cantidadMinima: parseInt(form.cantidadMinima) || 0
      };
      
      console.log("✅ Datos validados, llamando a onSave:", dataToSend);
      await onSave(dataToSend);
      
    } catch (error) {
      console.error("❌ Error en handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    console.log("✖ Cerrando formulario");
    onClose();
  };

  return (
    <div className="inv-modal-overlay">
      <div className="inv-modal">
        <button 
          className="inv-close-btn" 
          onClick={handleClose}
          disabled={isSubmitting}
        >
          ✖
        </button>

        <h2>
          {readOnly ? "Detalles de Lonchera" : 
           form.id ? "Editar Lonchera" : "Nueva Lonchera"}
        </h2>
        
        {form.id && (
          <div className="form-id-info">
            <small>ID: #{form.id}</small>
            {readOnly && <span className="read-only-badge">🔒 Solo lectura</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* NOMBRE LONCHERA */}
          <div className="form-group">
            <label>
              Nombre Lonchera *
              {!readOnly && <span className="char-count">({form.nombreLonchera.length}/20)</span>}
            </label>
            <input
              type="text"
              value={form.nombreLonchera}
              onChange={handleChange("nombreLonchera")}
              className={errors.nombreLonchera ? "input-error" : ""}
              placeholder="Ej: Lonchera Escolar 2024"
              maxLength="20"
              disabled={readOnly || isSubmitting}
              readOnly={readOnly}
            />
            {errors.nombreLonchera && (
              <small className="error-text">{errors.nombreLonchera}</small>
            )}
          </div>

          {/* ÍTEM */}
          <div className="form-group">
            <label>
              Ítem *
              {!readOnly && <span className="char-count">({form.item.length}/100)</span>}
            </label>
            <input
              type="text"
              value={form.item}
              onChange={handleChange("item")}
              className={errors.item ? "input-error" : ""}
              placeholder="Ej: Sándwich, Fruta, Jugo"
              maxLength="100"
              disabled={readOnly || isSubmitting}
              readOnly={readOnly}
            />
            {errors.item && (
              <small className="error-text">{errors.item}</small>
            )}
          </div>

          {/* CANTIDAD ACTUAL */}
          <div className="form-group">
            <label>Cantidad Actual *</label>
            <input
              type="number"
              value={form.cantidadActual}
              onChange={handleChange("cantidadActual")}
              className={errors.cantidadActual ? "input-error" : ""}
              placeholder="Ej: 50"
              min="0"
              max="999999"
              disabled={readOnly || isSubmitting}
              readOnly={readOnly}
            />
            {errors.cantidadActual && (
              <small className="error-text">{errors.cantidadActual}</small>
            )}
          </div>

          {/* CANTIDAD MÍNIMA */}
          <div className="form-group">
            <label>Cantidad Mínima *</label>
            <input
              type="number"
              value={form.cantidadMinima}
              onChange={handleChange("cantidadMinima")}
              className={errors.cantidadMinima ? "input-error" : ""}
              placeholder="Ej: 20"
              min="0"
              max="999999"
              disabled={readOnly || isSubmitting}
              readOnly={readOnly}
            />
            {errors.cantidadMinima && (
              <small className="error-text">{errors.cantidadMinima}</small>
            )}
            
            {form.cantidadActual && form.cantidadMinima && 
             parseInt(form.cantidadActual) <= parseInt(form.cantidadMinima) && 
             !errors.cantidadMinima && (
              <small className="warning-text">
                ⚠️ La cantidad actual está en o por debajo del mínimo
              </small>
            )}
          </div>

          {/* CICLO */}
          <div className="form-group">
            <label>
              Ciclo
              {!readOnly && <span className="char-count">({form.ciclo.length}/20)</span>}
            </label>
            <input
              type="text"
              value={form.ciclo}
              onChange={handleChange("ciclo")}
              className={errors.ciclo ? "input-error" : ""}
              placeholder="Ej: 2024-I"
              maxLength="20"
              disabled={readOnly || isSubmitting}
              readOnly={readOnly}
            />
            {errors.ciclo && (
              <small className="error-text">{errors.ciclo}</small>
            )}
          </div>

          {/* ESCUELA */}
          <div className="form-group">
            <label>
              Escuela
              {!readOnly && <span className="char-count">({form.escuela.length}/20)</span>}
            </label>
            <input
              type="text"
              value={form.escuela}
              onChange={handleChange("escuela")}
              className={errors.escuela ? "input-error" : ""}
              placeholder="Ej: Escuela Primaria XYZ"
              maxLength="20"
              disabled={readOnly || isSubmitting}
              readOnly={readOnly}
            />
            {errors.escuela && (
              <small className="error-text">{errors.escuela}</small>
            )}
          </div>

          {/* ESTADO */}
          <div className="form-group">
            <label>Estado</label>
            <select 
              value={form.estado} 
              onChange={handleChange("estado")}
              disabled={readOnly || isSubmitting}
            >
              <option value="A">Activo (A)</option>
              <option value="I">Inactivo (I)</option>
            </select>
            <small className="helper-text">
              {readOnly ? "Estado actual" : 
               form.id ? "Las loncheras inactivas no se pueden editar" : "Se creará como activa"}
            </small>
          </div>

          {/* BOTONES */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {readOnly ? "Cerrar" : "Cancelar"}
            </button>
            
            {!readOnly && (
              <button 
                type="submit" 
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span> Procesando...
                  </>
                ) : form.id ? "Guardar Cambios" : "Agregar Lonchera"}
              </button>
            )}
          </div>
          
          {/* INFORMACIÓN */}
          <div className="form-info">
            <small>
              {readOnly ? (
                "🔒 Modo solo lectura - Los datos no se pueden modificar"
              ) : (
                <><strong>* Campos obligatorios</strong><br />
                {form.id 
                  ? "Los cambios se guardarán en el sistema."
                  : "La nueva lonchera se agregará al inventario."}</>
              )}
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}