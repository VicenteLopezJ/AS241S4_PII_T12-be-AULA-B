import React from 'react';
import { Edit2, Trash2, Eye, Building2, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const CentroCostosList = ({ centros, loading, onEdit, onDelete, onView }) => {
    const getTipoColor = (tipo) => {
        return tipo === 'VALLE_GRANDE'
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    };

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="w-10 h-10 mx-auto border-b-2 border-teal-500 rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-slate-400">Cargando centros de costos...</p>
            </div>
        );
    }

    if (centros.length === 0) {
        return (
            <div className="py-12 text-center">
                <Building2 className="mx-auto mb-3 text-slate-500" size={40} />
                <p className="text-sm text-slate-400">No hay centros de costos registrados</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {centros.map((centro) => (
                <div key={centro.id_centro_costos} className="overflow-hidden transition-colors border rounded-lg bg-slate-800 hover:bg-slate-750 border-slate-600">
                    <div className="p-4 border-b bg-teal-500/10 border-teal-500/20">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <span className="text-xs font-medium text-slate-400">
                                    {centro.codigo_centro}
                                </span>
                                <h3 className="mt-1 text-base font-bold text-white line-clamp-2">
                                    {centro.nombre_centro}
                                </h3>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${centro.estado === 'a' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                                {(centro.estado || '').trim().toLowerCase() === 'a' ? (
                                    <span className="flex items-center gap-1"><CheckCircle size={12} /> Activo</span>
                                ) : (
                                    <span className="flex items-center gap-1"><XCircle size={12} /> Inactivo</span>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="mb-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getTipoColor(centro.tipo_institucion)}`}>
                                {centro.tipo_institucion === 'VALLE_GRANDE' ? '🏫 Valle Grande' : '🏢 PROSIP'}
                            </span>
                        </div>

                        <p className="mb-3 text-sm text-slate-400 line-clamp-2">
                            {centro.descripcion || 'Sin descripción'}
                        </p>

                        <div className="mb-4 space-y-2">
                            {centro.presupuesto_anual && (
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="text-teal-400" size={16} />
                                    <span className="text-slate-300">
                                        S/ {parseFloat(centro.presupuesto_anual).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {centro.responsable_nombre && (
                                <div className="text-sm">
                                    <span className="text-slate-400">Responsable: </span>
                                    <span className="font-medium text-slate-200">{centro.responsable_nombre}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-slate-700">
                            <button
                                onClick={() => onView && onView(centro)}
                                className="flex-1 py-2 px-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                            >
                                <Eye size={14} />
                                Ver
                            </button>
                            <button
                                onClick={() => onEdit && onEdit(centro)}
                                className="flex-1 py-2 px-2 bg-teal-500/20 text-teal-300 rounded-lg hover:bg-teal-500/30 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                            >
                                <Edit2 size={14} />
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete && onDelete(centro)}
                                className="flex items-center justify-center px-2 py-2 text-red-300 transition-colors rounded-lg bg-red-500/20 hover:bg-red-500/30"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CentroCostosList;