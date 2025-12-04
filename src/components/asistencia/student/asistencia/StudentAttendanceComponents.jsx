// src/components/asistencia/student/asistencia/StudentAttendanceComponents.jsx
// 🔥 VERSIÓN COMPLETA Y CORREGIDA

import React, { useState } from 'react';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';

const getAttendanceStatusFromPercentage = (percentage) => {
    const percent = typeof percentage === 'string' 
        ? parseFloat(percentage.replace('%', '').replace(',', '.'))
        : parseFloat(percentage);
    
    if (isNaN(percent)) return 'SIN DATOS';
    
    if (percent >= 85) return 'ÓPTIMO';
    if (percent >= 70) return 'ALERTA';
    return 'CRÍTICO';
};

const getStatusClass = (status) => {
    if (!status) return '';
    
    const normalized = status
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    
    switch(normalized) {
        case 'OPTIMO':
            return 'optimo';
        case 'ALERTA':
            return 'alerta';
        case 'CRITICO':
        case 'DESAPROBADO':
            return 'critico';
        default:
            return '';
    }
};

// ============================================
// COMPONENTE: HeaderGreeting
// ============================================
export const HeaderGreeting = ({ info }) => (
    <div className="header-greeting-box">
        <h1>¡Hola {info.name || 'ESTUDIANTE'}!</h1>
        <p>Recuerda que una buena <strong>asistencia</strong> es clave para tu rendimiento académico.</p>
        <p className="update-message">
            Este reporte muestra tus asistencias actualizadas al <strong>{info.lastUpdated || 'hoy'}</strong>. 
            Si tienes menos del <span className="text-desaprobado">70% de asistencia</span>, estarás en situación crítica.
        </p>
        <div className="calculation-info">
            <p className="text-sm text-gray-400 mt-2">
                <strong>Nota importante:</strong> 3 tardanzas (T) = 1 falta | 3 justificadas (J) = 1 asistencia
            </p>
        </div>
    </div>
);

// ============================================
// 🔥 COMPONENTE CORREGIDO: AlertBox
// ============================================
const AlertBox = ({ status, title, range, isActive }) => {
    const getBoxStatusClass = () => {
        const normalized = status
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        
        switch(normalized) {
            case 'OPTIMO':
                return 'optimo';
            case 'ALERTA':
                return 'alerta';
            case 'CRITICO':
            case 'DESAPROBADO':
                return 'critico';
            default:
                return '';
        }
    };

    return (
        <div className={`alert-box ${getBoxStatusClass()} ${isActive ? 'active' : ''}`}>
            <span className="alert-icon">●</span>
            <p className="alert-title">{title}</p>
            <p className="alert-range">{range}</p>
        </div>
    );
};

// ============================================
// 🔥 COMPONENTE CORREGIDO: AttendanceAlerts
// ============================================
export const AttendanceAlerts = ({ overallStatus }) => {
    const normalizedStatus = overallStatus
        ?.toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    
    console.log('🎯 AttendanceAlerts - Original:', overallStatus, 'Normalized:', normalizedStatus);
    
    return (
        <>
            <div className="alerts-container">
                <AlertBox 
                    status="ÓPTIMO" 
                    title="ÓPTIMO" 
                    range="≥ 85% de asistencia" 
                    isActive={normalizedStatus === 'OPTIMO'} 
                />
                <AlertBox 
                    status="ALERTA" 
                    title="ALERTA" 
                    range="70% - 84% de asistencia" 
                    isActive={normalizedStatus === 'ALERTA'} 
                />
                <AlertBox 
                    status="CRÍTICO" 
                    title="CRÍTICO" 
                    range="< 70% (Desaprobado)" 
                    isActive={normalizedStatus === 'CRITICO'} 
                />
            </div>
            
            {normalizedStatus === 'OPTIMO' && (
                <div className="status-message optimo">
                    <span className="message-icon">✓</span>
                    <p>¡Excelente Trabajo! Tu asistencia está en estado óptimo.</p>
                </div>
            )}
            
            {normalizedStatus === 'ALERTA' && (
                <div className="status-message alerta">
                    <span className="message-icon">⚠</span>
                    <p>Atención: Tu asistencia está en estado de alerta. Necesitas mejorar.</p>
                </div>
            )}
            
            {normalizedStatus === 'CRITICO' && (
                <div className="status-message critico">
                    <span className="message-icon">✖</span>
                    <p>Alerta Crítica: Tu asistencia está por debajo del 70%. Estás en riesgo de desaprobar.</p>
                </div>
            )}

            <div className="justification-reminder">
                <span className="reminder-icon">ℹ</span>
                <p>Importante: Justifica las inasistencias dentro de las 48 horas.</p>
            </div>
        </>
    );
};

// ============================================
// 🔥 COMPONENTE CORREGIDO: AttendanceFilters
// ============================================
export const AttendanceFilters = ({ 
    currentFilters, 
    onFilterChange, 
    availableCourses = [], 
    availableSprints = [],
    semesterName = '',
    selectedSprint,
    onSprintChange,
    unjustifiedCount = 0,
    loading = false
}) => {
    const [showCourseMenu, setShowCourseMenu] = useState(false);
    
    const handleCourseSelect = (course) => {
        onFilterChange({ 
            course: course.label,
            courseId: course.courseId 
        });
        setShowCourseMenu(false);
    };
    
    console.log('📋 AttendanceFilters Render:', {
        unjustifiedCount,
        selectedSprint,
        loading
    });
    
    return (
        <div className="filters-container">
            <h3 className="filter-title">Filtros de Asistencia</h3>
            
            {/* 🔥 ALERTA DE FALTAS POR JUSTIFICAR */}
            {!loading && unjustifiedCount > 0 && (
                <div 
                    className="status-message critico" 
                    style={{ 
                        marginBottom: '1rem',
                        animation: 'pulse 2s infinite',
                        border: '2px solid #ef4444',
                        boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                    }}
                >
                    <span className="message-icon" style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ¡Atención! Tienes <strong style={{ 
                                color: '#fca5a5', 
                                fontSize: '1.3rem',
                                textDecoration: 'underline'
                            }}>
                                {unjustifiedCount}
                            </strong> falta{unjustifiedCount > 1 ? 's' : ''} sin justificar en el Sprint {selectedSprint}
                        </p>
                        <p style={{ 
                            margin: '0.5rem 0 0 0', 
                            fontSize: '0.9rem',
                            color: '#fecaca'
                        }}>
                            📅 Recuerda: Debes justificar tus faltas dentro de las 48 horas siguientes a la clase.
                        </p>
                    </div>
                </div>
            )}
            
            {/* 🔥 MENSAJE CUANDO NO HAY FALTAS */}
            {!loading && unjustifiedCount === 0 && (
                <div 
                    className="status-message optimo" 
                    style={{ 
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                >
                    <span className="message-icon">✓</span>
                    <p style={{ margin: 0 }}>
                        ¡Excelente! No tienes faltas pendientes por justificar en el Sprint {selectedSprint}
                    </p>
                </div>
            )}
            
            <div className="filter-controls">
                {/* Semestre */}
                <div className="filter-group">
                    <label>Semestre</label>
                    <button 
                        className="filter-button" 
                        style={{ cursor: 'default', opacity: 0.9 }}
                        disabled
                    >
                        {semesterName || currentFilters.semester}
                    </button>
                </div>
                
                {/* Sprint */}
                <div className="filter-group">
                    <label>Sprint</label>
                    <select 
                        className="filter-button" 
                        value={selectedSprint}
                        onChange={(e) => onSprintChange(parseInt(e.target.value))}
                        disabled={loading}
                        style={{ 
                            cursor: loading ? 'wait' : 'pointer',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 'bold',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {availableSprints.map(sprint => (
                            <option key={sprint.sprintNumber} value={sprint.sprintNumber}>
                                Sprint {sprint.sprintNumber}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Curso */}
                <div className="filter-group" style={{position: 'relative'}}>
                    <label>Curso</label>
                    <button 
                        className="filter-button" 
                        onClick={() => setShowCourseMenu(!showCourseMenu)}
                        disabled={loading}
                        style={{
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {currentFilters.course}
                    </button>
                    
                    {showCourseMenu && !loading && (
                        <div className="course-dropdown">
                            {availableCourses.map((course, index) => (
                                <div
                                    key={course.courseId || index}
                                    onClick={() => handleCourseSelect(course)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '0.75rem',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {course.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            
        </div>
    );
};

// ============================================
// COMPONENTE: AttendanceSummary
// ============================================
export const AttendanceSummary = ({ data, semesterName, sprintName, sprintDates }) => (
    <div className="summary-section">
        <h3>Resumen {sprintName}</h3>
        <p className="summary-subtitle">
            Estadísticas del sprint ({semesterName}) 
            {sprintDates && <span className="text-xs ml-2">({sprintDates})</span>}
        </p>
        <div className="summary-cards-container">
            <div className="summary-card">
                <span className="summary-value">{data.enrolledCourses || 0}</span>
                <span className="summary-title">Cursos con Asistencias</span>
            </div>
            <div className="summary-card">
                <span className="summary-value">{data.scheduledClasses || 0}</span>
                <span className="summary-title">Clases del Sprint</span>
            </div>
            <div className="summary-card highlight">
                <span className="summary-value">{data.generalAttendance || '0.00'}%</span>
                <span className="summary-title">Asistencia del Sprint</span>
            </div>
        </div>
    </div>
);

// ============================================
// 🔥 COMPONENTE CORREGIDO: TableRow
// ============================================
const TableRow = ({ ud, courseName, semester, a, f, t, j, asistencias, plan, percent, estado }) => {
    const normalizedEstado = estado
        ?.toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    
    const getRowStatusClass = () => {
        switch(normalizedEstado) {
            case 'OPTIMO':
                return 'optimo';
            case 'ALERTA':
                return 'alerta';
            case 'CRITICO':
            case 'DESAPROBADO':
                return 'critico';
            default:
                return '';
        }
    };
    
    return (
        <tr>
            <td>
                {ud} <br/>
                <span className="course-name-small">{courseName}</span><br/>
                <span className="semester-tag">{semester}</span>
            </td>
            <td className="text-green-400 font-bold">{a}</td>
            <td className={f > 0 ? 'text-red-400 font-bold' : ''}>{f}</td>
            <td className={t > 0 ? 'text-yellow-400 font-bold' : ''}>{t}</td>
            <td className="text-blue-400 font-bold">{j}</td>
            <td className="text-cyan-400 font-bold">{asistencias}</td>
            <td>{plan}</td>
            <td className="font-bold">{percent}</td>
            <td>
                <span className={`status-badge ${getRowStatusClass()}`}>
                    {estado}
                </span>
            </td>
        </tr>
    );
};

// ============================================
// COMPONENTE: AttendanceTable
// ============================================
export const AttendanceTable = ({ data }) => (
    <div className="attendance-table-wrapper">
        <table className="attendance-table">
            <thead>
                <tr>
                    <th>UD / Curso</th>
                    <th>A</th>
                    <th>F</th>
                    <th>T</th>
                    <th>J</th>
                    <th>Asist.</th>
                    <th>Plan</th>
                    <th>%</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <TableRow key={row.courseId || index} {...row} />
                ))}
            </tbody>
        </table>
    </div>
);

// ============================================
// COMPONENTE: LegendBlocks
// ============================================
export const LegendBlocks = () => (
    <div className="legends-container">
        <div className="legend-block column-legend">
            <h3>Leyenda de Columnas:</h3>
            <ul>
                <li><span className="legend-key">A</span>: Asistencias (Presente)</li>
                <li><span className="legend-key">F</span>: Faltas</li>
                <li><span className="legend-key">T</span>: Tardanzas (3T = 1 falta)</li>
                <li><span className="legend-key">J</span>: Justificadas (3J = 1 asistencia)</li>
                <li><span className="legend-key">Asist.</span>: Total asistencias efectivas</li>
            </ul>
        </div>
        
        <div className="legend-block status-legend">
            <h3>Estados de Asistencia:</h3>
            <ul>
                <li className="status-optimokey"><span>ÓPTIMO</span>: ≥ 85% asistencia</li>
                <li className="status-alertakey"><span>ALERTA</span>: 70% - 84% asistencia</li>
                <li className="status-criticokey"><span>CRÍTICO</span>: &lt; 70% (Desaprobado)</li>
            </ul>
        </div>
    </div>
);