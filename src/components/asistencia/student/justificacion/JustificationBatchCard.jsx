// src/components/asistencia/student/justificacion/JustificationBatchCard.jsx

import React, { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import JustificationBatchService from "../../../../services/asistencia/student/justificacion/JustificationBatchService";
import { INASISTENCIAS_API } from "../../../../services/api";

const getStatusDetails = (estado) => {
  switch (estado) {
    case "Aprobado":
      return {
        icon: <CheckCircleIcon className="w-5 h-5 text-[#16a34a] mr-2" />,
        badgeClass: "badge-aprobado",
        color: "text-[#16a34a]",
      };
    case "Rechazado":
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
    case "Revisado":
      return {
        icon: <CheckBadgeIcon className="w-5 h-5 text-[#2563eb] mr-2" />,
        badgeClass: "badge-revisado",
        color: "text-[#2563eb]",
      };
    default:
      return {
        icon: null,
        badgeClass: "",
        color: "text-[#334155]",
      };
  }
};

const JustificationBatchCard = ({ data, onViewDetails, onCancel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const { icon, badgeClass, color } = getStatusDetails(data.estado);
  const categoryIcon = JustificationBatchService.getCategoryIcon(
    data.categoriaRaw
  );

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
        alert('Por favor permite ventanas emergentes');
        window.URL.revokeObjectURL(url);
        return;
      }
      
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
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
      link.download = `batch_${data.id}.pdf`;
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

  return (
    <div className="bg-[#cbd5e1] p-5 mb-5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-2 border-[#94a3b8] hover:border-[#64748b] transition-all duration-300 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-3">{categoryIcon}</span>
          <div>
            <h3 className={`text-lg font-extrabold ${color}`}>
              Solicitud de Justificación Agrupada
            </h3>
            <p className="text-sm text-[#334155] font-semibold">
              Categoría: {data.categoria}
            </p>
          </div>
        </div>

        <div className="flex space-x-2 items-center">
          {!data.dentroPlazo && (
            <span className="px-3 py-1 text-xs font-extrabold rounded-full badge-fuera-plazo flex items-center">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Fuera de plazo
            </span>
          )}
          <span
            className={`px-3 py-1 text-xs font-extrabold rounded-full ${badgeClass} flex items-center`}
          >
            {icon}
            {data.estado.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="border-b-2 border-[#94a3b8] pb-3 mb-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#334155] font-semibold">
              Total de Faltas
            </p>
            <p className="text-lg font-black text-[#0f172a]">
              {data.totalFaltas}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#334155] font-semibold">
              Fecha de Envío
            </p>
            <p className="text-sm text-[#1e293b] font-semibold">
              {data.fechaEnvio}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="font-extrabold text-[#0f172a] text-sm mb-1">
          Descripción General:
        </p>
        <p className="text-[#1e293b] text-sm bg-[#e2e8f0] p-3 rounded-md font-semibold">
          {data.descripcionGeneral.length > 150 && !isExpanded
            ? `${data.descripcionGeneral.substring(0, 150)}...`
            : data.descripcionGeneral}
        </p>
      </div>

      {data.archivoAdjunto && (
        <div className="mb-3 bg-[#e2e8f0] p-3 rounded-md border-2 border-[#cbd5e1]">
          <p className="text-xs text-[#334155] mb-2 font-semibold flex items-center">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Documento Adjunto
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewPDF(data.archivoAdjunto)}
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
              onClick={() => handleDownloadPDF(data.archivoAdjunto)}
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

            <span className="text-xs text-[#64748b] font-semibold">
              {data.tipoDocumento || "archivo"}
            </span>
          </div>
        </div>
      )}

      {data.fechaRevision && (
        <div className="mt-4 p-3 bg-[#e2e8f0] rounded-md border-l-4 border-[#2563eb]">
          <p className="font-extrabold text-[#0f172a] text-sm mb-1">
            {data.estadoRaw === "approved"
              ? "Aprobado"
              : data.estadoRaw === "rejected"
              ? "Rechazado"
              : data.estadoRaw === "reviewed"
              ? "Revisado"
              : "Revisado"}{" "}
            el {data.fechaRevision}
          </p>
          {data.comentariosRevision && (
            <p className="text-[#1e293b] text-sm mt-2 font-semibold">
              <span className="font-extrabold">Comentarios:</span>{" "}
              {data.comentariosRevision}
            </p>
          )}
          {data.revisorEmail && (
            <p className="text-[#334155] text-xs mt-1 font-semibold">
              Revisado por: {data.revisorEmail}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t-2 border-[#94a3b8] flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(data.id)}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] border-2 border-[#1d4ed8] text-white text-sm font-extrabold py-2 px-4 rounded-lg transition duration-200 shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_12px_rgba(37,99,235,0.4)] hover:-translate-y-0.5"
          >
            Ver Detalles Completos
          </button>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-[#334155] hover:text-[#0f172a] transition font-semibold"
        >
          <span className="mr-1">{isExpanded ? "Menos info" : "Más info"}</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm border-t-2 border-[#94a3b8] pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#e2e8f0] p-2 rounded border-2 border-[#cbd5e1]">
              <p className="text-[#334155] text-xs font-semibold">
                ID de Solicitud
              </p>
              <p className="text-[#0f172a] font-mono font-extrabold">
                #{data.id}
              </p>
            </div>
            <div className="bg-[#e2e8f0] p-2 rounded border-2 border-[#cbd5e1]">
              <p className="text-[#334155] text-xs font-semibold">
                Estado del Plazo
              </p>
              <p
                className={`font-extrabold ${
                  data.dentroPlazo ? "text-[#16a34a]" : "text-[#dc2626]"
                }`}
              >
                {data.dentroPlazo ? "✓ Dentro de 48 horas" : "✗ Fuera de plazo"}
              </p>
            </div>
          </div>

          {data.studentName && (
            <div className="bg-[#e2e8f0] p-2 rounded border-2 border-[#cbd5e1]">
              <p className="text-[#334155] text-xs font-semibold">Estudiante</p>
              <p className="text-[#0f172a] font-extrabold">
                {data.studentName} ({data.studentCode})
              </p>
            </div>
          )}

          <div className="bg-[#e2e8f0] p-2 rounded border-2 border-[#cbd5e1]">
            <p className="text-[#334155] text-xs font-semibold">
              Fecha de Creación
            </p>
            <p className="text-[#0f172a] font-extrabold">
              {data.fechaCreacion}
            </p>
          </div>
        </div>
      )}

      {data.estadoRaw === "pending" && (
        <div className="mt-4 pt-4 border-t-2 border-[#94a3b8]">
          <div className="flex items-center space-x-2 text-[#ca8a04]">
            <ClockIcon className="w-4 h-4" />
            <p className="text-sm font-semibold">
              Tu solicitud está siendo revisada. Se te notificará cuando sea
              procesada.
            </p>
          </div>
        </div>
      )}

      {data.estadoRaw === "reviewed" && (
        <div className="mt-4 pt-4 border-t-2 border-[#94a3b8]">
          <div className="flex items-center space-x-2 text-[#2563eb]">
            <CheckBadgeIcon className="w-4 h-4" />
            <p className="text-sm font-semibold">
              Todas las justificaciones han sido revisadas. Ver detalles completos para más información.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JustificationBatchCard;