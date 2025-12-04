import React from 'react';
import { Eye, Download, XCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const DeclaracionesTable = ({ declaraciones, loading, onView, onDownload }) => {
    const getEstadoBadge = (estado) => {
        const badges = {
            'PENDIENTE': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
            'APROBADO': 'bg-green-500/20 text-green-300 border border-green-500/30',
            'RECHAZADO': 'bg-red-500/20 text-red-300 border border-red-500/30',
            'ANULADO': 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
        };
        return badges[estado] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return <Clock className="text-yellow-400" size={14} />;
            case 'APROBADO': return <CheckCircle className="text-green-400" size={14} />;
            case 'RECHAZADO': return <XCircle className="text-red-400" size={14} />;
            default: return <AlertCircle className="text-gray-400" size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="w-10 h-10 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-slate-400">Cargando declaraciones...</p>
            </div>
        );
    }

    if (declaraciones.length === 0) {
        return (
            <div className="py-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-slate-500" size={40} />
                <p className="text-sm text-slate-400">No hay declaraciones registradas</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-700">
                    <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-300">
                            N° Declaración
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-300">
                            Trabajador
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-300">
                            DNI
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-300">
                            Importe
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-300">
                            Estado
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-300">
                            Fecha
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-300">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {declaraciones.map((dec) => (
                        <tr key={dec.id_declaracion} className="transition-colors hover:bg-slate-700/50">
                            <td className="px-4 py-3">
                                <span className="font-mono text-xs font-medium text-slate-200">
                                    {dec.numero_declaracion || `DJ-${String(dec.id_declaracion).padStart(6, '0')}`}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{dec.nombre_trabajador}</p>
                                    {dec.cargo_trabajador && (
                                        <p className="text-xs text-slate-400">{dec.cargo_trabajador}</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">
                                {dec.dni_trabajador}
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-teal-400">
                                    {dec.moneda} {parseFloat(dec.importe_total).toFixed(2)}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadge(dec.estado)}`}>
                                    {getEstadoIcon(dec.estado)}
                                    {dec.estado}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300">
                                {new Date(dec.fecha_solicitud).toLocaleDateString('es-PE', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onView && onView(dec)}
                                        className="p-1.5 transition-colors rounded-md hover:bg-blue-500/20"
                                        title="Ver detalles"
                                    >
                                        <Eye className="text-blue-400" size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDownload && onDownload(dec)}
                                        className="p-1.5 transition-colors rounded-md hover:bg-green-500/20"
                                        title="Descargar"
                                    >
                                        <Download className="text-green-400" size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DeclaracionesTable;