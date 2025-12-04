import React, { useState, useEffect } from "react";
import { AreaSignatureService } from "../../../services/valeProvisional/areaSignatureApi";
import "../../../styles/valeProvisional/areaSignature/areaSignatureForm.css";

const AreaSignatureForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    idArea: "",
    signatureUrl: "",
    signatureDate: "",
    managerName: "",
    managerLastname: "",
    managerPosition: "",
    area: "",
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    console.log("🔄 useEffect - initialData:", initialData);
    
    // Cargar datos iniciales si existen
    if (initialData) {
      setFormData({
        idArea: initialData.ID_AREA || initialData.idArea || "",
        signatureUrl: initialData.SIGNATURE_URL || initialData.signatureUrl || "",
        signatureDate: initialData.SIGNATURE_DATE || initialData.signatureDate || "",
        managerName: initialData.MANAGER_NAME || initialData.managerName || "",
        managerLastname: initialData.MANAGER_LASTNAME || initialData.managerLastname || "",
        managerPosition: initialData.MANAGER_POSITION || initialData.managerPosition || "",
        area: initialData.AREA || initialData.area || "",
      });
    }

    // Cargar lista de áreas
    loadAreas();
  }, [initialData]);

  const loadAreas = async () => {
    try {
      console.log("📡 Cargando áreas...");
      const response = await AreaSignatureService.getAreas();
      console.log("✅ Respuesta áreas:", response.data);
      setAreas(response.data.data || []);
    } catch (error) {
      console.error("Error cargando áreas:", error);
      setFormError("Error al cargar la lista de áreas");
    }
  };

  // Función para validar que no contenga números
  const validateNoNumbers = (value) => {
    // Verifica si contiene números
    if (/\d/.test(value)) {
      return "No se permiten números en este campo";
    }
    return "";
  };

  // Función para validar que solo contenga letras y espacios
  const validateOnlyLettersAndSpaces = (value) => {
    // Permite letras (incluyendo acentos) y espacios
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
      return "Solo se permiten letras y espacios";
    }
    return "";
  };

  // Validación en tiempo real
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "idArea":
        if (!value) {
          error = "Debe seleccionar un área";
        }
        break;
        
      case "signatureUrl":
        if (!value.trim()) {
          error = "La URL de la firma es obligatoria";
        } else if (value.trim().length > 255) {
          error = "La URL no puede exceder 255 caracteres";
        } else if (!/^\/uploads\/firmas\/[a-zA-Z0-9_\-\.]+$/.test(value.trim())) {
          error = "Formato inválido. Use: /uploads/firmas/nombre_archivo.ext";
        }
        break;
        
      case "managerName":
        if (!value.trim()) {
          error = "El nombre del gerente es obligatorio";
        } else if (value.trim().length < 2) {
          error = "El nombre debe tener al menos 2 caracteres";
        } else if (value.trim().length > 50) {
          error = "El nombre no puede exceder 50 caracteres";
        } else {
          // Validar que no contenga números
          const noNumbersError = validateNoNumbers(value);
          if (noNumbersError) {
            error = noNumbersError;
          } else {
            // Validar que solo contenga letras y espacios
            const lettersOnlyError = validateOnlyLettersAndSpaces(value);
            if (lettersOnlyError) {
              error = lettersOnlyError;
            }
          }
        }
        break;
        
      case "managerLastname":
        if (!value.trim()) {
          error = "El apellido del gerente es obligatorio";
        } else if (value.trim().length < 2) {
          error = "El apellido debe tener al menos 2 caracteres";
        } else if (value.trim().length > 50) {
          error = "El apellido no puede exceder 50 caracteres";
        } else {
          // Validar que no contenga números
          const noNumbersError = validateNoNumbers(value);
          if (noNumbersError) {
            error = noNumbersError;
          } else {
            // Validar que solo contenga letras y espacios
            const lettersOnlyError = validateOnlyLettersAndSpaces(value);
            if (lettersOnlyError) {
              error = lettersOnlyError;
            }
          }
        }
        break;
        
      case "managerPosition":
        if (!value.trim()) {
          error = "El cargo del gerente es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El cargo debe tener al menos 3 caracteres";
        } else if (value.trim().length > 50) {
          error = "El cargo no puede exceder 50 caracteres";
        } else {
          // Para el cargo, solo validamos que no tenga números
          const noNumbersError = validateNoNumbers(value);
          if (noNumbersError) {
            error = noNumbersError;
          }
        }
        break;
        
      case "area":
        if (!value.trim()) {
          error = "El nombre del área es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El área debe tener al menos 3 caracteres";
        } else if (value.trim().length > 100) {
          error = "El área no puede exceder 100 caracteres";
        } else {
          // Para el área, solo validamos que no tenga números
          const noNumbersError = validateNoNumbers(value);
          if (noNumbersError) {
            error = noNumbersError;
          }
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
    
    // Validar todos los campos (excepto signatureDate que es opcional)
    Object.keys(formData).forEach((key) => {
      if (key !== "signatureDate") { // Fecha es opcional
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Obtener error de un campo específico
  const getFieldError = (fieldName) => {
    return errors[fieldName] || "";
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    // Verificar que todos los campos obligatorios tengan valor
    const requiredFields = ["idArea", "signatureUrl", "managerName", "managerLastname", "managerPosition", "area"];
    const hasAllRequiredFields = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim()
    );
    
    return hasAllRequiredFields && Object.keys(errors).length === 0;
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
        id_area: parseInt(formData.idArea),
        signature_url: formData.signatureUrl.trim(),
        manager_name: formData.managerName.trim(),
        manager_lastname: formData.managerLastname.trim(),
        manager_position: formData.managerPosition.trim(),
        area: formData.area.trim(),
        status: "A",
      };

      // Agregar fecha si se proporcionó
      if (formData.signatureDate) {
        submitData.signature_date = formData.signatureDate;
      }

      // Si estamos en modo edición, agregar el ID
      if (initialData?.ID_SIGNATURE || initialData?.idSignature) {
        submitData.id_signature = initialData.ID_SIGNATURE || initialData.idSignature;
      }

      console.log("📤 Enviando datos al backend:", submitData);

      // Llamar a la función onSubmit
      await onSubmit(submitData);
      console.log("✅ Formulario enviado exitosamente");
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      
      // Manejo de errores del backend
      if (error.response?.status === 400) {
        const backendErrors = error.response?.data?.errors || {};
        const newErrors = {};
        
        // Mapear errores del backend a campos del formulario
        Object.keys(backendErrors).forEach((backendField) => {
          let formField = "";
          
          switch (backendField) {
            case "id_area":
              formField = "idArea";
              break;
            case "signature_url":
              formField = "signatureUrl";
              break;
            case "manager_name":
              formField = "managerName";
              break;
            case "manager_lastname":
              formField = "managerLastname";
              break;
            case "manager_position":
              formField = "managerPosition";
              break;
            case "area":
              formField = "area";
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

  // Obtener fecha actual
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <form onSubmit={handleSubmit} className="vale-provisional-area-signature-formulario">
      {/* Mostrar errores generales */}
      {formError && (
        <div className="vale-provisional-area-signature-mensaje-error-general">
          <span className="vale-provisional-area-signature-error-icon">⚠️</span>
          {formError}
        </div>
      )}

      {/* Grid de campos - 2 columnas */}
      <div className="vale-provisional-area-signature-contenedor-campos">
        {/* Área */}
        <div className="vale-provisional-area-signature-campo-formulario vale-provisional-area-signature-campo-completo">
          <label className="vale-provisional-area-signature-etiqueta-campo">
            Área *
          </label>
          <select
            name="idArea"
            value={formData.idArea}
            onChange={handleChange}
            className={`vale-provisional-area-signature-entrada-formulario vale-provisional-area-signature-selector-desplegable ${
              getFieldError("idArea") ? "vale-provisional-area-signature-entrada-error" : ""
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
          {getFieldError("idArea") && (
            <div className="vale-provisional-area-signature-mensaje-error-campo">
              {getFieldError("idArea")}
            </div>
          )}
        </div>

        {/* URL de la Firma */}
        <div className="vale-provisional-area-signature-campo-formulario vale-provisional-area-signature-campo-completo">
          <label className="vale-provisional-area-signature-etiqueta-campo">
            URL de la Firma *
            <span className="vale-provisional-area-signature-contador-caracteres">
              {formData.signatureUrl.length}/255
            </span>
          </label>
          <input
            type="text"
            name="signatureUrl"
            value={formData.signatureUrl}
            onChange={handleChange}
            placeholder="Ej: /uploads/firmas/firma_gerente.png"
            className={`vale-provisional-area-signature-entrada-formulario ${
              getFieldError("signatureUrl") ? "vale-provisional-area-signature-entrada-error" : ""
            }`}
            disabled={loading}
            required
            maxLength={255}
          />
          {getFieldError("signatureUrl") && (
            <div className="vale-provisional-area-signature-mensaje-error-campo">
              {getFieldError("signatureUrl")}
            </div>
          )}
          <small className="vale-provisional-area-signature-texto-ayuda">
            Formato requerido: /uploads/firmas/nombre_archivo.ext
          </small>
        </div>

        {/* Fecha de Firma */}
        <div className="vale-provisional-area-signature-campo-formulario">
          <label className="vale-provisional-area-signature-etiqueta-campo">
            Fecha de Firma
          </label>
          <input
            type="date"
            name="signatureDate"
            value={formData.signatureDate}
            onChange={handleChange}
            className={`vale-provisional-area-signature-entrada-formulario ${
              getFieldError("signatureDate") ? "vale-provisional-area-signature-entrada-error" : ""
            }`}
            disabled={loading}
            max={getTodayDate()}
          />
          {getFieldError("signatureDate") && (
            <div className="vale-provisional-area-signature-mensaje-error-campo">
              {getFieldError("signatureDate")}
            </div>
          )}
          <small className="vale-provisional-area-signature-texto-ayuda">
            Opcional - Si no se especifica, se usará la fecha actual
          </small>
        </div>

        {/* Nombre del Gerente */}
        <div className="vale-provisional-area-signature-campo-formulario">
          <label className="vale-provisional-area-signature-etiqueta-campo">
            Nombre del Gerente *
            <span className="vale-provisional-area-signature-contador-caracteres">
              {formData.managerName.length}/50
            </span>
          </label>
          <input
            type="text"
            name="managerName"
            value={formData.managerName}
            onChange={handleChange}
            placeholder="Ingrese nombre del gerente"
            className={`vale-provisional-area-signature-entrada-formulario ${
              getFieldError("managerName") ? "vale-provisional-area-signature-entrada-error" : ""
            }`}
            disabled={loading}
            required
            maxLength={50}
          />
          {getFieldError("managerName") && (
            <div className="vale-provisional-area-signature-mensaje-error-campo">
              {getFieldError("managerName")}
            </div>
          )}
        </div>

        {/* Apellido del Gerente */}
        <div className="vale-provisional-area-signature-campo-formulario">
          <label className="vale-provisional-area-signature-etiqueta-campo">
            Apellido del Gerente *
            <span className="vale-provisional-area-signature-contador-caracteres">
              {formData.managerLastname.length}/50
            </span>
          </label>
          <input
            type="text"
            name="managerLastname"
            value={formData.managerLastname}
            onChange={handleChange}
            placeholder="Ingrese apellido del gerente"
            className={`vale-provisional-area-signature-entrada-formulario ${
              getFieldError("managerLastname") ? "vale-provisional-area-signature-entrada-error" : ""
            }`}
            disabled={loading}
            required
            maxLength={50}
          />
          {getFieldError("managerLastname") && (
            <div className="vale-provisional-area-signature-mensaje-error-campo">
              {getFieldError("managerLastname")}
            </div>
          )}
        </div>

        {/* Cargo del Gerente */}
        <div className="vale-provisional-area-signature-campo-formulario">
          <label className="vale-provisional-area-signature-etiqueta-campo">
            Cargo del Gerente *
            <span className="vale-provisional-area-signature-contador-caracteres">
              {formData.managerPosition.length}/50
            </span>
          </label>
          <input
            type="text"
            name="managerPosition"
            value={formData.managerPosition}
            onChange={handleChange}
            placeholder="Ingrese cargo del gerente"
            className={`vale-provisional-area-signature-entrada-formulario ${
              getFieldError("managerPosition") ? "vale-provisional-area-signature-entrada-error" : ""
            }`}
            disabled={loading}
            required
            maxLength={50}
          />
          {getFieldError("managerPosition") && (
            <div className="vale-provisional-area-signature-mensaje-error-campo">
              {getFieldError("managerPosition")}
            </div>
          )}
        </div>

        {/* Área (campo adicional) */}
        <div className="vale-provisional-area-signature-campo-formulario vale-provisional-area-signature-campo-completo">
          <label className="vale-provisional-area-signature-etiqueta-campo">
            Nombre del Área *
            <span className="vale-provisional-area-signature-contador-caracteres">
              {formData.area.length}/100
            </span>
          </label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="Ej: Gerencia de Operaciones, Dirección Financiera, etc."
            className={`vale-provisional-area-signature-entrada-formulario ${
              getFieldError("area") ? "vale-provisional-area-signature-entrada-error" : ""
            }`}
            disabled={loading}
            required
            maxLength={100}
          />
          {getFieldError("area") && (
            <div className="vale-provisional-area-signature-mensaje-error-campo">
              {getFieldError("area")}
            </div>
          )}
        </div>
      </div>

      {/* Información del estado */}
      <div className="vale-provisional-area-signature-seccion-informacion">
        <p className="vale-provisional-area-signature-texto-informativo">
          💡 <strong>Todos los campos son obligatorios</strong> (excepto fecha de firma)
        </p>
        <p className="vale-provisional-area-signature-texto-informativo">
          💡 <strong>Restricciones:</strong> No se permiten números en nombre, apellido, cargo y área
        </p>
        <p className="vale-provisional-area-signature-texto-informativo">
          💡 La firma se creará automáticamente con estado <strong>ACTIVO</strong>
        </p>
        {initialData && (
          <p className="vale-provisional-area-signature-texto-informativo">
            📝 <strong>Modo edición:</strong> Actualizando firma existente
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="vale-provisional-area-signature-contenedor-botones">
        <button
          type="button"
          onClick={handleCancel}
          className="vale-provisional-area-signature-boton vale-provisional-area-signature-boton-cancelar"
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="vale-provisional-area-signature-boton vale-provisional-area-signature-boton-enviar" 
          disabled={loading || !isFormValid()}
        >
          {loading ? (
            <>
              <span className="vale-provisional-area-signature-cargando-spinner"></span>
              {initialData ? "Actualizando..." : "Guardando..."}
            </>
          ) : (
            initialData ? "Actualizar Firma" : "Guardar Firma"
          )}
        </button>
      </div>
    </form>
  );
};

export default AreaSignatureForm;