// src/components/asistencia/student/justificacion/NewJustificationBatchForm.jsx
// PARTE 1 DE 2

import React, { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import JustificationBatchService from "../../../../services/asistencia/student/justificacion/JustificationBatchService";
import { getUnjustifiedAbsences } from "../../../../services/asistencia/student/asistencia/attendanceService";
import { getCurrentStudentId } from "../../../../services/asistencia/student/studentConfig";
import { INASISTENCIAS_API } from "../../../../services/api";

const NewJustificationBatchForm = ({ isVisible, onClose, onSuccess }) => {
  const studentId = getCurrentStudentId();

  const [formData, setFormData] = useState({
    studentId: studentId,
    categoria: "",
    descripcion: "",
    tipoDocumento: "",
    otroTipoDocumento: "",
    archivo: null,
    faltasSeleccionadas: [],
  });

  const [fileName, setFileName] = useState("Sin archivos seleccionados");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);

  const [availableAbsences, setAvailableAbsences] = useState([]);
  const [loadingAbsences, setLoadingAbsences] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchAvailableAbsences();
      resetForm();
    }
  }, [isVisible]);

  const fetchAvailableAbsences = async () => {
    setLoadingAbsences(true);
    setErrors({});
    try {
      const absences = await getUnjustifiedAbsences(studentId);
      setAvailableAbsences(absences);

      if (absences.length === 0) {
        setErrors({ fetch: "No tienes faltas pendientes de justificar" });
      }
    } catch (err) {
      console.error("Error loading absences:", err);
      setErrors({ fetch: "Error al cargar las faltas disponibles" });
    } finally {
      setLoadingAbsences(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: studentId,
      categoria: "",
      descripcion: "",
      tipoDocumento: "",
      otroTipoDocumento: "",
      archivo: null,
      faltasSeleccionadas: [],
    });
    setFileName("Sin archivos seleccionados");
    setSelectAll(false);
    setErrors({});
    setTouched({});
    setSuccess(false);
  };

  // ✅ VALIDACIÓN POR CAMPO
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "faltasSeleccionadas":
        if (!value || value.length === 0) {
          newErrors.faltasSeleccionadas = "Debes seleccionar al menos 2 faltas";
        } else if (value.length === 1) {
          newErrors.faltasSeleccionadas =
            "Debes seleccionar al menos 2 faltas (tienes solo 1 seleccionada)";
        } else {
          delete newErrors.faltasSeleccionadas;
        }
        break;

      case "categoria":
        if (!value) {
          newErrors.categoria = "Debes seleccionar una categoría";
        } else {
          delete newErrors.categoria;
        }
        break;

      case "descripcion":
        if (!value.trim()) {
          newErrors.descripcion = "La descripción es obligatoria";
        } else if (value.trim().length < 5) {
          newErrors.descripcion =
            "La descripción debe tener al menos 5 caracteres";
        } else {
          delete newErrors.descripcion;
        }
        break;

      case "tipoDocumento":
        if (!value) {
          newErrors.tipoDocumento = "Debes seleccionar un tipo de documento";
        } else {
          delete newErrors.tipoDocumento;
        }
        break;

      case "otroTipoDocumento":
        if (formData.tipoDocumento === "other") {
          if (!value.trim()) {
            newErrors.otroTipoDocumento =
              "Debes especificar el tipo de documento";
          } else if (value.trim().length < 3) {
            newErrors.otroTipoDocumento = "Especifica al menos 3 caracteres";
          } else {
            delete newErrors.otroTipoDocumento;
          }
        }
        break;

      case "archivo":
        if (!formData.archivo) {
          newErrors.archivo = "Debes adjuntar un archivo PDF como evidencia";
        } else {
          delete newErrors.archivo;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    
    if (name === "tipoDocumento" && value !== "other") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        otroTipoDocumento: "",
      }));
      const newErrors = { ...errors };
      delete newErrors.otroTipoDocumento;
      setErrors(newErrors);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleAbsenceToggle = (attendanceId) => {
    const newSelection = formData.faltasSeleccionadas.includes(attendanceId)
      ? formData.faltasSeleccionadas.filter((id) => id !== attendanceId)
      : [...formData.faltasSeleccionadas, attendanceId];

    setFormData((prev) => ({ ...prev, faltasSeleccionadas: newSelection }));

    if (touched.faltasSeleccionadas) {
      validateField("faltasSeleccionadas", newSelection);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setFormData((prev) => ({ ...prev, faltasSeleccionadas: [] }));
      validateField("faltasSeleccionadas", []);
    } else {
      const allIds = availableAbsences.map((abs) => abs.attendanceId);
      setFormData((prev) => ({ ...prev, faltasSeleccionadas: allIds }));
      validateField("faltasSeleccionadas", allIds);
    }
    setSelectAll(!selectAll);
    setTouched((prev) => ({ ...prev, faltasSeleccionadas: true }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const newErrors = { ...errors };

    if (file) {
      // ✅ SOLO PDF
      if (file.type !== "application/pdf") {
        newErrors.archivo = "Solo se permiten archivos PDF";
        setErrors(newErrors);
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        newErrors.archivo = "El archivo no debe superar los 5MB";
        setErrors(newErrors);
        e.target.value = "";
        return;
      }

      delete newErrors.archivo;
      setErrors(newErrors);
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, archivo: file }));
    } else {
      handleRemoveFile();
    }
  };

  const handleRemoveFile = () => {
    setFileName("Sin archivos seleccionados");
    setFormData((prev) => ({ ...prev, archivo: null }));
    const fileInput = document.getElementById("file-upload-batch");
    if (fileInput) fileInput.value = "";
    const newErrors = { ...errors };
    delete newErrors.archivo;
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.faltasSeleccionadas ||
      formData.faltasSeleccionadas.length === 0
    ) {
      newErrors.faltasSeleccionadas = "Debes seleccionar al menos 2 faltas";
    } else if (formData.faltasSeleccionadas.length === 1) {
      newErrors.faltasSeleccionadas =
        "Debes seleccionar al menos 2 faltas (tienes solo 1 seleccionada)";
    }

    if (!formData.categoria) {
      newErrors.categoria = "Debes seleccionar una categoría";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    } else if (formData.descripcion.trim().length < 5) {
      newErrors.descripcion = "La descripción debe tener al menos 5 caracteres";
    }

    if (!formData.tipoDocumento) {
      newErrors.tipoDocumento = "Debes seleccionar un tipo de documento";
    }

    if (
      formData.tipoDocumento === "other" &&
      !formData.otroTipoDocumento.trim()
    ) {
      newErrors.otroTipoDocumento = "Debes especificar el tipo de documento";
    } else if (
      formData.tipoDocumento === "other" &&
      formData.otroTipoDocumento.trim().length < 3
    ) {
      newErrors.otroTipoDocumento = "Especifica al menos 3 caracteres";
    }

    if (!formData.archivo) {
      newErrors.archivo = "Debes adjuntar un archivo PDF como evidencia";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 MÉTODO handleSubmit CORREGIDO
  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      faltasSeleccionadas: true,
      categoria: true,
      descripcion: true,
      tipoDocumento: true,
      otroTipoDocumento: true,
    });

    if (!validateForm()) {
      console.log("❌ Validación falló:", errors);
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Subir archivo PDF
      let attachmentPath = null;
      if (formData.archivo) {
        console.log("📤 Subiendo archivo:", formData.archivo.name);
        
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.archivo);

        const uploadResponse = await INASISTENCIAS_API.post(
          "/api/v1/uploads/upload",
          uploadFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        attachmentPath = uploadResponse.data.filename;
        console.log("✅ Archivo subido:", attachmentPath);
      }

      
      let finalDocumentType;
      if (formData.tipoDocumento === "other") {
        finalDocumentType = formData.otroTipoDocumento.trim();
        console.log("📝 Tipo personalizado:", finalDocumentType);
      } else {
        finalDocumentType = formData.tipoDocumento;
        console.log("📄 Tipo predefinido:", finalDocumentType);
      }

      // 3️⃣ Construir payload
      const batchData = {
        studentId: parseInt(formData.studentId),
        reasonCategory: formData.categoria,
        generalDescription: formData.descripcion.trim(),
        documentType: finalDocumentType, // 🔥 CORREGIDO
        attachmentPath: attachmentPath,
        attendanceDetails: formData.faltasSeleccionadas.map((attendanceId) => ({
          attendanceId: parseInt(attendanceId),
          specificReason: null,
          comments: null,
        })),
        notes: null,
      };

      // 4️⃣ Log de debugging
      console.log("📋 Payload completo:");
      console.log(JSON.stringify(batchData, null, 2));

      // 5️⃣ Enviar al backend
      const response = await JustificationBatchService.createBatch(batchData);
      console.log("✅ Respuesta del backend:", response);

      setSuccess(true);
      resetForm();
      
      if (document.getElementById("file-upload-batch")) {
        document.getElementById("file-upload-batch").value = "";
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
      
    } catch (err) {
      console.error("❌ Error completo:", err);
      console.error("📋 Detalles:", err.response?.data);
      
      let errorMessage = "Error al crear la solicitud agrupada";
      
      if (err.response?.data?.details) {
        errorMessage = err.response.data.details.join(", ");
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;// PARTE 2 DE 2 - CONTINUACIÓN DEL RETURN

  return (
    <div className="mb-6">
      {/* ALERTA DE INFORMACIÓN */}
      <div
        className="p-4 mb-6 rounded-lg shadow-md flex items-start text-sm"
        style={{
          backgroundColor: "#1e40af",
          color: "#fff",
          border: "2px solid #1e3a8a",
          boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
        }}
      >
        <ExclamationTriangleIcon className="w-5 h-5 mr-3 mt-0.5 min-w-5" />
        <div>
          <p style={{ fontWeight: 800, marginBottom: "0.25rem" }}>
            💡 Justificación Agrupada
          </p>
          <p style={{ fontWeight: 600 }}>
            Con esta opción puedes justificar{" "}
            <strong>múltiples faltas a la vez</strong> con un solo documento.
          </p>
        </div>
      </div>

      {/* ALERTA DE PLAZO */}
      <div
        className="p-4 mb-6 rounded-lg shadow-md flex items-start text-sm"
        style={{
          backgroundColor: "#ca8a04",
          color: "#fff",
          border: "2px solid #a16207",
          boxShadow: "0 4px 12px rgba(202, 138, 4, 0.3)",
        }}
      >
        <ExclamationTriangleIcon className="w-5 h-5 mr-3 mt-0.5 min-w-5" />
        <p style={{ fontWeight: 600 }}>
          <strong style={{ fontWeight: 800 }}>Importante:</strong> Las
          justificaciones deben enviarse dentro de las 48 horas posteriores a la
          falta más antigua.
        </p>
      </div>

      {/* MENSAJES DE ERROR */}
      {errors.submit && (
        <div
          className="px-4 py-3 rounded-lg mb-4 flex items-start"
          style={{
            backgroundColor: "#dc2626",
            border: "2px solid #ef4444",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
          }}
        >
          <XMarkIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p style={{ fontWeight: 700 }}>{errors.submit}</p>
        </div>
      )}

      {/* MENSAJES DE ÉXITO */}
      {success && (
        <div
          className="px-4 py-3 rounded-lg mb-4 flex items-start"
          style={{
            backgroundColor: "#16a34a",
            border: "2px solid #15803d",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.4)",
          }}
        >
          <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p style={{ fontWeight: 700 }}>
            ✓ Solicitud agrupada enviada exitosamente
          </p>
        </div>
      )}

      {/* FORMULARIO */}
      <div
        className="p-6 rounded-lg shadow-xl"
        style={{
          backgroundColor: "#cbd5e1",
          border: "2px solid #94a3b8",
        }}
      >
        <h2
          className="text-xl mb-1"
          style={{
            fontWeight: 800,
            color: "#0f172a",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
            letterSpacing: "-0.01em",
          }}
        >
          Nueva Justificación Agrupada
        </h2>
        <p
          className="text-sm mb-6 pb-4"
          style={{
            color: "#334155",
            fontWeight: 600,
            borderBottom: "2px solid #94a3b8",
          }}
        >
          Justifica múltiples faltas con una sola solicitud
        </p>

        <form onSubmit={handleSubmit}>
          {/* Seleccionar Faltas */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label
                className="block text-sm"
                style={{ fontWeight: 700, color: "#0f172a" }}
              >
                Seleccionar Faltas a Justificar * (
                {formData.faltasSeleccionadas.length} seleccionadas - mínimo 2)
              </label>
              {availableAbsences.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs px-3 py-1 rounded-md transition"
                  style={{
                    backgroundColor: "#1e40af",
                    color: "#fff",
                    fontWeight: 800,
                    border: "2px solid #1e3a8a",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {selectAll ? "Deseleccionar todas" : "Seleccionar todas"}
                </button>
              )}
            </div>

            {loadingAbsences ? (
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  backgroundColor: "#fff",
                  color: "#334155",
                  border: "2px solid #94a3b8",
                  fontWeight: 600,
                }}
              >
                Cargando faltas disponibles...
              </div>
            ) : availableAbsences.length === 0 ? (
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  backgroundColor: "#fff",
                  color: "#334155",
                  border: "2px solid #94a3b8",
                  fontWeight: 600,
                }}
              >
                {errors.fetch || "No tienes faltas pendientes de justificar"}
              </div>
            ) : (
              <>
                <div
                  className={`max-h-60 overflow-y-auto rounded-lg ${
                    errors.faltasSeleccionadas && touched.faltasSeleccionadas
                      ? "border-red-500"
                      : "border-slate-400"
                  }`}
                  style={{
                    backgroundColor: "#fff",
                    border: "2px solid",
                  }}
                >
                  {availableAbsences.map((absence) => (
                    <label
                      key={absence.attendanceId}
                      className="flex items-center p-3 cursor-pointer transition border-b last:border-b-0"
                      style={{
                        borderColor: "#94a3b8",
                        backgroundColor: formData.faltasSeleccionadas.includes(
                          absence.attendanceId
                        )
                          ? "#dbeafe"
                          : "transparent",
                      }}
                      onClick={() => {
                        handleAbsenceToggle(absence.attendanceId);
                        setTouched((prev) => ({
                          ...prev,
                          faltasSeleccionadas: true,
                        }));
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.faltasSeleccionadas.includes(
                          absence.attendanceId
                        )}
                        onChange={() => {}}
                        className="w-4 h-4 rounded focus:ring-2"
                        style={{ accentColor: "#1e40af" }}
                      />
                      <div className="ml-3 flex-1">
                        <p
                          className="text-sm"
                          style={{ fontWeight: 700, color: "#0f172a" }}
                        >
                          {absence.courseName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "#64748b", fontWeight: 600 }}
                        >
                          {JustificationBatchService.formatDate(
                            absence.classDate
                          )}
                          {absence.classTime &&
                            ` - ${new Date(
                              absence.classTime
                            ).toLocaleTimeString("es-PE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.faltasSeleccionadas && touched.faltasSeleccionadas && (
                  <div className="flex items-center mt-2 text-red-600 text-sm font-semibold">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {errors.faltasSeleccionadas}
                  </div>
                )}
                <p
                  className="text-xs mt-2"
                  style={{ color: "#64748b", fontWeight: 600 }}
                >
                  💡 Selecciona todas las faltas relacionadas al mismo motivo
                  (mínimo 2)
                </p>
              </>
            )}
          </div>

          {/* Categoría */}
          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Categoría del Motivo *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-3 cursor-pointer transition ${
                errors.categoria && touched.categoria
                  ? "border-red-500"
                  : "border-slate-400"
              }`}
              style={{
                backgroundColor: "#fff",
                color: "#0f172a",
                border: "2px solid",
                fontWeight: 600,
              }}
            >
              <option value="">-- Selecciona una categoría --</option>
              <option value="medical">
                🏥 Médica (enfermedad, cita médica)
              </option>
              <option value="family">
                👨‍👩‍👧‍👦 Familiar (emergencia, fallecimiento)
              </option>
              <option value="personal">
                👤 Personal (trámites, gestiones)
              </option>
              <option value="academic">
                📚 Académica (eventos, representación)
              </option>
              <option value="emergency">
                🚨 Emergencia (situación imprevista)
              </option>
            </select>
            {errors.categoria && touched.categoria && (
              <div className="flex items-center mt-2 text-red-600 text-sm font-semibold">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.categoria}
              </div>
            )}
          </div>

          {/* Descripción General */}
          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Descripción General *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="4"
              placeholder="Explica el motivo general de todas las faltas seleccionadas..."
              className={`w-full rounded-lg p-3 resize-none transition ${
                errors.descripcion && touched.descripcion
                  ? "border-red-500"
                  : "border-slate-400"
              }`}
              style={{
                backgroundColor: "#fff",
                color: "#0f172a",
                border: "2px solid",
                fontWeight: 600,
              }}
            ></textarea>
            <div className="flex justify-between items-start mt-1">
              <p className="text-xs text-slate-600 font-semibold">
                {formData.descripcion.length} caracteres (mínimo 5)
              </p>
              {errors.descripcion && touched.descripcion && (
                <div className="flex items-center text-red-600 text-sm font-semibold">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.descripcion}
                </div>
              )}
            </div>
          </div>

     
          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Tipo de Documento *
            </label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-3 cursor-pointer transition ${
                errors.tipoDocumento && touched.tipoDocumento
                  ? "border-red-500"
                  : "border-slate-400"
              }`}
              style={{
                backgroundColor: "#fff",
                color: "#0f172a",
                border: "2px solid",
                fontWeight: 600,
              }}
            >
              <option value="">-- Selecciona un tipo --</option>
              <option value="medical_certificate">Certificado Médico</option>
              <option value="death_certificate">Acta de Defunción</option>
              <option value="travel_document">Documento de Viaje</option>
              <option value="court_order">Orden Judicial</option>
              <option value="institutional_letter">Carta Institucional</option>
             
            </select>
            {errors.tipoDocumento && touched.tipoDocumento && (
              <div className="flex items-center mt-2 text-red-600 text-sm font-semibold">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.tipoDocumento}
              </div>
            )}
          </div>

         
          {/* Archivo PDF */}
          <div className="mb-8">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Documento de Evidencia (PDF - Opcional)
            </label>

            <div className="flex items-center space-x-3">
              <label
                htmlFor="file-upload-batch"
                className="font-semibold py-2 px-4 rounded-lg cursor-pointer transition duration-200 flex items-center"
                style={{
                  backgroundColor: "#64748b",
                  color: "#fff",
                  fontWeight: 800,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Seleccionar PDF
              </label>

              {formData.archivo && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 rounded-lg transition duration-200"
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    border: "2px solid #b91c1c",
                  }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}

              <input
                id="file-upload-batch"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="mt-2 flex items-center space-x-2">
              <span
                className="text-sm italic font-semibold"
                style={{ color: formData.archivo ? "#16a34a" : "#64748b" }}
              >
                {fileName}
              </span>
            </div>

            {errors.archivo && (
              <div className="flex items-center mt-2 text-red-600 text-sm font-semibold">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.archivo}
              </div>
            )}

            <p
              className="text-xs mt-2"
              style={{ color: "#64748b", fontWeight: 600 }}
            >
              Solo archivos PDF. Máximo 5MB. Solo 1 archivo permitido.
            </p>
          </div>

          {/* Resumen */}
          {formData.faltasSeleccionadas.length > 0 && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: "#dbeafe",
                border: "2px solid #3b82f6",
              }}
            >
              <p
                className="text-sm mb-2"
                style={{ fontWeight: 700, color: "#1e40af" }}
              >
                📋 Resumen de tu solicitud:
              </p>
              <ul
                className="text-sm space-y-1"
                style={{ color: "#0f172a", fontWeight: 600 }}
              >
                <li>
                  •{" "}
                  <strong style={{ fontWeight: 800 }}>
                    {formData.faltasSeleccionadas.length}
                  </strong>{" "}
                  falta(s) seleccionada(s)
                </li>
                <li>
                  • Categoría:{" "}
                  <strong style={{ fontWeight: 800 }}>
                    {formData.categoria || "No seleccionada"}
                  </strong>
                </li>
                <li>
                  • Tipo de documento:{" "}
                  <strong style={{ fontWeight: 800 }}>
                    {formData.tipoDocumento === "other" &&
                    formData.otroTipoDocumento
                      ? formData.otroTipoDocumento
                      : formData.tipoDocumento || "No seleccionado"}
                  </strong>
                </li>
                <li>
                  • Documento:{" "}
                  <strong style={{ fontWeight: 800 }}>
                    {formData.archivo ? "✓ Adjunto" : "✗ Sin adjuntar"}
                  </strong>
                </li>
              </ul>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              disabled={
                loading ||
                availableAbsences.length === 0 ||
                loadingAbsences ||
                formData.faltasSeleccionadas.length < 2
              }
              className="font-semibold py-2 px-6 rounded-lg shadow-md flex items-center transition duration-200"
              style={{
                backgroundColor:
                  loading ||
                  availableAbsences.length === 0 ||
                  loadingAbsences ||
                  formData.faltasSeleccionadas.length < 2
                    ? "#94a3b8"
                    : "#16a34a",
                color: "#fff",
                fontWeight: 800,
                border: `2px solid ${
                  loading ||
                  availableAbsences.length === 0 ||
                  loadingAbsences ||
                  formData.faltasSeleccionadas.length < 2
                    ? "#64748b"
                    : "#15803d"
                }`,
                cursor:
                  loading ||
                  availableAbsences.length === 0 ||
                  loadingAbsences ||
                  formData.faltasSeleccionadas.length < 2
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-5 h-5 mr-1" />
                  Enviar Solicitud Agrupada
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="font-semibold py-2 px-6 rounded-lg transition duration-200"
              style={{
                backgroundColor: "transparent",
                color: "#0f172a",
                fontWeight: 800,
                border: "2px solid #94a3b8",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJustificationBatchForm;