// ============================================
// DASHBOARD.JSX - INTEGRADO COMPLETO
// ============================================
import React, { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import MainLayout from "../../components/DJurada/MainLayout.jsx";
import DeclaracionesTable from "../../components/DJurada/DeclaracionesTable.jsx";
import DeclaracionForm from "../../components/DJurada/DeclaracionForm.jsx";
import ViewModal from "../../components/DJurada/ViewModal.jsx";
import DownloadModal from "../../components/DJurada/DownloadModal.jsx";
import { declaracionesAPI, reportesAPI } from "../../services/declaracionJurada/declaracionJurada.js";

import { generarPDF } from "../../components/DJurada/utils/pdfGenerator.js";
import { generarExcel } from "../../components/DJurada/utils/excelGenerator.js";
import { useToast } from "../../components/DJurada/utils/Toast.js";
import { ToastContainer } from "../../components/DJurada/Toast.jsx";


const Dashboard = () => {
    const toast = useToast();

    const [activeTab, setActiveTab] = useState('lista');
    const [declaraciones, setDeclaraciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedDeclaracion, setSelectedDeclaracion] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        await Promise.all([
            cargarDeclaraciones(),
            cargarEstadisticas()
        ]);
    };

    const cargarDeclaraciones = async () => {
        try {
            setLoading(true);
            const response = await declaracionesAPI.getAll();
            if (response.success) {
                setDeclaraciones(response.data);
                toast.success(`✅ ${response.data.length} declaraciones cargadas`);
            } else {
                toast.error('❌ Error al cargar declaraciones');
            }
        } catch (error) {
            console.error('Error al cargar declaraciones:', error);
            toast.error('❌ Error al cargar declaraciones');
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const response = await reportesAPI.dashboard();
            if (response.success) {
                setStats({
                    total: response.data.total_declaraciones || 0,
                    pendientes: response.data.pendientes || 0,
                    aprobadas: response.data.aprobadas || 0,
                    rechazadas: response.data.rechazadas || 0
                });
            } else {
                toast.warning('⚠️ No se pudieron cargar las estadísticas');
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            toast.warning('⚠️ No se pudieron cargar las estadísticas');
        }
    };

    const handleCrearDeclaracion = async (formData) => {
        try {
            setLoading(true);
            toast.info('⏳ Creando declaración...');

            const response = await declaracionesAPI.create(formData);

            if (response.success) {
                toast.success('✅ Declaración creada exitosamente');
                setActiveTab('lista');
                await cargarDatos();
            } else {
                toast.error(`❌ Error: ${response.error}`);
            }
        } catch (error) {
            console.error('❌ ERROR AL CREAR:', error);
            toast.error('❌ Error al crear declaración: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerDetalle = (declaracion) => {
        setSelectedDeclaracion(declaracion);
        setShowViewModal(true);
    };

    const handleDescargar = (declaracion) => {
        setSelectedDeclaracion(declaracion);
        setShowDownloadModal(true);
    };

    const handleDownloadPDF = async (declaracion) => {
        try {
            setDownloadLoading(true);
            toast.info('⏳ Generando PDF...');

            const result = await generarPDF(declaracion);

            if (result.success) {
                toast.success(`✅ PDF descargado: ${result.filename}`);
                setShowDownloadModal(false);
            } else {
                toast.error('❌ Error al generar PDF');
            }
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            toast.error('❌ Error al generar PDF');
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleDownloadExcel = async (declaracion) => {
        try {
            setDownloadLoading(true);
            toast.info('⏳ Generando Excel...');

            const result = await generarExcel(declaracion);

            if (result.success) {
                toast.success(`✅ Excel descargado: ${result.filename}`);
                setShowDownloadModal(false);
            } else {
                toast.error('❌ Error al generar Excel');
            }
        } catch (error) {
            console.error('Error al descargar Excel:', error);
            toast.error('❌ Error al generar Excel');
        } finally {
            setDownloadLoading(false);
        }
    };

    return (
        <MainLayout>
            <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

            <div className="px-6 py-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-5 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl border border-teal-500/20 shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="mb-1 text-xs font-medium text-teal-100">Total Declaraciones</p>
                                <p className="text-4xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                        <p className="text-xs text-teal-100/80">Registradas en el sistema</p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl border border-yellow-500/20 shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="mb-1 text-xs font-medium text-yellow-100">Pendientes</p>
                                <p className="text-4xl font-bold text-white">{stats.pendientes}</p>
                            </div>
                        </div>
                        <p className="text-xs text-yellow-100/80">Esperando aprobación</p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-green-600 to-green-700 rounded-xl border border-green-500/20 shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="mb-1 text-xs font-medium text-green-100">Aprobadas</p>
                                <p className="text-4xl font-bold text-white">{stats.aprobadas}</p>
                            </div>
                        </div>
                        <p className="text-xs text-green-100/80">Declaraciones aprobadas</p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-red-600 to-red-700 rounded-xl border border-red-500/20 shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="mb-1 text-xs font-medium text-red-100">Rechazadas</p>
                                <p className="text-4xl font-bold text-white">{stats.rechazadas}</p>
                            </div>
                        </div>
                        <p className="text-xs text-red-100/80">Declaraciones rechazadas</p>
                    </div>
                </div>

                <div className="p-6 mb-6 bg-slate-700 rounded-xl">
                    <div className="mb-6">
                        <div className="inline-flex p-1 space-x-1 rounded-lg bg-slate-800">
                            <button
                                onClick={() => setActiveTab('lista')}
                                className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'lista'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                📋 Lista de Declaraciones
                            </button>
                            <button
                                onClick={() => setActiveTab('nueva')}
                                className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'nueva'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                ➕ Nueva Declaración
                            </button>
                        </div>
                    </div>

                    {activeTab === 'lista' ? (
                        <div>
                            <div className="mb-4">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute transform -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, DNI o número de declaración..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                    <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-2 border border-slate-600 text-sm font-medium">
                                        <Filter size={18} />
                                        Filtros
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg bg-slate-800">
                                <DeclaracionesTable
                                    declaraciones={declaraciones}
                                    loading={loading}
                                    onView={handleVerDetalle}
                                    onDownload={handleDescargar}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-lg bg-slate-800">
                            <div className="mb-6">
                                <h2 className="mb-2 text-2xl font-bold text-white">
                                    Nueva Declaración Jurada
                                </h2>
                                <p className="text-slate-400">
                                    Complete todos los campos requeridos para registrar una nueva declaración
                                </p>
                            </div>
                            <DeclaracionForm
                                onSubmit={handleCrearDeclaracion}
                                loading={loading}
                                onCancel={() => setActiveTab('lista')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {showViewModal && selectedDeclaracion && (
                <ViewModal
                    type="declaracion"
                    data={selectedDeclaracion}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedDeclaracion(null);
                    }}
                />
            )}

            {showDownloadModal && selectedDeclaracion && (
                <DownloadModal
                    declaracion={selectedDeclaracion}
                    onClose={() => {
                        setShowDownloadModal(false);
                        setSelectedDeclaracion(null);
                    }}
                    onDownloadPDF={handleDownloadPDF}
                    onDownloadExcel={handleDownloadExcel}
                    loading={downloadLoading}
                />
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </MainLayout>
    );
};

export default Dashboard;