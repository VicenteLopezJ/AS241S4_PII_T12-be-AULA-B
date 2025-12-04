// src/pages/asistencia/student/asistencia/StudentAttendancePage.jsx
// 🔥 VERSIÓN CON AUTO-REFRESH SIEMPRE ACTIVO

import React, { useState, useEffect, useCallback } from 'react';
import { BoltIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { 
    getStudentHeaderInfo,
    getStudentCourses,
    getSprintsConfig,
    fetchAttendancesBySprint,
    getSprintSummary,
    getAcademicConfig,
    getUnjustifiedAbsencesBySprint,
    config as serviceConfig
} from '../../../../services/asistencia/student/asistencia/attendanceService'; 
import { 
    HeaderGreeting, 
    AttendanceAlerts, 
    AttendanceFilters, 
    AttendanceTable, 
    AttendanceSummary, 
    LegendBlocks 
} from '../../../../components/asistencia/student/asistencia/StudentAttendanceComponents';
import '../../../../styles/asistencia/student/asistencia/attendanceStyles.css';

const StudentAttendancePage = () => {
    const [headerInfo, setHeaderInfo] = useState({});
    const [sprintsConfig, setSprintsConfig] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [summaryData, setSummaryData] = useState({});
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [currentSprintInfo, setCurrentSprintInfo] = useState({ name: '', startDate: '', endDate: '' });
    const [academicConfig, setAcademicConfig] = useState(null);
    const [unjustifiedCount, setUnjustifiedCount] = useState(0);
    const [currentSprintStatus, setCurrentSprintStatus] = useState('ÓPTIMO');
    
    const [filters, setFilters] = useState({ 
        semester: '', 
        course: 'Todos los cursos',
        courseId: 'all',
        period: null
    });

    // ⏱️ CONFIGURACIÓN DE AUTO-REFRESH (SIEMPRE ACTIVO)
    const AUTO_REFRESH_INTERVAL = 30000; // 30 segundos

    // 🔥 FUNCIÓN HELPER: Calcular estado según porcentaje
    const calculateStatus = (percentage) => {
        const percent = typeof percentage === 'string' 
            ? parseFloat(percentage) 
            : percentage;
        
        if (isNaN(percent) || percent === 0) return 'SIN DATOS';
        
        if (percent >= 85) return 'ÓPTIMO';
        if (percent >= 70) return 'ALERTA';
        return 'CRÍTICO';
    };

    // PASO 1: Cargar configuración académica
    useEffect(() => {
        const loadAcademicConfig = async () => {
            try {
                console.log('📄 Loading academic config...');
                const config = await getAcademicConfig(serviceConfig.STUDENT_ID);
                setAcademicConfig(config);
                
                setFilters(prev => ({
                    ...prev,
                    period: config.currentPeriod
                }));
                
                console.log('✅ Academic config loaded:', config);
            } catch (err) {
                console.error('❌ Error loading academic config:', err);
                setFilters(prev => ({ ...prev, period: '2025-I' }));
            }
        };

        loadAcademicConfig();
    }, []);

    // PASO 2: Cargar datos iniciales
    useEffect(() => {
        if (!filters.period) return;

        const loadInitialData = async () => {
            try {
                console.log(`📄 Loading data for period: ${filters.period}`);
                
                const [info, courses, sprints] = await Promise.all([
                    getStudentHeaderInfo(serviceConfig.STUDENT_ID, filters.period),
                    getStudentCourses(serviceConfig.STUDENT_ID, filters.period),
                    getSprintsConfig(serviceConfig.STUDENT_ID, filters.period)
                ]);
                
                setHeaderInfo(info);
                setAvailableCourses(courses);
                setSprintsConfig(sprints);
                
                setSelectedSprint(sprints.currentSprint);
                
                if (info.currentSemester) {
                    const semesterNames = {
                        1: '1er Semestre',
                        2: '2do Semestre',
                        3: '3er Semestre',
                        4: '4to Semestre',
                        5: '5to Semestre',
                        6: '6to Semestre'
                    };
                    setFilters(prev => ({ 
                        ...prev, 
                        semester: semesterNames[info.currentSemester] || `${info.currentSemester}° Semestre`
                    }));
                }
                
                console.log('✅ Initial data loaded:', { info, sprints });
            } catch (err) {
                console.error('❌ Error loading initial data:', err);
                setError('Error al cargar datos iniciales');
            }
        };

        loadInitialData();
    }, [filters.period]);

    // PASO 3: Actualizar info del sprint seleccionado
    useEffect(() => {
        if (!sprintsConfig || !selectedSprint) return;
        
        const sprint = sprintsConfig.sprints.find(s => s.sprintNumber === selectedSprint);
        if (sprint) {
            setCurrentSprintInfo({
                name: sprint.name,
                startDate: sprint.startDate,
                endDate: sprint.endDate,
                weeks: sprint.weeks
            });
        }
    }, [selectedSprint, sprintsConfig]);

    // 🔥 FUNCIÓN CENTRALIZADA PARA CARGAR ASISTENCIAS
    const loadAttendanceData = useCallback(async (showLoading = true) => {
        if (!selectedSprint || !sprintsConfig || !filters.period) return;
        
        if (showLoading) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }
        setError(null);
        
        try {
            console.log(`📄 Loading data for sprint: ${selectedSprint}, period: ${filters.period}`);
            
            const [records, summary, unjustified] = await Promise.all([
                fetchAttendancesBySprint(serviceConfig.STUDENT_ID, selectedSprint, filters.period),
                getSprintSummary(serviceConfig.STUDENT_ID, selectedSprint, filters.period),
                getUnjustifiedAbsencesBySprint(serviceConfig.STUDENT_ID, selectedSprint, filters.period)
            ]);
            
            let filteredRecords = records;
            if (filters.courseId && filters.courseId !== 'all') {
                filteredRecords = records.filter(r => r.courseId === parseInt(filters.courseId));
            }
            
            setAttendanceData(filteredRecords);
            setSummaryData(summary);
            setUnjustifiedCount(unjustified.length);
            
            const sprintPercentage = parseFloat(summary.generalAttendance);
            const sprintStatus = calculateStatus(sprintPercentage);
            setCurrentSprintStatus(sprintStatus);
            
            setLastUpdate(new Date());
            
            console.log('✅ Data refreshed successfully');
            
        } catch (err) {
            console.error('❌ Error loading attendance data:', err);
            setError('Error al cargar los datos de asistencia. Por favor, intenta de nuevo.');
        } finally {
            if (showLoading) {
                setLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    }, [selectedSprint, filters.courseId, filters.period, sprintsConfig]);

    // PASO 4: Cargar asistencias inicialmente
    useEffect(() => {
        loadAttendanceData(true);
    }, [loadAttendanceData]);

    // ⏱️ AUTO-REFRESH: Actualizar cada 30 segundos (SIEMPRE ACTIVO)
    useEffect(() => {
        if (!selectedSprint) return;

        const intervalId = setInterval(() => {
            console.log('🔄 Auto-refreshing data...');
            loadAttendanceData(false);
        }, AUTO_REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, [selectedSprint, loadAttendanceData]);

    // 🔄 REFRESH MANUAL
    const handleManualRefresh = async () => {
        console.log('🔄 Manual refresh triggered');
        await loadAttendanceData(false);
    };

    // 🕒 Formato de última actualización
    const getLastUpdateText = () => {
        if (!lastUpdate) return 'Nunca';
        
        const now = new Date();
        const diff = Math.floor((now - lastUpdate) / 1000);
        
        if (diff < 60) return `Hace ${diff} segundos`;
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
        return lastUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        console.log('📄 Filters changed:', newFilters);
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Handle sprint change
    const handleSprintChange = (sprint) => {
        console.log('📄 Sprint changed to:', sprint);
        setSelectedSprint(sprint);
    };

    // Loading state
    if (loading && !headerInfo.name) {
        return (
            <div className="attendance-dashboard">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando datos de asistencia...</p>
                    {academicConfig && (
                        <p className="text-sm text-gray-400 mt-2">
                            Período: {academicConfig.currentPeriod} • Semestre: {academicConfig.currentSemester}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Error state
    if (error && !sprintsConfig) {
        return (
            <div className="attendance-dashboard">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h2>Error al cargar datos</h2>
                    <p>{error}</p>
                    <button 
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="attendance-dashboard">
            {/* 🔥 PANEL DE CONTROL DE ACTUALIZACIÓN */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-gray-300">
                            Auto-actualización activa
                        </span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                        Última actualización: <strong className="text-gray-300">{getLastUpdateText()}</strong>
                    </div>
                </div>

                <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                        isRefreshing 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                    <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Ahora'}</span>
                </button>
            </div>

            <HeaderGreeting info={headerInfo} />
            
            <AttendanceAlerts overallStatus={currentSprintStatus} />

            {/* Banner del Sprint Seleccionado */}
            {currentSprintInfo.name && academicConfig && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg mb-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BoltIcon className="w-6 h-6" />
                            <div>
                                <span className="font-bold text-lg">
                                    Mostrando asistencias de: {currentSprintInfo.name}
                                </span>
                                <p className="text-sm text-purple-100 mt-0.5">
                                    Período: {academicConfig.currentPeriod} • 
                                    Fechas: {currentSprintInfo.startDate} al {currentSprintInfo.endDate}
                                    {currentSprintInfo.weeks && (
                                        <span className="ml-2 bg-purple-500 px-2 py-0.5 rounded text-xs">
                                            Semanas: {currentSprintInfo.weeks.join(', ')}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        {sprintsConfig && (
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    sprintsConfig.semesterType === 'impar' 
                                        ? 'bg-green-500' 
                                        : 'bg-blue-500'
                                }`}>
                                    {sprintsConfig.semesterType === 'impar' ? 'Sprints 1-4' : 'Sprints 5-9'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Resumen del Sprint */}
            {!loading && summaryData && (
                <AttendanceSummary 
                    data={summaryData} 
                    semesterName={filters.semester}
                    sprintName={currentSprintInfo.name}
                    sprintDates={`${currentSprintInfo.startDate} - ${currentSprintInfo.endDate}`}
                />
            )}

            {/* Filtros */}
            <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                    {sprintsConfig && (
                        <AttendanceFilters 
                            currentFilters={filters} 
                            onFilterChange={handleFilterChange}
                            availableCourses={availableCourses}
                            availableSprints={sprintsConfig.sprints}
                            semesterName={filters.semester}
                            semesterType={sprintsConfig.semesterType}
                            selectedSprint={selectedSprint}
                            onSprintChange={handleSprintChange}
                            unjustifiedCount={unjustifiedCount}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
            
            {/* Tabla de asistencias */}
            <div className="attendance-detail-section">
                <h2>
                    Registro de Asistencias - {headerInfo.name} ({currentSprintInfo.name})
                </h2>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="loading-spinner"></div>
                        <span className="ml-3">Cargando asistencias del sprint...</span>
                    </div>
                ) : attendanceData.length === 0 ? (
                    <div className="no-data-message">
                        <p>No hay registros de asistencia para {currentSprintInfo.name}.</p>
                        <p className="text-sm mt-2">
                            Selecciona otro sprint para ver las asistencias registradas.
                        </p>
                    </div>
                ) : (
                    <>
                        <AttendanceTable data={attendanceData} />
                        <div className="mt-4 text-sm text-gray-400 text-center">
                            <p>
                                Mostrando {attendanceData.length} curso(s) • 
                                Sprint: {currentSprintInfo.name} • 
                                Estado del sprint: <strong className={`${
                                    currentSprintStatus === 'ÓPTIMO' ? 'text-green-400' :
                                    currentSprintStatus === 'ALERTA' ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>{currentSprintStatus}</strong>
                                {unjustifiedCount > 0 && (
                                    <span className="text-red-400 font-bold ml-2">
                                        • {unjustifiedCount} falta{unjustifiedCount > 1 ? 's' : ''} sin justificar
                                    </span>
                                )}
                            </p>
                        </div>
                    </>
                )}
            </div>
            
            <LegendBlocks />
            
            <div className="connection-status">
                <span className="status-dot online"></span>
                <span className="status-text">
                    Conectado • Período: {filters.period || 'Cargando...'}
                    <span className="ml-2 text-green-400">• Actualización automática activa</span>
                </span>
            </div>
        </div>
    );
};

export default StudentAttendancePage;