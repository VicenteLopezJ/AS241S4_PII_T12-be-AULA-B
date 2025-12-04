import React, { useState, useEffect } from "react";
import { DocumentService } from "../../../services/valeProvisional/documentApi";
import { VoucherService } from "../../../services/valeProvisional/voucherApi";
import {
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Receipt,
} from "lucide-react";
import "../../../styles/valeProvisional/document/documentForm.css";

const DocumentForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    trackingId: "",
    documentType: "",
    documentUrl: "",
    receptionDate: new Date().toISOString().split("T")[0],
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [selectedVoucherInfo, setSelectedVoucherInfo] = useState(null);

  // Tipos de documentos disponibles
  const documentTypes = [
    { value: "FACTURA", label: "Factura" },
    { value: "BOLETA", label: "Boleta de Venta" },
    { value: "RECIBO", label: "Recibo" },
    { value: "TICKET", label: "Ticket" },
    { value: "CONTRATO", label: "Contrato" },
    { value: "ORDEN_COMPRA", label: "Orden de Compra" },
    { value: "NOTA_CREDITO", label: "Nota de Crédito" },
    { value: "NOTA_DEBITO", label: "Nota de Débito" },
    { value: "GUIA_REMISION", label: "Guía de Remisión" },
    { value: "DOCUMENTO_EQUIVALENTE", label: "Documento Equivalente" },
    { value: "OTRO", label: "Otro Documento" },
  ];

  // ✅ Cargar lista de vales disponibles
  useEffect(() => {
    loadAvailableVouchers();
  }, []);

  // ✅ Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        trackingId: initialData.TRACKING_ID || initialData.trackingId || "",
        documentType: initialData.DOCUMENT_TYPE || initialData.documentType || "",
        documentUrl: initialData.DOCUMENT_URL || initialData.documentUrl || "",
        receptionDate: initialData.RECEPTION_DATE || 
                      initialData.receptionDate || 
                      new Date().toISOString().split("T")[0],
      });

      // Si hay un trackingId en los datos iniciales, buscar información del vale
      const initialTrackingId = initialData.TRACKING_ID || initialData.trackingId;
      if (initialTrackingId) {
        loadVoucherInfo(initialTrackingId);
      }
    }
  }, [initialData]);

  // ✅ Función para cargar vales disponibles
  const loadAvailableVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const response = await VoucherService.getAll();

      if (response.data && response.data.status === "success") {
        const availableVouchers = response.data.data.filter(
          (voucher) =>
            voucher.status === "A" || // Aprobados
            voucher.status === "P" || // Pendientes
            voucher.status === "J" || // Justificados
            voucher.status === "JV" // Justificados vencidos
        );

        setVouchers(availableVouchers);
      }
    } catch (error) {
      console.error("❌ Error cargando vales:", error);
      setError("Error al cargar la lista de vales disponibles");
    } finally {
      setLoadingVouchers(false);
    }
  };

  // ✅ Función para cargar información de un vale específico
  const loadVoucherInfo = (trackingId) => {
    const voucher = vouchers.find(v => 
      (v.idVoucher || v.ID_VOUCHER) == trackingId
    );
    setSelectedVoucherInfo(voucher || null);
  };

  // 🔥 VALIDACIONES
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case "trackingId":
        if (!value || value === "") {
          errors.trackingId = "💰 Debe seleccionar un vale para justificar";
        } else {
          delete errors.trackingId;
        }
        break;

      case "documentType":
        if (!value || value === "") {
          errors.documentType = "📄 Debe seleccionar un tipo de documento";
        } else {
          delete errors.documentType;
        }
        break;

      case "documentUrl":
        if (!value || value.trim() === "") {
          errors.documentUrl = "🔗 La URL del documento es requerida";
        } else if (!value.toLowerCase().startsWith("http://") && !value.toLowerCase().startsWith("https://")) {
          errors.documentUrl = "🔗 La URL debe empezar con http:// o https://";
        } else if (value.length > 255) {
          errors.documentUrl = "🔗 La URL no puede exceder los 255 caracteres";
        } else {
          delete errors.documentUrl;
        }
        break;

      default:
        if (!value || value.toString().trim() === "") {
          errors[name] = "Este campo es requerido";
        } else {
          delete errors[name];
        }
    }

    setFieldErrors(errors);
    return !errors[name];
  };

  // Validar todo el formulario
  const validateForm = () => {
    const fieldsToValidate = ["trackingId", "documentType", "documentUrl"];
    
    let isValid = true;
    const newErrors = {};

    fieldsToValidate.forEach((field) => {
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      if (!fieldIsValid) {
        isValid = false;
        newErrors[field] = fieldErrors[field] || "Campo inválido";
      }
    });

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, formData[name]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Cuando cambia el trackingId, cargar info del vale
    if (name === "trackingId") {
      loadVoucherInfo(value);
    }

    // Limpiar error general cuando el usuario empiece a escribir
    if (error) setError("");

    // Si el campo ya fue tocado, validar en tiempo real
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allFields = ["trackingId", "documentType", "documentUrl"];
    const newTouchedFields = {};
    allFields.forEach((field) => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);

    setLoading(true);
    setError("");

    // 🔥 VALIDACIÓN COMPLETA DEL FORMULARIO
    if (!validateForm()) {
      setError("❌ Por favor corrija los errores marcados en rojo antes de enviar el formulario");
      setLoading(false);

      // Scroll al primer error
      const firstErrorField = document.querySelector(".vale-documento-campo-error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    try {
      // Preparar datos para el backend
      const submitData = {
        DOCUMENT_TYPE: formData.documentType.trim(),
        DOCUMENT_URL: formData.documentUrl.trim(),
        RECEPTION_DATE: formData.receptionDate,
        TRACKING_ID: parseInt(formData.trackingId),
      };

      // Si estamos en modo edición, agregar el ID
      if (initialData?.ID_DOCUMENT || initialData?.idDocument) {
        submitData.ID_DOCUMENT = initialData.ID_DOCUMENT || initialData.idDocument;
      }

      // Llamar a la función onSubmit
      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al procesar la solicitud";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError("");
    setFieldErrors({});
    setTouchedFields({});
    setSelectedVoucherInfo(null);
    onCancel();
  };

  // ✅ Función para obtener el texto display de un vale
  const getVoucherDisplayText = (voucher) => {
    if (!voucher) return "";

    const correlative = voucher.correlative || voucher.CORRELATIVE || "";
    const amount = voucher.amount || voucher.AMOUNT || "";
    const applicantName = voucher.applicant
      ? `${voucher.applicant.firstName || ""} ${voucher.applicant.lastName || ""}`.trim()
      : "";

    return `${correlative} - S/ ${amount}${applicantName ? ` - ${applicantName}` : ""}`;
  };

  // Contador de caracteres para URL
  const urlCharCount = formData.documentUrl.length;
  const urlMaxChars = 255;

  // Verificar si el formulario está listo para enviar
  const isFormReady = () => {
    return formData.trackingId && 
           formData.documentType && 
           formData.documentUrl &&
           Object.keys(fieldErrors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} className="vale-documento-formulario">

      {/* Mostrar errores generales */}
      {error && (
        <div className="vale-documento-mensaje-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* SECCIÓN 1: SELECCIÓN DEL VALE */}
      <div className="vale-documento-seccion">
        <h3 className="vale-documento-seccion-titulo">
          <Receipt size={18} />
          Paso 1: Seleccionar Vale
        </h3>
        
        <div className={`vale-documento-campo-formulario ${
          fieldErrors.trackingId ? "vale-documento-campo-error" : ""
        } ${
          touchedFields.trackingId && !fieldErrors.trackingId && formData.trackingId
            ? "vale-documento-campo-exito" : ""
        }`}>
          <label className="vale-documento-etiqueta-campo">
            <Receipt size={16} />
            Vale a Justificar <span className="vale-documento-asterisco-requerido">*</span>
          </label>
          <select
            name="trackingId"
            value={formData.trackingId}
            onChange={handleChange}
            onBlur={handleBlur}
            className="vale-documento-entrada-formulario vale-documento-selector-desplegable"
            disabled={loading || loadingVouchers}
            required
          >
            <option value="">
              {loadingVouchers ? "Cargando vales..." : "Seleccione un vale"}
            </option>
            {vouchers.map((voucher) => (
              <option
                key={voucher.idVoucher || voucher.ID_VOUCHER}
                value={voucher.idVoucher || voucher.ID_VOUCHER}
              >
                {getVoucherDisplayText(voucher)}
                {voucher.status === "J" || voucher.status === "JV"
                  ? " (Ya justificado)"
                  : ""}
                {voucher.status === "A" ? " (Aprobado)" : ""}
                {voucher.status === "P" ? " (Pendiente)" : ""}
              </option>
            ))}
          </select>
          
          {loadingVouchers && (
            <small className="vale-documento-texto-ayuda">Cargando vales disponibles...</small>
          )}
          
          {!loadingVouchers && vouchers.length === 0 && (
            <small className="vale-documento-texto-ayuda vale-documento-texto-advertencia">
              No hay vales disponibles para justificar
            </small>
          )}
          
          {fieldErrors.trackingId && (
            <div className="vale-documento-mensaje-error-campo">
              <AlertCircle size={12} />
              <span>{fieldErrors.trackingId}</span>
            </div>
          )}
          
          {touchedFields.trackingId && !fieldErrors.trackingId && formData.trackingId && (
            <div className="vale-documento-mensaje-exito-campo">
              <CheckCircle size={12} />
              <span>Vale seleccionado correctamente</span>
            </div>
          )}
        </div>

        {/* Información del vale seleccionado */}
        {selectedVoucherInfo && (
          <div className="vale-documento-info-vale">
            <h4>📋 Información del Vale Seleccionado</h4>
            <div className="vale-documento-info-vale-detalle">
              <div className="vale-documento-info-vale-item">
                <strong>Correlativo:</strong> 
                <span>{selectedVoucherInfo.correlative || selectedVoucherInfo.CORRELATIVE}</span>
              </div>
              <div className="vale-documento-info-vale-item">
                <strong>Monto:</strong> 
                <span>S/ {selectedVoucherInfo.amount || selectedVoucherInfo.AMOUNT}</span>
              </div>
              <div className="vale-documento-info-vale-item">
                <strong>Solicitante:</strong> 
                <span>
                  {selectedVoucherInfo.applicant
                    ? `${selectedVoucherInfo.applicant.firstName || ""} ${selectedVoucherInfo.applicant.lastName || ""}`.trim()
                    : "N/A"}
                </span>
              </div>
              <div className="vale-documento-info-vale-item">
                <strong>Estado:</strong>
                <span className={`vale-documento-estado-${selectedVoucherInfo.status || selectedVoucherInfo.STATUS}`}>
                  {selectedVoucherInfo.status || selectedVoucherInfo.STATUS}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: INFORMACIÓN DEL DOCUMENTO */}
      <div className="vale-documento-seccion">
        <h3 className="vale-documento-seccion-titulo">
          <FileText size={18} />
          Paso 2: Información del Documento
        </h3>

        <div className="vale-documento-contenedor-campos">
          {/* Tipo de Documento */}
          <div className={`vale-documento-campo-formulario ${
            fieldErrors.documentType ? "vale-documento-campo-error" : ""
          } ${
            touchedFields.documentType && !fieldErrors.documentType && formData.documentType
              ? "vale-documento-campo-exito" : ""
          }`}>
            <label className="vale-documento-etiqueta-campo">
              <FileText size={16} />
              Tipo de Documento <span className="vale-documento-asterisco-requerido">*</span>
            </label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              onBlur={handleBlur}
              className="vale-documento-entrada-formulario vale-documento-selector-desplegable"
              disabled={loading}
              required
            >
              <option value="">Seleccionar tipo</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            {fieldErrors.documentType && (
              <div className="vale-documento-mensaje-error-campo">
                <AlertCircle size={12} />
                <span>{fieldErrors.documentType}</span>
              </div>
            )}
            
            {touchedFields.documentType && !fieldErrors.documentType && formData.documentType && (
              <div className="vale-documento-mensaje-exito-campo">
                <CheckCircle size={12} />
                <span>Tipo de documento seleccionado</span>
              </div>
            )}
          </div>

          {/* Fecha de Recepción */}
          <div className="vale-documento-campo-formulario">
            <label className="vale-documento-etiqueta-campo">
              <Calendar size={16} />
              Fecha de Recepción
            </label>
            <input
              type="date"
              name="receptionDate"
              value={formData.receptionDate}
              onChange={handleChange}
              className="vale-documento-entrada-formulario"
              disabled={loading}
              max={new Date().toISOString().split("T")[0]}
            />
            <small className="vale-documento-texto-ayuda">
              Fecha automática, puede ajustarse si es necesario
            </small>
          </div>

          {/* URL del Documento */}
          <div className={`vale-documento-campo-formulario vale-documento-campo-completo ${
            fieldErrors.documentUrl ? "vale-documento-campo-error" : ""
          } ${
            touchedFields.documentUrl && !fieldErrors.documentUrl && formData.documentUrl
              ? "vale-documento-campo-exito" : ""
          }`}>
            <label className="vale-documento-etiqueta-campo">
              <Receipt size={16} />
              URL del Documento <span className="vale-documento-asterisco-requerido">*</span>
            </label>
            <input
              type="text"
              name="documentUrl"
              value={formData.documentUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://ejemplo.com/documento.pdf"
              className="vale-documento-entrada-formulario"
              disabled={loading}
              required
              maxLength={255}
            />
            
            <div className="vale-documento-campo-info">
              <small className="vale-documento-texto-ayuda">
                Debe empezar con http:// o https://
              </small>
              <div className="vale-documento-contador-caracteres">
                {urlCharCount}/{urlMaxChars}
              </div>
            </div>
            
            {fieldErrors.documentUrl && (
              <div className="vale-documento-mensaje-error-campo">
                <AlertCircle size={12} />
                <span>{fieldErrors.documentUrl}</span>
              </div>
            )}
            
            {touchedFields.documentUrl && !fieldErrors.documentUrl && formData.documentUrl && (
              <div className="vale-documento-mensaje-exito-campo">
                <CheckCircle size={12} />
                <span>URL válida</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de validación */}
      <div className="vale-documento-resumen-validacion">
        <div className={`vale-documento-tarjeta-resumen ${
          Object.keys(fieldErrors).length === 0 && isFormReady() ? "vale-documento-valida" : "vale-documento-invalida"
        }`}>
          {Object.keys(fieldErrors).length === 0 && isFormReady() ? (
            <>
              <CheckCircle size={16} />
              <span>✅ Todos los campos están completados correctamente</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} />
              <span>
                {Object.keys(fieldErrors).length > 0 
                  ? `❌ Hay ${Object.keys(fieldErrors).length} campo(s) con errores`
                  : "⚠️ Complete todos los campos requeridos"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Información del estado */}
      <div className="vale-documento-seccion-informacion">
        <p className="vale-documento-texto-informativo">
          💡 El documento se creará automáticamente con estado <strong>ACTIVO</strong>
        </p>
        <p className="vale-documento-texto-informativo">
          ✅ El estado del vale se actualizará a <strong>JUSTIFICADO</strong>
        </p>
        {initialData && (
          <p className="vale-documento-texto-informativo">
            📝 <strong>Modo edición:</strong> Actualizando documento existente
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="vale-documento-contenedor-botones">
        <button
          type="button"
          onClick={handleCancel}
          className="vale-documento-boton vale-documento-boton-cancelar"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="vale-documento-boton vale-documento-boton-enviar"
          disabled={loading || !isFormReady()}
          title={!isFormReady() ? "Complete todos los campos requeridos" : ""}
        >
          {loading
            ? "Procesando..."
            : initialData
            ? "Actualizar Documento"
            : "Guardar Documento"}
        </button>
      </div>
    </form>
  );
};

export default DocumentForm;