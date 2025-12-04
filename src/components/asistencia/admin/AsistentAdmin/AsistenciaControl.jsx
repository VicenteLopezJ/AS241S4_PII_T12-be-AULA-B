// src/components/asistencia/admin/AsistentAdmin/AsistenciaControl.jsx
import React, { useState, useEffect, useRef } from 'react';
import { asistenciaService, formatUtils } from '../../../../services/asistencia/admin/AsistentAdmin/asistenciaService';
import '../../../../styles/asistencia/admin/AsistentAdmin/asistenciaControl.css';

const AsistenciaControl = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalEstudiantes: 0,
    asistenciaPromedio: 0,
    estudiantesCriticos: 0,
    estudiantesProblema: 0,
    estudiantesOptimos: 0,
    estudiantesSinAsistencia: 0,
    optimosPorSemestre: {},
    criticosPorSemestre: {},
    desaprobadosPorSemestre: {}
  });

  const [filtros, setFiltros] = useState({
    estado: 'TODOS',
    semestre: 'TODOS'
  });

  const [semestres, setSemestres] = useState([]);
  const [semestresFiltrados, setSemestresFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🆕 Selector de período ÚNICO (no múltiple)
  const [selectedPeriod, setSelectedPeriod] = useState('2025-I');
  const [availablePeriods] = useState(['2025-I', '2025-II']);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para menú de exportación
  const [exportMenuOpen, setExportMenuOpen] = useState(null);
  const [exportingFormat, setExportingFormat] = useState(null);

  // Estado para cursos del modal
  const [showCourses, setShowCourses] = useState(false);

  // Estados para auto-refresh permanente
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);

  // 🔥 Cargar datos cuando cambia el período seleccionado
  useEffect(() => {
    cargarDatos();
  }, [selectedPeriod]);

  // Auto-refresh permanente cada 30 segundos
  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      cargarDatosSilencioso();
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedPeriod]);

  useEffect(() => {
    const filtrados = aplicarFiltros(semestres, filtros);
    setSemestresFiltrados(filtrados);
  }, [filtros, semestres]);

  // 🆕 Limpiar filtro de semestre cuando cambia el período
  useEffect(() => {
    setFiltros(prev => ({
      ...prev,
      semestre: 'TODOS'
    }));
  }, [selectedPeriod]);

  const aplicarFiltros = (data, filtrosActivos) => {
    let resultado = [...data];

    if (filtrosActivos.semestre !== 'TODOS') {
      const numSemestre = parseInt(filtrosActivos.semestre);
      resultado = resultado.filter(s => s.semesterNumber === numSemestre);
    }

    if (filtrosActivos.estado !== 'TODOS') {
      resultado = resultado.filter(s => {
        const porcentaje = s.porcentaje;
        
        switch(filtrosActivos.estado) {
          case 'OPTIMO':
            return porcentaje >= 85;
          case 'CRITICO':
            return porcentaje >= 70 && porcentaje < 85;
          case 'DESAPROBADO':
            return porcentaje < 70;
          case 'SIN_ASISTENCIA':
            return s.estudiantesSinAsistencia && s.estudiantesSinAsistencia.length > 0;
          default:
            return true;
        }
      });
    }

    return resultado;
  };

  // Carga de datos silenciosa (sin loading completo)
  const cargarDatosSilencioso = async () => {
    try {
      setIsRefreshing(true);
      const data = await asistenciaService.obtenerEstadisticasMejoradas(selectedPeriod);
      
      setEstadisticas(data.estadisticas);
      setSemestres(data.semestres);
      setSemestresFiltrados(aplicarFiltros(data.semestres, filtros));
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error en actualización automática:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📊 Loading data for period: ${selectedPeriod}`);
      
      const data = await asistenciaService.obtenerEstadisticasMejoradas(selectedPeriod);
      
      console.log('✅ Data loaded:', data);
      
      setEstadisticas(data.estadisticas);
      setSemestres(data.semestres);
      setSemestresFiltrados(data.semestres);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError(error.message || 'Error al cargar los datos');
      
      if (error.message.includes('timeout')) {
        alert('⏱️ El servidor está tardando mucho en responder. Intenta nuevamente.');
      } else if (error.message.includes('No se pudo conectar')) {
        alert('❌ No se puede conectar con el servidor.');
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Cambiar período (solo uno a la vez)
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setShowPeriodSelector(false);
  };

  const handleFiltroEstadoChange = (nuevoEstado) => {
    setFiltros(prev => ({
      ...prev,
      estado: nuevoEstado
    }));
  };

  const handleFiltroSemestreChange = (nuevoSemestre) => {
    setFiltros(prev => ({
      ...prev,
      semestre: nuevoSemestre
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: 'TODOS',
      semestre: 'TODOS'
    });
  };

  const contarPorEstado = (estado) => {
    return semestres.filter(s => {
      const porcentaje = s.porcentaje;
      switch(estado) {
        case 'OPTIMO':
          return porcentaje >= 85;
        case 'CRITICO':
          return porcentaje >= 70 && porcentaje < 85;
        case 'DESAPROBADO':
          return porcentaje < 70;
        case 'SIN_ASISTENCIA':
          return s.estudiantesSinAsistencia && s.estudiantesSinAsistencia.length > 0;
        default:
          return true;
      }
    }).length;
  };

  const contarPorSemestre = (numSemestre) => {
    if (numSemestre === 'TODOS') return semestres.length;
    return semestres.filter(s => s.semesterNumber === parseInt(numSemestre)).length;
  };

  // 🆕 Obtener semestres disponibles según el período
  const getAvailableSemesters = () => {
    if (selectedPeriod.endsWith('-I')) {
      return [1, 2, 3]; // Período I: semestres impares
    } else {
      return [4, 5, 6]; // Período II: semestres pares
    }
  };

  const availableSemesters = getAvailableSemesters();

  const handleVerDetalles = async (semestre) => {
    try {
      setModalLoading(true);
      setModalOpen(true);
      setModalData(null);
      setSearchTerm('');
      setShowCourses(false);
      
      console.log(`🔍 Ver detalles del semestre ${semestre.id}`);
      const detalles = await asistenciaService.obtenerDetalleSemestre(semestre.id, selectedPeriod);
      
      setModalData({
        ...detalles,
        semesterInfo: semestre
      });
      
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      alert('Error al cargar detalles del semestre');
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleExportar = async (semestreId, formato) => {
    try {
      setExportingFormat(formato);
      setExportMenuOpen(null);
      
      console.log(`📤 Exportando semestre ${semestreId} como ${formato}`);
      await asistenciaService.exportarDatos(semestreId, selectedPeriod, formato);
      
      const formatoNombre = formato === 'pdf' ? 'PDF' : 'Excel';
      alert(`✅ Reporte ${formatoNombre} descargado correctamente`);
      
    } catch (error) {
      console.error('Error al exportar:', error);
      alert(`❌ Error al exportar: ${error.message}`);
    } finally {
      setExportingFormat(null);
    }
  };

  const toggleExportMenu = (semestreId) => {
    setExportMenuOpen(exportMenuOpen === semestreId ? null : semestreId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuOpen && !event.target.closest('.export-dropdown')) {
        setExportMenuOpen(null);
      }
      if (showPeriodSelector && !event.target.closest('.period-selector')) {
        setShowPeriodSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportMenuOpen, showPeriodSelector]);

  const handleRefresh = () => {
    cargarDatos();
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
    setSearchTerm('');
    setShowCourses(false);
  };

  const getFilteredStudents = () => {
    if (!modalData || !modalData.students) return [];
    
    if (!searchTerm) return modalData.students;
    
    const term = searchTerm.toLowerCase();
    return modalData.students.filter(student => 
      student.studentCode.toLowerCase().includes(term) ||
      student.fullName.toLowerCase().includes(term)
    );
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (error) {
    return (
      <div className="asistencia-control-wrapper">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error al cargar datos</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="action-btn action-btn--primary">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asistencia-control-wrapper">
      {/* Header */}
      <div className="asistencia-header">
        <div>
          <h1 className="asistencia-title">Control de Asistencias</h1>
          <p className="asistencia-subtitle">
            Monitoreo en tiempo real - Período: {selectedPeriod}
          </p>
        </div>
        <div className="header-actions">
          {/* 🆕 Selector de Período ÚNICO */}
          <div className="period-selector">
            <button 
              className="action-btn action-btn--secondary"
              onClick={() => setShowPeriodSelector(!showPeriodSelector)}
            >
              📅 Período: {selectedPeriod}
            </button>
            
            {showPeriodSelector && (
              <div className="period-dropdown">
                <div className="period-dropdown-header">
                  <strong>Seleccionar Período</strong>
                </div>
                {availablePeriods.map(period => (
                  <button
                    key={period}
                    className={`period-option ${selectedPeriod === period ? 'period-option--active' : ''}`}
                    onClick={() => handlePeriodChange(period)}
                  >
                    <span className="period-option-radio">
                      {selectedPeriod === period ? '◉' : '○'}
                    </span>
                    <span>{period}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón de actualización manual */}
          <button 
            onClick={handleRefresh} 
            className={`action-btn action-btn--secondary ${isRefreshing ? 'spinning' : ''}`}
            disabled={loading}
          >
            🔄 Actualizar Ahora
          </button>
        </div>
      </div>

      {/* Estadísticas Grid */}
      <div className="estadisticas-grid estadisticas-grid--extended">
        <div className="estadistica-card estadistica-card--green">
          <div className="estadistica-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="estadistica-content">
            <div className="estadistica-valor">
              {loading ? '...' : estadisticas.estudiantesOptimos}
            </div>
            <div className="estadistica-label">Estudiantes Óptimos</div>
          </div>
        </div>

        <div className="estadistica-card estadistica-card--blue">
          <div className="estadistica-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div className="estadistica-content">
            <div className="estadistica-valor">
              {loading ? '...' : formatUtils.formatPercentage(estadisticas.asistenciaPromedio)}
            </div>
            <div className="estadistica-label">Asistencia Promedio</div>
          </div>
        </div>

        <div className="estadistica-card estadistica-card--yellow">
          <div className="estadistica-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="estadistica-content">
            <div className="estadistica-valor">
              {loading ? '...' : estadisticas.estudiantesCriticos}
            </div>
            <div className="estadistica-label">Estudiantes Críticos</div>
          </div>
        </div>

        <div className="estadistica-card estadistica-card--red">
          <div className="estadistica-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="estadistica-content">
            <div className="estadistica-valor">
              {loading ? '...' : estadisticas.estudiantesProblema}
            </div>
            <div className="estadistica-label">Estudiantes Desaprobados</div>
          </div>
        </div>
      </div>

      {/* Sección de Filtros */}
      <div className="filtros-section">
        <div className="filtros-container">
          <div className="filtros-header">
            <h2 className="filtros-title">📊 Filtrar por Estado de Asistencia</h2>
            {(filtros.estado !== 'TODOS' || filtros.semestre !== 'TODOS') && (
              <button 
                className="limpiar-filtros-btn"
                onClick={limpiarFiltros}
              >
                ✖ Limpiar Filtros
              </button>
            )}
          </div>
          <div className="filtros-buttons">
            <button 
              className={`filtro-btn ${filtros.estado === 'TODOS' ? 'filtro-btn--active' : ''}`}
              onClick={() => handleFiltroEstadoChange('TODOS')}
            >
              TODOS ({semestres.length})
            </button>
            <button 
              className={`filtro-btn filtro-btn--optimo ${filtros.estado === 'OPTIMO' ? 'filtro-btn--active' : ''}`}
              onClick={() => handleFiltroEstadoChange('OPTIMO')}
            >
              ✅ ÓPTIMO ({contarPorEstado('OPTIMO')})
              <span className="filtro-badge">≥ 85%</span>
            </button>
            <button 
              className={`filtro-btn filtro-btn--critico ${filtros.estado === 'CRITICO' ? 'filtro-btn--active' : ''}`}
              onClick={() => handleFiltroEstadoChange('CRITICO')}
            >
              ⚠️ CRÍTICO ({contarPorEstado('CRITICO')})
              <span className="filtro-badge">70-84%</span>
            </button>
            <button 
              className={`filtro-btn filtro-btn--desaprobado ${filtros.estado === 'DESAPROBADO' ? 'filtro-btn--active' : ''}`}
              onClick={() => handleFiltroEstadoChange('DESAPROBADO')}
            >
              ❌ DESAPROBADO ({contarPorEstado('DESAPROBADO')})
              <span className="filtro-badge">&lt; 70%</span>
            </button>
          </div>
        </div>

        <div className="filtros-container">
          <h2 className="filtros-title">🎓 Filtrar por Semestre Académico</h2>
          <div className="filtros-buttons filtros-semestre">
            <button 
              className={`filtro-btn filtro-btn--semestre ${filtros.semestre === 'TODOS' ? 'filtro-btn--active' : ''}`}
              onClick={() => handleFiltroSemestreChange('TODOS')}
            >
              TODOS
            </button>
            {availableSemesters.map(num => (
              <button 
                key={num}
                className={`filtro-btn filtro-btn--semestre ${filtros.semestre === num.toString() ? 'filtro-btn--active' : ''}`}
                onClick={() => handleFiltroSemestreChange(num.toString())}
              >
                {num}° Semestre ({contarPorSemestre(num.toString())})
              </button>
            ))}
          </div>
        </div>
      </div>

      {(filtros.estado !== 'TODOS' || filtros.semestre !== 'TODOS') && (
        <div className="filtros-activos-banner">
          <span className="filtros-activos-icon">🔍</span>
          <span className="filtros-activos-text">
            Mostrando {semestresFiltrados.length} de {semestres.length} semestres
            {filtros.estado !== 'TODOS' && ` | Estado: ${filtros.estado}`}
            {filtros.semestre !== 'TODOS' && ` | Semestre: ${filtros.semestre}°`}
          </span>
        </div>
      )}

      {/* Lista de Semestres */}
      <div className="semestres-lista">
        <h2 className="semestres-title">Asistencia por Semestre</h2>
        <p className="semestres-subtitle">
          Resumen de asistencias por estudiantes - Período: {selectedPeriod}
        </p>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando datos desde el servidor...</p>
          </div>
        ) : semestresFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>🔭 No hay datos disponibles para los filtros seleccionados</p>
            <button 
              onClick={limpiarFiltros}
              className="action-btn action-btn--primary"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          semestresFiltrados.map((semestre) => (
            <div key={semestre.id} className="semestre-card">
              <div className="semestre-header">
                <div>
                  <h3 className="semestre-nombre">{semestre.nombre}</h3>
                  <span className="semestre-badge">
                    {semestre.totalEstudiantes} estudiante(s)
                  </span>
                  <span className="semestre-badge semestre-badge--courses">
                    📚 {semestre.courses?.length || 0} curso(s)
                  </span>
                </div>
                <div className={`semestre-porcentaje semestre-porcentaje--${formatUtils.getColorByPercentage(semestre.porcentaje)}`}>
                  {formatUtils.formatPercentage(semestre.porcentaje)}
                </div>
              </div>
              <p className="semestre-periodo">{semestre.periodo}</p>

              {/* Sección de Cursos */}
              {semestre.courses && semestre.courses.length > 0 && (
                <div className="courses-section">
                  <h4 className="courses-title">📚 Cursos Asignados ({semestre.courses.length})</h4>
                  <div className="courses-grid">
                    {semestre.courses.slice(0, 6).map((course, idx) => (
                      <div key={idx} className="course-badge">
                        <span className="course-code">{course.code}</span>
                        <span className="course-name">{course.name}</span>
                        <span className="course-credits">{course.credits} créditos</span>
                      </div>
                    ))}
                    {semestre.courses.length > 6 && (
                      <div className="course-badge course-badge--more">
                        +{semestre.courses.length - 6} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contenedor de estudiantes con 4 categorías */}
              <div className="estudiantes-container estudiantes-container--four">
                <div className="estudiantes-column">
                  <h4 className="estudiantes-subtitle estudiantes-subtitle--optimo">
                    Óptimos ({semestre.estudiantesOptimos?.length || 0})
                  </h4>
                  <div className="estudiantes-badges">
                    {semestre.estudiantesOptimos && semestre.estudiantesOptimos.length > 0 ? (
                      semestre.estudiantesOptimos.map((est, idx) => (
                        <span key={idx} className="estudiante-badge estudiante-badge--optimo">
                          {est}
                        </span>
                      ))
                    ) : (
                      <span className="empty-badge">Sin estudiantes óptimos</span>
                    )}
                  </div>
                </div>

                <div className="estudiantes-column">
                  <h4 className="estudiantes-subtitle estudiantes-subtitle--critico">
                    Críticos ({semestre.estudiantesCriticos?.length || 0})
                  </h4>
                  <div className="estudiantes-badges">
                    {semestre.estudiantesCriticos && semestre.estudiantesCriticos.length > 0 ? (
                      semestre.estudiantesCriticos.map((est, idx) => (
                        <span key={idx} className="estudiante-badge estudiante-badge--critico">
                          {est}
                        </span>
                      ))
                    ) : (
                      <span className="empty-badge">Sin estudiantes críticos</span>
                    )}
                  </div>
                </div>

                <div className="estudiantes-column">
                  <h4 className="estudiantes-subtitle estudiantes-subtitle--desaprobado">
                    Desaprobados ({semestre.estudiantesDesaprobados?.length || 0})
                  </h4>
                  <div className="estudiantes-badges">
                    {semestre.estudiantesDesaprobados && semestre.estudiantesDesaprobados.length > 0 ? (
                      semestre.estudiantesDesaprobados.map((est, idx) => (
                        <span key={idx} className="estudiante-badge estudiante-badge--desaprobado">
                          {est}
                        </span>
                      ))
                    ) : (
                      <span className="empty-badge">Sin estudiantes desaprobados</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Acciones */}
              <div className="semestre-actions">
                <button 
                  className="action-btn action-btn--secondary"
                  onClick={() => handleVerDetalles(semestre)}
                >
                  👁️ Ver Detalles
                </button>
                
                <div className="export-dropdown">
                  <button 
                    className="action-btn action-btn--primary"
                    onClick={() => toggleExportMenu(semestre.id)}
                    disabled={exportingFormat !== null}
                  >
                    {exportingFormat && exportMenuOpen === semestre.id ? (
                      <>⏳ Exportando...</>
                    ) : (
                      <>📤 Exportar ▼</>
                    )}
                  </button>
                  
                  {exportMenuOpen === semestre.id && (
                    <div className="export-menu">
                      <button
                        className="export-menu-item export-menu-item--excel"
                        onClick={() => handleExportar(semestre.id, 'xlsx')}
                      >
                        <span className="export-icon">📊</span>
                        <span className="export-text">
                          <strong>Exportar Excel</strong>
                          <small>Formato .xlsx con estilos</small>
                        </span>
                      </button>
                      <button
                        className="export-menu-item export-menu-item--pdf"
                        onClick={() => handleExportar(semestre.id, 'pdf')}
                      >
                        <span className="export-icon">📄</span>
                        <span className="export-text">
                          <strong>Exportar PDF</strong>
                          <small>Documento portable</small>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalles */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">📋 Detalles del Semestre</h2>
                {modalData && (
                  <>
                    <p className="modal-subtitle">
                      {modalData.semesterInfo.nombre} - Período: {selectedPeriod}
                    </p>
                    {modalData.semesterInfo.courses && modalData.semesterInfo.courses.length > 0 && (
                      <button 
                        className="toggle-courses-btn"
                        onClick={() => setShowCourses(!showCourses)}
                      >
                        {showCourses ? '📚 Ocultar Cursos' : `📚 Ver Cursos (${modalData.semesterInfo.courses.length})`}
                      </button>
                    )}
                  </>
                )}
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {modalLoading ? (
                <div className="modal-loading">
                  <div className="loading-spinner"></div>
                  <p>Cargando detalles...</p>
                </div>
              ) : modalData ? (
                <>
                  {showCourses && modalData.semesterInfo.courses && (
                    <div className="modal-courses-list">
                      <h3 className="modal-courses-title">📚 Cursos del Semestre</h3>
                      <div className="modal-courses-grid">
                        {modalData.semesterInfo.courses.map((course, idx) => (
                          <div key={idx} className="modal-course-item">
                            <div className="modal-course-header">
                              <span className="modal-course-code">{course.code}</span>
                              <span className="modal-course-credits">{course.credits} créditos</span>
                            </div>
                            <div className="modal-course-name">{course.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                   <div className="modal-stats">
                    <div className="modal-stat-card">
                      <div className="modal-stat-label">Total Estudiantes</div>
                      <div className="modal-stat-value">{modalData.totalStudents}</div>
                    </div>
                    <div className="modal-stat-card">
                      <div className="modal-stat-label">Promedio General</div>
                      <div className="modal-stat-value">
                        {(() => {
                          // 🔥 Calcular promedio REAL desde los estudiantes del modal
                          const studentsWithClasses = modalData.students.filter(s => s.totalClasses > 0);
                          if (studentsWithClasses.length === 0) return '0.0%';
                          const totalPercentage = studentsWithClasses.reduce((sum, s) => sum + s.percentage, 0);
                          const average = totalPercentage / studentsWithClasses.length;
                          return formatUtils.formatPercentage(average);
                        })()}
                      </div>
                    </div>
                    <div className="modal-stat-card">
                      <div className="modal-stat-label">Óptimos (≥85%)</div>
                      <div className="modal-stat-value modal-stat-value--success">
                        {modalData.students.filter(s => s.percentage >= 85 && s.totalClasses > 0).length}
                      </div>
                    </div>
                    <div className="modal-stat-card">
                      <div className="modal-stat-label">Críticos (70-84%)</div>
                      <div className="modal-stat-value modal-stat-value--warning">
                        {modalData.students.filter(s => s.percentage >= 70 && s.percentage < 85 && s.totalClasses > 0).length}
                      </div>
                    </div>
                    <div className="modal-stat-card">
                      <div className="modal-stat-label">Desaprobados (&lt;70%)</div>
                      <div className="modal-stat-value modal-stat-value--danger">
                        {modalData.students.filter(s => s.percentage < 70 && s.totalClasses > 0).length}
                      </div>
                    </div>
                    <div className="modal-stat-card">
                      
                      <div className="modal-stat-value modal-stat-value--info">
                        {modalData.students.filter(s => s.totalClasses === 0).length}
                      </div>
                    </div>
                  </div>

                  <div className="modal-search">
                    <input
                      type="text"
                      placeholder="🔍 Buscar por código o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="modal-search-input"
                    />
                  </div>

                  <div className="modal-table-container">
                    <table className="modal-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nombre Completo</th>
                          <th>Presente</th>
                          <th>Tardanza</th>
                          <th>Justificado</th>
                          <th>Ausente</th>
                          <th>Total Clases</th>
                          <th>Porcentaje</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredStudents().length > 0 ? (
                          getFilteredStudents().map((student) => (
                            <tr key={student.studentId}>
                              <td className="table-code">{student.studentCode}</td>
                              <td className="table-name">{student.fullName}</td>
                              <td className="table-number">{student.present}</td>
                              <td className="table-number">{student.late}</td>
                              <td className="table-number">{student.justified}</td>
                              <td className="table-number">{student.absent}</td>
                              <td className="table-number table-total">{student.totalClasses}</td>
                              <td className="table-percentage">
                                <span className={`percentage-badge percentage-badge--${formatUtils.getColorByPercentage(student.percentage)}`}>
                                  {formatUtils.formatPercentage(student.percentage)}
                                </span>
                              </td>
                              <td>
                                <span className={`status-badge status-badge--${student.status.toLowerCase()}`}>
                                  {student.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="table-empty">
                              No se encontraron estudiantes
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="modal-footer">
                    <button 
                      className="action-btn action-btn--secondary"
                      onClick={closeModal}
                    >
                      Cerrar
                    </button>
                    
                    <div className="export-dropdown">
                      <button 
                        className="action-btn action-btn--primary"
                        onClick={() => toggleExportMenu(`modal-${modalData.semesterInfo.id}`)}
                      >
                        📤 Exportar Lista ▼
                      </button>
                      
                      {exportMenuOpen === `modal-${modalData.semesterInfo.id}` && (
                        <div className="export-menu export-menu--modal">
                          <button
                            className="export-menu-item export-menu-item--excel"
                            onClick={() => handleExportar(modalData.semesterInfo.id, 'xlsx')}
                          >
                            <span className="export-icon">📊</span>
                            <span className="export-text">
                              <strong>Excel</strong>
                              <small>.xlsx</small>
                            </span>
                          </button>
                          <button
                            className="export-menu-item export-menu-item--pdf"
                            onClick={() => handleExportar(modalData.semesterInfo.id, 'pdf')}
                          >
                            <span className="export-icon">📄</span>
                            <span className="export-text">
                              <strong>PDF</strong>
                              <small>.pdf</small>
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciaControl;