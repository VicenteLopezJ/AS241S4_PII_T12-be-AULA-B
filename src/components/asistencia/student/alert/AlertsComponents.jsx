// src/components/asistencia/student/alert/AlertsComponents.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldExclamationIcon, LightBulbIcon, BellIcon, 
    ClockIcon, CheckCircleIcon, ArrowRightCircleIcon, 
    CalendarDaysIcon, ChatBubbleLeftRightIcon, BellAlertIcon
} from '@heroicons/react/24/outline'; 

// ========== TARJETA DE MÉTRICA ==========
const MetricCard = ({ title, count, description, icon: Icon, type }) => {
    const cardClass = `card-${type}`;
    const textClass = `text-${type}`;

    return (
        <div className={`p-6 rounded-xl shadow-xl ${cardClass} flex flex-col justify-between h-40 transform transition-all duration-300`}>
            <div className={`flex items-start justify-between ${textClass}`}>
                <div className="flex items-center space-x-3">
                    {Icon && <Icon className="w-7 h-7 drop-shadow-lg" />}
                    <h3 className="font-bold text-lg tracking-wide">{title}</h3>
                </div>
            </div>
            
            <div className="mt-4">
                <p className="text-5xl font-black text-white drop-shadow-lg tracking-tight">{count}</p>
                <p className={`text-sm mt-2 font-semibold ${textClass}`}>{description}</p>
            </div>
        </div>
    );
};

// ========== TARJETA DE ALERTA ==========
const AlertCard = ({ data, type }) => {
    const navigate = useNavigate();
    const isCritica = type === 'critica';
    const badgeClass = isCritica ? 'badge-critico' : 'badge-alerta';

    // 🔥 Función para navegar a asistencias
    const handleVerDetalles = () => {
        // Navegar a la página de asistencias
        navigate('/asistencia/student/cursos', {
            state: {
                highlightCourseId: data.courseId,
                courseCode: data.codigo,
                courseName: data.unidadDidactica
            }
        });
    };

    return (
        <div className="bg-slate-300 p-6 rounded-xl shadow-lg border-2 border-slate-400 mb-6 hover:border-slate-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b-2 border-slate-400 pb-3">
                <div className="flex items-center">
                    {isCritica ? (
                        <span className="text-3xl mr-3 drop-shadow-md">⚠️</span>
                    ) : (
                        <span className="text-3xl mr-3 drop-shadow-md">🔔</span>
                    )}
                    
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {data.unidadDidactica} ({data.codigo})
                    </h3>
                </div>
                
                <div className="flex space-x-2 items-center">
                    {isCritica && (
                        <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-red-600 text-white border-2 border-red-700 shadow-md">
                            CRÍTICO
                        </span>
                    )}
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${badgeClass}`}>
                        {data.porcentajeInasistencia} inasistencias
                    </span>
                </div>
            </div>

            {/* Mensaje */}
            <p className="text-slate-700 text-sm mb-4 font-semibold leading-relaxed">
                {data.message}
            </p>

            {/* Estadísticas en grid */}
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div className="bg-slate-200 p-3 rounded-lg shadow-sm border border-slate-300">
                    <p className="text-slate-900 text-xl font-extrabold">{data.totalClases}</p>
                    <p className="text-slate-600 text-xs font-bold mt-1">Total de Clases</p>
                </div>
                <div className="bg-slate-200 p-3 rounded-lg shadow-sm border border-slate-300">
                    <p className="text-red-600 text-xl font-extrabold">{data.totalFaltas}</p>
                    <p className="text-slate-600 text-xs font-bold mt-1">Total de Faltas</p>
                </div>
                <div className="bg-slate-200 p-3 rounded-lg shadow-sm border border-slate-300">
                    <p className={`text-xl font-extrabold ${
                        data.porcentaje >= 85 ? 'text-green-600' :
                        data.porcentaje >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        {data.porcentaje.toFixed(1)}%
                    </p>
                    <p className="text-slate-600 text-xs font-bold mt-1">Asistencia</p>
                </div>
            </div>

            {/* Asistencias efectivas */}
            <div className="mt-3 p-3 bg-white rounded-lg border-2 border-slate-300 shadow-sm">
                <p className="text-sm text-slate-700 font-semibold">
                    <strong className="text-blue-600 font-extrabold">Asistencias Efectivas:</strong> {data.asistenciasEfectivas}
                </p>
                <p className="text-xs text-slate-600 mt-1 font-semibold">
                    Presentes: {data.asistencias} | Tardanzas: {data.tardanzas} | Justificadas: {data.justificadas}
                </p>
            </div>

            {/* Footer con botón */}
            <div className="flex justify-between items-center border-t-2 border-slate-400 pt-3 mt-4 text-sm text-slate-700">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center font-semibold">
                        <ClockIcon className="w-4 h-4 mr-1 text-blue-600" />
                        {data.fechaRevision}
                    </span>
                    <span className="flex items-center font-semibold">
                        <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600" />
                        Enviado por correo
                    </span>
                </div>
                
                {/* 🔥 BOTÓN FUNCIONAL */}
                <button 
                    onClick={handleVerDetalles}
                    className="btn-action-alerts hover:scale-105 transition-transform"
                >
                    Ver Detalles →
                </button>
            </div>
        </div>
    );
};

// ========== SECCIÓN DE RECOMENDACIONES ==========
// ========== SECCIÓN DE RECOMENDACIONES ==========
const Recommendations = () => {
    return (
        <div className="recommendations-container mt-8">
            <h3 className="card-title-alerts mb-4 border-b-2 border-slate-400 pb-2">
                💡 Recomendaciones para Mejorar
            </h3>
            <p className="card-description-alerts mb-6">
                Sigue estos pasos para mejorar tu situación académica y mantener un buen rendimiento.
            </p>

            <div className="space-y-4">
                <div className="recommendation-item">
                    <div className="flex items-start">
                        <ArrowRightCircleIcon className="w-6 h-6 mr-3 mt-1 text-green-600 min-w-6 drop-shadow-md" />
                        <div>
                            <p className="recommendation-title">Asiste regularmente a clases</p>
                            <p className="recommendation-desc mt-1">
                                La asistencia regular es fundamental para el rendimiento académico y evitar problemas futuros.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="recommendation-item">
                    <div className="flex items-start">
                        <CalendarDaysIcon className="w-6 h-6 mr-3 mt-1 text-yellow-600 min-w-6 drop-shadow-md" />
                        <div>
                            <p className="recommendation-title">Justifica tus faltas dentro del plazo</p>
                            <p className="recommendation-desc mt-1">
                                Recuerda que tienes 48 horas para enviar justificaciones válidas con documentación de respaldo.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="recommendation-item">
                    <div className="flex items-start">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3 mt-1 text-blue-600 min-w-6 drop-shadow-md" />
                        <div>
                            <p className="recommendation-title">Comunícate con tus docentes</p>
                            <p className="recommendation-desc mt-1">
                                Informa proactivamente sobre cualquier dificultad o inquietud que puedas tener.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="recommendation-item">
                    <div className="flex items-start">
                        <BellAlertIcon className="w-6 h-6 mr-3 mt-1 text-red-600 min-w-6 drop-shadow-md" />
                        <div>
                            <p className="recommendation-title">Revisa regularmente tus alertas</p>
                            <p className="recommendation-desc mt-1">
                                Mantente informado sobre tu estado académico revisando esta sección frecuentemente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========== COMPONENTE PRINCIPAL ==========
const AlertsComponent = ({ data }) => {
    const { metricData, criticalAlerts, warningAlerts } = data;

    return (
        <div className="p-4"> 
          
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 metric-grid">
                <MetricCard 
                    title="Críticas" 
                    count={metricData.criticas.count} 
                    description={metricData.criticas.description} 
                    icon={ShieldExclamationIcon}
                    type="criticas"
                />
                <MetricCard 
                    title="Advertencias" 
                    count={metricData.advertencias.count} 
                    description={metricData.advertencias.description} 
                    icon={LightBulbIcon}
                    type="advertencias"
                />
                <MetricCard 
                    title="Notificaciones" 
                    count={metricData.notificaciones.count} 
                    description={metricData.notificaciones.description} 
                    icon={BellIcon}
                    type="notificaciones"
                />
            </div>

            {/* Alertas Críticas */}
            {criticalAlerts.length > 0 && (
                <>
                    <h2 className="section-title-alerts text-red-400">
                        ⚠️ Alertas Críticas - Acción Inmediata Requerida
                    </h2>
                    <div className="space-y-6 mb-10">
                        {criticalAlerts.map((alert, index) => (
                            <AlertCard key={index} data={alert} type="critica" />
                        ))}
                    </div>
                </>
            )}

            {/* Alertas de Advertencia */}
            {warningAlerts.length > 0 && (
                <>
                    <h2 className="section-title-alerts text-yellow-400">
                        🔔 Alertas de Advertencia
                    </h2>
                    <div className="space-y-6">
                        {warningAlerts.map((alert, index) => (
                            <AlertCard key={index} data={alert} type="advertencia" />
                        ))}
                    </div>
                </>
            )}

            {/* Recomendaciones */}
            <Recommendations />
        </div>
    );
};

export default AlertsComponent;