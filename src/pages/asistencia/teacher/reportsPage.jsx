import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, ChartBarIcon, BellAlertIcon, ClockIcon, UserGroupIcon, ArrowsPointingOutIcon, AdjustmentsHorizontalIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import CourseService from '../../../services/asistencia/student/cursos/CourseService';
import Swal from "sweetalert2";

// Datos de ejemplo simulados para la sección de Reportes
const reportData = {
    summary: [
        { course: "Introducción a la Programación", code: "INO", students: 25, present: 88.5, late: 6.9, missing: 3.3, justified: 1.3 },
        { course: "Comunicación Oral y Escrita", code: "COE", students: 22, present: 92.1, late: 5.4, missing: 1.9, justified: 0.6 },
        { course: "Fundamentos de Administración", code: "FAH", students: 20, present: 85.3, late: 9.1, missing: 3.6, justified: 2.0 },
        { course: "Tecnología de la Información", code: "TPI", students: 18, present: 79.2, late: 12.3, missing: 6.5, justified: 2.0 },
    ],
    alerts: [
        { student: "Carlos Mendoza", code: "TPI", percentage: 65.2, reason: "Múltiples faltas sin justificar", type: "CRITICO" },
        { student: "Ana Rodríguez", code: "INO", percentage: 72.8, reason: "Tardanzas frecuentes", type: "ALERTA" },
        { student: "Luis García", code: "FAH", percentage: 74.1, reason: "Asistencia irregular", type: "ALERTA" },
    ],
    trends: [
        { week: 1, alerts: 5, attendance: 87.2 },
        { week: 2, alerts: 3, attendance: 89.1 },
        { week: 3, alerts: 7, attendance: 85.8 },
        { week: 4, alerts: 4, attendance: 88.5 },
    ]
};

// Componente de los Porcentajes dentro del Resumen
const PercentagePill = ({ label, percentage, bgColor, textColor = 'text-white' }) => (
    <div className={`text-xs p-1 rounded-md text-center ${bgColor} ${textColor} font-medium`}>
        <span className="block font-semibold">{percentage}%</span>
        <span className="block font-light text-[10px] opacity-80">{label}</span>
    </div>
);

// Componente para una fila de Resumen de Asistencia
const SummaryRow = ({ courseData }) => {
    return (
        <div className="border-b border-slate-400 py-3 last:border-b-0">
            <div className="flex justify-between items-center mb-2">
                <div className="text-gray-900">
                    <span className="text-sm font-semibold block">{courseData.course}</span>
                    <span className="text-xs text-gray-600 block">{courseData.code} - {courseData.students} estudiantes</span>
                </div>
                <div className="text-right text-gray-900">
                    <span className="text-2xl font-bold">{courseData.present.toFixed(1)}%</span>
                    <span className="text-xs text-gray-600 block">Asistencia</span>
                </div>
            </div>

            {/* Barras de porcentaje */}
            <div className="grid grid-cols-4 gap-2">
                <PercentagePill
                    label="Presente"
                    percentage={courseData.present.toFixed(1)}
                    bgColor="bg-green-600"
                />
                <PercentagePill
                    label="Tardanza"
                    percentage={courseData.late.toFixed(1)}
                    bgColor="bg-yellow-600"
                />
                <PercentagePill
                    label="Falta"
                    percentage={courseData.missing.toFixed(1)}
                    bgColor="bg-red-700"
                />
                <PercentagePill
                    label="Justificado"
                    percentage={courseData.justified.toFixed(1)}
                    bgColor="bg-gray-700"
                />
            </div>
        </div>
    );
};

// Componente para una Alerta Activa
const AlertItem = ({ alert }) => {
    const isCritical = alert.type === 'CRITICO';
    const bgColor = isCritical ? 'bg-red-700' : 'bg-yellow-600';
    const tagText = isCritical ? 'CRÍTICO' : 'ALERTA';

    return (
        <div className="bg-slate-400 p-3 rounded-xl mb-3 flex justify-between items-start text-gray-900">
            <div className="flex flex-col">
                <div className='flex items-center space-x-2'>
                    <span className="text-md font-semibold">{alert.student}</span>
                    <span className="text-xs font-medium text-gray-500">{alert.code}</span>
                </div>
                <span className="text-sm font-light text-gray-700">{alert.percentage}% de asistencia</span>
                <span className="text-xs italic text-gray-500 mt-1">{alert.reason}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${bgColor}`}>
                {tagText}
            </span>
        </div>
    );
};

// Componente para una Tendencia por Periodo
const TrendItem = ({ trend }) => {
    return (
        <div className="bg-slate-400 p-3 rounded-xl mb-3 flex justify-between items-center text-gray-900">
            <div className="flex flex-col">
                <span className="text-sm font-semibold">{`Semana ${trend.week}`}</span>
                <span className="text-xs text-gray-600">{trend.alerts} alertas generadas</span>
            </div>
            <div className="text-right">
                <span className="text-lg font-bold">{trend.attendance.toFixed(1)}%</span>
                <span className="text-xs text-gray-600">Asistencia promedio</span>
            </div>
        </div>
    );
};

// Componente auxiliar para botones rápidos
const QuickReportButton = ({ icon, label, colorClass }) => {
    const IconComponent = icon;

    return (
        <button className={`flex items-center w-full p-3 rounded-lg text-white font-medium shadow-md ${colorClass} hover:opacity-90 transition-opacity`}>
            <IconComponent className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </button>
    );
};

// Función para generar contenido CSV para Excel
const generateCSVContent = (data, semesterName, courseName, attendanceFilter) => {
    let csvContent = "Reporte de Asistencia\n";
    csvContent += `Semestre: ${semesterName}\n`;
    csvContent += `Curso: ${courseName}\n`;
    csvContent += `Filtro de Asistencia: ${attendanceFilter}\n\n`;

    if (Array.isArray(data) && data.length > 0) {
        // Encabezados
        const headers = Object.keys(data[0]);
        csvContent += headers.join(',') + '\n';

        // Datos
        data.forEach(item => {
            const row = headers.map(header => {
                const value = item[header];
                // Escapar comas y comillas
                return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            }).join(',');
            csvContent += row + '\n';
        });
    } else {
        csvContent += "No hay datos disponibles\n";
    }

    return csvContent;
};

// Función para generar contenido HTML para PDF
const generateHTMLContent = (data, semesterName, courseName, attendanceFilter) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte de Asistencia</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Reporte de Asistencia</h1>
            </div>
            <div class="info">
                <p><strong>Semestre:</strong> ${semesterName}</p>
                <p><strong>Curso:</strong> ${courseName}</p>
                <p><strong>Filtro de Asistencia:</strong> ${attendanceFilter}</p>
                <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            ${Array.isArray(data) && data.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                ${Object.values(item).map(value => `<td>${value}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>No hay datos disponibles</p>'}
            <div class="footer">
                <p>Generado automáticamente por el Sistema de Asistencia</p>
            </div>
        </body>
        </html>
    `;
};

// Componente principal
const ReportsPage = () => {
    // Estados para los filtros
    const [selectedSemester, setSelectedSemester] = useState('');
    const [reportType, setReportType] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState('ninguno');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Obtener semestres disponibles
    const semesters = CourseService.getAllSemesters();

    // Cargar cursos cuando cambie el semestre seleccionado
    useEffect(() => {
        const loadCourses = async () => {
            if (selectedSemester) {
                setIsLoading(true);
                try {
                    const coursesData = await CourseService.getCoursesBySemester(parseInt(selectedSemester));
                    // Asegurarnos de que cada curso tenga un ID único
                    const coursesWithIds = Array.isArray(coursesData)
                        ? coursesData.map((course, index) => ({
                            ...course,
                            id: course.id || `course-${index}-${Date.now()}`
                        }))
                        : [];
                    setCourses(coursesWithIds);
                } catch (error) {
                    console.error('Error al cargar cursos:', error);
                    setCourses([]);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar los cursos del semestre seleccionado',
                    });
                } finally {
                    setIsLoading(false);
                }
            } else {
                setCourses([]);
                setSelectedCourse('');
            }
        };

        loadCourses();
    }, [selectedSemester]);

    // Función para generar reporte
    const handleGenerateReport = async () => {
        if (!selectedSemester) {
            Swal.fire({
                icon: 'warning',
                title: 'Semestre requerido',
                text: 'Por favor seleccione un semestre',
            });
            return;
        }

        if (!reportType) {
            Swal.fire({
                icon: 'warning',
                title: 'Tipo de reporte requerido',
                text: 'Por favor seleccione un tipo de reporte (PDF o Excel)',
            });
            return;
        }

        try {
            setIsLoading(true);

            // Mostrar mensaje de carga
            Swal.fire({
                title: 'Generando reporte...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            let reportData = [];
            const semesterName = semesters.find(s => s.id === parseInt(selectedSemester))?.name || 'Semestre';
            const courseName = selectedCourse && selectedCourse !== 'todos'
                ? courses.find(c => c.id === selectedCourse)?.name || 'Curso'
                : 'Todos los cursos';

            // Lógica para obtener datos según los filtros
            if (selectedCourse && selectedCourse !== 'todos') {
                // Obtener asistencias por curso específico
                const courseData = await CourseService.getAttendancesByCourse(selectedCourse);
                reportData = Array.isArray(courseData) ? courseData : [];

                // Si hay filtro de asistencia y no es "ninguno" ni "todos", filtrar por estado
                if (attendanceStatus && attendanceStatus !== 'ninguno' && attendanceStatus !== 'todos') {
                    reportData = reportData.filter(attendance => attendance.status === attendanceStatus);
                }
            } else if (attendanceStatus && attendanceStatus !== 'ninguno' && attendanceStatus !== 'todos') {
                // Obtener asistencias por estado específico para todos los cursos del semestre
                const statusData = await CourseService.getAttendancesByStatus(attendanceStatus);
                reportData = Array.isArray(statusData) ? statusData : [];
            } else {
                // Obtener todos los cursos del semestre (sin filtro de asistencia)
                const coursesData = await CourseService.getCoursesBySemester(parseInt(selectedSemester));
                reportData = Array.isArray(coursesData) ? coursesData : [];
            }

            // Generar reporte según el tipo seleccionado
            if (reportType === 'pdf') {
                await generatePDFReport(reportData, semesterName, courseName, attendanceStatus);
            } else if (reportType === 'excel') {
                await generateExcelReport(reportData, semesterName, courseName, attendanceStatus);
            }

            Swal.close();

        } catch (error) {
            console.error('Error al generar reporte:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al generar el reporte',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para generar reporte PDF
    const generatePDFReport = async (data, semesterName, courseName, attendanceFilter) => {
        try {
            // Generar contenido HTML para el PDF
            const htmlContent = generateHTMLContent(data, semesterName, courseName, attendanceFilter);

            // Crear blob con el contenido HTML
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const attendanceText = attendanceFilter === 'ninguno' ? 'sin-filtro-asistencia' : attendanceFilter;
            const fileName = `reporte-${semesterName.toLowerCase().replace(/\s+/g, '-')}-${courseName.toLowerCase().replace(/\s+/g, '-')}-${attendanceText}.html`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'Reporte generado',
                text: `El reporte se ha descargado exitosamente como HTML (listo para imprimir como PDF)`,
                timer: 4000,
                showConfirmButton: true
            });

        } catch (error) {
            console.error('Error al generar PDF:', error);
            throw new Error('Error al generar el reporte PDF');
        }
    };

    // Función para generar reporte Excel
    const generateExcelReport = async (data, semesterName, courseName, attendanceFilter) => {
        try {
            // Generar contenido CSV
            const csvContent = generateCSVContent(data, semesterName, courseName, attendanceFilter);

            // Crear blob con el contenido CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const attendanceText = attendanceFilter === 'ninguno' ? 'sin-filtro-asistencia' : attendanceFilter;
            const fileName = `reporte-${semesterName.toLowerCase().replace(/\s+/g, '-')}-${courseName.toLowerCase().replace(/\s+/g, '-')}-${attendanceText}.csv`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'Reporte generado',
                text: `El reporte se ha descargado exitosamente como CSV (compatible con Excel)`,
                timer: 4000,
                showConfirmButton: true
            });

        } catch (error) {
            console.error('Error al generar Excel:', error);
            throw new Error('Error al generar el reporte Excel');
        }
    };

    // Colores para los botones de Reportes Rápidos
    const reportColors = {
        green: 'bg-green-600',
        blue: 'bg-blue-600',
        purple: 'bg-purple-600',
        orange: 'bg-orange-600',
        teal: 'bg-teal-600',
    };

    return (
        <div className="min-h-screen bg-gray-800 p-8 text-gray-100">
            {/* Título y Subtítulo de la página (Blanco) */}
            <h1 className="text-3xl font-bold mb-2">Reportes y Análisis</h1>
            <p className="text-sm font-light mb-8 opacity-70">
                Genera reportes detallados sobre el rendimiento y asistencia de tus estudiantes por semestre
            </p>

            {/* --- 1. Configuración de Reporte (bg-slate-300) --- */}
            <div className="bg-slate-300 p-6 rounded-xl shadow-lg mb-8 text-gray-900">
                <div className="flex items-center mb-5">
                    <DocumentTextIcon className="w-6 h-6 mr-2 text-gray-700" />
                    <h2 className="text-lg font-semibold">Configuración de Reporte</h2>
                </div>

                <div className="grid grid-cols-5 gap-6 items-end">
                    {/* Semestre */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600">Semestre</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-600 text-white rounded-lg appearance-none border border-slate-500 focus:ring-blue-700 focus:border-blue-700"
                                value={selectedSemester}
                                onChange={(e) => {
                                    setSelectedSemester(e.target.value);
                                    setSelectedCourse(''); // Resetear curso al cambiar semestre
                                }}
                            >
                                <option value="">Seleccione semestre</option>
                                {semesters.map(semester => (
                                    <option key={`semester-${semester.id}`} value={semester.id}>
                                        {semester.name}
                                    </option>
                                ))}
                            </select>
                            <ArrowDownOnSquareIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                        </div>
                    </div>

                    {/* Tipo de Reporte */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600">Tipo de Reporte</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-600 text-white rounded-lg appearance-none border border-slate-500 focus:ring-blue-700 focus:border-blue-700"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="">Seleccione tipo</option>
                                <option value="pdf">Reporte en PDF</option>
                                <option value="excel">Reporte en Excel</option>
                            </select>
                            <ArrowDownOnSquareIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                        </div>
                    </div>

                    {/* Curso */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600">Curso</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-600 text-white rounded-lg appearance-none border border-slate-500 focus:ring-blue-700 focus:border-blue-700"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                disabled={!selectedSemester || isLoading}
                            >
                                <option value="todos">Todos los cursos</option>
                                {courses.map((course, index) => (
                                    <option key={`course-${course.id || `temp-${index}`}`} value={course.id}>
                                        {course.name || course.nombre || `Curso ${index + 1}`}
                                    </option>
                                ))}
                            </select>
                            <ArrowDownOnSquareIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                        </div>
                    </div>

                    {/* Asistencia (reemplaza Periodo) */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600">Asistencia</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-600 text-white rounded-lg appearance-none border border-slate-500 focus:ring-blue-700 focus:border-blue-700"
                                value={attendanceStatus}
                                onChange={(e) => setAttendanceStatus(e.target.value)}
                            >
                                <option value="ninguno">Ninguno</option>
                                <option value="todos">Todos</option>
                                <option value="P">Presente (P)</option>
                                <option value="L">Tardanza (L)</option>
                                <option value="A">Ausente (A)</option>
                                <option value="J">Justificado (J)</option>
                            </select>
                            <ArrowDownOnSquareIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                        </div>
                    </div>

                    {/* Botón Generar Reporte */}
                    <button
                        className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm text-white font-medium rounded-lg bg-blue-700 hover:bg-blue-600 transition shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                    >
                        <ArrowDownOnSquareIcon className="w-5 h-5" />
                        <span>{isLoading ? 'Generando...' : 'Generar Reporte'}</span>
                    </button>
                </div>
            </div>

            {/* --- 2. Contenido Principal: Resumen, Alertas, Tendencias y Reportes Rápidos --- */}
            <div className="grid grid-cols-3 gap-6">

                {/* Columna Izquierda (Resumen y Tendencias) */}
                <div className="col-span-2 space-y-6">

                    {/* Resumen de Asistencia por Curso (bg-slate-300) */}
                    <div className="bg-slate-300 p-6 rounded-xl shadow-lg text-gray-900">
                        <div className="flex items-center mb-4">
                            <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700" />
                            <h2 className="text-lg font-semibold">Resumen de Asistencia por Curso</h2>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                            {selectedSemester ? `${semesters.find(s => s.id === parseInt(selectedSemester))?.name} - ` : ''}Porcentajes del último mes
                        </p>

                        <div className="space-y-3">
                            {reportData.summary.map((course, index) => (
                                <SummaryRow key={`summary-${index}`} courseData={course} />
                            ))}
                        </div>
                    </div>

                    {/* Tendencias por Periodo (bg-slate-300) */}
                    <div className="bg-slate-300 p-6 rounded-xl shadow-lg text-gray-900">
                        <div className="flex items-center mb-4">
                            <ArrowsPointingOutIcon className="w-6 h-6 mr-2 text-gray-700" />
                            <h2 className="text-lg font-semibold">Tendencias por Periodo</h2>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                            {selectedSemester ? `${semesters.find(s => s.id === parseInt(selectedSemester))?.name} - ` : ''}Evolución por semanas
                        </p>

                        <div className="space-y-2">
                            {reportData.trends.map((trend, index) => (
                                <TrendItem key={`trend-${index}`} trend={trend} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha (Alertas y Reportes Rápidos) */}
                <div className="col-span-1 space-y-6">

                    {/* Alertas Activas (bg-slate-300) */}
                    <div className="bg-slate-300 p-6 rounded-xl shadow-lg text-gray-900">
                        <div className="flex items-center mb-4">
                            <BellAlertIcon className="w-6 h-6 mr-2 text-gray-700" />
                            <h2 className="text-lg font-semibold">Alertas Activas</h2>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                            {selectedSemester ? `${semesters.find(s => s.id === parseInt(selectedSemester))?.name} - ` : ''}Todos los cursos
                        </p>

                        <div className="space-y-3">
                            {reportData.alerts.map((alert, index) => (
                                <AlertItem key={`alert-${index}`} alert={alert} />
                            ))}
                        </div>

                        {/* Botón Ver Todas las Alertas (Color de Alerta: Naranja/Amarillo) */}
                        <button className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm text-white font-medium rounded-lg bg-yellow-600 hover:bg-yellow-500 transition shadow-lg">
                            <span>Ver Todas las Alertas</span>
                        </button>
                    </div>

                    {/* Reportes Rápidos (bg-slate-300) */}
                    <div className="bg-slate-300 p-6 rounded-xl shadow-lg text-gray-900">
                        <div className="flex items-center mb-4">
                            <ClockIcon className="w-6 h-6 mr-2 text-gray-700" />
                            <h2 className="text-lg font-semibold">Reportes Rápidos</h2>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                            Reportes específicos para {selectedSemester ? semesters.find(s => s.id === parseInt(selectedSemester))?.name : 'seleccionar semestre'}
                        </p>

                        <div className="space-y-3">
                            <QuickReportButton
                                icon={AdjustmentsHorizontalIcon}
                                label="Asistencia Diaria - Hoy"
                                colorClass={reportColors.green}
                            />
                            <QuickReportButton
                                icon={UserGroupIcon}
                                label="Lista de Estudiantes por Curso"
                                colorClass={reportColors.blue}
                            />
                            <QuickReportButton
                                icon={BellAlertIcon}
                                label="Estudiantes en Riesgo"
                                colorClass={reportColors.purple}
                            />
                            <QuickReportButton
                                icon={DocumentTextIcon}
                                label="Justificaciones del Mes"
                                colorClass={reportColors.orange}
                            />
                            <QuickReportButton
                                icon={ChartBarIcon}
                                label="Análisis de Tendencias"
                                colorClass={reportColors.teal}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;