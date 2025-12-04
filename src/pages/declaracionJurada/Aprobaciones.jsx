import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Eye } from 'lucide-react';
import MainLayout from '../../components/DJurada/MainLayout.jsx';
import AprobacionModal from '../../components/DJurada/AprobacionModal.jsx';
import RechazoModal from '../../components/DJurada/RechazoModal.jsx';
import AprobacionViewModal from '../../components/DJurada/AprobacionViewModal.jsx';
import { declaracionesAPI, aprobacionesAPI } from '../../services/declaracionJurada/declaracionJurada.js';

const Aprobaciones = () => {
    const [declaracionesPendientes, setDeclaracionesPendientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAprobacionModal, setShowAprobacionModal] = useState(false);
    const [showRechazoModal, setShowRechazoModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedDeclaracion, setSelectedDeclaracion] = useState(null);
    const [stats, setStats] = useState({
        pendientes: 0,
        aprobadas_hoy: 0,
        rechazadas_hoy: 0
    });

    useEffect(() => {
        cargarDeclaracionesPendientes();
    }, []);

    const cargarDeclaracionesPendientes = async () => {
        try {
            setLoading(true);
           const response = await declaracionesAPI.getPendientes();
            console.log('📋 Response completa:', response);
            console.log('📋 Data:', response.data);

            if (response.success) {
                setDeclaracionesPendientes(response.data);
                setStats({
                    ...stats,
                    pendientes: response.data.length
                });
            }
        } catch (error) {
            console.error('Error al cargar pendientes:', error);
            alert('❌ Error al cargar declaraciones pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = (declaracion) => {
        setSelectedDeclaracion(declaracion);
        setShowAprobacionModal(true);
    };

    const handleRechazar = (declaracion) => {
        setSelectedDeclaracion(declaracion);
        setShowRechazoModal(true);
    };

    const handleVerDetalle = (declaracion) => {
        setSelectedDeclaracion(declaracion);
        setShowViewModal(true);
    };

    const handleSubmitAprobacion = async (formData) => {
        try {
            setLoading(true);
            const response = await aprobacionesAPI.aprobar(formData);

            if (response.success) {
                alert('✅ Declaración aprobada exitosamente');
                setShowAprobacionModal(false);
                setSelectedDeclaracion(null);
                await cargarDeclaracionesPendientes();
            } else {
                alert('❌ Error: ' + response.error);
            }
        } catch (error) {
            alert('❌ Error al aprobar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRechazo = async (formData) => {
        try {
            setLoading(true);
            const response = await aprobacionesAPI.rechazar(formData);

            if (response.success) {
                alert('✅ Declaración rechazada');
                setShowRechazoModal(false);
                setSelectedDeclaracion(null);
                await cargarDeclaracionesPendientes();
            } else {
                alert('❌ Error: ' + response.error);
            }
        } catch (error) {
            alert('❌ Error al rechazar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const declaracionesFiltradas = declaracionesPendientes.filter(d =>
        d.nombre_trabajador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.dni_trabajador.includes(searchTerm) ||
        (d.numero_declaracion && d.numero_declaracion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <MainLayout>
            <div className="px-6 py-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    <div className="p-5 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl border border-yellow-500/20 shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="mb-1 text-xs font-medium text-yellow-100">Pendientes de Revisión</p>
                                <p className="text-4xl font-bold text-white">{stats.pendientes}</p>
                                <p className="mt-2 text-xs text-yellow-100/80">Esperando aprobación</p>
                            </div>
                            <Clock className="text-yellow-200" size={28} />
                        </div>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-green-600 to-green-700 rounded-xl border border-green-500/20 shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="mb-1 text-xs font-medium text-green-100">Aprobadas Hoy</p>
                                <p className="text-4xl font-bold text-white">{stats.aprobadas_hoy}</p>
                                <p className="mt-2 text-xs text-green-100/80">Declaraciones aprobadas</p>
                            </div>
                            <CheckCircle className="text-green-200" size={28} />
                        </div>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-red-600 to-red-700 rounded-xl border border-red-500/20 shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="mb-1 text-xs font-medium text-red-100">Rechazadas Hoy</p>
                                <p className="text-4xl font-bold text-white">{stats.rechazadas_hoy}</p>
                                <p className="mt-2 text-xs text-red-100/80">Declaraciones rechazadas</p>
                            </div>
                            <XCircle className="text-red-200" size={28} />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-700 rounded-xl">
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute transform -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, DNI o número..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="w-10 h-10 mx-auto border-b-2 border-yellow-500 rounded-full animate-spin"></div>
                            <p className="mt-3 text-sm text-slate-400">Cargando declaraciones...</p>
                        </div>
                    ) : declaracionesFiltradas.length === 0 ? (
                        <div className="py-12 text-center rounded-lg bg-slate-800">
                            <Clock className="mx-auto mb-3 text-slate-500" size={40} />
                            <p className="text-sm text-slate-400">No hay declaraciones pendientes de aprobación</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {declaracionesFiltradas.map((declaracion) => (
                                <div key={declaracion.id_declaracion} className="overflow-hidden transition-colors rounded-lg bg-slate-800 hover:bg-slate-750">
                                    <div className="px-5 py-3 border-b bg-yellow-500/10 border-yellow-500/20">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs font-bold text-slate-200 bg-slate-700 px-2.5 py-1 rounded">
                                                        {declaracion.numero_declaracion || `DJ-${String(declaracion.id_declaracion).padStart(6, '0')}`}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                                                        <Clock size={12} />
                                                        {declaracion.estado}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-white">{declaracion.nombre_trabajador}</h3>
                                                <p className="text-xs text-slate-400 mt-0.5">DNI: {declaracion.dni_trabajador} | {declaracion.cargo_trabajador || 'Sin cargo'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 mb-0.5">Importe Total</p>
                                                <p className="text-2xl font-bold text-yellow-400">
                                                    {declaracion.moneda} {parseFloat(declaracion.importe_total).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-2">
                                            <div className="p-3 rounded-lg bg-slate-700">
                                                <p className="mb-1 text-xs text-slate-400">Concepto del Gasto</p>
                                                <p className="text-sm font-medium text-slate-200 line-clamp-2">{declaracion.concepto_gasto}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-700">
                                                <p className="mb-1 text-xs text-slate-400">Fecha de Solicitud</p>
                                                <p className="text-sm font-medium text-slate-200">
                                                    {new Date(declaracion.fecha_solicitud).toLocaleDateString('es-PE', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVerDetalle(declaracion)}
                                                className="flex-1 py-2.5 px-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                            >
                                                <Eye size={16} />
                                                Ver Detalles Completos
                                            </button>
                                            <button
                                                onClick={() => handleAprobar(declaracion)}
                                                className="flex-1 py-2.5 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                            >
                                                <CheckCircle size={16} />
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleRechazar(declaracion)}
                                                className="flex-1 py-2.5 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                            >
                                                <XCircle size={16} />
                                                Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAprobacionModal && selectedDeclaracion && (
                <AprobacionModal
                    declaracion={selectedDeclaracion}
                    onSubmit={handleSubmitAprobacion}
                    onCancel={() => {
                        setShowAprobacionModal(false);
                        setSelectedDeclaracion(null);
                    }}
                    loading={loading}
                />
            )}

            {showRechazoModal && selectedDeclaracion && (
                <RechazoModal
                    declaracion={selectedDeclaracion}
                    onSubmit={handleSubmitRechazo}
                    onCancel={() => {
                        setShowRechazoModal(false);
                        setSelectedDeclaracion(null);
                    }}
                    loading={loading}
                />
            )}

            {showViewModal && selectedDeclaracion && (
                <AprobacionViewModal
                    declaracion={selectedDeclaracion}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedDeclaracion(null);
                    }}
                    onAprobar={handleAprobar}
                    onRechazar={handleRechazar}
                />
            )}
        </MainLayout>
    );
};

export default Aprobaciones;