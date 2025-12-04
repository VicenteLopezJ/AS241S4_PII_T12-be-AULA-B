import { useState, useEffect } from "react";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import { getUsersByRole } from "../../../../services/hackathon/userService";
import { updateAttendanceDetail } from "../../../../services/hackathon/attendanceService";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import TableLayout from "../../TableLayout";

export default function AttendanceStudentList({ groupMeta, attendanceRecords, onBack }) {
  
  const [enrichedStudents, setEnrichedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const formatOracleDate = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
  };

  const handleToggleStatus = async (student) => {
    const newStatus = student.attendanceStatus === "P" ? "A" : "P";
    const newData = {
      attendanceStatus: newStatus,
      arrivalTime: newStatus === "P" ? formatOracleDate() : null
    };

    try {
      await updateAttendanceDetail(student.idAttendanceDetail, newData);

      setEnrichedStudents((prev) =>
        prev.map((s) =>
          s.idAttendanceDetail === student.idAttendanceDetail
            ? {
                ...s,
                attendanceStatus: newStatus,
                arrivalTime: newStatus === "P" ? newData.arrivalTime : null,
                statusLabel: newStatus === "P" ? "Presente" : "Ausente",
                statusColor:
                  newStatus === "P"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800",
                
                tardinessStatus: newStatus === "P" 
                    ? calculateTardiness(newData.arrivalTime, groupMeta.startTime, groupMeta.endTime) 
                    : "Ausente"
              }
            : s
        )
      );
    } catch (err) {
      console.error("Error actualizando:", err);
    }
  };

  
  const calculateTardiness = (arrivalTimeStr, sessionStartStr, sessionEndStr) => {
      if (!arrivalTimeStr || !sessionStartStr) return "N/A";
      
      const arrivalTime = new Date(arrivalTimeStr).getTime();
      const sessionStartTime = new Date(sessionStartStr).getTime();
      const sessionEndTime = sessionEndStr ? new Date(sessionEndStr).getTime() : Infinity;

      if (arrivalTime > sessionEndTime) return "Tarde (Fuera de hora)";
      if (arrivalTime > sessionStartTime) return "A tiempo"; 
      
      
      if (arrivalTime > sessionStartTime) return "A tiempo"; 
      
      return "A tiempo";
  };

  useEffect(() => {
    const mergeData = async () => {
      setLoading(true);
      
      try {
        
        const allStudents = await getUsersByRole("estudiante");
        
        
        const studentsMap = {};
        allStudents.forEach(student => {
            
            const fullName = `${student.name} ${student.surname}`;
            
            studentsMap[student.idUser] = {
                name: fullName,
                email: student.email,
            };
        });
        
        
        const sessionStartTime = groupMeta?.startTime;
        const sessionEndTime = groupMeta?.endTime;

        const mergedData = attendanceRecords.map((record) => {
          
          const studentInfo = studentsMap[record.userId];
          
          
          const studentName = studentInfo?.name || "Sin Nombre";
          const studentEmail = studentInfo?.email || "Email no encontrado";
          
          let statusLabel = record.attendanceStatus === 'A' ? 'Ausente' : 'Presente';
          let statusColor = record.attendanceStatus === 'A' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800';
          let tardinessStatus = 'Ausente';
          
          if (record.attendanceStatus === 'P' && record.arrivalTime) {
             
             const arrivalTime = new Date(record.arrivalTime).getTime();
             const start = new Date(sessionStartTime).getTime();
             const end = sessionEndTime ? new Date(sessionEndTime).getTime() : Infinity;

             if (arrivalTime > end) {
                 tardinessStatus = 'Ausente (Fuera de rango)';
             } else if (arrivalTime > start) {
                  
                  
                  tardinessStatus = 'Tarde';
              } else {
                 tardinessStatus = 'A tiempo'; 
             }
          }

          return {
            ...record,
            
            studentName: studentName, 
            email: studentEmail,
            sessionStartTime: sessionStartTime, 
            sessionEndTime: sessionEndTime, 
            tardinessStatus: tardinessStatus, 
            statusLabel: statusLabel, 
            statusColor: statusColor,
          };
        });

        setEnrichedStudents(mergedData);

      } catch (error) {
        console.error("Error cruzando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (attendanceRecords && attendanceRecords.length > 0) {
      mergeData();
    } else {
      setEnrichedStudents([]);
      setLoading(false);
    }
  }, [attendanceRecords, groupMeta]); 

  
  const prepareDataForReport = () => {
    return enrichedStudents.map(s => {
        const formatOptions = { 
            hour: "2-digit", 
            minute: "2-digit", 
            hour12: true 
        };

        const arrivalTimeDisplay = s.arrivalTime
            ? new Date(s.arrivalTime).toLocaleTimeString([], formatOptions)
            : "N/A";
        
        const sessionStartTimeDisplay = s.sessionStartTime
            ? new Date(s.sessionStartTime).toLocaleTimeString([], formatOptions)
            : "N/A";

        return {
            'Grupo': groupMeta?.groupName || 'N/A', 
            'Semestre': groupMeta?.groupSemester || 'N/A',
            'Fecha Sesión': groupMeta?.sessionDate ? new Date(groupMeta.sessionDate).toLocaleDateString() : 'N/A',
            'Nombre del Estudiante': s.studentName,
            'Email': s.email,
            'Estado de Asistencia': s.statusLabel,
            'Hora de Llegada': arrivalTimeDisplay,
            'Hora de Inicio de Sesión': sessionStartTimeDisplay,
            'Puntualidad': s.tardinessStatus
        };
    });
  };

  const handleGenerateExcel = () => {
    if (enrichedStudents.length === 0) {
        alert("No hay datos para exportar a Excel.");
      return;
    }

    const dataToExport = prepareDataForReport();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AsistenciaDetalle"); 
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    
    
    const fileName = `asistencia_${groupMeta?.groupName?.replace(/\s/g, '_')}_${new Date(groupMeta?.sessionDate).toISOString().slice(0, 10)}.xlsx`;
    saveAs(data, fileName);
  };
  
  const handleGeneratePDF = async () => {
    if (enrichedStudents.length === 0) {
      alert("No hay datos para generar el reporte PDF.");
      return;
    }
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(`Reporte de Asistencia`, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Grupo: ${groupMeta?.groupName || 'N/A'} - ${groupMeta?.groupSemester}`, 14, 30);
      doc.text(`Fecha Sesión: ${new Date(groupMeta?.sessionDate).toLocaleDateString()}`, 14, 36);
      doc.text(`Horario: ${new Date(groupMeta?.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${new Date(groupMeta?.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`, 14, 42);

      const dataToExport = prepareDataForReport();
      
      const rows = dataToExport.map(row => [
          row['Nombre del Estudiante'],
          row['Email'],
          row['Estado de Asistencia'],
          row['Hora de Llegada'],
          row['Puntualidad']
      ]);
      const columns = ['Estudiante', 'Email', 'Estado', 'Llegada', 'Puntualidad'];
      
      autoTable(doc, {
        startY: 50,
        head: [columns],
        body: rows,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 58, 138], textColor: 255 }, 
        alternateRowStyles: { fillColor: [241, 245, 249] }, 
      });
      
      const blob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(pdfUrl);
      setShowPreview(true);
      
    } catch (err) {
      console.error("Error generando el PDF:", err);
      alert("No se pudo generar el PDF.");
    }
  };

  const handleDownloadPDF = () => {
    if (pdfBlobUrl) {
      const link = document.createElement("a");
      link.href = pdfBlobUrl;
      link.download = `reporte_${groupMeta?.groupName?.replace(/\s/g, '_')}_${new Date(groupMeta?.sessionDate).toISOString().slice(0, 10)}.pdf`;
      link.click();
    }
  };


  return (
    <div>
      <div className="mb-8">
        <button 
          onClick={onBack} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-800 h-10 py-2 px-4 text-slate-400 hover:text-white mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a sesiones
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Asistencia: {groupMeta?.groupName}</h1>
        <div className="flex gap-4 items-center text-slate-400 text-lg">
            <span>{groupMeta?.groupSemester}</span>
            <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
            <span>{new Date(groupMeta?.sessionDate).toLocaleDateString()}</span>
        </div>
      </div>

      <TableLayout
        title="Lista de Estudiantes"
        loading={loading}
        data={enrichedStudents}
        searchable={true}
        actionButton={
          <div className="flex gap-3">
            <button
              onClick={handleGeneratePDF}
              disabled={loading || enrichedStudents.length === 0}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-green-500 hover:bg-green-600 text-white gap-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" /> Generar PDF
            </button>
            <button
              onClick={handleGenerateExcel}
              disabled={loading || enrichedStudents.length === 0}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
            </button>
          </div>
        }
        columns={[
          {
            label: "Nombres y Apellidos",
            accessor: "studentName",
            sortable: true
          },
          {
            label: <div className="w-35 text-center">Email</div>,
            accessor: "email",
            sortable: true
          },
          {
            label: "Hora Llegada",
            accessor: "arrivalTime",
            render: (row) =>
              row.arrivalTime
                ? new Date(row.arrivalTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--",
          },
          {
            label: "Estado",
            accessor: "statusLabel",
            render: (row) => (
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${row.statusColor}`}
              >
                {row.statusLabel}
              </span>
            ),
          },
          {
            label: <div className="w-full text-center">Acciones</div>,
            center: true,
            render: (row) => (
              <div className="flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={row.attendanceStatus === "P"}
                    onChange={() => handleToggleStatus(row)}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-full transition-all"></span>
                </label>
              </div>
            ),
          },
        ]}
      />
      
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
              Vista previa del reporte PDF
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