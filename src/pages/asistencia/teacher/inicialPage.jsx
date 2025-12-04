import React, { useState, useEffect } from "react";
import { BookOpen, Users, Calendar, FileText, AlertTriangle, BarChart3, ArrowRight, ChevronDownIcon } from "lucide-react";
import { getStudentStats } from '../../../services/asistencia/admin/studentAdmin/studentService';
import CourseService from '../../../services/asistencia/student/cursos/CourseService';
import JustificacionService from "../../../services/asistencia/student/justificacion/JustificacionService";

// --- Modal de Confirmación (basado en JustificationManagementPage) ---
const ReviewModal = ({ justification, onClose, onSubmit }) => {
    const [action, setAction] = useState("approved");
    const [comments, setComments] = useState("");

    const handleSubmit = () => {
        if (action === "rejected" && !comments.trim()) {
            alert("Los comentarios son obligatorios para rechazar.");
            return;
        }
        onSubmit(justification, action, comments);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 text-white shadow-2xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-blue-400">
                    Revisar Justificación
                </h2>
                <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm font-semibold">{justification.studentName || justification.name}</p>
                    <p className="text-xs text-gray-400">{justification.courseName || justification.code}</p>
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
                    >
                        Cancelar
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition ${action === 'approved'
                            ? 'bg-green-600 hover:bg-green-500'
                            : 'bg-red-600 hover:bg-red-500'
                            }`}
                        onClick={handleSubmit}
                    >
                        Confirmar {action === 'approved' ? 'Aprobación' : 'Rechazo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Clase de Hoy ---
const TodayClassItem = ({ title, code, students, time }) => (
    <div className="flex items-center justify-between bg-gray-500 rounded-xl px-4 py-3 mb-3">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-gray-800 font-medium">{title}</p>
                <p className="text-xs text-gray-100">
                    {code} • {students} estudiantes
                </p>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <p className="text-gray-100 font-semibold text-sm">{time}</p>
            <button className="mt-1 px-3 py-1 text-xs font-semibold rounded-md bg-green-600 hover:bg-green-700 text-white transition">
                Tomar Asistencia
            </button>
        </div>
    </div>
);

// --- Estadísticas por curso ---
const CourseStatItem = ({ title, code, students, attendance, alerts }) => (
    <div className="flex justify-between items-center bg-gray-500 rounded-lg px-3 py-2 mb-2">
        <div>
            <p className="text-gray-900 font-medium">{title}</p>
            <p className="text-xs text-gray-100">
                {code} • {students} horas semanales
            </p>
        </div>
        <div className="text-right">
            <p className="text-gray-900 font-semibold text-sm">{attendance}</p>
            {alerts > 0 ? (
                <span className="text-xs font-semibold bg-red-200 text-red-700 px-2 py-0.5 rounded-full">
                    {alerts} alertas
                </span>
            ) : (
                <span className="text-xs font-semibold text-green-600">Sin alertas</span>
            )}
        </div>
    </div>
);

// --- Justificaciones ---
const JustificationItem = ({ justification, onActionClick }) => (
    <div className="p-3 bg-gray-500 rounded-xl border border-gray-300 mb-3">
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-gray-900 font-semibold">{justification.studentName || justification.name}</h3>
            <span className="text-xs font-bold rounded-full bg-amber-600 text-white px-2 py-0.5">
                {justification.courseCode || justification.code}
            </span>
        </div>
        <p className="text-xs text-gray-100">Falta del {justification.classDate || justification.date}</p>
        <p className="text-sm text-gray-700 mt-1">{justification.reason}</p>
        <div className="flex gap-2 mt-3">
            <button
                onClick={() => onActionClick(justification)}
                className="flex-1 py-1 rounded-md text-sm bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
                Aprobar
            </button>
            <button
                onClick={() => onActionClick(justification)}
                className="flex-1 py-1 rounded-md text-sm bg-gray-400 hover:bg-gray-500 text-white font-semibold"
            >
                Rechazar
            </button>
        </div>
    </div>
);

// --- Página Principal ---
const InicialPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJustification, setSelectedJustification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coursesCount, setCoursesCount] = useState(0);
    const [studentsCount, setStudentsCount] = useState(0);
    const [pendingJustifications, setPendingJustifications] = useState([]);
    const [totalPendingJustifications, setTotalPendingJustifications] = useState(0);
    const [courses, setCourses] = useState([]);

    // Cargar datos del dashboard
    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Cargar estadísticas de estudiantes
                const studentStats = await getStudentStats();
                setStudentsCount(studentStats.total);

                // Cargar datos de cursos usando el nuevo servicio
                const allCourses = await CourseService.getAllCourses();
                setCoursesCount(allCourses.length);
                setCourses(allCourses || []);

                // Cargar justificaciones pendientes
                const allJustifications = await JustificacionService.getAllJustifications();
                const pendingJustifs = allJustifications.filter(j => j.status === "pending");
                setPendingJustifications(pendingJustifs.slice(0, 2)); // Solo las primeras 2
                setTotalPendingJustifications(pendingJustifs.length); // Total de pendientes

            } catch (error) {
                console.error("Error loading dashboard data:", error);
                // En caso de error, mantener los valores por defecto
                setCoursesCount(0);
                setStudentsCount(0);
                setPendingJustifications([]);
                setTotalPendingJustifications(0);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Función de navegación para Justificaciones
    const handleViewAllJustifications = () => {
        window.location.href = 'justifications';
    };

    const currentClasses = [
        {
            title: "Introducción a la Programación",
            code: "INO - Lab 1",
            students: 25,
            time: "08:00 - 10:00",
        },
        {
            title: "Comunicación Oral y Escrita",
            code: "COI - Aula 203",
            students: 22,
            time: "14:00 - 16:00",
        },
    ];

    const recentActivity = [
        {
            type: "calendar",
            text: "Asistencia registrada para INO - 25 estudiantes",
            time: "Hace 2 horas",
        },
        {
            type: "file",
            text: "Nueva justificación de Vicente López",
            time: "Hace 4 horas",
        },
        {
            type: "alert",
            text: "Alerta crítica generada para TP2",
            time: "Hace 1 día",
        },
        {
            type: "calendar",
            text: "Asistencia registrada para COI - 22 estudiantes",
            time: "Hace 2 días",
        },
    ];

    const handleActionClick = (justification) => {
        setSelectedJustification(justification);
        setIsModalOpen(true);
    };

    const handleConfirmAction = async (justification, action, comment) => {
        try {
            // Lógica para actualizar el estado de la justificación
            const payload = {
                reviewedBy: 1, // ID del docente logueado
                reviewComments: comment,
            };

            if (action === "approved") {
                await JustificacionService.approveJustification(justification.justificationId, payload);
            } else {
                await JustificacionService.rejectJustification(justification.justificationId, payload);
            }

            // Recargar las justificaciones después de la acción
            const allJustifications = await JustificacionService.getAllJustifications();
            const pendingJustifs = allJustifications.filter(j => j.status === "pending");
            setPendingJustifications(pendingJustifs.slice(0, 2));
            setTotalPendingJustifications(pendingJustifs.length);

        } catch (error) {
            console.error("Error updating justification:", error);
        } finally {
            setIsModalOpen(false);
            setSelectedJustification(null);
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-800 min-h-screen text-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen text-gray-50">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">¡Bienvenida, María!</h1><br></br>
                <p className="text-sm text-gray-500">
                    DOC001 • Sistemas de Información • {coursesCount} cursos • {studentsCount} estudiantes
                </p>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-12 gap-6">
                {/* Izquierda */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    {/* Clases de hoy */}
                    <div className="bg-slate-300 p-5 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-gray-800" />
                            <h2 className="text-lg font-bold text-gray-800">Clases de Hoy</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            miércoles, 17 de septiembre de 2025
                        </p>
                        {currentClasses.map((clase, i) => (
                            <TodayClassItem key={i} {...clase} />
                        ))}
                    </div>

                    {/* Estadísticas */}
                    <div className="bg-slate-300 p-5 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-gray-800" />
                            <h2 className="text-lg font-bold text-gray-800">Cursos Disponibles</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            Lista de cursos activos
                        </p>
                        {courses.length > 0 ? (
                            courses.map((course, i) => (
                                <CourseStatItem
                                    key={course.courseId || i}
                                    title={course.name}
                                    code={course.code}
                                    students={course.weeklyHours || 0} // Usando horas semanales como dato disponible
                                    attendance={"N/A"}
                                    alerts={0}
                                />
                            ))
                        ) : (
                            <p className="text-gray-600 text-sm text-center py-4">
                                No se encontraron cursos asignados.
                            </p>
                        )}
                    </div>
                </div>

                {/* Derecha */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Resumen rápido */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-950 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg">
                            <p className="text-3xl font-bold text-white">{coursesCount}</p>
                            <p className="text-sm text-gray-300">Cursos</p>
                        </div>
                        <div className="bg-emerald-950 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg">
                            <p className="text-3xl font-bold text-white">{studentsCount}</p>
                            <p className="text-sm text-gray-300">Estudiantes</p>
                        </div>
                    </div>

                    {/* Justificaciones */}
                    <div className="bg-gray-100 p-5 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-gray-800" />
                            <h2 className="text-lg font-bold text-gray-800">
                                Justificaciones Pendientes{" "}
                                <span className="ml-2 text-xs font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                                    {totalPendingJustifications}
                                </span>
                            </h2>
                        </div>

                        {/* Listar solo 2 justificaciones desde la base de datos */}
                        {pendingJustifications.map((justification) => (
                            <JustificationItem
                                key={justification.justificationId}
                                justification={justification}
                                onActionClick={handleActionClick}
                            />
                        ))}

                        {pendingJustifications.length === 0 && (
                            <p className="text-gray-600 text-center py-4">No hay justificaciones pendientes</p>
                        )}

                        <button
                            onClick={handleViewAllJustifications}
                            className="w-full mt-2 py-2 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                        >
                            Ver Todas las Justificaciones <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="bg-gray-100 p-5 rounded-2xl shadow-lg text-gray-900">
                        <h2 className="text-lg font-semibold mb-3">Acciones Rápidas</h2>
                        <div className="flex flex-col gap-3">
                            <button className="py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                                <Calendar className="w-5 h-5" /> Tomar Asistencia
                            </button>
                            <button className="py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Users className="w-5 h-5" /> Ver Estudiantes
                            </button>
                            <button className="py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                                <BarChart3 className="w-5 h-5" /> Generar Reporte
                            </button>
                        </div>
                    </div>

                    {/* Actividad reciente */}
                    <div className="bg-gray-100 p-5 rounded-2xl shadow-lg text-gray-900">
                        <h2 className="text-lg font-semibold mb-3">Actividad Reciente</h2>
                        {recentActivity.map((activity, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-start py-2 border-b border-gray-700 last:border-b-0"
                            >
                                <div className="flex items-start gap-3">
                                    {activity.type === "file" ? (
                                        <FileText className="w-5 h-5 text-amber-300 mt-1" />
                                    ) : activity.type === "calendar" ? (
                                        <Calendar className="w-5 h-5 text-blue-400 mt-1" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                                    )}
                                    <p className="text-sm text-gray-800">{activity.text}</p>
                                </div>
                                <p className="text-xs text-gray-800">{activity.time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación */}
            {isModalOpen && (
                <ReviewModal
                    justification={selectedJustification}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleConfirmAction}
                />
            )}
        </div>
    );
};

export default InicialPage;