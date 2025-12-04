// src/components/asistencia/student/justificacion/JustificacionCard.jsx

import React, { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon, 
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";
import { INASISTENCIAS_API } from "../../../../services/api";

const getStatusDetails = (estado) => {
  switch (estado) {
    case "Aprobado":
      return {
        icon: <CheckCircleIcon className="w-5 h-5 text-[#16a34a] mr-2" />,
        badgeClass: "badge-aprobado",
        color: "text-[#16a34a]",
      };
    case "Rechazada":
      return {
        icon: <XCircleIcon className="w-5 h-5 text-[#dc2626] mr-2" />,
        badgeClass: "badge-rechazada",
        color: "text-[#dc2626]",
      };
    case "Pendiente":
      return {
        icon: <ClockIcon className="w-5 h-5 text-[#ca8a04] mr-2" />,
        badgeClass: "badge-pendiente",
        color: "text-[#ca8a04]",
      };
    default:
      return {
        icon: null,
        badgeClass: "",
        color: "text-[#334155]",
      };
  }
};

// 🆕 Componente principal con prop onResend
const JustificacionCard = ({ data, onUpdate, onResend }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const { icon, badgeClass, color } = getStatusDetails(data.estado);

  const handleViewPDF = async (filename) => {
    if (!filename) return;
    
    setLoadingPDF(true);
    try {
      const response = await INASISTENCIAS_API.get(`/api/v1/files/${filename}`, {
        responseType: 'blob',
        headers: { 'Accept': 'application/pdf' }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        alert('Por favor permite ventanas emergentes para ver el documento');
        window.URL.revokeObjectURL(url);
        return;
      }
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error al cargar el documento');
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleDownloadPDF = async (filename) => {
    if (!filename) return;
    
    setLoadingPDF(true);
    try {
      const response = await INASISTENCIAS_API.get(`/api/v1/files/${filename}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `justificacion_${data.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el documento');
    } finally {
      setLoadingPDF(false);
    }
  };

  // 🆕 Handler para reenvío
  const handleResend = () => {
    if (onResend) {
      onResend({
        attendanceId: data.attendanceId,
        courseName: data.unidadDidactica,
        classDate: data.fechaFalta,
        previousReason: data.motivo,
        previousDescription: data.descripcion,
        reviewComments: data.observaciones
      });
    }
  };

  return (
    <div className="bg-[#cbd5e1] p-5 mb-5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-2 border-[#94a3b8] hover:border-[#64748b] transition-all duration-300 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5">
      <div className="flex justify-between items-center mb-4 justificacion-card-header">
        <div className="flex items-center">
          {icon}
          <div>
            <h3 className={`text-lg font-extrabold ${color}`}>
              {data.unidadDidactica}
            </h3>
            <p className="text-sm text-[#334155] font-semibold">
              Código: {data.codigo}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {data.fueraPlazo && (
            <span className="px-3 py-1 text-xs font-extrabold rounded-full badge-fuera-plazo">
              Fuera de plazo
            </span>
          )}
          <span
            className={`px-3 py-1 text-xs font-extrabold rounded-full ${badgeClass}`}
          >
            {data.estado.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="border-b-2 border-[#94a3b8] pb-3 mb-3">
        <p className="text-sm text-[#334155] font-semibold">
          <span className="font-extrabold text-[#0f172a]">Falta del:</span>{" "}
          {data.fechaFalta}
        </p>
        <p className="text-sm text-[#334155] font-semibold">
          <span className="font-extrabold text-[#0f172a]">Enviado:</span>{" "}
          {data.fechaEnvio}
        </p>
        {data.fechaRevision && (
          <p className="text-sm text-[#334155] font-semibold">
            <span className="font-extrabold text-[#0f172a]">Revisado:</span>{" "}
            {data.fechaRevision}
          </p>
        )}
      </div>

      <div className="mb-3">
        <p className="font-extrabold text-[#0f172a] text-sm mb-1">Motivo:</p>
        <p className="text-[#1e293b] text-sm bg-[#e2e8f0] p-3 rounded-md font-semibold">
          {data.motivo}
        </p>
      </div>

      {data.descripcion && (
        <div className="mb-3">
          <p className="font-extrabold text-[#0f172a] text-sm mb-1">
            Descripción:
          </p>
          <p className="text-[#1e293b] text-sm bg-[#e2e8f0] p-3 rounded-md font-semibold">
            {data.descripcion}
          </p>
        </div>
      )}

      {data.attachmentFile && (
        <div className="mb-3 bg-[#e2e8f0] p-3 rounded-md border-2 border-[#cbd5e1]">
          <p className="text-xs text-[#334155] mb-2 font-semibold flex items-center">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Documento Adjunto
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewPDF(data.attachmentFile)}
              disabled={loadingPDF}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                loadingPDF 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span>{loadingPDF ? 'Cargando...' : 'Ver PDF'}</span>
            </button>

            <button
              onClick={() => handleDownloadPDF(data.attachmentFile)}
              disabled={loadingPDF}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold text-sm transition border-2 ${
                loadingPDF 
                  ? 'bg-gray-400 border-gray-500 cursor-not-allowed' 
                  : 'bg-white border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a] hover:text-white'
              }`}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Descargar</span>
            </button>

            <span className="text-xs text-[#64748b] font-semibold truncate max-w-[150px]">
              {data.attachmentFile}
            </span>
          </div>
        </div>
      )}

      {/* 🆕 SECCIÓN DE JUSTIFICACIÓN RECHAZADA */}
      {data.estadoRaw === "rejected" && (
        <div className="mt-4 p-4 bg-[#fee2e2] rounded-md border-l-4 border-[#dc2626]">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-extrabold text-[#7f1d1d] text-sm mb-2">
                Justificación Rechazada
              </p>
              {data.observaciones && (
                <div className="mb-3">
                  <p className="text-xs text-[#7f1d1d] font-semibold mb-1">
                    Motivo del rechazo:
                  </p>
                  <p className="text-[#991b1b] text-sm bg-white p-2 rounded font-semibold">
                    {data.observaciones}
                  </p>
                </div>
              )}
              <button
                onClick={handleResend}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-extrabold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-md"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Reenviar Justificación Corregida
              </button>
              <p className="text-xs text-[#7f1d1d] mt-2 font-semibold text-center">
                💡 Revisa los comentarios del docente antes de reenviar
              </p>
            </div>
          </div>
        </div>
      )}

      {data.observaciones && data.estadoRaw !== "rejected" && (
        <div className="mt-4 p-3 bg-[#e2e8f0] rounded-md border-l-4 border-[#2563eb]">
          <p className="font-extrabold text-[#0f172a] text-sm mb-1">
            Observaciones del docente:
          </p>
          <p className="text-[#1e293b] text-sm font-semibold">
            {data.observaciones}
          </p>
        </div>
      )}

      {data.estadoRaw !== "pending" && data.estadoRaw !== "rejected" && (
        <div className="mt-4 pt-4 border-t-2 border-[#94a3b8]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm text-[#334155] hover:text-[#0f172a] transition font-semibold"
          >
            <span>{isExpanded ? "Ocultar detalles" : "Ver más detalles"}</span>
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#e2e8f0] p-2 rounded border-2 border-[#cbd5e1]">
                  <p className="text-[#334155] text-xs font-semibold">
                    ID Justificación
                  </p>
                  <p className="text-[#0f172a] font-mono font-extrabold">
                    #{data.id}
                  </p>
                </div>
                <div className="bg-[#e2e8f0] p-2 rounded border-2 border-[#cbd5e1]">
                  <p className="text-[#334155] text-xs font-semibold">
                    ID Asistencia
                  </p>
                  <p className="text-[#0f172a] font-mono font-extrabold">
                    #{data.attendanceId}
                  </p>
                </div>
              </div>

              {data.studentName && (
                <div className="bg-[#e2e8f0] p-2 rounded border-2 border-[#cbd5e1]">
                  <p className="text-[#334155] text-xs font-semibold">
                    Estudiante
                  </p>
                  <p className="text-[#0f172a] font-extrabold">
                    {data.studentName} ({data.studentCode})
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {data.estadoRaw === "pending" && (
        <div className="mt-4 pt-4 border-t-2 border-[#94a3b8]">
          <div className="flex items-center space-x-2 text-[#ca8a04]">
            <ClockIcon className="w-4 h-4" />
            <p className="text-sm font-semibold">
              Tu justificación está siendo revisada por el docente
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JustificacionCard;