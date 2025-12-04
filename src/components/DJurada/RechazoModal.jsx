import React, { useState } from 'react';
import { X, XCircle, User, Briefcase, Mail, FileText, AlertTriangle } from 'lucide-react';

const RechazoModal = ({ declaracion, onSubmit, onCancel, loading }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formData, setFormData] = useState({
        declaracion_id: declaracion?.id_declaracion || '',
        nombre_aprobador: '',
        cargo_aprobador: '',
        email_aprobador: '',
        observaciones: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validar campos requeridos
        if (!formData.nombre_aprobador || !formData.cargo_aprobador) {
            alert('⚠️ Complete todos los campos requeridos');
            return;
        }
        
        if (!formData.observaciones.trim()) {
            alert('⚠️ Las observaciones son obligatorias para rechazar');
            return;
        }

        // Mostrar confirmación
        setShowConfirmation(true);
    };

    const handleConfirmarRechazo = () => {
        onSubmit(formData);
    };

    // Vista de Confirmación
    if (showConfirmation) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-lg border shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-slate-700">
                    {/* Header */}
                    <div className="p-6 text-white bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <AlertTriangle size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Confirmar Rechazo</h2>
                                <p className="mt-1 text-sm opacity-90">Esta acción no se puede deshacer</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Información de la Declaración */}
                        <div className="p-5 border-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                            <h3 className="mb-3 text-sm font-bold text-slate-300">Declaración a Rechazar:</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">N° Declaración:</span>
                                    <span className="font-bold text-white">
                                        {declaracion?.numero_declaracion || `DJ-${String(declaracion?.id_declaracion).padStart(6, '0')}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Trabajador:</span>
                                    <span className="font-semibold text-white">{declaracion?.nombre_trabajador}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Importe:</span>
                                    <span className="text-lg font-bold text-red-400">
                                        {declaracion?.moneda} {parseFloat(declaracion?.importe_total || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Datos del Revisor */}
                        <div className="p-5 border-2 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/20">
                            <h3 className="mb-3 text-sm font-bold text-slate-300">Revisor:</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Nombre:</span>
                                    <span className="font-semibold text-white">{formData.nombre_aprobador}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-400">Cargo:</span>
                                    <span className="font-semibold text-white">{formData.cargo_aprobador}</span>
                                </div>
                                {formData.email_aprobador && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-400">Email:</span>
                                        <span className="text-sm text-white">{formData.email_aprobador}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="p-5 border-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20">
                            <h3 className="mb-3 text-sm font-bold text-slate-300">Motivo del Rechazo:</h3>
                            <p className="text-sm leading-relaxed text-slate-200">{formData.observaciones}</p>
                        </div>

                        {/* Alert de Confirmación */}
                        <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-500/10">
                            <div className="flex items-start gap-3">
                                <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <p className="mb-1 font-bold text-red-300">¿Está seguro de rechazar esta declaración?</p>
                                    <p className="text-sm text-slate-300">
                                        El estado cambiará a <strong>RECHAZADO</strong> y se notificará al trabajador.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                disabled={loading}
                                className="flex-1 px-6 py-3 font-medium text-white transition-colors border rounded-lg border-slate-600 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                            >
                                ← Volver
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmarRechazo}
                                disabled={loading}
                                className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-bold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                                        Rechazando...
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={20} />
                                        SÍ, RECHAZAR
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Vista del Formulario Inicial
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 text-white bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <XCircle size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Rechazar Declaración Jurada</h2>
                            <p className="mt-1 text-sm opacity-90">
                                N° {declaracion?.numero_declaracion || `DJ-${String(declaracion?.id_declaracion).padStart(6, '0')}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 transition-colors rounded-lg hover:bg-white/20"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Información de la Declaración */}
                    <div className="p-6 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-white">
                            <FileText className="text-blue-400" size={24} />
                            Información de la Declaración
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="p-4 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Trabajador</p>
                                <p className="font-semibold text-white">{declaracion?.nombre_trabajador}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">DNI</p>
                                <p className="font-semibold text-white">{declaracion?.dni_trabajador}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Importe Total</p>
                                <p className="text-lg font-semibold text-red-400">
                                    {declaracion?.moneda} {parseFloat(declaracion?.importe_total || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-1 text-xs text-slate-400">Centro de Costos</p>
                                <p className="text-sm font-semibold text-white">
                                    {declaracion?.nombre_centro || 'N/A'}
                                </p>
                            </div>
                        </div>
                        {declaracion?.concepto_gasto && (
                            <div className="p-4 mt-4 border rounded-lg bg-slate-800 border-slate-600">
                                <p className="mb-2 text-xs text-slate-400">Concepto del Gasto</p>
                                <p className="text-sm leading-relaxed text-slate-200">{declaracion.concepto_gasto}</p>
                            </div>
                        )}
                    </div>

                    {/* Datos del Revisor */}
                    <div className="p-6 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-white">
                            <User className="text-red-400" size={24} />
                            Datos del Revisor
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Nombre Completo <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute transform -translate-y-1/2 text-slate-400 left-4 top-1/2" size={18} />
                                    <input
                                        type="text"
                                        name="nombre_aprobador"
                                        required
                                        value={formData.nombre_aprobador}
                                        onChange={handleChange}
                                        className="w-full py-3 pl-12 pr-4 text-white transition-all border rounded-lg bg-slate-800 border-slate-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-slate-500"
                                        placeholder="Ej: Juan Pérez García"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Cargo <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute transform -translate-y-1/2 text-slate-400 left-4 top-1/2" size={18} />
                                    <input
                                        type="text"
                                        name="cargo_aprobador"
                                        required
                                        value={formData.cargo_aprobador}
                                        onChange={handleChange}
                                        className="w-full py-3 pl-12 pr-4 text-white transition-all border rounded-lg bg-slate-800 border-slate-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-slate-500"
                                        placeholder="Ej: Jefe de Administración"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Email (Opcional)
                                </label>
                                <div className="relative">
                                    <Mail className="absolute transform -translate-y-1/2 text-slate-400 left-4 top-1/2" size={18} />
                                    <input
                                        type="email"
                                        name="email_aprobador"
                                        value={formData.email_aprobador}
                                        onChange={handleChange}
                                        className="w-full py-3 pl-12 pr-4 text-white transition-all border rounded-lg bg-slate-800 border-slate-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-slate-500"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Motivo del Rechazo */}
                    <div className="p-6 border-2 rounded-lg bg-slate-700 border-red-500/30">
                        <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-white">
                            <AlertTriangle className="text-red-400" size={24} />
                            Motivo del Rechazo
                        </h3>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-300">
                                Observaciones <span className="text-red-400">* (Obligatorio)</span>
                            </label>
                            <textarea
                                name="observaciones"
                                rows="6"
                                required
                                value={formData.observaciones}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-white transition-all border-2 rounded-lg resize-none bg-slate-800 border-slate-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-slate-500"
                                placeholder="Explica detalladamente por qué se rechaza esta declaración...&#10;&#10;Ejemplos:&#10;- Falta de documentación de respaldo&#10;- Gasto no autorizado&#10;- Monto excede el presupuesto aprobado&#10;- No corresponde al centro de costos indicado"
                            />
                            <p className="mt-2 text-sm text-slate-400">
                                Las observaciones deben ser claras y específicas para que el trabajador pueda corregir la declaración.
                            </p>
                        </div>
                    </div>

                    {/* Alert de Advertencia */}
                    <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-500/10">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <p className="font-medium text-red-300">¿Estás seguro de rechazar esta declaración?</p>
                                <p className="mt-1 text-sm text-slate-300">
                                    Esta acción cambiará el estado de la declaración a <strong>RECHAZADO</strong> y se notificará al trabajador. 
                                    Asegúrate de proporcionar observaciones claras.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-3 font-medium text-white transition-colors border rounded-lg bg-slate-700 border-slate-600 hover:bg-slate-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-8 py-3 font-bold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            <XCircle size={20} />
                            Continuar →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RechazoModal;