import React from 'react';
import { X, FileText, Building2, FolderKanban, Calendar, DollarSign, User, MapPin, Clock } from 'lucide-react';

const ViewModal = ({ type, data, onClose }) => {
    if (!data) return null;

    const getHeaderConfig = () => {
        switch (type) {
            case 'declaracion':
                return {
                    title: 'Detalle de Declaración Jurada',
                    icon: FileText,
                    color: 'bg-teal-600',
                    borderColor: 'border-teal-500/20'
                };
            case 'centro':
                return {
                    title: 'Detalle de Centro de Costos',
                    icon: Building2,
                    color: 'bg-emerald-600',
                    borderColor: 'border-emerald-500/20'
                };
            case 'proyecto':
                return {
                    title: 'Detalle de Proyecto',
                    icon: FolderKanban,
                    color: 'bg-purple-600',
                    borderColor: 'border-purple-500/20'
                };
            default:
                return {
                    title: 'Detalles',
                    icon: FileText,
                    color: 'bg-blue-600',
                    borderColor: 'border-blue-500/20'
                };
        }
    };

    const config = getHeaderConfig();
    const Icon = config.icon;

    const renderDeclaracionContent = () => (
        <>
            {/* Información General */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <FileText className="text-teal-400" size={20} />
                    Información General
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">N° Declaración</p>
                        <p className="text-sm font-bold text-white">
                            {data.numero_declaracion || `DJ-${String(data.id_declaracion).padStart(6, '0')}`}
                        </p>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Estado</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            data.estado === 'PENDIENTE' ? 'bg-yellow-200 text-yellow-800' :
                            data.estado === 'APROBADO' ? 'bg-green-200 text-green-800' :
                            data.estado === 'RECHAZADO' ? 'bg-red-200 text-red-800' :
                            'bg-gray-200 text-gray-800'
                        }`}>
                            {data.estado}
                        </span>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Fecha de Solicitud</p>
                        <p className="text-sm font-medium text-slate-200">
                            {new Date(data.fecha_solicitud).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Importe Total</p>
                        <p className="text-lg font-bold text-teal-400">
                            {data.moneda} {parseFloat(data.importe_total || 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Datos del Trabajador */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <User className="text-blue-400" size={20} />
                    Datos del Trabajador
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Nombre Completo</p>
                        <p className="text-sm font-semibold text-white">{data.nombre_trabajador}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">DNI</p>
                        <p className="text-sm font-medium text-slate-200">{data.dni_trabajador}</p>
                    </div>
                    {data.cargo_trabajador && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Cargo</p>
                            <p className="text-sm font-medium text-slate-200">{data.cargo_trabajador}</p>
                        </div>
                    )}
                    {data.email_trabajador && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Email</p>
                            <p className="text-sm font-medium text-slate-200">{data.email_trabajador}</p>
                        </div>
                    )}
                    {data.telefono_trabajador && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Teléfono</p>
                            <p className="text-sm font-medium text-slate-200">{data.telefono_trabajador}</p>
                        </div>
                    )}
                    {data.domicilio_trabajador && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600 md:col-span-2">
                            <p className="mb-1 text-xs text-slate-400">Domicilio</p>
                            <p className="text-sm font-medium text-slate-200">{data.domicilio_trabajador}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detalles del Gasto */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <DollarSign className="text-green-400" size={20} />
                    Detalles del Gasto
                </h3>
                <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Concepto del Gasto</p>
                        <p className="text-sm text-slate-200">{data.concepto_gasto}</p>
                    </div>
                    {data.justificacion && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Justificación</p>
                            <p className="text-sm text-slate-200">{data.justificacion}</p>
                        </div>
                    )}
                    {data.razon_sin_comprobante && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Razón Sin Comprobante</p>
                            <p className="text-sm text-slate-200">{data.razon_sin_comprobante}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {/* <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Tipo de Operación</p>
                            <p className="text-sm font-medium text-slate-200">
                                {data.tipo_operacion === 'G' ? '📤 Gastado' : '📥 Recibido'}
                            </p>
                        </div> */}
                        {data.fecha_gasto && (
                            <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Fecha del Gasto</p>
                                <p className="text-sm font-medium text-slate-200">
                                    {new Date(data.fecha_gasto).toLocaleDateString('es-PE')}
                                </p>
                            </div>
                        )}
                        {data.lugar_gasto && (
                            <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Lugar</p>
                                <p className="text-sm font-medium text-slate-200">{data.lugar_gasto}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    const renderCentroContent = () => (
        <>
            {/* Información General */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <Building2 className="text-emerald-400" size={20} />
                    Información General
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Código</p>
                        <p className="text-sm font-bold text-white">{data.codigo_centro}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Estado</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            data.estado === 'A' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                            {data.estado === 'A' ? '✓ Activo' : '✗ Inactivo'}
                        </span>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600 md:col-span-2">
                        <p className="mb-1 text-xs text-slate-400">Nombre del Centro</p>
                        <p className="text-base font-semibold text-white">{data.nombre_centro}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Tipo de Institución</p>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            data.tipo_institucion === 'VALLE_GRANDE' 
                                ? 'bg-blue-200 text-blue-800' 
                                : 'bg-purple-200 text-purple-800'
                        }`}>
                            {data.tipo_institucion === 'VALLE_GRANDE' ? '🏫 Valle Grande' : '🏢 PROSIP'}
                        </span>
                    </div>
                    {data.presupuesto_anual && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Presupuesto Anual</p>
                            <p className="text-lg font-bold text-emerald-400">
                                S/ {parseFloat(data.presupuesto_anual).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Descripción y Responsable */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <User className="text-blue-400" size={20} />
                    Detalles Adicionales
                </h3>
                <div className="space-y-3">
                    {data.descripcion && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Descripción</p>
                            <p className="text-sm text-slate-200">{data.descripcion}</p>
                        </div>
                    )}
                    {data.responsable_nombre && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Responsable</p>
                            <p className="text-sm font-medium text-slate-200">{data.responsable_nombre}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const renderProyectoContent = () => (
        <>
            {/* Información General */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <FolderKanban className="text-purple-400" size={20} />
                    Información General
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Código</p>
                        <p className="text-sm font-bold text-white">{data.codigo_proyecto}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                        <p className="mb-1 text-xs text-slate-400">Estado</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            data.estado === 'A' ? 'bg-green-200 text-green-800' :
                            data.estado === 'C' ? 'bg-blue-200 text-blue-800' :
                            'bg-gray-200 text-gray-700'
                        }`}>
                            {data.estado === 'A' ? '✓ Activo' : data.estado === 'C' ? '✓ Cerrado' : '✗ Inactivo'}
                        </span>
                    </div>
                    <div className="p-3 border rounded-lg bg-slate-800 border-slate-600 md:col-span-2">
                        <p className="mb-1 text-xs text-slate-400">Nombre del Proyecto</p>
                        <p className="text-base font-semibold text-white">{data.nombre_proyecto}</p>
                    </div>
                </div>
            </div>

            {/* Fechas y Presupuesto */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <Calendar className="text-blue-400" size={20} />
                    Fechas y Presupuesto
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {data.fecha_inicio && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Fecha de Inicio</p>
                            <p className="text-sm font-medium text-slate-200">
                                {new Date(data.fecha_inicio).toLocaleDateString('es-PE')}
                            </p>
                        </div>
                    )}
                    {data.fecha_fin && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Fecha de Fin</p>
                            <p className="text-sm font-medium text-slate-200">
                                {new Date(data.fecha_fin).toLocaleDateString('es-PE')}
                            </p>
                        </div>
                    )}
                    {data.presupuesto_asignado && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600 md:col-span-2">
                            <p className="mb-1 text-xs text-slate-400">Presupuesto Asignado</p>
                            <p className="text-lg font-bold text-purple-400">
                                S/ {parseFloat(data.presupuesto_asignado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Descripción y Responsable */}
            <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <User className="text-yellow-400" size={20} />
                    Detalles Adicionales
                </h3>
                <div className="space-y-3">
                    {data.descripcion && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Descripción</p>
                            <p className="text-sm text-slate-200">{data.descripcion}</p>
                        </div>
                    )}
                    {data.responsable_nombre && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Responsable</p>
                            <p className="text-sm font-medium text-slate-200">{data.responsable_nombre}</p>
                        </div>
                    )}
                    {data.observaciones && (
                        <div className="p-3 border rounded-lg bg-slate-800 border-slate-600">
                            <p className="mb-1 text-xs text-slate-400">Observaciones</p>
                            <p className="text-sm text-slate-200">{data.observaciones}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        switch (type) {
            case 'declaracion':
                return renderDeclaracionContent();
            case 'centro':
                return renderCentroContent();
            case 'proyecto':
                return renderProyectoContent();
            default:
                return <p className="text-slate-400">No hay datos disponibles</p>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                {/* Header */}
                <div className={`sticky top-0 ${config.color} text-white p-5 flex justify-between items-center rounded-t-xl`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur">
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{config.title}</h2>
                            <p className="text-xs opacity-90 mt-0.5">
                                Información completa del registro
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
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-700 bg-slate-750">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewModal;