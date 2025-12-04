// src/pages/asistencia/student/alert/AlertsPage.jsx
// 🔥 VERSIÓN CON AUTO-REFRESH SIEMPRE ACTIVO

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import AlertsComponent from '../../../../components/asistencia/student/alert/AlertsComponents';
import { getStudentAlerts } from '../../../../services/asistencia/student/alert/AlertsService';
import '../../../../styles/asistencia/student/alert/AlertsStyles.css';

const AlertsPage = () => {
    const [alertsData, setAlertsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    // ⏱️ CONFIGURACIÓN DE AUTO-REFRESH (SIEMPRE ACTIVO)
    const AUTO_REFRESH_INTERVAL = 30000; // 30 segundos

    // 🔄 FUNCIÓN CENTRALIZADA PARA CARGAR ALERTAS
    const loadAlerts = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }
        setError(null);
        
        try {
            console.log('📊 Loading alerts from backend...');
            
            const data = await getStudentAlerts();
            
            if (data.error) {
                setError(data.error);
            }
            
            setAlertsData(data);
            setLastUpdate(new Date());
            
            console.log('✅ Alerts loaded successfully');
            console.log(`🔴 Critical: ${data.criticalAlerts.length}`);
            console.log(`🟡 Warnings: ${data.warningAlerts.length}`);
            
        } catch (err) {
            console.error('❌ Error loading alerts:', err);
            setError('Error al cargar las alertas. Por favor, intenta de nuevo.');
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
        loadAlerts(true);
    }, [loadAlerts]);

    // ⏱️ AUTO-REFRESH: Actualizar cada 30 segundos (SIEMPRE ACTIVO)
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log('🔄 Auto-refreshing alerts...');
            loadAlerts(false);
        }, AUTO_REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, [loadAlerts]);

    // 🔄 REFRESH MANUAL
    const handleManualRefresh = async () => {
        console.log('🔄 Manual refresh triggered');
        await loadAlerts(false);
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

    // ========== LOADING STATE ==========
    if (loading && !alertsData) {
        return (
            <div className="alertas-page">
                <div className="loading-container">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mb-6 shadow-lg"></div>
                    <p className="text-2xl text-slate-200 font-extrabold mb-2 tracking-tight">
                        Cargando alertas académicas...
                    </p>
                    <p className="text-base text-slate-400 font-semibold">
                        Obteniendo datos desde la base de datos
                    </p>
                </div>
            </div>
        );
    }

    // ========== ERROR STATE ==========
    if (error && !alertsData) {
        return (
            <div className="alertas-page">
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="error-container max-w-md">
                        <div className="flex items-center mb-4">
                            <span className="text-4xl mr-3">❌</span>
                            <h3 className="font-extrabold text-2xl text-red-900 tracking-tight">
                                Error al cargar alertas
                            </h3>
                        </div>
                        <p className="mb-6 text-red-800 font-semibold text-base">{error}</p>
                        <button
                            onClick={() => loadAlerts(true)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-extrabold shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-red-700"
                        >
                            🔄 Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== NO DATA STATE ==========
    if (!alertsData || (alertsData.criticalAlerts.length === 0 && alertsData.warningAlerts.length === 0)) {
        return (
            <div className="alertas-page">
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

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-slate-100 mb-2 tracking-tight">
                        Alertas Académicas
                    </h1>
                    <p className="text-base text-slate-400 font-semibold">
                        Monitorea tu estado académico y recibe notificaciones importantes
                    </p>
                </div>
                
                {/* No Alerts Container */}
                <div className="no-alerts-container">
                    <div className="text-center">
                        <svg className="w-24 h-24 mx-auto mb-6 text-green-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            ¡Excelente! No tienes alertas
                        </h3>
                        <p className="text-slate-700 font-semibold text-lg mb-6">
                            Tu asistencia está en buen estado. Continúa así para mantener tu rendimiento académico.
                        </p>
                        
                        {alertsData?.studentInfo && (
                            <div className="mt-6 bg-white rounded-xl p-6 inline-block border-2 border-slate-400 shadow-lg">
                                <p className="text-slate-900 font-extrabold text-lg">
                                    {alertsData.studentInfo.name}
                                </p>
                                <p className="text-slate-600 text-base font-bold mt-2">
                                    {alertsData.studentInfo.currentSemester}° Semestre • {alertsData.studentInfo.career}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ========== SUCCESS STATE - Render Normal ==========
    return (
        <div className="alertas-page">
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
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-100 mb-2 tracking-tight">
                    Alertas Académicas
                </h1>
                <p className="text-base text-slate-400 font-semibold mb-3">
                    Monitorea tu estado académico y recibe notificaciones importantes
                </p>
                
                {alertsData.studentInfo && (
                    <p className="text-sm text-slate-500 font-bold">
                        {alertsData.studentInfo.name} • {alertsData.studentInfo.currentSemester}° Semestre • {alertsData.studentInfo.career}
                    </p>
                )}
            </div>

            {/* Alerts Component */}
            <AlertsComponent data={alertsData} />
        </div>
    );
};

export default AlertsPage;