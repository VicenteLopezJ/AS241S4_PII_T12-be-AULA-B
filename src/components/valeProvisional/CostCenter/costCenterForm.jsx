import React, { useState, useEffect } from "react";
import { CostCenterService } from "../../../services/valeProvisional/costCenterApi";
import "../../../styles/valeProvisional/costCenter/costCenterForm.css";

const CostCenterForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    costCenterName: "",
    description: "",
    areaId: "",
    ...initialData,
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    console.log("🔄 useEffect - initialData:", initialData);
    // Si hay datos iniciales (modo edición), cargarlos
    if (initialData) {
      setFormData({
        costCenterName: initialData.COST_CENTER_NAME || "",
        description: initialData.DESCRIPTION || "",
        areaId: initialData.AREA_ID || "",
      });
    }

    // Cargar lista de áreas para el dropdown
    loadAreas();
  }, [initialData]);

  const loadAreas = async () => {
    try {
      console.log("📡 Cargando áreas...");
      const response = await CostCenterService.getAreas();
      console.log("✅ Respuesta áreas:", response.data);
      setAreas(response.data.data || []);
    } catch (error) {
      console.error("Error cargando áreas:", error);
      setFormError("Error al cargar la lista de áreas");
    }
  };

  // Validación en tiempo real
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "costCenterName":
        if (!value.trim()) {
          error = "El nombre del centro de costo es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        } else if (value.trim().length > 100) {
          error = "El nombre no puede exceder 100 caracteres";
        }
        break;
        
      case "areaId":
        if (!value) {
          error = "Debe seleccionar un área";
        }
        break;
        
      case "description":
        if (value.length > 255) {
          error = "La descripción no puede exceder 255 caracteres";
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validar campo individual
    const fieldError = validateField(name, value);
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Actualizar errores
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
    
    // Limpiar error general cuando el usuario empiece a escribir
    if (formError) setFormError("");
  };

  // Validar formulario completo
  const validateForm = () => {
    const newErrors = {};
    
    // Validar cada campo
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar si un campo específico tiene error
  const getFieldError = (fieldName) => {
    return errors[fieldName] || "";
  };

  // Verificar si el formulario es válido para habilitar/deshabilitar botón
  const isFormValid = () => {
    return formData.costCenterName.trim() && 
           formData.areaId && 
           Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔄 Iniciando envío del formulario...");

    // Validar formulario completo
    if (!validateForm()) {
      setFormError("Por favor, corrija los errores en el formulario");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      // Preparar datos para el backend
      const submitData = {
        cost_center_name: formData.costCenterName.trim(),
        description: formData.description.trim(),
        area_id: parseInt(formData.areaId),
      };

      // Si estamos en modo edición, agregar el ID
      if (initialData?.ID_COST_CENTER) {
        submitData.id_cost_center = initialData.ID_COST_CENTER;
      }

      console.log("📤 Enviando datos al backend:", submitData);

      // Llamar a la función onSubmit que manejará la comunicación con el backend
      await onSubmit(submitData);
      console.log("✅ Formulario enviado exitosamente");
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      
      // Manejo específico de errores de validación del backend
      if (error.response?.status === 400) {
        const backendErrors = error.response?.data?.errors || {};
        const newErrors = {};
        
        // Mapear errores del backend a los campos del formulario
        Object.keys(backendErrors).forEach((backendField) => {
          let formField = "";
          
          switch (backendField) {
            case "cost_center_name":
              formField = "costCenterName";
              break;
            case "area_id":
              formField = "areaId";
              break;
            case "description":
              formField = "description";
              break;
            default:
              formField = backendField;
          }
          
          newErrors[formField] = backendErrors[backendField];
        });
        
        setErrors(newErrors);
        setFormError("Corrija los errores en el formulario");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Error al procesar la solicitud";
        setFormError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setFormError("");
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="vale-provisional-cost-center-formulario">
      {/* Mostrar errores generales */}
      {formError && (
        <div className="vale-provisional-cost-center-mensaje-error-general">
          <span className="vale-provisional-cost-center-error-icon">⚠️</span>
          {formError}
        </div>
      )}

      {/* Grid de campos - 2 columnas */}
      <div className="vale-provisional-cost-center-contenedor-campos">
        {/* Nombre del Centro de Costos */}
        <div className="vale-provisional-cost-center-campo-formulario">
          <label className="vale-provisional-cost-center-etiqueta-campo">
            Nombre del Centro de Costos *
            <span className="vale-provisional-cost-center-contador-caracteres">
              {formData.costCenterName.length}/100
            </span>
          </label>
          <input
            type="text"
            name="costCenterName"
            value={formData.costCenterName}
            onChange={handleChange}
            placeholder="Ingrese nombre del centro de costos"
            className={`vale-provisional-cost-center-entrada-formulario ${
              getFieldError("costCenterName") ? "vale-provisional-cost-center-entrada-error" : ""
            }`}
            disabled={loading}
            required
            maxLength={100}
          />
          {getFieldError("costCenterName") && (
            <div className="vale-provisional-cost-center-mensaje-error-campo">
              {getFieldError("costCenterName")}
            </div>
          )}
        </div>

        {/* Área */}
        <div className="vale-provisional-cost-center-campo-formulario">
          <label className="vale-provisional-cost-center-etiqueta-campo">
            Área *
          </label>
          <select
            name="areaId"
            value={formData.areaId}
            onChange={handleChange}
            className={`vale-provisional-cost-center-entrada-formulario vale-provisional-cost-center-selector-desplegable ${
              getFieldError("areaId") ? "vale-provisional-cost-center-entrada-error" : ""
            }`}
            disabled={loading}
            required
          >
            <option value="">Seleccionar área</option>
            {areas.map((area) => (
              <option key={area.ID_AREA} value={area.ID_AREA}>
                {area.AREA_NAME}
              </option>
            ))}
          </select>
          {getFieldError("areaId") && (
            <div className="vale-provisional-cost-center-mensaje-error-campo">
              {getFieldError("areaId")}
            </div>
          )}
        </div>

        {/* Descripción */}
        <div className="vale-provisional-cost-center-campo-formulario vale-provisional-cost-center-campo-completo">
          <label className="vale-provisional-cost-center-etiqueta-campo">
            Descripción
            <span className="vale-provisional-cost-center-contador-caracteres">
              {formData.description.length}/255
            </span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ingrese descripción del centro de costos"
            className={`vale-provisional-cost-center-entrada-formulario vale-provisional-cost-center-campo-texto ${
              getFieldError("description") ? "vale-provisional-cost-center-entrada-error" : ""
            }`}
            disabled={loading}
            rows={3}
            maxLength={255}
          />
          {getFieldError("description") && (
            <div className="vale-provisional-cost-center-mensaje-error-campo">
              {getFieldError("description")}
            </div>
          )}
        </div>
      </div>

      {/* Información del estado */}
      <div className="vale-provisional-cost-center-seccion-informacion">
        <p className="vale-provisional-cost-center-texto-informativo">
          💡 El centro de costos se creará automáticamente con estado{" "}
          <strong>ACTIVO</strong>
        </p>
        {initialData && (
          <p className="vale-provisional-cost-center-texto-informativo">
            📝 <strong>Modo edición:</strong> Actualizando centro de costo ID: {initialData.ID_COST_CENTER}
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="vale-provisional-cost-center-contenedor-botones">
        <button
          type="button"
          onClick={handleCancel}
          className="vale-provisional-cost-center-boton vale-provisional-cost-center-boton-cancelar"
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="vale-provisional-cost-center-boton vale-provisional-cost-center-boton-enviar" 
          disabled={loading || !isFormValid()}
        >
          {loading ? (
            <>
              <span className="vale-provisional-cost-center-cargando-spinner"></span>
              {initialData ? "Actualizando..." : "Guardando..."}
            </>
          ) : (
            initialData ? "Actualizar" : "Guardar"
          )}
        </button>
      </div>
    </form>
  );
};

export default CostCenterForm;