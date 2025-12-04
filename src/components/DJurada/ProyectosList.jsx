import React from 'react';
import { Edit2, Trash2, Eye, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const ProyectosList = ({ proyectos, loading, onEdit, onDelete, onView }) => {
    const getEstadoBadge = (estado) => {
        const badges = {
            'A': { bg: 'bg-green-500/20 border border-green-500/30', text: 'text-green-300', label: 'Activo', icon: CheckCircle },
            'I': { bg: 'bg-gray-500/20 border border-gray-500/30', text: 'text-gray-300', label: 'Inactivo', icon: XCircle },
            'C': { bg: 'bg-blue-500/20 border border-blue-500/30', text: 'text-blue-300', label: 'Cerrado', icon: CheckCircle }
        };
        return badges[estado] || badges['I'];
    };

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="w-10 h-10 mx-auto border-b-2 border-purple-500 rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-slate-400">Cargando proyectos...</p>
            </div>
        );
    }

    if (proyectos.length === 0) {
        return (
            <div className="py-12 text-center">
                <Calendar className="mx-auto mb-3 text-slate-500" size={40} />
                <p className="text-sm text-slate-400">No hay proyectos registrados</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proyectos.map((proyecto) => {
                const estadoBadge = getEstadoBadge(proyecto.estado);
                const Icon = estadoBadge.icon;

                return (
                    <div key={proyecto.id_proyecto} className="overflow-hidden transition-colors border rounded-lg bg-slate-800 hover:bg-slate-750 border-slate-600">
                        <div className="p-4 border-b bg-purple-500/10 border-purple-500/20">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <span className="text-xs font-medium text-slate-400">
                                        {proyecto.codigo_proyecto}
                                    </span>
                                    <h3 className="mt-1 text-base font-bold text-white line-clamp-2">
                                        {proyecto.nombre_proyecto}
                                    </h3>
                                </div>
                                <span className={`${estadoBadge.bg} ${estadoBadge.text} px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                                    <Icon size={12} />
                                    {estadoBadge.label}
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <p className="mb-3 text-sm text-slate-400 line-clamp-2">
                                {proyecto.descripcion || 'Sin descripción'}
                            </p>

                            <div className="mb-4 space-y-2">
                                {proyecto.presupuesto_asignado && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="text-purple-400" size={16} />
                                        <span className="text-slate-300">
                                            S/ {parseFloat(proyecto.presupuesto_asignado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                {proyecto.fecha_inicio && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="text-blue-400" size={16} />
                                        <span className="text-slate-300">
                                            {new Date(proyecto.fecha_inicio).toLocaleDateString('es-PE')}
                                            {proyecto.fecha_fin && ` - ${new Date(proyecto.fecha_fin).toLocaleDateString('es-PE')}`}
                                        </span>
                                    </div>
                                )}

                                {proyecto.responsable_nombre && (
                                    <div className="text-sm">
                                        <span className="text-slate-400">Responsable: </span>
                                        <span className="font-medium text-slate-200">{proyecto.responsable_nombre}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-slate-700">
                                <button
                                    onClick={() => onView && onView(proyecto)}
                                    className="flex-1 py-2 px-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                                >
                                    <Eye size={14} />
                                    Ver
                                </button>
                                <button
                                    onClick={() => onEdit && onEdit(proyecto)}
                                    className="flex-1 py-2 px-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                                >
                                    <Edit2 size={14} />
                                    Editar
                                </button>
                                <button
                                    onClick={() => onDelete && onDelete(proyecto)}
                                    className="flex items-center justify-center px-2 py-2 text-red-300 transition-colors rounded-lg bg-red-500/20 hover:bg-red-500/30"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProyectosList;