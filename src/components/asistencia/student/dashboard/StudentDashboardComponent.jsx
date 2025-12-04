// src/components/asistencia/student/dashboard/StudentDashboardComponent.jsx
// 🔥 VERSIÓN CON AUTO-REFRESH SIEMPRE ACTIVO

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { fetchCompleteStudentData, quickActionsData } from '../../../../services/asistencia/student/dashboard/dashboardService';
import '../../../../styles/asistencia/student/dashboard/dashboardStyles.css';

const AlertBanner = ({ message }) => (
  <div className="alert-banner" role="alert">
    <svg className="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
    </svg>
    <div>
      <span className="alert-title">¡Atención!</span> {message}
    </div>
  </div>
);

const AttendanceSummaryCard = ({ title, count, subtitle, color }) => {
  const mod = color === 'green' ? 'attendance-card--green' : color === 'yellow' ? 'attendance-card--yellow' : 'attendance-card--red';
  return (
    <div className={`attendance-card ${mod}`}>
      <div className="count">{count}</div>
      <div className="title">{title}</div>
      <div className="subtitle">{subtitle}</div>
    </div>
  );
};

const AttendanceSummary = ({ data }) => (
  <div className="attendance-summary">
    <p className="summary-desc">Estado actual de tus cursos según el porcentaje de asistencia.</p>
    <div className="attendance-cards">
      {data.map(card => (
        <AttendanceSummaryCard key={card.title} {...card} />
      ))}
    </div>
  </div>
);

const RecentAttendance = ({ data }) => {
  const navigate = useNavigate();
  
  // 🔥 Actualizado para ir a asistencias
  const handleViewAll = () => {
    navigate('/asistencia/student/asistencias');
  };
  
  return (
    <div className="recent-attendance">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="card-title">Asistencias Recientes</h3>
          <p className="muted-text">Últimos registros de asistencia.</p>
        </div>
        <button 
          onClick={handleViewAll}
          className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
        >
          Ver todas →
        </button>
      </div>
      
      <div className="mt-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay registros de asistencia recientes</p>
          </div>
        ) : (
          data.map((item, index) => (
            <div key={index} className="recent-item">
              <div className="flex flex-col">
                <span className="course">{item.courseCode}</span>
                <span className="date">{item.date}</span>
              </div>
              <button className={`recent-btn ${item.colorClass}`}>
                {item.buttonText}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const QuickActions = ({ actions }) => {
  const navigate = useNavigate();
  
  // 🔥 Actualizado para manejar las rutas correctamente
  const handleActionClick = (route) => {
    // Mapeo de rutas antiguas a nuevas
    const routeMap = {
      '/student/asistencias': '/asistencia/student/asistencias',
      '/student/justificaciones': '/asistencia/student/justificaciones',
      '/student/alertas': '/asistencia/student/alertas'
    };
    
    const newRoute = routeMap[route] || route;
    navigate(newRoute);
  };
  
  return (
    <div className="quick-actions">
      <h3 className="card-title">Acciones Rápidas</h3>
      <div className="space-y-3 mt-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action.route)}
            className={`action-btn ${action.colorClass || 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.text}
          </button>
        ))}
      </div>
    </div>
  );
};

const PendingJustifications = ({ data }) => {
  const navigate = useNavigate();
  
  // 🔥 Actualizado para ir a justificaciones
  const handleViewAll = () => {
    navigate('/asistencia/student/justificaciones');
  };
  
  return (
    <div className="pending-justifications">
      <div className="flex justify-between items-center mb-2">
        <h3 className="card-title">Justificaciones Pendientes</h3>
        {data.length > 0 && (
          <button 
            onClick={handleViewAll}
            className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
          >
            Ver todas →
          </button>
        )}
      </div>
      
      <div className="mt-2">
        {data.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No tienes justificaciones pendientes</p>
            <button 
              onClick={() => navigate('/asistencia/student/justificaciones')}
              className="mt-3 text-blue-500 hover:text-blue-700 text-xs font-semibold"
            >
              Enviar nueva justificación
            </button>
          </div>
        ) : (
          data.map((item, index) => (
            <div key={index} className="pending-card">
              <div className="flex justify-between items-start mb-1">
                <span className="course">{item.courseCode}</span>
                <span className="status-badge">{item.status}</span>
              </div>
              <p className="date">{item.date}</p>
              <p className="reason">{item.reason}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PerformanceTrend = () => (
  <div className="performance-trend">
    <h3 className="card-title">Tendencia de Rendimiento</h3>
    <div className="trend-box mt-2">
      <svg className="trend-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
      </svg>
      <p className="trend-title">Tendencia Descendente</p>
      <p className="trend-desc">Aumentaron las Faltas esta semana.</p>
    </div>
  </div>
);

const StudentDashboardComponent = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  // ⏱️ CONFIGURACIÓN DE AUTO-REFRESH (SIEMPRE ACTIVO)
  const AUTO_REFRESH_INTERVAL = 30000; // 30 segundos

  // 🔄 FUNCIÓN CENTRALIZADA PARA CARGAR DASHBOARD
  const loadDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    
    try {
      console.log('🔄 Loading dashboard data...');
      const data = await fetchCompleteStudentData();
      console.log('✅ Dashboard data loaded:', data);
      setStudentData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError('Error al cargar los datos del dashboard. Por favor, intenta de nuevo.');
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  // Cargar datos inicialmente
  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // ⏱️ AUTO-REFRESH: Actualizar cada 30 segundos (SIEMPRE ACTIVO)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard...');
      loadDashboardData(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loadDashboardData]);

  // 🔄 REFRESH MANUAL
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadDashboardData(false);
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

  // Loading state
  if (loading && !studentData) {
    return (
      <div className="student-dashboard-wrapper">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !studentData) {
    return (
      <div className="student-dashboard-wrapper">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">Error al cargar el dashboard</h3>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => loadDashboardData(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!studentData) {
    return (
      <div className="student-dashboard-wrapper">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-lg text-gray-600">No se encontraron datos del estudiante</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="student-dashboard-wrapper">
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

      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="student-dashboard-title">¡Hola {studentData.studentName}! 👋</h1>
          <p className="student-dashboard-subtitle">
            {studentData.studentId} - {studentData.semester} - {studentData.career}
          </p>
          {studentData.lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización de datos: {studentData.lastUpdated}
            </p>
          )}
        </div>
      </div>

      {studentData.isCriticalAlert && (
        <AlertBanner message={studentData.alertMessage} />
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col-main">
          <AttendanceSummary data={studentData.attendanceSummaryData} />
          <RecentAttendance data={studentData.recentAttendanceData} />
        </div>

        <div className="dashboard-col-side">
          <QuickActions actions={quickActionsData} />
          <PendingJustifications data={studentData.pendingJustificationData} />
          <PerformanceTrend />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardComponent;