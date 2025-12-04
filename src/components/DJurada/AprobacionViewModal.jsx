import React from 'react';
import { X, FileText, User, DollarSign, Clock, CheckCircle, XCircle, Calendar, MapPin, AlertCircle } from 'lucide-react';

const AprobacionViewModal = ({ declaracion, onClose }) => {
    if (!declaracion) return null;

    const getEstadoBadge = () => {
        const badges = {
            'PENDIENTE': { bg: 'bg-yellow-200', text: 'text-yellow-800', icon: Clock },
            'APROBADO': { bg: 'bg-green-200', text: 'text-green-800', icon: CheckCircle },
            'RECHAZADO': { bg: 'bg-red-200', text: 'text-red-800', icon: XCircle }
        };
        return badges[declaracion.estado] || badges['PENDIENTE'];
    };

    const badge = getEstadoBadge();
    const BadgeIcon = badge.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-5 text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Revisión de Declaración Jurada</h2>
                            <p className="text-xs opacity-90 mt-0.5">
                                {declaracion.numero_declaracion || `DJ-${String(declaracion.id_declaracion).padStart(6, '0')}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 transition-colors rounded-lg hover:bg-white/20"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Estado y Resumen */}
                    <div className="p-5 border rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                                        <BadgeIcon size={16} />
                                        {declaracion.estado}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Fecha: {new Date(declaracion.fecha_solicitud).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400">Trabajador</p>
                                        <p className="text-base font-bold text-white">{declaracion.nombre_trabajador}</p>
                                        <p className="text-xs text-slate-400">DNI: {declaracion.dni_trabajador}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400">Importe Total</p>
                                        <p className="text-3xl font-bold text-amber-400">
                                            {declaracion.moneda} {parseFloat(declaracion.importe_total || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del Trabajador */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <User className="text-blue-400" size={20} />
                            Información del Trabajador
                        </h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Nombre Completo</p>
                                <p className="text-sm font-semibold text-white">{declaracion.nombre_trabajador}</p>
                            </div>
                            <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">DNI</p>
                                <p className="text-sm font-medium text-slate-200">{declaracion.dni_trabajador}</p>
                            </div>
                            {declaracion.cargo_trabajador && (
                                <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                    <p className="mb-1 text-xs text-slate-400">Cargo</p>
                                    <p className="text-sm font-medium text-slate-200">{declaracion.cargo_trabajador}</p>
                                </div>
                            )}
                            {declaracion.email_trabajador && (
                                <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                    <p className="mb-1 text-xs text-slate-400">Email</p>
                                    <p className="text-sm font-medium text-slate-200">{declaracion.email_trabajador}</p>
                                </div>
                            )}
                            {declaracion.telefono_trabajador && (
                                <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                    <p className="mb-1 text-xs text-slate-400">Teléfono</p>
                                    <p className="text-sm font-medium text-slate-200">{declaracion.telefono_trabajador}</p>
                                </div>
                            )}
                            {declaracion.domicilio_trabajador && (
                                <div className="p-3 border rounded-lg bg-slate-800 border-slate-600 md:col-span-2">
                                    <p className="mb-1 text-xs text-slate-400">Domicilio</p>
                                    <p className="text-sm font-medium text-slate-200">{declaracion.domicilio_trabajador}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles Financieros */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <DollarSign className="text-green-400" size={20} />
                            Detalles Financieros
                        </h3>
                        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
                            <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Importe Total</p>
                                <p className="text-xl font-bold text-green-400">
                                    {declaracion.moneda} {parseFloat(declaracion.importe_total || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Moneda</p>
                                <p className="text-sm font-medium text-slate-200">
                                    {declaracion.moneda === 'PEN' ? '💵 Soles (PEN)' : '💲 Dólares (USD)'}
                                </p>
                            </div>
                            {/* <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Tipo de Operación</p>
                                <p className="text-sm font-medium text-slate-200">
                                    {declaracion.tipo_operacion === 'G' ? '📤 Gastado' : '📥 Recibido'}
                                </p>
                            </div> */}
                        </div>
                        <div className="p-4 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-2 text-xs text-slate-400">Concepto del Gasto</p>
                            <p className="text-sm leading-relaxed text-slate-200">{declaracion.concepto_gasto}</p>
                        </div>
                    </div>

                    {/* Justificación y Detalles */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <AlertCircle className="text-yellow-400" size={20} />
                            Justificación y Detalles
                        </h3>
                        <div className="space-y-3">
                            {declaracion.justificacion && (
                                <div className="p-4 border rounded-lg bg-slate-800 border-slate-600">
                                    <p className="mb-2 text-xs text-slate-400">Justificación</p>
                                    <p className="text-sm leading-relaxed text-slate-200">{declaracion.justificacion}</p>
                                </div>
                            )}
                            {declaracion.razon_sin_comprobante && (
                                <div className="p-4 border rounded-lg bg-slate-800 border-slate-600">
                                    <p className="mb-2 text-xs text-slate-400">Razón Sin Comprobante</p>
                                    <p className="text-sm leading-relaxed text-slate-200">{declaracion.razon_sin_comprobante}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {declaracion.fecha_gasto && (
                                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                        <p className="flex items-center gap-1 mb-1 text-xs text-slate-400">
                                            <Calendar size={14} />
                                            Fecha del Gasto
                                        </p>
                                        <p className="text-sm font-medium text-slate-200">
                                            {new Date(declaracion.fecha_gasto).toLocaleDateString('es-PE', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                                {declaracion.lugar_gasto && (
                                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                        <p className="flex items-center gap-1 mb-1 text-xs text-slate-400">
                                            <MapPin size={14} />
                                            Lugar del Gasto
                                        </p>
                                        <p className="text-sm font-medium text-slate-200">{declaracion.lugar_gasto}</p>
                                    </div>
                                )}
                            </div>
                            {/* {declaracion.beneficiario && (
                                <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                    <p className="mb-1 text-xs text-slate-400">Beneficiario</p>
                                    <p className="text-sm font-medium text-slate-200">{declaracion.beneficiario}</p>
                                </div>
                            )} */}
                        </div>
                    </div>

                    {/* Alerta de Acción */}
                    {declaracion.estado === 'PENDIENTE' && (
                        <div className="p-4 border-l-4 rounded-lg bg-amber-500/10 border-amber-500">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <p className="font-medium text-amber-300">Acción Requerida</p>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Esta declaración está pendiente de revisión. Por favor, revisa todos los detalles y procede a aprobar o rechazar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con Acciones */}
                <div className="p-5 border-t border-slate-700 bg-slate-750">
                    {declaracion.estado === 'PENDIENTE' ? (
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-slate-700 hover:bg-slate-600"
                            >
                                Cerrar
                            </button>
                            {/* <button
                                onClick={() => {
                                    onRechazar(declaracion);
                                    onClose();
                                }}
                                className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                <XCircle size={18} />
                                Rechazar
                            </button> */}
                            {/* <button
                                onClick={() => {
                                    onAprobar(declaracion);
                                    onClose();
                                 }}
                                className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                           >
                                <CheckCircle size={18} />
                                Aprobar
                            </button> */}
                        </div>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-slate-700 hover:bg-slate-600"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AprobacionViewModal;