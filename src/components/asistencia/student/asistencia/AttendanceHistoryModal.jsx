// src/components/asistencia/student/asistencia/AttendanceHistoryModal.jsx
// 🔥 VERSIÓN CORREGIDA - Estados y porcentajes funcionando correctamente

import React, { useState, useEffect } from 'react';
import { XMarkIcon, BoltIcon, ChartBarIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getSprintsConfig, fetchAttendancesBySprint } from '../../../../services/asistencia/student/asistencia/attendanceService';

const AttendanceHistoryModal = ({ isOpen, onClose, studentId }) => {
  const [history, setHistory] = useState([]);
  const [sprintsConfig, setSprintsConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSprints, setExpandedSprints] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  // 🔥 FUNCIÓN CORREGIDA: Calcula estado según porcentaje exacto
  const getAttendanceStatus = (percentage) => {
    const numPercent = typeof percentage === 'string' 
      ? parseFloat(percentage) 
      : percentage;
    
    if (isNaN(numPercent) || numPercent === 0) return 'SIN DATOS';
    
    // ✅ CORRECCIÓN: Usar >= para incluir el valor límite
    if (numPercent >= 85) return 'ÓPTIMO';
    if (numPercent >= 70) return 'ALERTA';
    return 'CRÍTICO';
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getSprintsConfig(studentId, '2025-II');
      setSprintsConfig(config);
      
      const sprintPromises = config.sprints.map(async (sprint) => {
        const attendances = await fetchAttendancesBySprint(studentId, sprint.sprintNumber, '2025-II');
        
        // Calcular estadísticas del sprint
        const totalClasses = attendances.reduce((sum, c) => sum + c.plan, 0);
        const totalPresent = attendances.reduce((sum, c) => sum + c.a, 0);
        const totalAbsent = attendances.reduce((sum, c) => sum + c.f, 0);
        const totalLate = attendances.reduce((sum, c) => sum + c.t, 0);
        const totalJustified = attendances.reduce((sum, c) => sum + c.j, 0);
        const totalEffective = attendances.reduce((sum, c) => sum + c.asistencias, 0);
        
        // 🔥 CÁLCULO CORRECTO DEL PORCENTAJE
        const percentage = totalClasses > 0 ? (totalEffective / totalClasses) * 100 : 0;
        
        // 🔥 USAR FUNCIÓN CORREGIDA PARA DETERMINAR ESTADO
        const status = getAttendanceStatus(percentage);
        
        console.log(`📊 Sprint ${sprint.sprintNumber}: ${percentage.toFixed(2)}% = ${status}`);
        
        return {
          sprintNumber: sprint.sprintNumber,
          sprintName: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          totalClasses,
          present: totalPresent,
          absent: totalAbsent,
          late: totalLate,
          justified: totalJustified,
          effectiveAttendance: totalEffective,
          percentage: percentage.toFixed(2),
          status,
          courses: attendances
        };
      });
      
      const sprintsData = await Promise.all(sprintPromises);
      setHistory(sprintsData);
      
    } catch (err) {
      setError('Error al cargar el historial de asistencias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSprint = (sprintNumber) => {
    setExpandedSprints(prev => ({
      ...prev,
      [sprintNumber]: !prev[sprintNumber]
    }));
  };

  if (!isOpen) return null;

  // 🔥 FUNCIÓN CORREGIDA: Colores basados en estado normalizado
  const getStatusColor = (status) => {
    const normalized = status
      ?.toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    
    switch (normalized) {
      case 'OPTIMO':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ALERTA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CRITICO':
      case 'DESAPROBADO':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'SIN DATOS':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 🔥 FUNCIÓN CORREGIDA: Barra de progreso basada en porcentaje numérico
  const getProgressBarColor = (percentage) => {
    const numPercent = typeof percentage === 'string' 
      ? parseFloat(percentage) 
      : percentage;
    
    if (numPercent >= 85) return 'bg-green-500';
    if (numPercent >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BoltIcon className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Historial de Asistencias por Sprint</h2>
              <p className="text-sm text-gray-400">
                {sprintsConfig && (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    sprintsConfig.semesterType === 'impar' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {sprintsConfig.semesterType === 'impar' ? 'Sprints 1-4' : 'Sprints 5-9'} • 
                    {sprintsConfig.semester}° Semestre
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BoltIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay datos de asistencia para los sprints</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((sprint) => (
                <div
                  key={sprint.sprintNumber}
                  className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
                >
                  {/* Sprint Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-650 transition-colors"
                    onClick={() => toggleSprint(sprint.sprintNumber)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-bold text-white">{sprint.sprintName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(sprint.status)}`}>
                          {sprint.status}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {sprint.courses.length} cursos
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{sprint.percentage}%</div>
                          <div className="text-xs text-gray-400">
                            {sprint.effectiveAttendance} de {sprint.totalClasses} clases
                          </div>
                          <div className="text-xs text-purple-400 mt-1">
                            {sprint.startDate} - {sprint.endDate}
                          </div>
                        </div>
                        {expandedSprints[sprint.sprintNumber] ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressBarColor(parseFloat(sprint.percentage))}`}
                        style={{ width: `${Math.min(parseFloat(sprint.percentage), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Expanded Course Details */}
                  {expandedSprints[sprint.sprintNumber] && (
                    <div className="border-t border-gray-600 p-4 bg-gray-750">
                      <h4 className="text-white font-semibold mb-3">Detalle por Curso:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sprint.courses.map((course) => (
                          <div
                            key={course.courseId}
                            className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="text-white font-bold text-sm">{course.ud}</h5>
                                <p className="text-gray-400 text-xs">{course.courseName}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(course.estado)}`}>
                                {course.estado}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total:</span>
                                <span className="text-white font-bold">{course.plan}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Presentes:</span>
                                <span className="text-green-400 font-bold">{course.a}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Faltas:</span>
                                <span className="text-red-400 font-bold">{course.f}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Tardanzas:</span>
                                <span className="text-yellow-400 font-bold">{course.t}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Justificadas:</span>
                                <span className="text-blue-400 font-bold">{course.j}</span>
                              </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400">Asist. Efectivas:</span>
                                <span className="text-cyan-400 font-bold text-sm">{course.asistencias}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${getProgressBarColor(parseFloat(course.percent))}`}
                                  style={{ width: `${Math.min(parseFloat(course.percent), 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-center mt-1">
                                <span className="text-white font-bold text-sm">{course.percent}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          {!loading && !error && history.length > 0 && (
            <div className="mt-6 bg-gray-700 rounded-lg p-4 border border-gray-600">
              <h4 className="text-white font-bold mb-3">Información importante:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong className="text-cyan-400">Asistencias Efectivas</strong> = Presentes + (Tardanzas ÷ 3) + (Justificadas ÷ 3)</li>
                <li>• <strong className="text-green-400">ÓPTIMO</strong>: ≥ 85% de asistencia</li>
                <li>• <strong className="text-yellow-400">ALERTA</strong>: 70% - 84% de asistencia</li>
                <li>• <strong className="text-red-400">CRÍTICO</strong>: &lt; 70% de asistencia (Desaprobado)</li>
                <li>• Haz clic en cada sprint para ver el detalle por curso</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryModal;