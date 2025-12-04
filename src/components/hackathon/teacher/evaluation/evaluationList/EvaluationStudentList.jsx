
import { useState } from "react";
import {Plus,LayoutGrid,List,FileText,ArrowRight,UserCheck,Clock,ClipboardList,TrendingUp,Download,FileSpreadsheet,   } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "../../../index";
import { useTheme } from "../../../../../styles/hackathon/ThemeContext";
import EvaluationDetailModal from "./EvaluationDetailModal";
import TableLayout from "../../../TableLayout";
import { useNavigate } from "react-router-dom";

export default function EvaluationStudentList({ evaluations, loadingEvaluations }) {
  const { mode, theme } = useTheme();
  const [viewMode, setViewMode] = useState("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null); 
  const [showPreview, setShowPreview] = useState(false); 

  const navigate = useNavigate(); 
  
  const getEvaluationConditionClasses = (state) => {
    switch (state) {
      case "APROBADO":
        return "bg-emerald-500/20 text-emerald-400";
      case "RECUPERACION":
        return "bg-yellow-500/20 text-yellow-400";
      case "DESAPROBADO":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleOpenDetail = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const data = evaluations.map((e) => ({
    ...e,
    studentFullName: `${e.student_name} ${e.student_surname}`,
    
    statusText: e.status === 1 ? "Activa" : "Inactiva",
  }));

  const columns = [
    {
      label: "Estudiante",
      accessor: "studentFullName",
      sortable: true,
    },
    {
      label: "Evaluador",
      accessor: "tutor_name",
      sortable: true,
    },
    {
      label: "Módulo",
      accessor: "placement",
      sortable: true,
    },
    {
      label: "Resultado",
      accessor: "evaluationResult",
      sortable: true,
      render: (row) =>
        row.evaluationResult !== null
          ? `${row.evaluationResult.toFixed(2)}/${row.evaluationMaxresult.toFixed(2)}`
          : "N/A",
    },
    {
      label: "Condición",
      accessor: "evaluationState",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEvaluationConditionClasses(
            row.evaluationState
          )}`}
        >
          {row.evaluationState}
        </span>
      ),
    },
    {
      label: "Estado",
      accessor: "status",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 1
              ? "bg-emerald-500/20 text-emerald-600"
              : "bg-red-500/20 text-red-600"
          }`}
        >
          {row.status === 1 ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      label: "Detalle",
      accessor: "idEvaluation",
      sortable: false,
      render: (row) => (
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            handleOpenDetail(row);
          }}
          className="text-sky-500 hover:text-sky-400"
        >
          <ClipboardList className="w-5 h-5" />
        </button>
      ),
    },
  ];

  

  const prepareDataForReport = () => {
    return data.map(e => ({
        'Estudiante': e.studentFullName,
        'Evaluador': e.tutor_name,
        'Módulo': e.placement,
        'Resultado': e.evaluationResult !== null 
            ? `${e.evaluationResult.toFixed(2)}/${e.evaluationMaxresult.toFixed(2)}` 
            : "N/A",
        'Puntuación Obtenida': e.evaluationResult !== null ? e.evaluationResult.toFixed(2) : "N/A",
        'Puntuación Máxima': e.evaluationMaxresult !== null ? e.evaluationMaxresult.toFixed(2) : "N/A",
        'Condición': e.evaluationState,
        'Estado': e.statusText,
        'Fecha de Sesión': formatDate(e.sessionDate),
    }));
  };

  const handleGenerateExcel = () => {
    if (data.length === 0) {
      alert("No hay datos de evaluaciones para exportar.");
      return;
    }

    const dataToExport = prepareDataForReport();

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Evaluaciones");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream"
    });
    saveAs(blob, `reporte_evaluaciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  
  const handleGeneratePDF = async () => {
    if (data.length === 0) {
      alert("No hay datos de evaluaciones para generar el reporte PDF.");
      return;
    }
  
    try {
      
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF('landscape'); 
      doc.setFontSize(18);
      doc.text("Reporte Detallado de Evaluaciones", 14, 22);
      doc.setFontSize(12);
      doc.text(`Fecha de Reporte: ${formatDate(new Date())}`, 14, 30);
      const dataToExport = prepareDataForReport();
      const pdfColumns = ['Estudiante', 'Evaluador', 'Módulo', 'Puntuación Obtenida', 'Puntuación Máxima', 'Condición', 'Estado', 'Fecha de Sesión'];
      const header = pdfColumns;
      const rows = dataToExport.map(row => 
          pdfColumns.map(col => row[col] || '')
      );
      
      
      autoTable(doc, {
        startY: 38,
        head: [header],
        body: rows,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [6, 182, 212], textColor: 255 }, 
        alternateRowStyles: { fillColor: [241, 245, 249] }, 
        margin: { top: 35 }
      });
      
      
      const blob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(pdfUrl);
      setShowPreview(true);
      
    } catch (err) {
      console.error("Error generando el PDF:", err);
      alert("No se pudo generar el PDF. Verifica la instalación de jspdf y jspdf-autotable.");
    }
  };

  const handleDownloadPDF = () => {
    if (pdfBlobUrl) {
      const link = document.createElement("a");
      link.href = pdfBlobUrl;
      link.download = `reporte_evaluaciones_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/hackathon/evaluationday/setup')}
          className="bg-sky-500 hover:bg-sky-600 text-white flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Asignar Evaluación
        </Button>

        <div className="flex gap-2">
            <button
              onClick={handleGeneratePDF}
              disabled={loadingEvaluations || data.length === 0}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white disabled:opacity-50"
              title="Generar Reporte PDF"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={handleGenerateExcel}
              disabled={loadingEvaluations || data.length === 0}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white disabled:opacity-50"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </button>

          <button
            onClick={() => setViewMode("cards")}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 ${
              viewMode === "cards"
                ? "bg-sky-500 text-white"
                : "border border-slate-600 text-white hover:bg-slate-800"
            }`}
            title="Vista en Tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 ${
              viewMode === "list"
                ? "bg-sky-500 text-white"
                : "border border-slate-600 text-white hover:bg-slate-800"
            }`}
            title="Vista en Lista (Tabla)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "list" && (
        <TableLayout
          title="Evaluaciones"
          columns={columns}
          data={data}
          loading={loadingEvaluations}
          searchable={true}
          itemsPerPage={10}
          actionButton={null} 
        />
      )}
      
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluations.length === 0 ? (
            <div className="col-span-full text-center p-8 text-slate-400 border border-dashed border-slate-700 rounded-xl">
              No hay evaluaciones asignadas para este grupo.
            </div>
          ) : (
            evaluations.map((e) => (
              <div
                key={e.idEvaluation}
                onClick={() => handleOpenDetail(e)}
                className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 hover:border-sky-500 transition-all cursor-pointer space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {e.student_name} {e.student_surname}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEvaluationConditionClasses(
                      e.evaluationState
                    )}`}
                  >
                    {e.evaluationState}
                  </span>
                </div>

                <div className="space-y-2 text-slate-400">
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-white">Módulo:</span>{" "}
                    {e.placement}
                  </p>
                  <p className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-white">
                      Evaluador:
                    </span>{" "}
                    {e.tutor_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-white">
                      Resultado:
                    </span>
                    {e.evaluationResult !== null
                      ? ` ${e.evaluationResult.toFixed(2)} / ${e.evaluationMaxresult.toFixed(2)}`
                      : " N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-white">Fecha:</span>{" "}
                    {formatDate(e.sessionDate)}
                  </p>
                </div>

                <Button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleOpenDetail(e);
                  }}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center mt-4"
                >
                  Ver Detalle <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && selectedEvaluation && (
        <EvaluationDetailModal
          evaluation={selectedEvaluation}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {showPreview && pdfBlobUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-4 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setShowPreview(false)}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Vista previa del reporte PDF de Evaluaciones
            </h2>
            <iframe
              src={pdfBlobUrl}
              title="Vista previa PDF"
              className="w-full h-[70vh] border rounded-lg"
            ></iframe>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}