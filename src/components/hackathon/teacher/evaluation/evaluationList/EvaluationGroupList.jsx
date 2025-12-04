// src/components/Evaluation/EvaluationGroupList.jsx
import { useState } from "react";
import { Users, FileText, ArrowRight, LayoutGrid, List, Calendar, Tag } from "lucide-react";
import { Button } from "../../../index";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
    if (!dateString) return "Fecha no definida";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default function EvaluationGroupList({ groups, onGroupSelect }) {
    const [viewMode, setViewMode] = useState("cards");
    const navigate = useNavigate();

    if (groups.length === 0) {
        return (
            <div className="text-center p-12 bg-white/5 rounded-xl border border-slate-700">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white">No hay Sesiones de Evaluación activas</h3>
                <p className="text-slate-400 mt-2">Crea una nueva evaluación para empezar a organizar sesiones.</p>
                <Button 
                    onClick={() => navigate('/hackathon/evaluationday/setup')} 
                    className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center mx-auto"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Crear Nueva Evaluación
                </Button>
            </div>
        );
    }
    
    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <Button 
                        onClick={() => navigate('/hackathon/evaluationday/setup')} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Crear Nueva Evaluación
                    </Button>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("cards")}
                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 ${
                                viewMode === "cards" ? "bg-emerald-500 text-white" : "border border-slate-600 text-white hover:bg-slate-800"
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4 mr-2" /> Tarjetas
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 ${
                                viewMode === "list" ? "bg-emerald-500 text-white" : "border border-slate-600 text-white hover:bg-slate-800"
                            }`}
                        >
                            <List className="w-4 h-4 mr-2" /> Lista
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((session) => (
                        <div 
                            key={session.id} 
                            onClick={() => onGroupSelect(session)} 
                            className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl cursor-pointer h-full"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${session.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative border border-slate-200/50 bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300 h-full rounded-xl">
                                <div className="flex flex-col space-y-1.5 pb-4 pt-6 px-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="space-y-1 pr-4">
                                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{session.semester} - {session.groupName}</p>
                                            <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{session.challengeTitle}</h3>
                                        </div>
                                        <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${session.color} shadow-lg`}>
                                            <FileText className="w-6 h-6 text-white" /> 
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 border-t pt-3 mt-3 border-slate-100">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>{formatDate(session.sessionDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Tag className="w-3 h-3" />
                                            <span>ID: {session.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6">
                                    <div className="mb-4">
                                        <p className="text-sm text-slate-700 font-medium mb-1">Caso de Estudio:</p>
                                        <p className="text-sm text-slate-600 line-clamp-2">{session.caseDescription}</p>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <p className="text-sm text-slate-500 font-medium">Total de Alumnos a Evaluar</p>
                                    </div>

                                    <p className="text-3xl font-bold text-slate-900 mb-6">{session.students}</p>

                                    <button className={`inline-flex w-full items-center justify-center bg-gradient-to-r ${session.color} text-white font-semibold py-3 rounded-xl hover:shadow-lg transform transition-all duration-300 hover:scale-105 gap-2 border-0`}>
                                        Ver Evaluaciones <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === "list" && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-[120px]">ID Sesión</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-[120px]">Fecha</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Desafío / Caso</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-[100px]">Alumnos</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 w-[180px]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((session) => (
                                    <tr key={session.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-700 font-mono text-xs">#{session.id}</td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">{formatDate(session.sessionDate)}</td>
                                        <td className="px-6 py-4 text-slate-900 font-semibold">
                                            <span className="block text-sm leading-tight">{session.challengeTitle}</span>
                                            <span className="block text-xs text-slate-500 leading-tight mt-1">{session.caseDescription}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 text-center">{session.students}</td>
                                        <td className="px-6 py-4 flex justify-center">
                                            <button
                                                onClick={() => onGroupSelect(session)}
                                                className={`inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r ${session.color} text-white font-semibold text-sm hover:shadow-lg transition-all transform hover:scale-105`}
                                            >
                                                Ver Evaluaciones
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
