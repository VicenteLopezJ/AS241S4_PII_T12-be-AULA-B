import React, { useEffect, useState } from "react";
import {
  ClockIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, ChevronDownIcon, AdjustmentsHorizontalIcon, ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import JustificacionService from "../../../services/asistencia/student/justificacion/JustificacionService";
import AttendanceService from "../../../services/asistencia/student/asistencia/attendanceeService";
import Swal from "sweetalert2";

// Definición de las opciones de cursos y estados
const AVAILABLE_COURSES = [
  "Sistemas Operativos",
  "Base de Datos",
  "Algoritmos y Programación",
  "Estructura de Datos",
  "Redes de Computadoras I",
];

const STATUS_MAP = {
  pending: {
    text: "Pendiente",
    icon: ClockIcon,
    color: "text-yellow-400",
    badge: "bg-yellow-600/30 text-yellow-800 border-yellow-600",
    cardBorder: "border-yellow-600",
    bgColor: "bg-yellow-900/20",
    iconColor: "text-yellow-400",
  },
  approved: {
    text: "Aprobada",
    icon: CheckCircleIcon,
    color: "text-green-400",
    badge: "bg-green-600/30 text-green-800 border-green-600",
    cardBorder: "border-green-600",
    bgColor: "bg-green-900/20",
    iconColor: "text-green-400",
  },
  rejected: {
    text: "Rechazada",
    icon: XCircleIcon,
    color: "text-red-400",
    badge: "bg-red-600/30 text-red-800 border-red-600",
    cardBorder: "border-red-600",
    bgColor: "bg-red-900/20",
    iconColor: "text-red-400",
  },
};

// Función para Formato de Fecha
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toISOString().substring(0, 10);
  } catch {
    return dateString;
  }
};

// 1. MODAL DE REVISIÓN
const ReviewModal = ({ justification, onClose, onSubmit }) => {
  const [action, setAction] = useState("approved");
  const [comments, setComments] = useState("");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 text-white shadow-2xl border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">
          Revisar Justificación #{justification.justificationId}
        </h2>
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm font-semibold">{justification.studentName}</p>
          <p className="text-xs text-gray-400">{justification.courseName}</p>
        </div>
        <label className="block text-sm font-medium mb-1 text-gray-300">
          Acción
        </label>
        <div className="relative mb-4">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-sm bg-gray-900 text-white rounded-lg appearance-none border border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="approved">Aprobar</option>
            <option value="rejected">Rechazar</option>
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <label className="block text-sm font-medium mb-1 text-gray-300">
          Comentarios de Revisión (Obligatorio si se rechaza)
        </label>
        <textarea
          className="w-full p-3 rounded-lg border border-gray-700 h-28 bg-gray-900 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="Escribe un comentario..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-300 bg-gray-600 hover:bg-gray-500 transition"
            onClick={onClose}
          > Cancelar
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition ${action === 'approved'
              ? 'bg-green-600 hover:bg-green-500'
              : 'bg-red-600 hover:bg-red-500'
              }`}
            onClick={() => onSubmit(action, comments)}
          >
            Confirmar {action === 'approved' ? 'Aprobación' : 'Rechazo'}
          </button>
        </div>
      </div>
    </div>
  );
};

// TARJETAS DE ESTADO
const StatusCard = ({ title, count, statusKey }) => {
  const currentStyle = STATUS_MAP[statusKey] || {};
  const Icon = currentStyle.icon || ClockIcon;

  return (
    <div
      className={`p-6 rounded-xl border-2 shadow-xl text-white flex flex-col items-center justify-center transition duration-300 hover:shadow-2xl 
        ${currentStyle.cardBorder} ${currentStyle.bgColor} min-h-[140px]`}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <Icon className={`w-8 h-8 ${currentStyle.iconColor} mb-2`} />
        <span className={`text-5xl font-extrabold ${currentStyle.iconColor}`}>{count}</span>
      </div>
      <span className="text-base font-medium text-gray-300 mt-2">{title}</span>
    </div>
  );
};

// ITEM INDIVIDUAL
const JustificationItem = ({ justification, onReview, onRestore }) => {
  const status = justification.status;
  const { text: statusText, badge: badgeClass } = STATUS_MAP[status] || {};
  const isPending = status === "pending";

  return (
    <div className="bg-slate-300 p-6 rounded-xl shadow-lg border-t-4 border-slate-400 text-gray-900 transition duration-300 hover:border-blue-600">
      <div className="flex justify-between items-start border-b border-gray-300 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {justification.studentName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {justification.courseName} - Código: {justification.courseCode}
          </p>
        </div>
        {statusText && (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${badgeClass.replace(/text-[\w-]*\s|text-[\w-]*$/, 'text-gray-900')}`}
          >
            {statusText}
          </span>
        )}
      </div>

      {/* DETALLES: Fecha, Motivo y Evidencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Fecha de la falta:</p>
          <p className="font-medium text-gray-900">{justification.classDate}</p>
        </div>
        <div>
          <p className="text-gray-600 flex items-center">
            <ClockIcon className="w-4 h-4 mr-1 inline-block" /> Fecha de envío:
          </p>
          <p className="font-medium text-gray-900">{formatDate(justification.requestDate)}</p>
        </div>
      </div>

      {/* Motivo de la Justificación (Bloque destacado) */}
      <div className="p-4 bg-slate-400 rounded-lg mb-4 border-l-4 border-blue-600 text-gray-900">
        <p className="text-xs text-gray-700 mb-1">Motivo de la Justificación:</p>
        <p className="text-sm font-light italic">{justification.reason}. {justification.description}</p>
      </div>
      {justification.attachmentFile && (
        <div className="flex items-center mb-4">
          <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
          <p className="text-sm text-gray-600 mr-4">Evidencia adjunta:</p>
          <button
            className="px-3 py-1 text-xs text-white font-medium rounded-lg bg-blue-700 hover:bg-blue-600 transition shadow-md hover:shadow-lg"
            onClick={() => console.log('Ver archivo:', justification.attachmentFile)}
          >
            Ver documento
          </button>
        </div>
      )}

      {/* ACCIONES */}
      <div className="mt-4 pt-4 border-t border-gray-400">
        {isPending ? (
          <button
            className="flex items-center justify-center space-x-2 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition hover:bg-blue-500 shadow-md hover:shadow-lg"
            onClick={onReview}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Revisar Justificación</span>
          </button>
        ) : (
          <>
            {/* Comentarios de revisión si fue aprobada o rechazada */}
            {justification.reviewComments && (
              <div className="p-3 bg-slate-400 rounded-lg mb-3 border-l-4 border-gray-500 text-sm italic text-gray-800">
                <p className="text-xs font-semibold text-gray-700 mb-1">Observaciones:</p>
                {justification.reviewComments}
              </div>
            )}

            <button
              className="flex items-center justify-center space-x-2 w-full bg-gray-600 text-white py-2 rounded-lg font-semibold transition hover:bg-gray-500 shadow-md hover:shadow-lg"
              onClick={onRestore}
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
              <span>Restaurar Justificación (a Pendiente)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL Y LÓGICA
const JustificationManagementPage = () => {
  const [justifications, setJustifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ESTADOS para los filtros
  // Utilizamos directamente la clave ('all', 'pending', 'approved', 'rejected')
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");

  // Cargar desde el backend
  const loadJustifications = async () => {
    setLoading(true);
    try {
      const data = await JustificacionService.getAllJustifications();
      setJustifications(data);
    } catch (e) {
      console.error("Error loading justifications:", e);
      Swal.fire("Error", "No se pudieron cargar las justificaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJustifications();
  }, []);

  // Contadores
  const pendingCount = justifications.filter((j) => j.status === "pending").length;
  const approvedCount = justifications.filter((j) => j.status === "approved").length;
  const rejectedCount = justifications.filter((j) => j.status === "rejected").length;

  // Lógica de Filtrado (Simplificada para usar directamente filterStatus)
  const filteredJustifications = justifications.filter((j) => {
    // Si filterStatus es 'all', siempre coincide. Si no, debe coincidir con el estado de la justificación.
    const statusMatch = filterStatus === "all" || j.status === filterStatus;
    const courseMatch = filterCourse === "all" || j.courseName === filterCourse;

    return statusMatch && courseMatch;
  });

  // Función auxiliar para buscar y actualizar la asistencia
  const updateAttendanceToJustified = async (justification, reviewComments) => {
    try {
      console.log('🔍 Buscando asistencia para actualizar a Justificado:', {
        studentName: justification.studentName,
        classDate: justification.classDate,
        courseName: justification.courseName
      });

      // Buscar la asistencia usando los filtros - buscamos tanto ausencias como ya justificadas
      const attendancesAbsent = await AttendanceService.getAttendances({
        dateFrom: justification.classDate,
        dateTo: justification.classDate,
        status: 'A' // Ausencias
      });

      const attendancesJustified = await AttendanceService.getAttendances({
        dateFrom: justification.classDate,
        dateTo: justification.classDate,
        status: 'J' // Ya justificadas
      });

      const allAttendances = [...attendancesAbsent, ...attendancesJustified];
      console.log('📋 Asistencias encontradas:', allAttendances.length);

      // Filtrar por nombre del estudiante
      const matchingAttendance = allAttendances.find(att =>
        att.studentName === justification.studentName &&
        att.classDate === justification.classDate
      );

      if (matchingAttendance) {
        console.log('✅ Asistencia encontrada:', matchingAttendance.attendanceId);

        // Preparar las observaciones con los comentarios de revisión
        const observations = reviewComments
          ? `Justificación aprobada: ${reviewComments}`
          : `Justificado: ${justification.reason}`;

        // Actualizar el estado a 'J' (Justificado)
        await AttendanceService.updateAttendance(matchingAttendance.attendanceId, {
          status: 'J',
          observations: observations
        });

        console.log('✅ Asistencia actualizada a Justificado con observaciones:', observations);
        return true;
      } else {
        console.warn('⚠️ No se encontró asistencia coincidente');
        return false;
      }
    } catch (error) {
      console.error('❌ Error al actualizar asistencia:', error);
      return false;
    }
  };

  // Procesar Acción de Revisión y Restaurar
  const handleSubmitReview = async (action, comments) => {
    try {
      if (action === "rejected" && !comments.trim()) {
        // Validación de comentarios si se rechaza
        Swal.fire("Advertencia", "Los comentarios son obligatorios para un rechazo.", "warning");
        return;
      }

      const payload = {
        // En un entorno real, este debería ser el ID del usuario logueado
        reviewedBy: 1,
        reviewComments: comments,
      };

      if (action === "approved") {
        // Aprobar la justificación
        await JustificacionService.approveJustification(selected.justificationId, payload);

        // Actualizar la asistencia a Justificado
        const attendanceUpdated = await updateAttendanceToJustified(selected, comments);

        if (attendanceUpdated) {
          Swal.fire("Éxito", "Justificación aprobada y asistencia actualizada a Justificado", "success");
        } else {
          Swal.fire("Advertencia", "Justificación aprobada, pero no se pudo actualizar la asistencia automáticamente", "warning");
        }
      } else {
        await JustificacionService.rejectJustification(selected.justificationId, payload);
        Swal.fire("Éxito", "Justificación rechazada", "success");
      }

      setSelected(null);
      loadJustifications();
    } catch (e) {
      console.error("Error submitting review:", e);
      Swal.fire("Error", "No se pudo actualizar la justificación. (Error del Servidor/DB: ORA-04091)", "error");
    }
  };

  const handleRestore = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Restaurar justificación?",
      text: "Esto devolverá el estado a Pendiente",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'bg-gray-800 text-white border border-gray-700 rounded-xl',
        title: 'text-yellow-400',
        confirmButton: 'bg-red-600 hover:bg-red-500',
        cancelButton: 'bg-gray-600 hover:bg-gray-500'
      },
      buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    try {
      await JustificacionService.restoreJustification(id);
      Swal.fire("Restaurada", "La justificación vuelve a estar pendiente", "success");
      loadJustifications();
    } catch (e) {
      console.error("Error restoring justification:", e);
      Swal.fire("Error", "No se pudo restaurar", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 p-4 sm:p-8 text-gray-100 font-sans">
      <h1 className="text-3xl font-extrabold mb-1 text-white">
        Gestión de Justificaciones
      </h1>
      <p className="text-sm font-light mb-8 text-gray-400">
        Revisa y aprueba las solicitudes de justificación de tus estudiantes.
      </p>

      {/* --- 1. Tarjetas de Conteo (Diseño mejorado con bgColor) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatusCard title="Pendientes" count={pendingCount} statusKey="pending" />
        <StatusCard title="Aprobadas" count={approvedCount} statusKey="approved" />
        <StatusCard title="Rechazadas" count={rejectedCount} statusKey="rejected" />
      </div>

      {/* --- 2. Filtros (Fondo bg-slate-300) --- */}
      <div className="bg-slate-300 p-4 rounded-xl shadow-lg mb-6 border border-gray-400">
        <h2 className="text-lg font-bold mb-3 text-gray-900">Opciones de Filtrado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Filtro de Estado (Ahora usa las claves de estado directamente) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Estado de la Justificación</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-sm bg-white text-gray-900 rounded-lg appearance-none border border-gray-400 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={loading}
              >
                <option value="all">Todos los estados</option>
                {/* Usamos la clave (key) como valor, no el texto traducido */}
                {Object.keys(STATUS_MAP).map(key => (
                  <option key={key} value={key}>
                    {STATUS_MAP[key].text}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>

          {/* Filtro por Curso */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Filtrar por Curso</label>
            <div className="relative">
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-sm bg-white text-gray-900 rounded-lg appearance-none border border-gray-400 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={loading}
              >
                <option value="all">Todos los cursos</option>
                {AVAILABLE_COURSES.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>


      {/* --- 3. Lista de Justificaciones --- */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-8 text-blue-400">Cargando justificaciones...</div>
        ) : (
          filteredJustifications.map((j) => (
            <JustificationItem
              key={j.justificationId}
              justification={j}
              onReview={() => setSelected(j)}
              onRestore={() => handleRestore(j.justificationId)}
            />
          ))
        )}
        {!loading && filteredJustifications.length === 0 && (
          <p className="text-center text-gray-400 p-8 border border-gray-700 rounded-xl bg-gray-800">
            No hay justificaciones para mostrar con los filtros actuales.
          </p>
        )}
      </div>

      {/* --- 4. Modal --- */}
      {selected && (
        <ReviewModal
          justification={selected}
          onClose={() => setSelected(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default JustificationManagementPage;