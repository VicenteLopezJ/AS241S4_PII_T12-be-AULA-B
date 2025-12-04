import React, { useState, useEffect } from 'react';
import {
  CalendarIcon, ClockIcon, UsersIcon, BookOpenIcon, PlusIcon, PencilIcon, TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import AttendanceService from '../../../services/asistencia/student/asistencia/attendanceeService';
import TakeAttendanceForm from '../../../components/asistencia/teacher/TakeAttendanceModal';
import EditAttendanceModal from '../../../components/asistencia/teacher/EditAttendanceModal';
import AttendanceStats from '../../../components/asistencia/teacher/AttendanceStats';

// Componente Card auxiliar (sin cambios)
const Card = ({ title, description, children, className = '' }) => (
  <div className={`bg-slate-300 p-6 rounded-xl shadow-lg text-gray-900 ${className}`}>
    {title && (
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
    )}
    {description && (
      <p className="text-sm opacity-70 mb-4">{description}</p>
    )}
    {children}
  </div>
);

// Componente StatusBadge auxiliar (sin cambios)
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'P': { label: 'Presente', color: 'bg-green-100 text-green-800 border-green-200' },
    'L': { label: 'Tarde', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'A': { label: 'Ausente', color: 'bg-red-100 text-red-800 border-red-200' },
    'J': { label: 'Justificado', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  };

  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

const AttendancePage = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    studentId: '',
    courseId: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [viewMode, setViewMode] = useState('today');
  const [selectedSemester, setSelectedSemester] = useState('1'); // Default to 1st semester
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState([]); // State for dynamic courses

  // Estados para modales/formulario en línea
  const [showTakeAttendance, setShowTakeAttendance] = useState(false); // Controla el formulario en línea
  const [showEditAttendance, setShowEditAttendance] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Load courses when semester changes
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const fetchedCourses = await AttendanceService.getCoursesBySemester(selectedSemester);
        setCourses(fetchedCourses);
        // Reset selected course when semester changes
        if (fetchedCourses.length > 0) {
          setSelectedCourse(fetchedCourses[0].courseId);
        } else {
          setSelectedCourse('');
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
      }
    };
    loadCourses();
  }, [selectedSemester]);

  // Cargar asistencias cuando cambien los filtros, curso, fecha o se cierre el formulario
  useEffect(() => {
    // Solo cargar la lista si NO estamos en el modo de tomar asistencia en línea
    if (!showTakeAttendance) {
      loadAttendances();
    }
  }, [filters, selectedCourse, selectedDate, viewMode, showTakeAttendance]); // <-- showTakeAttendance añadido

  const loadAttendances = async () => {
    if (!selectedCourse && (viewMode === 'today' || viewMode === 'history')) {
      setAttendances([]);
      return;
    }

    setLoading(true);
    try {
      const requestFilters = { ...filters };

      // En modo "today", usar el curso y fecha seleccionados
      if (viewMode === 'today') {
        requestFilters.courseId = selectedCourse;
        requestFilters.dateFrom = selectedDate;
        requestFilters.dateTo = selectedDate;
      } else {
        // En modo "history", usar curso seleccionado, y aplicar filtros de fecha si existen
        requestFilters.courseId = selectedCourse;
        // Solo aplicar fechas si se han especificado en los filtros
        // NOTA: Para el historial, la fecha seleccionada arriba (selectedDate) NO se usa, solo se usan los `filters`
        if (!filters.dateFrom) delete requestFilters.dateFrom;
        if (!filters.dateTo) delete requestFilters.dateTo;
      }

      console.log('Cargando asistencias con filtros:', requestFilters);
      const data = await AttendanceService.getAttendances(requestFilters);
      setAttendances(data);
    } catch (error) {
      console.error('Error loading attendances:', error);
      // En desarrollo, usar datos mock
      const mockData = AttendanceService.getMockAttendances(
        selectedCourse,
        viewMode === 'today' ? selectedDate : null,
        filters.status
      );
      setAttendances(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAttendance = () => {
    if (!selectedCourse || !selectedDate) {
      alert('Por favor selecciona un curso y fecha');
      return;
    }
    // Cambiar a la vista del formulario en línea
    setShowTakeAttendance(true);
  };

  const handleEditAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setShowEditAttendance(true);
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta asistencia?')) {
      try {
        await AttendanceService.deactivateAttendance(attendanceId);
        loadAttendances();
      } catch (error) {
        console.error('Error deleting attendance:', error);
      }
    }
  };

  const handleAttendanceSuccess = () => {
    setShowTakeAttendance(false); // Ocultar el formulario en línea
    setShowEditAttendance(false);
    setSelectedAttendance(null);
    loadAttendances(); // Recargar la lista de asistencias
  };

  const handleCancelTakeAttendance = () => {
    setShowTakeAttendance(false); // Función para el botón 'Cancelar' del formulario
  };

  const clearFilters = () => {
    setFilters({
      studentId: '',
      courseId: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // IMPORTANTE: Al cambiar de modo, ocultamos el formulario de toma si estaba abierto
    setShowTakeAttendance(false);

    // Al cambiar a historial, forzar la recarga de asistencias
    if (mode === 'history') {
      setFilters(prev => ({
        ...prev,
        dateFrom: '',
        dateTo: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 p-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-2">Gestión de Asistencias</h1>
      <p className="text-sm font-light mb-8 opacity-70">
        Registra y gestiona la asistencia de tus estudiantes
      </p>

      <div className="space-y-6">
        {/* Estadísticas */}
        <AttendanceStats attendances={attendances} />

        {/* Modo de Vista */}
        <Card title="Modo de Vista">
          <div className="flex space-x-3">
            <button
              onClick={() => handleViewModeChange('today')}
              className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-lg transition ${viewMode === 'today'
                  ? 'bg-blue-700 text-white hover:bg-blue-800'
                  : 'bg-gray-600 text-gray-100 hover:bg-gray-700'
                }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Asistencia del Día</span>
            </button>
            <button
              onClick={() => handleViewModeChange('history')}
              className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-lg transition ${viewMode === 'history'
                  ? 'bg-blue-700 text-white hover:bg-blue-800'
                  : 'bg-gray-600 text-gray-100 hover:bg-gray-700'
                }`}
            >
              <ClockIcon className="w-5 h-5" />
              <span>Ver Historial</span>
            </button>
          </div>
        </Card>

        {/* Filtros y Selección */}
        <Card title="Seleccionar Filtros">
          <div className="p-6 rounded-xl bg-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 text-gray-900">
            <div>
              <label className="block text-sm font-medium mb-2">Semestre</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 border-gray-600"
              >
                <option value="1">1er Semestre</option>
                <option value="2">2do Semestre</option>
                <option value="3">3er Semestre</option>
                <option value="4">4to Semestre</option>
                <option value="5">5to Semestre</option>
                <option value="6">6to Semestre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Curso</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 border-gray-600"
                disabled={courses.length === 0}
              >
                {courses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.name}
                  </option>
                ))}
                {courses.length === 0 && <option value="">Sin cursos disponibles</option>}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={viewMode === 'history'} // Deshabilitar si está en historial
                  className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg shadow-inner appearance-none focus:ring-blue-500 focus:border-blue-500 border-gray-600 ${viewMode === 'history' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleTakeAttendance}
                disabled={!selectedCourse || viewMode === 'history'} // Deshabilitar si está en historial
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Tomar Asistencia</span>
              </button>

              {viewMode === 'history' && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <FunnelIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros adicionales para historial */}
          {viewMode === 'history' && showFilters && (
            <div className="mt-4 p-4 bg-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                >
                  <option value="">Todos los estados</option>
                  <option value="P">Presente</option>
                  <option value="L">Tarde</option>
                  <option value="A">Ausente</option>
                  <option value="J">Justificado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ID Estudiante</label>
                <input
                  type="number"
                  placeholder="ID del estudiante"
                  value={filters.studentId}
                  onChange={(e) => setFilters(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Lista de Asistencias / FORMULARIO EN LÍNEA */}
        <Card>
          {showTakeAttendance ? (
            // 1. VISTA DE FORMULARIO DE TOMA DE ASISTENCIA
            <TakeAttendanceForm
              courseId={selectedCourse}
              semester={selectedSemester}
              classDate={selectedDate}
              onClose={handleCancelTakeAttendance}
              onSuccess={handleAttendanceSuccess}
            />
          ) : (
            // 2. VISTAS DE LISTA (HOY o HISTORIAL)
            <>
              {(!selectedCourse) ? (
                // Muestra mensaje si no hay curso seleccionado
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <BookOpenIcon className="w-12 h-12 mb-4 text-gray-900" />
                  <h3 className="text-xl font-semibold text-gray-900">Selecciona un curso</h3>
                  <p className="text-sm text-gray-600">
                    Elige un curso para ver {viewMode === 'today' ? 'la asistencia de hoy' : 'el historial de asistencias'}
                  </p>
                </div>
              ) : loading ? (
                // Muestra loading
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : attendances.length === 0 ? (
                // Muestra mensaje si no hay asistencias registradas
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <UsersIcon className="w-12 h-12 mb-4 text-gray-900" />
                  <h3 className="text-xl font-semibold text-gray-900">No hay asistencias registradas</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {viewMode === 'today'
                      ? `No hay asistencias para el ${selectedDate}`
                      : 'No hay asistencias que coincidan con los filtros'
                    }
                  </p>
                  {viewMode === 'today' && (
                    <button
                      onClick={handleTakeAttendance}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Tomar Asistencia</span>
                    </button>
                  )}
                </div>
              ) : (
                // Muestra la tabla de asistencias (HISTORIAL O DÍA)
                <div className="overflow-x-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {viewMode === 'today' ? 'Asistencias del Día' : 'Historial de Asistencias'}
                      <span className="text-sm font-normal ml-2">({attendances.length} registros)</span>
                    </h3>
                    {viewMode === 'history' && (
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <FunnelIcon className="w-4 h-4" />
                        <span>Filtros</span>
                      </button>
                    )}
                  </div>

                  <table className="w-full text-sm text-left text-gray-900">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-100">
                      <tr>
                        <th className="px-6 py-3">Estudiante</th>
                        <th className="px-6 py-3">Curso</th>
                        <th className="px-6 py-3">Fecha</th>
                        <th className="px-6 py-3">Hora</th>
                        <th className="px-6 py-3">Estado</th>
                        <th className="px-6 py-3">Observaciones</th>
                        <th className="px-6 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.map((attendance) => (
                        <tr key={attendance.attendanceId} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{attendance.studentName}</td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium">{attendance.courseName}</div>
                              <div className="text-xs text-gray-600">{attendance.courseCode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{attendance.classDate}</td>
                          <td className="px-6 py-4">
                            {new Date(attendance.classTime).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={attendance.status} />
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="truncate" title={attendance.observations}>
                              {attendance.observations || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAttendance(attendance)}
                                className="p-2 text-blue-600 hover:text-blue-800 transition hover:bg-blue-50 rounded"
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAttendance(attendance.attendanceId)}
                                className="p-2 text-red-600 hover:text-red-800 transition hover:bg-red-50 rounded"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Modales (EditAttendanceModal sigue siendo un modal flotante) */}
      {showEditAttendance && selectedAttendance && (
        <EditAttendanceModal
          attendance={selectedAttendance}
          onClose={() => {
            setShowEditAttendance(false);
            setSelectedAttendance(null);
          }}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
};
export default AttendancePage;