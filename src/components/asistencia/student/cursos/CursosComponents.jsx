// src/components/asistencia/student/cursos/CursosComponents.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BookOpenIcon, CubeTransparentIcon, ClockIcon, ExclamationTriangleIcon, 
    UserIcon, MapPinIcon, CalendarIcon 
} from '@heroicons/react/24/outline';


const MetricCard = ({ title, count, description, icon: Icon, colorClass }) => {
  
    const getCardStyle = () => {
        switch(colorClass) {
            case 'card-total-cursos':
                return {
                    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                    border: '2px solid #64748b',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                };
            case 'card-total-creditos':
                return {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    border: '2px solid #8b5cf6',
                    boxShadow: '0 4px 8px rgba(124, 58, 237, 0.3)'
                };
            case 'card-asistencia-promedio':
                return {
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    border: '2px solid #22c55e',
                    boxShadow: '0 4px 8px rgba(22, 163, 74, 0.3)'
                };
            case 'card-cursos-criticos':
                return {
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    border: '2px solid #ef4444',
                    boxShadow: '0 4px 8px rgba(220, 38, 38, 0.4)'
                };
            default:
                return {};
        }
    };

    return (
        <div 
            className="p-4 rounded-xl h-28 flex flex-col justify-between text-white transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl"
            style={getCardStyle()}
        >
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {title}
                </span>
                {Icon && <Icon className="w-6 h-6 opacity-80" />}
            </div>
            <div className="mt-2">
                <p className="text-4xl font-black mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', letterSpacing: '-0.02em' }}>
                    {count}
                </p>
                <p className="text-xs opacity-90 font-semibold">{description}</p>
            </div>
        </div>
    );
};


const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    const { title, codigo, docente, aula, horario, asistencia, proximaClase, estado } = course;


    const getCardStyle = () => {
        switch(estado) {
            case 'ÓPTIMO':
                return {
                    border: '2px solid #16a34a',
                    borderTop: '4px solid #16a34a',
                    backgroundColor: '#1e293b',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
                };
            case 'ALERTA':
                return {
                    border: '2px solid #ca8a04',
                    borderTop: '4px solid #ca8a04',
                    backgroundColor: '#1e293b',
                    boxShadow: '0 4px 12px rgba(202, 138, 4, 0.2)'
                };
            case 'CRÍTICO':
                return {
                    border: '2px solid #dc2626',
                    borderTop: '4px solid #dc2626',
                    backgroundColor: '#1e293b',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                };
            default:
                return {
                    border: '2px solid #475569',
                    backgroundColor: '#1e293b'
                };
        }
    };

    const getBadgeStyle = () => {
        switch(estado) {
            case 'ÓPTIMO':
                return {
                    backgroundColor: '#16a34a',
                    border: '2px solid #15803d',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.4)'
                };
            case 'ALERTA':
                return {
                    backgroundColor: '#ca8a04',
                    border: '2px solid #a16207',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    boxShadow: '0 2px 4px rgba(202, 138, 4, 0.4)'
                };
            case 'CRÍTICO':
                return {
                    backgroundColor: '#dc2626',
                    border: '2px solid #b91c1c',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.4)'
                };
            default:
                return {};
        }
    };

    const getBarStyle = () => {
        const inasistencia = (100 - asistencia.porcentaje).toFixed(1);
        let background = '';
        let boxShadow = '';
        
        switch(estado) {
            case 'ÓPTIMO':
                background = 'linear-gradient(90deg, #16a34a 0%, #15803d 100%)';
                boxShadow = '0 2px 4px rgba(22, 163, 74, 0.3)';
                break;
            case 'ALERTA':
                background = 'linear-gradient(90deg, #ca8a04 0%, #a16207 100%)';
                boxShadow = '0 2px 4px rgba(202, 138, 4, 0.3)';
                break;
            case 'CRÍTICO':
                background = 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)';
                boxShadow = '0 2px 4px rgba(220, 38, 38, 0.3)';
                break;
            default:
                background = '#64748b';
        }
        
        return { background, boxShadow, width: `${inasistencia}%` };
    };

    const getPercentageColor = () => {
        switch(estado) {
            case 'ÓPTIMO': return '#15803d';
            case 'ALERTA': return '#a16207';
            case 'CRÍTICO': return '#b91c1c';
            default: return '#334155';
        }
    };

    // 🔥 Función actualizada para ir a asistencias
    const handleVerAsistencias = () => {
        navigate('/asistencia/student/asistencias');
    };

    // 🔥 Función actualizada para ir a justificaciones
    const handleJustificar = () => {
        navigate('/asistencia/student/justificaciones');
    };

    return (
        <div 
            className="p-6 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl"
            style={getCardStyle()}
        >
            
            {/* Header del curso */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-extrabold text-white leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', letterSpacing: '-0.01em' }}>
                    {title} <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>({codigo})</span>
                </h3>
                <span 
                    className="px-3 py-1 text-xs rounded-full font-extrabold"
                    style={{ ...getBadgeStyle(), letterSpacing: '0.02em' }}
                >
                    {estado}
                </span>
            </div>

            {/* Información del curso */}
            <div className="space-y-2 text-sm mb-4 pb-4" style={{ borderBottom: '2px solid #475569' }}>
                {docente && !['Por asignar', 'por asignar'].includes(docente) && (
                    <p className="flex items-center font-semibold" style={{ color: '#cbd5e1' }}>
                        <UserIcon className="w-4 h-4 mr-2" style={{ color: '#60a5fa' }} /> {docente}
                    </p>
                )}
                {aula && !['Por confirmar', 'por confirmar', 'Lab 1'].includes(aula) && (
                    <p className="flex items-center font-semibold" style={{ color: '#cbd5e1' }}>
                        <MapPinIcon className="w-4 h-4 mr-2" style={{ color: '#4ade80' }} /> {aula}
                    </p>
                )}
                {horario && !['Lab 1', 'Por confirmar', 'por confirmar'].includes(horario) && (
                    <p className="flex items-center font-semibold" style={{ color: '#cbd5e1' }}>
                        <ClockIcon className="w-4 h-4 mr-2" style={{ color: '#c084fc' }} /> {horario}
                    </p>
                )}
            </div>

            {/* Estadísticas de asistencia */}
            <div 
                className="mb-4 p-4 rounded-lg" 
                style={{ 
                    backgroundColor: '#cbd5e1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}
            >
                <h4 
                    className="text-base font-extrabold mb-3" 
                    style={{ 
                        color: '#0f172a',
                        textShadow: '0 1px 2px rgba(0,0,0,0.08)', 
                        letterSpacing: '-0.01em' 
                    }}
                >
                    Estadísticas de Asistencia
                </h4>
                <div className="grid grid-cols-5 gap-3 text-center text-sm mb-3">
                    <div>
                        <p className="text-2xl font-black" style={{ color: '#2563eb', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {asistencia.totalClases}
                        </p>
                        <p className="text-xs font-bold" style={{ color: '#334155' }}>Clases</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: '#16a34a', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {asistencia.asistencias}
                        </p>
                        <p className="text-xs font-bold" style={{ color: '#334155' }}>Asistencias</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: '#dc2626', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {asistencia.faltas}
                        </p>
                        <p className="text-xs font-bold" style={{ color: '#334155' }}>Faltas</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: '#ca8a04', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {asistencia.tardanzas || 0}
                        </p>
                        <p className="text-xs font-bold" style={{ color: '#334155' }}>Tardanzas</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: '#0891b2', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {asistencia.justificadas}
                        </p>
                        <p className="text-xs font-bold" style={{ color: '#334155' }}>Justificadas</p>
                    </div>
                </div>
                <div 
                    className="text-right font-black text-xl" 
                    style={{ 
                        color: getPercentageColor(), 
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)' 
                    }}
                >
                    {asistencia.porcentaje}%
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full rounded-full h-3 mb-4" style={{ backgroundColor: '#475569' }}>
                <div 
                    className="h-3 rounded-full transition-all duration-500" 
                    style={getBarStyle()}
                ></div>
            </div>

            {/* Footer con botones */}
            <div className="flex justify-between items-center text-sm flex-wrap gap-3">
                <p className="flex items-center font-semibold" style={{ color: '#cbd5e1' }}>
                    <CalendarIcon className="w-4 h-4 mr-1" style={{ color: '#60a5fa' }}/> 
                    Próxima clase: {proximaClase}
                </p>
                <div className="space-x-2 flex">
                    <button 
                        onClick={handleVerAsistencias}
                        className="px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 hover:transform hover:-translate-y-1"
                        style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
                            border: '2px solid #2563eb',
                            letterSpacing: '0.01em'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                        Ver Asistencias
                    </button>
                    <button 
                        onClick={handleJustificar}
                        className="px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 hover:transform hover:-translate-y-1"
                        style={{
                            backgroundColor: '#16a34a',
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            boxShadow: '0 4px 8px rgba(22, 163, 74, 0.3)',
                            border: '2px solid #15803d',
                            letterSpacing: '0.01em'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                    >
                        Justificar
                    </button>
                </div>
            </div>
        </div>
    );
};



const FooterAction = ({ criticalCount }) => {
    const navigate = useNavigate();

    if (criticalCount === 0) return null;

    // 🔥 Función actualizada para ir a alertas
    const handleVerDetalles = () => {
        navigate('/asistencia/student/alertas');
    };

    return (
        <div 
            className="p-4 shadow-2xl flex justify-between items-center flex-wrap gap-4 mt-8" 
            style={{ 
                backgroundColor: '#dc2626',
                border: '2px solid #ef4444',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
        >
            <div className="flex items-center space-x-3 text-white">
                <ExclamationTriangleIcon 
                    className="w-8 h-8 flex-shrink-0" 
                    style={{ color: '#fde047', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} 
                />
                <div>
                    <p className="font-extrabold text-lg mb-1" 
                       style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', letterSpacing: '-0.01em' }}>
                        ¡Atención Requerida!
                    </p>
                    <p className="text-sm font-semibold">
                        Tienes {criticalCount} curso(s) en estado CRÍTICO. Es importante que mejores tu asistencia para evitar la desaprobación por faltas.
                    </p>
                </div>
            </div>
            <button 
                onClick={handleVerDetalles}
                className="px-5 py-2 rounded-lg text-sm font-extrabold transition-all duration-200 hover:transform hover:-translate-y-1 flex-shrink-0"
                style={{
                    backgroundColor: '#b91c1c',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    boxShadow: '0 4px 8px rgba(185, 28, 28, 0.4)',
                    border: '2px solid #991b1b',
                    letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#991b1b'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#b91c1c'}
            >
                Ver Detalles
            </button>
        </div>
    );
};


const CursosComponent = ({ data }) => {
    const { metricData, courses } = data;
    const criticalCount = courses.filter(c => c.estado === 'CRÍTICO').length;

    const metricIcons = {
        'Total Cursos': { icon: BookOpenIcon, class: 'card-total-cursos', description: 'Cursos inscritos' },
        'Total Créditos': { icon: CubeTransparentIcon, class: 'card-total-creditos', description: 'Créditos totales' },
        'Asistencia Promedio': { icon: ClockIcon, class: 'card-asistencia-promedio', description: 'Promedio general' },
        'Cursos Críticos': { icon: ExclamationTriangleIcon, class: 'card-cursos-criticos', description: 'Desaprobación' },
    };

    return (
        <div> 
            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(metricData).map(([key, value]) => {
                    const info = metricIcons[key];
                    const count = key === 'Asistencia Promedio' ? value : value;
                    return (
                        <MetricCard 
                            key={key}
                            title={key} 
                            count={count}
                            description={info.description}
                            icon={info.icon}
                            colorClass={info.class}
                        />
                    );
                })}
            </div>

            {/* Grid de cursos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {courses.map((course) => (
                    <CourseCard key={course.id || course.courseId} course={course} />
                ))}
            </div>

            {/* Footer de alerta */}
            <FooterAction criticalCount={criticalCount} />
        </div>
    );
};

export default CursosComponent;