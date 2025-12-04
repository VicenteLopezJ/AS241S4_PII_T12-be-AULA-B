import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  DollarSign,
  User,
  Building,
  FileText,
  Calendar,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { VoucherService } from "../../../services/valeProvisional/voucherApi";
import { CostCenterService } from "../../../services/valeProvisional/costCenterApi";
import { applicantService } from "../../../services/valeProvisional/applicantApi";
import { AreaSignatureService } from "../../../services/valeProvisional/areaSignatureApi";
import "../../../styles/valeProvisional/voucher/voucherForm.css";

const VoucherForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: "",
    activityToPerform: "",
    costCenterId: "",
    applicantId: "",
    areaSignaturesId: "",
    requestDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    justificationDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [costCenters, setCostCenters] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [areaSignatures, setAreaSignatures] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Cargar datos para los selectores
  useEffect(() => {
    loadFormOptions();
  }, []);

  // Si hay datos iniciales (edición), cargarlos
  useEffect(() => {
    if (initialData) {
      console.log("🎯 VoucherForm - initialData recibido:", initialData);

      const formattedData = {
        amount: initialData.amount || initialData.AMOUNT || "",
        activityToPerform:
          initialData.activityToPerform ||
          initialData.ACTIVITY_TO_PERFORM ||
          "",
        costCenterId:
          initialData.costCenterId || initialData.COST_CENTER_ID || "",
        applicantId: initialData.applicantId || initialData.APPLICANT_ID || "",
        areaSignaturesId:
          initialData.areaSignaturesId || initialData.AREA_SIGNATURES_ID || "",
        requestDate:
          formatDateForInput(
            initialData.requestDate || initialData.REQUEST_DATE
          ) || new Date().toISOString().split("T")[0],
        deliveryDate:
          formatDateForInput(
            initialData.deliveryDate || initialData.DELIVERY_DATE
          ) || "",
        justificationDate:
          formatDateForInput(
            initialData.justificationDate || initialData.JUSTIFICATION_DATE
          ) || "",
      };

      console.log("📅 Datos formateados para formulario:", formattedData);
      setFormData(formattedData);
    }
  }, [initialData]);

  const loadFormOptions = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Cargando opciones del formulario...");

      const [costCentersRes, applicantsRes, areaSignaturesRes] =
        await Promise.all([
          CostCenterService.getAll(),
          applicantService.getAll(),
          AreaSignatureService.getAll(),
        ]);

      const costCentersData =
        costCentersRes.data?.data || costCentersRes.data || [];
      const applicantsData =
        applicantsRes.data?.data || applicantsRes.data || [];
      const areaSignaturesData =
        areaSignaturesRes.data?.data || areaSignaturesRes.data || [];

      setCostCenters(costCentersData);
      setApplicants(applicantsData);
      setAreaSignatures(areaSignaturesData);

    } catch (error) {
      console.error("❌ Error cargando opciones:", error);
      setError("Error al cargar las opciones del formulario");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fechas ISO a formato yyyy-MM-dd
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    if (
      typeof dateString === "string" &&
      dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return dateString;
    }

    if (typeof dateString === "string" && dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    if (dateString instanceof Date) {
      return dateString.toISOString().split("T")[0];
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    } catch (error) {
      console.error("❌ Error formateando fecha:", error);
    }

    return "";
  };

  // 🔥 VALIDACIONES COMPLETAS Y DETALLADAS
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'amount':
        if (!value || value.trim() === '') {
          errors.amount = '💰 El monto es requerido';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          errors.amount = '💰 El monto debe ser un número mayor a 0';
        } else if (parseFloat(value) > 200) {
          errors.amount = '💰 El monto máximo permitido es S/ 200.00';
        } else if (parseFloat(value) < 0.01) {
          errors.amount = '💰 El monto mínimo permitido es S/ 0.01';
        } else {
          delete errors.amount;
        }
        break;
        
      case 'activityToPerform':
        if (!value || value.trim() === '') {
          errors.activityToPerform = '📝 La descripción de la actividad es requerida';
        } else if (value.trim().length < 10) {
          errors.activityToPerform = '📝 La descripción debe tener al menos 10 caracteres';
        } else if (value.trim().length > 500) {
          errors.activityToPerform = '📝 La descripción no puede exceder los 500 caracteres';
        } else {
          delete errors.activityToPerform;
        }
        break;
        
      case 'costCenterId':
        if (!value || value === '') {
          errors.costCenterId = '🏢 Debe seleccionar un centro de costo';
        } else {
          delete errors.costCenterId;
        }
        break;
        
      case 'applicantId':
        if (!value || value === '') {
          errors.applicantId = '👤 Debe seleccionar un solicitante';
        } else {
          delete errors.applicantId;
        }
        break;
        
      case 'areaSignaturesId':
        if (!value || value === '') {
          errors.areaSignaturesId = '✍️ Debe seleccionar una firma de área';
        } else {
          delete errors.areaSignaturesId;
        }
        break;
        
      case 'requestDate':
        if (!value || value.trim() === '') {
          errors.requestDate = '📅 La fecha de solicitud es requerida';
        } else {
          const requestDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (requestDate < today) {
            errors.requestDate = '📅 La fecha de solicitud no puede ser anterior a hoy';
          } else {
            delete errors.requestDate;
          }
        }
        break;
        
      case 'deliveryDate':
        if (!value || value.trim() === '') {
          errors.deliveryDate = '📦 La fecha de entrega es requerida';
        } else {
          const deliveryDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const requestDate = new Date(formData.requestDate);
          
          if (deliveryDate < today) {
            errors.deliveryDate = '📦 La fecha de entrega no puede ser anterior a hoy';
          } else if (deliveryDate < requestDate) {
            errors.deliveryDate = '📦 La fecha de entrega no puede ser anterior a la fecha de solicitud';
          } else {
            delete errors.deliveryDate;
            
            // Calcular automáticamente la fecha de justificación (2 días después)
            const justificationDate = new Date(deliveryDate);
            justificationDate.setDate(justificationDate.getDate() + 2);
            
            setFormData(prev => ({
              ...prev,
              justificationDate: justificationDate.toISOString().split('T')[0]
            }));
          }
        }
        break;
        
      default:
        if (!value || value.toString().trim() === '') {
          errors[name] = 'Este campo es requerido';
        } else {
          delete errors[name];
        }
    }
    
    setFieldErrors(errors);
    return !errors[name]; // Retorna true si no hay error para este campo
  };

  // Validar todo el formulario
  const validateForm = () => {
    const fieldsToValidate = [
      'amount',
      'activityToPerform', 
      'costCenterId',
      'applicantId',
      'areaSignaturesId',
      'requestDate',
      'deliveryDate'
    ];
    
    let isValid = true;
    const newErrors = {};
    
    fieldsToValidate.forEach(field => {
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      if (!fieldIsValid) {
        isValid = false;
        newErrors[field] = fieldErrors[field] || 'Campo inválido';
      }
    });
    
    setFieldErrors(newErrors);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allFields = [
      'amount', 'activityToPerform', 'costCenterId', 'applicantId', 
      'areaSignaturesId', 'requestDate', 'deliveryDate'
    ];
    
    const newTouchedFields = {};
    allFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);

    setSaving(true);
    setError("");

    // 🔥 VALIDACIÓN COMPLETA DEL FORMULARIO
    if (!validateForm()) {
      setError("❌ Por favor corrija los errores marcados en rojo antes de enviar el formulario");
      setSaving(false);
      
      // Scroll al primer error
      const firstErrorField = document.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      return;
    }

    // Validación adicional del monto
    if (parseFloat(formData.amount) > 200) {
      setError("💰 El monto máximo permitido es S/ 200.00");
      setSaving(false);
      return;
    }

    try {
      console.log("📤 Enviando datos del formulario:", formData);

      const voucherData = {
        AMOUNT: parseFloat(formData.amount),
        ACTIVITY_TO_PERFORM: formData.activityToPerform.trim(),
        COST_CENTER_ID: parseInt(formData.costCenterId),
        APPLICANT_ID: parseInt(formData.applicantId),
        AREA_SIGNATURES_ID: parseInt(formData.areaSignaturesId),
        REQUEST_DATE: formData.requestDate,
        DELIVERY_DATE: formData.deliveryDate || null,
        JUSTIFICATION_DATE: formData.justificationDate || null,
      };

      console.log("📦 Datos preparados para enviar:", voucherData);

      let result;
      if (initialData) {
        const updateData = {
          ...voucherData,
          ID_VOUCHER: initialData.idVoucher || initialData.ID_VOUCHER,
        };
        console.log("🔄 Actualizando vale:", updateData);
        result = await VoucherService.update(updateData);
      } else {
        console.log("🆕 Creando nuevo vale:", voucherData);
        result = await VoucherService.create(voucherData);
      }

      console.log("✅ Respuesta del servidor:", result);

      if (onSubmit) {
        onSubmit(result.data);
      }

      alert(
        initialData
          ? "✅ Vale actualizado exitosamente"
          : "✅ Vale creado exitosamente"
      );
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      console.error("🔧 Detalles del error:", error.response?.data);
      setError(
        error.response?.data?.message ||
          "❌ Error al guardar el vale. Por favor, verifique los datos e intente nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  const getDisplayName = (item, type) => {
    if (!item) return "";

    switch (type) {
      case "costCenter":
        return (
          item.cost_center_name ||
          item.COST_CENTER_NAME ||
          item.description ||
          `Centro ${item.id_cost_center || item.ID_COST_CENTER}`
        );

      case "applicant":
        const firstName =
          item.first_name || item.FIRST_NAME || item.applicant_name || "";
        const lastName =
          item.last_name || item.LAST_NAME || item.applicant_lastname || "";
        return (
          `${firstName} ${lastName}`.trim() ||
          `Solicitante ${item.id_applicant || item.ID_APPLICANT}`
        );

      case "areaSignature":
        const managerName = item.manager_name || item.MANAGER_NAME || "";
        const managerLastname =
          item.manager_lastname || item.MANAGER_LASTNAME || "";
        const areaName = item.area || item.AREA || "";
        return (
          `${managerName} ${managerLastname}`.trim() ||
          areaName ||
          `Firma ${item.id_signature || item.ID_SIGNATURE}`
        );

      default:
        return "";
    }
  };

  // Contador de caracteres para la actividad
  const activityCharCount = formData.activityToPerform.length;
  const activityMaxChars = 500;

  if (loading) {
    return (
      <div className="form-loading">
        <Loader size={32} className="loading-spinner" />
        <p>Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="voucher-form-container">
      <div className="voucher-form">

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="form-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* PRIMERA FILA - 2 COLUMNAS */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="amount" className="form-label">
                <DollarSign size={16} />
                Monto (Soles) <span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.amount ? 'error' : ''} ${touchedFields.amount && !fieldErrors.amount ? 'success' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max="200"
                required
              />
              <div className="field-info">
                <small>Máximo: S/ 200.00 | Mínimo: S/ 0.01</small>
              </div>
              {fieldErrors.amount && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  <span>{fieldErrors.amount}</span>
                </div>
              )}
              {touchedFields.amount && !fieldErrors.amount && (
                <div className="field-success">
                  <CheckCircle size={12} />
                  <span>Monto válido</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="costCenterId" className="form-label">
                <Building size={16} />
                Centro de Costo <span className="required-asterisk">*</span>
              </label>
              <select
                id="costCenterId"
                name="costCenterId"
                value={formData.costCenterId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${fieldErrors.costCenterId ? 'error' : ''} ${touchedFields.costCenterId && !fieldErrors.costCenterId ? 'success' : ''}`}
                required
              >
                <option value="">Seleccione un centro de costo</option>
                {costCenters.map((center, index) => (
                  <option
                    key={
                      center.id_cost_center || center.ID_COST_CENTER || index
                    }
                    value={center.id_cost_center || center.ID_COST_CENTER}
                  >
                    {getDisplayName(center, "costCenter")}
                  </option>
                ))}
              </select>
              {fieldErrors.costCenterId && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  <span>{fieldErrors.costCenterId}</span>
                </div>
              )}
              {touchedFields.costCenterId && !fieldErrors.costCenterId && formData.costCenterId && (
                <div className="field-success">
                  <CheckCircle size={12} />
                  <span>Centro de costo seleccionado</span>
                </div>
              )}
            </div>
          </div>

          {/* SEGUNDA FILA - 2 COLUMNAS */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="applicantId" className="form-label">
                <User size={16} />
                Solicitante <span className="required-asterisk">*</span>
              </label>
              <select
                id="applicantId"
                name="applicantId"
                value={formData.applicantId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${fieldErrors.applicantId ? 'error' : ''} ${touchedFields.applicantId && !fieldErrors.applicantId ? 'success' : ''}`}
                required
              >
                <option value="">Seleccione un solicitante</option>
                {applicants.map((applicant, index) => (
                  <option
                    key={
                      applicant.id_applicant || applicant.ID_APPLICANT || index
                    }
                    value={applicant.id_applicant || applicant.ID_APPLICANT}
                  >
                    {getDisplayName(applicant, "applicant")}
                  </option>
                ))}
              </select>
              {fieldErrors.applicantId && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  <span>{fieldErrors.applicantId}</span>
                </div>
              )}
              {touchedFields.applicantId && !fieldErrors.applicantId && formData.applicantId && (
                <div className="field-success">
                  <CheckCircle size={12} />
                  <span>Solicitante seleccionado</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="areaSignaturesId" className="form-label">
                <User size={16} />
                Firma del Área <span className="required-asterisk">*</span>
              </label>
              <select
                id="areaSignaturesId"
                name="areaSignaturesId"
                value={formData.areaSignaturesId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${fieldErrors.areaSignaturesId ? 'error' : ''} ${touchedFields.areaSignaturesId && !fieldErrors.areaSignaturesId ? 'success' : ''}`}
                required
              >
                <option value="">Seleccione una firma de área</option>
                {areaSignatures.map((signature, index) => (
                  <option
                    key={
                      signature.id_signature || signature.ID_SIGNATURE || index
                    }
                    value={signature.id_signature || signature.ID_SIGNATURE}
                  >
                    {getDisplayName(signature, "areaSignature")}
                  </option>
                ))}
              </select>
              {fieldErrors.areaSignaturesId && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  <span>{fieldErrors.areaSignaturesId}</span>
                </div>
              )}
              {touchedFields.areaSignaturesId && !fieldErrors.areaSignaturesId && formData.areaSignaturesId && (
                <div className="field-success">
                  <CheckCircle size={12} />
                  <span>Firma de área seleccionada</span>
                </div>
              )}
            </div>
          </div>

          {/* TERCERA FILA - FECHAS REQUERIDAS */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="requestDate" className="form-label">
                <Calendar size={16} />
                Fecha de Solicitud <span className="required-asterisk">*</span>
              </label>
              <input
                type="date"
                id="requestDate"
                name="requestDate"
                value={formData.requestDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.requestDate ? 'error' : ''} ${touchedFields.requestDate && !fieldErrors.requestDate ? 'success' : ''}`}
                required
              />
              {fieldErrors.requestDate && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  <span>{fieldErrors.requestDate}</span>
                </div>
              )}
              {touchedFields.requestDate && !fieldErrors.requestDate && (
                <div className="field-success">
                  <CheckCircle size={12} />
                  <span>Fecha válida</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryDate" className="form-label">
                <Calendar size={16} />
                Fecha de Entrega <span className="required-asterisk">*</span>
              </label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.deliveryDate ? 'error' : ''} ${touchedFields.deliveryDate && !fieldErrors.deliveryDate ? 'success' : ''}`}
                min={formData.requestDate || new Date().toISOString().split('T')[0]}
                required
              />
              <div className="field-info">
                <small>Se calculará automáticamente fecha de justificación (+2 días)</small>
              </div>
              {fieldErrors.deliveryDate && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  <span>{fieldErrors.deliveryDate}</span>
                </div>
              )}
              {touchedFields.deliveryDate && !fieldErrors.deliveryDate && (
                <div className="field-success">
                  <CheckCircle size={12} />
                  <span>Fecha válida</span>
                </div>
              )}
            </div>
          </div>

          {/* CUARTA FILA - FECHA CALCULADA AUTOMÁTICAMENTE */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="justificationDate" className="form-label">
                <Calendar size={16} />
                Fecha Límite de Justificación
              </label>
              <input
                type="date"
                id="justificationDate"
                name="justificationDate"
                value={formData.justificationDate}
                onChange={handleChange}
                className="form-input"
                readOnly
                style={{ backgroundColor: '#f8f9fa', color: '#495057', borderColor: '#dee2e6' }}
              />
              <div className="field-info">
                <small>Calculada automáticamente (2 días después de la entrega)</small>
              </div>
            </div>

            <div className="form-group">
              {/* Espacio vacío para mantener balance */}
            </div>
          </div>

          {/* QUINTA FILA - ACTIVIDAD */}
          <div className="form-grid">
            <div className="form-group form-full-width">
              <label htmlFor="activityToPerform" className="form-label">
                <FileText size={16} />
                Actividad a Realizar <span className="required-asterisk">*</span>
              </label>
              <textarea
                id="activityToPerform"
                name="activityToPerform"
                value={formData.activityToPerform}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-textarea ${fieldErrors.activityToPerform ? 'error' : ''} ${touchedFields.activityToPerform && !fieldErrors.activityToPerform ? 'success' : ''}`}
                placeholder="Describa detalladamente la actividad a realizar con el vale provisional..."
                rows="4"
                minLength="10"
                maxLength="500"
                required
              />
              <div className="field-info">
                <div className="char-counter">
                  <small>
                    {activityCharCount} / {activityMaxChars} caracteres
                    {activityCharCount < 10 && ` (mínimo ${10 - activityCharCount} más)`}
                  </small>
                </div>
              </div>
              {fieldErrors.activityToPerform && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  <span>{fieldErrors.activityToPerform}</span>
                </div>
              )}
              {touchedFields.activityToPerform && !fieldErrors.activityToPerform && (
                <div className="field-success">
                  <CheckCircle size={12} />
                  <span>Descripción válida</span>
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN DE VALIDACIÓN */}
          <div className="validation-summary">
            <div className={`summary-card ${Object.keys(fieldErrors).length === 0 ? 'valid' : 'invalid'}`}>
              {Object.keys(fieldErrors).length === 0 ? (
                <>
                  <CheckCircle size={16} />
                  <span>Todos los campos están correctamente completados</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>Hay {Object.keys(fieldErrors).length} campo(s) que requieren atención</span>
                </>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={saving}
            >
              <X size={18} />
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={saving || Object.keys(fieldErrors).length > 0}
              title={Object.keys(fieldErrors).length > 0 ? "Corrija los errores antes de enviar" : ""}
            >
              {saving ? (
                <Loader size={18} className="loading-spinner" />
              ) : (
                <Save size={18} />
              )}
              {saving
                ? "Guardando..."
                : initialData
                ? "Actualizar Vale"
                : "Crear Vale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherForm;