
import { X, Calendar, Clock, User, ClipboardList, TrendingUp, BookOpen, CheckCircle, FileText } from 'lucide-react';
import { useTheme } from '../../../../../styles/hackathon/ThemeContext' 
import React, { useState, useMemo,Fragment } from 'react';

const getEvaluationConditionClasses = (state) => {
    switch (state) {
        case 'APROBADO':
            return "bg-emerald-500/20 text-emerald-400";
        case 'RECUPERACION':
            return "bg-yellow-500/20 text-yellow-400";
        case 'DESAPROBADO':
            return "bg-red-500/20 text-red-400";
        default:
            return "bg-gray-500/20 text-gray-400";
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const groupDetailsByTrack = (details) => {
    if (!details) return {};
    
    return details.reduce((acc, detail) => {
        const trackName = detail.track || 'Sin Track Asignado';
        
        if (!acc[trackName]) {
            acc[trackName] = [];
        }
        acc[trackName].push(detail);
        return acc;
    }, {});
};

export default function EvaluationDetailModal({ evaluation, onClose }) {
    const { mode, theme } = useTheme(); 

    const themeClass = `${theme.modalBg} ${theme.text}`;
    const overlayClass = theme.modalOverlay;
    const headerClass = `${theme.modalHeaderBg} border-b ${theme.modalHeaderBg.includes('slate-700') ? 'border-slate-700' : 'border-gray-200'}`;

    if (!evaluation) return null;

    const totalMaxScore = evaluation.details.reduce((sum, item) => sum + item.maxScore, 0);
    const groupedDetails = useMemo(() => groupDetailsByTrack(evaluation.details), [evaluation.details]);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClass}`} onClick={onClose}>
            <div 
                className={`relative w-full max-w-5xl h-full md:h-auto max-h-[90vh] rounded-xl shadow-2xl overflow-y-auto ${themeClass} no-scrollbar`}
                onClick={(e) => e.stopPropagation()} 
            >
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full text-slate-400 transition-colors z-10 
                                ${mode === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-gray-200/50 hover:text-gray-700'}`}
                    aria-label="Cerrar modal"
                >
                    <X className="w-6 h-6" />
                </button>

                <header className={`p-6 ${headerClass} sticky top-0 z-10`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className={`text-3xl font-bold ${theme.modalHeaderSectionText} mb-1`}>
                                Evaluación de {evaluation.student_name} {evaluation.student_surname}
                            </h2>
                            <p className={`text-lg ${mode === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                                Grupo: {evaluation.student_group_name} ({evaluation.student_semester}° Semestre)
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={`block px-3 py-1 mb-1 rounded-full text-center text-sm font-medium ${getEvaluationConditionClasses(evaluation.evaluationState)}`}>
                                {evaluation.evaluationState}
                            </span>
                            <p className={`text-3xl font-bold ${theme.modalHeaderSectionText}`}>
                                {(evaluation.evaluationResult ?? 0).toFixed(2)} / {(evaluation.evaluationMaxresult ?? totalMaxScore).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    
                    <h3 className={`text-xl font-semibold mb-3 border-b ${mode === 'dark' ? 'border-slate-700' : 'border-gray-300'} pb-2 ${theme.modalSectionHeader} flex items-center gap-2`}>
                        <BookOpen className="w-5 h-5" /> Información de la Sesión
                    </h3>
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${mode === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                        <InfoItem icon={Calendar} label="Fecha" value={formatDate(evaluation.sessionDate)} />
                        <InfoItem icon={Clock} label="Horario" value={`${formatTime(evaluation.startTime)} - ${formatTime(evaluation.endTime)}`} />
                        <InfoItem icon={User} label="Evaluador" value={evaluation.tutor_name} />
                        <InfoItem icon={ClipboardList} label="Placement" value={evaluation.placement} />
                        <InfoItem icon={BookOpen} label="Módulo de Desafío" value={evaluation.challengeTitle} />
                        <InfoItem icon={CheckCircle} label="Caso Evaluado" value={evaluation.caseDescription} />
                    </div>

                    <div className="mb-8">
                        <h3 className={`text-xl font-semibold mb-3 border-b ${mode === 'dark' ? 'border-slate-700' : 'border-gray-300'} pb-2 ${theme.modalSectionHeader} flex items-center gap-2`}>
                            <FileText className="w-5 h-5" /> Detalles del Desafío
                        </h3>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${mode === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                            <DescriptionBox 
                                title="Descripción del Desafío" 
                                description={evaluation.challengeDescription} 
                                icon={TrendingUp}
                            />
                            <DescriptionBox 
                                title="Descripción del Caso" 
                                description={evaluation.caseDescription} 
                                icon={ClipboardList}
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <h3 className={`text-xl font-semibold mb-4 border-b ${mode === 'dark' ? 'border-slate-700' : 'border-gray-300'} pb-2 ${theme.modalSectionHeader} flex items-center gap-2`}>
                            <ClipboardList className="w-5 h-5" /> Criterios Evaluados
                        </h3>
                        <CriteriosTable groupedDetails={groupedDetails} />
                    </div>

                </div>
            </div>
        </div>
    );
}


const InfoItem = ({ icon: Icon, label, value }) => {
    const { mode, theme } = useTheme();
    const borderClass = mode === 'dark' ? 'border-slate-700' : 'border-gray-300';
    const labelClass = mode === 'dark' ? 'text-slate-400' : 'text-gray-500';

    return (
        <div className={`flex flex-col p-3 border ${borderClass} rounded-lg ${theme.modalInfoBoxBg}`}>
            <div className={`flex items-center gap-2 mb-1 ${labelClass}`}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{label}</span>
            </div>
            <p className={`text-base font-semibold ${theme.modalHeaderText}`}>{value}</p>
        </div>
    );
};


const DescriptionBox = ({ title, description, icon: Icon }) => {
    const { theme } = useTheme();
    return (
        <div className={`p-4 ${theme.modalDescriptionBoxBg} rounded-lg`}>
            <h4 className={`text-sm font-semibold ${theme.modalHeaderText} mb-2 flex items-center gap-2`}>
                <Icon className={`w-4 h-4 ${theme.modalSectionHeader}`} /> {title}
            </h4>
            <p className={`text-sm ${theme.modalDescriptionBoxText}`}>
                {description || `No hay ${title.toLowerCase()} disponible.`}
            </p>
        </div>
    );
};



const CriteriosTable = ({ groupedDetails }) => {
    const { mode, theme } = useTheme();

    const headerClass = mode === 'dark' ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-100 text-gray-700';
    const rowClass = mode === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-50';
    const textClass = mode === 'dark' ? 'text-white' : 'text-gray-900';
    const secondaryTextClass = mode === 'dark' ? 'text-slate-400' : 'text-gray-500';
    
    
    const trackNames = Object.keys(groupedDetails);

    return (
        <div className={`overflow-x-auto border ${mode === 'dark' ? 'border-slate-700' : 'border-gray-300'} rounded-lg`}>
            <table className="min-w-full divide-y divide-slate-700">
                <thead>
                    <tr>
                        <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerClass}`}>Criterio</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerClass}`}>Unidad</th>
                        <th className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${headerClass}`}>Puntaje</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerClass}`}>Observación</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${theme.modalTableBodyDivide}`}>
                    {trackNames.map((trackName, trackIndex) => (
                        <React.Fragment key={`track-group-${trackIndex}`}>
                            <tr className={theme.modalTrackHeaderBg}>
                                <td colSpan="4" className={`px-6 py-2 text-sm font-bold ${theme.modalTrackHeaderText}`}>
                                    {trackName}
                                </td>
                            </tr>
                            
                            {groupedDetails[trackName].map((detail, index) => (
                                <tr key={detail.idEvalDetail} className={rowClass}>
                                    <td className={`px-6 py-3 text-sm font-medium ${textClass}`}>{detail.criterionDescription}</td>
                                    <td className={`px-6 py-3 text-sm ${textClass}`}>{detail.teachingUnit}</td>
                                    <td className="px-6 py-3 text-sm text-center">
                                        <span className={`font-bold ${theme.modalScoreText}`}>{detail.scoreObtained.toFixed(2)}</span>
                                        <span className={secondaryTextClass}> / {detail.maxScore.toFixed(2)}</span>
                                    </td>
                                    <td className={`px-6 py-3 text-sm ${textClass}`}>
                                        {detail.observation || 'Sin observaciones'}
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                    {trackNames.length === 0 && (
                        <tr>
                            <td colSpan="4" className={`px-6 py-4 text-center ${secondaryTextClass}`}>No hay criterios de evaluación disponibles.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};