import React from 'react';
import { X, FileText, Download, Table } from 'lucide-react';

const DownloadModal = ({ declaracion, onClose, onDownloadPDF, onDownloadExcel, loading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md border shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-slate-700">
                {/* Header */}
                <div className="p-6 text-white bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Download size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Descargar Declaración</h2>
                                <p className="mt-1 text-sm opacity-90">
                                    Selecciona el formato de descarga
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 transition-colors rounded-lg hover:bg-white/20"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Información de la Declaración */}
                    <div className="p-5 border-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                        <h3 className="mb-3 text-sm font-bold text-slate-300">Declaración:</h3>
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
                                <span className="text-lg font-bold text-teal-400">
                                    {declaracion?.moneda} {parseFloat(declaracion?.importe_total || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Opciones de Descarga */}
                    <div className="space-y-3">
                        <h3 className="mb-3 text-sm font-bold text-slate-300">Selecciona el formato:</h3>
                        
                        {/* Botón PDF */}
                        <button
                            onClick={() => onDownloadPDF(declaracion)}
                            disabled={loading}
                            className="flex items-center w-full gap-4 p-4 transition-all border-2 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/30 hover:border-red-500 hover:from-red-500/20 hover:to-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-lg bg-red-500/20 group-hover:bg-red-500/30">
                                <FileText className="text-red-400" size={24} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-bold text-white">Descargar en PDF</p>
                                <p className="text-xs text-slate-400">Documento completo en formato PDF</p>
                            </div>
                            <Download className="text-red-400" size={20} />
                        </button>

                        {/* Botón Excel */}
                        <button
                            onClick={() => onDownloadExcel(declaracion)}
                            disabled={loading}
                            className="flex items-center w-full gap-4 p-4 transition-all border-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500 hover:from-green-500/20 hover:to-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-lg bg-green-500/20 group-hover:bg-green-500/30">
                                <Table className="text-green-400" size={24} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-bold text-white">Descargar en Excel</p>
                                <p className="text-xs text-slate-400">Hoja de cálculo editable (.xlsx)</p>
                            </div>
                            <Download className="text-green-400" size={20} />
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="p-4 border-l-4 border-blue-500 rounded-lg bg-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-400 rounded-full animate-spin border-t-transparent"></div>
                                <p className="text-sm text-blue-300">Generando archivo...</p>
                            </div>
                        </div>
                    )}

                    {/* Botón Cancelar */}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full px-6 py-3 font-medium text-white transition-colors border rounded-lg border-slate-600 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadModal;

