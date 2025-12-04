// src/components/asistencia/student/justificacion/NewJustificationForm.jsx

import React, { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import JustificacionService from "../../../../services/asistencia/student/justificacion/JustificacionService";
import { getUnjustifiedAbsences } from "../../../../services/asistencia/student/asistencia/attendanceService";
import { getCurrentStudentId } from "../../../../services/asistencia/student/studentConfig";
import { INASISTENCIAS_API } from "../../../../services/api";

// ✅ Prop resendData para datos del reenvío
const NewJustificationSection = ({
  isVisible,
  onClose,
  onSuccess,
  resendData = null,
}) => {
  const studentId = getCurrentStudentId();

  const [formData, setFormData] = useState({
    attendanceId: "",
    motivo: "",
    descripcion: "",
    archivo: null,
  });

  const [fileName, setFileName] = useState("Sin archivos seleccionados");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);

  const [availableAbsences, setAvailableAbsences] = useState([]);
  const [loadingAbsences, setLoadingAbsences] = useState(false);

  useEffect(() => {
    if (isVisible) {
      if (resendData) {
        console.log("🔄 Loading resend data:", resendData);
        setFormData((prev) => ({
          ...prev,
          attendanceId: resendData.attendanceId?.toString() || "",
          motivo: resendData.previousReason || "",
          descripcion: resendData.previousDescription || "",
        }));
      } else {
        // 🔥 Si NO hay resendData, limpiar todo
        console.log("🧹 Cleaning form for new justification");
        setFormData((prev) => ({
          ...prev,
          attendanceId: "",
          motivo: "",
          descripcion: "",
        }));
      }

      setTouched({});
      setErrors({});

      fetchAvailableAbsences();
    }
  }, [resendData, isVisible]);

  useEffect(() => {
    if (isVisible) {
      fetchAvailableAbsences();
    }
  }, [isVisible]);

  const fetchAvailableAbsences = async () => {
    setLoadingAbsences(true);
    setErrors({});

    try {
      console.log("📋 Fetching available absences...");
      const absences = await getUnjustifiedAbsences(studentId);

      console.log("✅ Absences received:", absences);

      if (resendData && resendData.attendanceId) {
        const resendAbsence = {
          attendanceId: resendData.attendanceId,
          courseName: resendData.courseName || "Curso",
          classDate: resendData.classDate || new Date().toISOString(),
          classTime: null,
          label: `${resendData.courseName || "Curso"} - ${
            resendData.classDate || "Fecha"
          }`,
        };

        const exists = absences.some(
          (a) => a.attendanceId === resendData.attendanceId
        );
        if (!exists) {
          console.log("📌 Adding resend absence to list");
          absences.unshift(resendAbsence);
        }
      }

      setAvailableAbsences(absences);

      if (absences.length === 0 && !resendData) {
        setErrors({ fetch: "No tienes faltas pendientes de justificar" });
      }
    } catch (err) {
      console.error("❌ Error loading absences:", err);
      setErrors({ fetch: `Error al cargar las faltas: ${err.message}` });
      setAvailableAbsences([]);
    } finally {
      setLoadingAbsences(false);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "attendanceId":
        if (!value) {
          newErrors.attendanceId =
            "Debes seleccionar una falta para justificar";
        } else {
          delete newErrors.attendanceId;
        }
        break;

      case "motivo":
        const motivoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.\-]+$/;
        if (!value.trim()) {
          newErrors.motivo = "El motivo es obligatorio";
        } else if (value.trim().length < 5) {
          newErrors.motivo = "El motivo debe tener al menos 5 caracteres";
        } else if (!motivoRegex.test(value)) {
          newErrors.motivo =
            "Solo se permiten letras, espacios y puntuación básica";
        } else {
          delete newErrors.motivo;
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const newErrors = { ...errors };

    if (file) {
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
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
    const newErrors = { ...errors };
    delete newErrors.archivo;
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.attendanceId) {
      newErrors.attendanceId = "Debes seleccionar una falta para justificar";
    }

    const motivoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.\-]+$/;
    if (!formData.motivo.trim()) {
      newErrors.motivo = "El motivo es obligatorio";
    } else if (formData.motivo.trim().length < 5) {
      newErrors.motivo = "El motivo debe tener al menos 5 caracteres";
    } else if (!motivoRegex.test(formData.motivo)) {
      newErrors.motivo =
        "Solo se permiten letras, espacios y puntuación básica";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    } else if (formData.descripcion.trim().length < 5) {
      newErrors.descripcion = "La descripción debe tener al menos 5 caracteres";
    }

    if (!formData.archivo) {
      newErrors.archivo = "Debes adjuntar un archivo PDF como evidencia";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      attendanceId: true,
      motivo: true,
      descripcion: true,
    });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let attachmentFile = null;
      if (formData.archivo) {
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

        attachmentFile = uploadResponse.data.filename;
      }

      const justificationData = {
        attendanceId: parseInt(formData.attendanceId),
        reason: formData.motivo.trim(),
        description: formData.descripcion.trim(),
        attachmentFile: attachmentFile,
      };

      const response = await JustificacionService.createJustification(
        justificationData
      );

      setSuccess(true);

      setFormData({
        attendanceId: "",
        motivo: "",
        descripcion: "",
        archivo: null,
      });
      setFileName("Sin archivos seleccionados");
      setTouched({});
      setErrors({});

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setErrors({ submit: err.message || "Error al enviar la justificación" });
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6">
      {/* 🆕 ALERTA DE REENVÍO */}
      {resendData && resendData.reviewComments && (
        <div
          className="p-4 mb-6 rounded-lg shadow-md border-2"
          style={{
            backgroundColor: "#fee2e2",
            borderColor: "#dc2626",
          }}
        >
          <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-[#dc2626] mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-extrabold text-[#7f1d1d] mb-2">
                📋 Reenvío de Justificación Rechazada
              </p>
              <div className="bg-white p-3 rounded-md mb-2">
                <p className="text-sm font-semibold text-[#991b1b] mb-1">
                  Motivo del rechazo anterior:
                </p>
                <p className="text-sm text-[#7f1d1d]">
                  {resendData.reviewComments}
                </p>
              </div>
              <p className="text-sm text-[#7f1d1d] font-semibold">
                💡 Por favor corrige los problemas mencionados antes de reenviar
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className="p-4 mb-6 rounded-lg shadow-md flex items-start text-sm"
        style={{
          backgroundColor: "#ca8a04",
          color: "#fff",
          border: "2px solid #a16207",
        }}
      >
        <ExclamationTriangleIcon className="w-5 h-5 mr-3 mt-0.5 min-w-5" />
        <p style={{ fontWeight: 600 }}>
          <strong style={{ fontWeight: 800 }}>Importante:</strong> Las
          justificaciones deben enviarse dentro de las 48 horas posteriores a la
          falta.
        </p>
      </div>

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

      {success && (
        <div
          className="px-4 py-3 rounded-lg mb-4"
          style={{
            backgroundColor: "#16a34a",
            border: "2px solid #15803d",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.4)",
          }}
        >
          <p style={{ fontWeight: 700 }}>
            ✓ Justificación {resendData ? "reenviada" : "enviada"} exitosamente
          </p>
        </div>
      )}

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
          {resendData ? "Reenviar Justificación" : "Nueva Justificación"}
        </h2>
        <p
          className="text-sm mb-6 pb-4"
          style={{
            color: "#334155",
            fontWeight: 600,
            borderBottom: "2px solid #94a3b8",
          }}
        >
          Completa todos los campos obligatorios (*)
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Seleccionar Falta a Justificar *
            </label>

            {loadingAbsences ? (
              <div
                className="rounded-lg p-3"
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
                className="rounded-lg p-3"
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
                <select
                  name="attendanceId"
                  value={formData.attendanceId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={resendData?.attendanceId}
                  className={`w-full rounded-lg p-3 cursor-pointer transition ${
                    errors.attendanceId && touched.attendanceId
                      ? "border-red-500 focus:border-red-600"
                      : "border-slate-400 focus:border-blue-500"
                  } ${
                    resendData?.attendanceId
                      ? "bg-gray-200 cursor-not-allowed"
                      : ""
                  }`}
                  style={{
                    backgroundColor: resendData?.attendanceId
                      ? "#e2e8f0"
                      : "#fff",
                    color: "#0f172a",
                    border: "2px solid",
                    fontWeight: 600,
                  }}
                >
                  <option value="">-- Selecciona la falta --</option>
                  {availableAbsences.map((absence) => (
                    <option
                      key={absence.attendanceId}
                      value={absence.attendanceId}
                    >
                      {absence.courseName} -{" "}
                      {JustificacionService.formatDate(absence.classDate)}
                      {absence.classTime &&
                        ` (${new Date(absence.classTime).toLocaleTimeString(
                          "es-PE",
                          { hour: "2-digit", minute: "2-digit" }
                        )})`}
                    </option>
                  ))}
                </select>
                {errors.attendanceId && touched.attendanceId && (
                  <div className="flex items-center mt-2 text-red-600 text-sm font-semibold">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {errors.attendanceId}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Motivo de la Justificación *
            </label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={500}
              placeholder="Ej: Cita médica, emergencia familiar..."
              className={`w-full rounded-lg p-3 transition ${
                errors.motivo && touched.motivo
                  ? "border-red-500 focus:border-red-600"
                  : "border-slate-400 focus:border-blue-500"
              }`}
              style={{
                backgroundColor: "#fff",
                color: "#0f172a",
                border: "2px solid",
                fontWeight: 600,
              }}
            />
            <div className="flex justify-between items-start mt-1">
              <p className="text-xs text-slate-600 font-semibold">
                {formData.motivo.length}/500 caracteres (mínimo 5, solo letras)
              </p>
              {errors.motivo && touched.motivo && (
                <div className="flex items-center text-red-600 text-sm font-semibold">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.motivo}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Descripción Detallada *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="4"
              placeholder="Describe detalladamente el motivo de tu falta..."
              className={`w-full rounded-lg p-3 resize-none transition ${
                errors.descripcion && touched.descripcion
                  ? "border-red-500 focus:border-red-600"
                  : "border-slate-400 focus:border-blue-500"
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

          <div className="mb-8">
            <label
              className="block text-sm mb-2"
              style={{ fontWeight: 700, color: "#0f172a" }}
            >
              Evidencia (PDF - OBLIGATORIO)
            </label>

            <div className="flex items-center space-x-3">
              <label
                htmlFor="file-upload"
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
                id="file-upload"
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

            <p className="text-xs mt-2 text-slate-600 font-semibold">
              🔎 Archivo PDF obligatorio. Máximo 5MB. 
            </p>
          </div>

          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              disabled={
                loading || availableAbsences.length === 0 || loadingAbsences
              }
              className="font-semibold py-2 px-6 rounded-lg shadow-md flex items-center transition duration-200"
              style={{
                backgroundColor:
                  loading || availableAbsences.length === 0 || loadingAbsences
                    ? "#94a3b8"
                    : "#16a34a",
                color: "#fff",
                fontWeight: 800,
                border: `2px solid ${
                  loading || availableAbsences.length === 0 || loadingAbsences
                    ? "#64748b"
                    : "#15803d"
                }`,
                cursor:
                  loading || availableAbsences.length === 0 || loadingAbsences
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
                  {resendData
                    ? "Reenviar Justificación"
                    : "Enviar Justificación"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                // ✅ Limpiar el formulario y cerrar
                setFormData({
                  attendanceId: "",
                  motivo: "",
                  descripcion: "",
                  archivo: null,
                });
                setFileName("Sin archivos seleccionados");
                setTouched({});
                setErrors({});
                onClose();
              }}
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

export default NewJustificationSection;