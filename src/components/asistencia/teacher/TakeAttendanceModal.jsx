import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, UsersIcon } from '@heroicons/react/24/outline';
import AttendanceService from '../../../services/asistencia/student/asistencia/attendanceeService';

const TakeAttendanceForm = ({ courseId, semester, classDate, onClose, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [courseId, semester]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      console.log('Cargando estudiantes para curso:', courseId, 'semestre:', semester);
      const data = await AttendanceService.getStudentsForAttendance(courseId, semester);
      console.log('Estudiantes cargados:', data);

      const studentsWithAttendance = data.map(student => ({
        ...student,
        status: 'P', // Por defecto presente
        observations: ''
      }));
      setStudents(studentsWithAttendance);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(student =>
      student.studentId === studentId
        ? { ...student, status }
        : student
    ));
  };

  const handleObservationsChange = (studentId, observations) => {
    setStudents(prev => prev.map(student =>
      student.studentId === studentId
        ? { ...student, observations }
        : student
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('💾 Guardando asistencias para', students.length, 'estudiantes');

      const results = [];
      const errors = [];

      // Crear asistencias una por una para detectar duplicados
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const attendanceData = {
          enrollmentId: student.enrollmentId,
          classDate: classDate,
          classTime: `${classDate}T${new Date().toTimeString().split(' ')[0]}`,
          status: student.status,
          observations: student.observations || '',
          recordedBy: 1
        };

        try {
          console.log(`Creando asistencia ${i + 1}/${students.length}:`, attendanceData);
          const result = await AttendanceService.createAttendance(attendanceData);
          results.push({ student: student.studentName, success: true });
        } catch (error) {
          const errorDetail = error.response?.data?.detail || error.message;
          console.error(`❌ Error creando asistencia para ${student.studentName}:`, errorDetail);

          if (errorDetail.includes('already recorded')) {
            errors.push({ student: student.studentName, reason: 'Ya tiene asistencia registrada para esta fecha' });
          } else {
            errors.push({ student: student.studentName, reason: errorDetail });
          }
        }
      }

      // Mostrar resultados
      if (results.length > 0 && errors.length === 0) {
        console.log('✅ Todas las asistencias guardadas correctamente');
        alert(`✅ Asistencias guardadas correctamente\n\n${results.length} estudiantes registrados`);
        onSuccess();
      } else if (results.length > 0 && errors.length > 0) {
        console.warn(`⚠️ ${results.length} exitosas, ${errors.length} con errores`);
        const errorList = errors.map(e => `• ${e.student}: ${e.reason}`).join('\n');
        alert(`⚠️ Asistencias guardadas parcialmente\n\n✅ Exitosas: ${results.length}\n❌ Con errores: ${errors.length}\n\nDetalles:\n${errorList}`);
        onSuccess();
      } else {
        console.error('❌ Todas las asistencias fallaron');
        const errorList = errors.map(e => `• ${e.student}: ${e.reason}`).join('\n');
        alert(`❌ No se pudieron guardar las asistencias\n\n${errorList}`);
      }
    } catch (error) {
      console.error('❌ Error crítico saving attendance:', error);
      alert('❌ Error crítico al guardar asistencias: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'P': 'border-green-500 bg-green-50 text-gray-900',
      'L': 'border-yellow-500 bg-yellow-50 text-gray-900',
      'A': 'border-red-500 bg-red-50 text-gray-900',
      'J': 'border-blue-500 bg-blue-50 text-gray-900'
    };
    return colors[status] || 'border-gray-300 bg-white text-gray-900';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Registro de Asistencia
          </h2>
          <p className="text-base text-gray-600 mt-1">
            Fecha: {classDate}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          <XMarkIcon className="w-5 h-5" />
          <span>Cancelar</span>
        </button>
      </div>

      <div className="mt-6 overflow-y-auto bg-gray-50 rounded-lg p-4 max-h-[70vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando estudiantes...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay estudiantes</h3>
            <p className="text-gray-600">No se encontraron estudiantes inscritos en este curso.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Encabezado de tabla */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg shadow-sm">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Estudiante</div>
              <div className="col-span-3">Estado</div>
              <div className="col-span-4">Observaciones</div>
            </div>

            {/* Filas de estudiantes */}
            {students.map((student, index) => (
              <div
                key={student.studentId}
                className={`grid grid-cols-12 gap-4 items-center p-3 border-2 rounded-lg transition-all ${getStatusColor(student.status)}`}
              >
                <div className="col-span-1 text-sm font-medium">
                  {index + 1}
                </div>

                <div className="col-span-4">
                  <h3 className="font-medium truncate text-gray-900">
                    {student.studentName}
                  </h3>
                  <p className="text-xs text-gray-600">
                    ID: {student.studentId}
                  </p>
                </div>

                <div className="col-span-3">
                  <select
                    value={student.status}
                    onChange={(e) => handleStatusChange(student.studentId, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                  >
                    <option value="P">✅ Presente</option>
                    <option value="L">⏰ Tarde</option>
                    <option value="A">❌ Ausente</option>
                    <option value="J">📄 Justificado</option>
                  </select>
                </div>

                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Observaciones opcionales..."
                    value={student.observations}
                    onChange={(e) => handleObservationsChange(student.studentId, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie de página con botón de guardar */}
      <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || loading || students.length === 0}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <CheckIcon className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : `Guardar Asistencias (${students.length})`}</span>
        </button>
      </div>
    </div>
  );
};

export default TakeAttendanceForm;