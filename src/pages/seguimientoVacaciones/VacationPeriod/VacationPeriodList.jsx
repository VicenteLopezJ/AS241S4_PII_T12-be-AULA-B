import React, { useState, useEffect } from 'react';
import { Calendar, Plus, FileText, Download, Search, Edit2, Check, Trash, Delete, DeleteIcon, Ban } from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import VacationPeriodModal from './VacationalPeriodForm';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';
import vacationPeriodService from '../../../services/seguimientoVacaciones/vacationPeriodService';

const VacationPeriodList = () => {
    const { isLoading: authLoading, isAuthenticated } = useAuth();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState(null);

    const [metrics, setMetrics] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchPeriods();
        }
    }, [authLoading, isAuthenticated]);

    const fetchPeriods = async () => {
        setLoading(true);
        const result = await vacationPeriodService.getAllPeriods();

        if (result.success) {
            setPeriods(result.data);
            calculateMetrics(result.data);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error,
                confirmButtonColor: '#14b8a6'
            });
        }

        setLoading(false);
    };

    const calculateMetrics = (data) => {
        setMetrics({
            total: data.length,
            active: data.filter(p => p.status === 'A').length,
            inactive: data.filter(p => p.status === 'I').length
        });
    };

    const handleSavePeriod = async (data) => {
        try {
            let result;

            if (editingPeriod) {
                result = await vacationPeriodService.updatePeriod(editingPeriod.period_id, data);
            } else {
                result = await vacationPeriodService.createPeriod(data);
            }

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    background: '#243447',
                    text: editingPeriod ? 'Período actualizado correctamente' : 'Período creado correctamente',
                    confirmButtonColor: '#14b8a6',
                    timer: 2000,
                    color: '#fff'
                });

                fetchPeriods();
                setEditingPeriod(null);
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error,
                    confirmButtonColor: '#14b8a6'
                });
                return false;
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al guardar el período',
                confirmButtonColor: '#14b8a6'
            });
            return false;
        }
    };

    const handleEdit = (period) => {
        setEditingPeriod(period);
        setIsModalOpen(true);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.setTextColor(20, 184, 166);
        doc.text('Reporte de Períodos Vacacionales', 14, 22);

        // Fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 30);

        // Métricas
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total de períodos: ${metrics.total}`, 14, 40);
        doc.text(`Períodos activos: ${metrics.active}`, 14, 47);
        doc.text(`Períodos inactivos: ${metrics.inactive}`, 14, 54);

        // Tabla
        autoTable(doc, {
            startY: 62,
            head: [['Año', 'Nombre', 'Fecha Inicio', 'Fecha Fin', 'Total Días', 'Estado']],
            body: filteredPeriods.map(p => [
                p.year_period,
                p.period_name,
                p.start_date,
                p.end_date,
                p.total_days,
                p.status === 'A' ? 'Activo' : 'Inactivo'
            ]),
            headStyles: {
                fillColor: [20, 184, 166],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { top: 62 }
        });

        doc.save(`periodos_vacacionales_${new Date().toISOString().split('T')[0]}.pdf`);

        Swal.fire({
            icon: 'success',
            title: 'PDF Generado',
            background: '#243447',
            text: 'El reporte se ha descargado correctamente',
            confirmButtonColor: '#14b8a6',
            timer: 2000,
            color: '#fff'
        });
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filteredPeriods.map(p => ({
                'Año': p.year_period,
                'Nombre del Período': p.period_name,
                'Fecha de Inicio': p.start_date,
                'Fecha de Fin': p.end_date,
                'Total de Días': p.total_days,
                'Estado': p.status === 'A' ? 'Activo' : 'Inactivo'
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Períodos Vacacionales');

        // Ajustar ancho de columnas
        const maxWidth = filteredPeriods.reduce((w, r) => Math.max(w, r.period_name.length), 10);
        worksheet['!cols'] = [
            { wch: 8 },
            { wch: maxWidth },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 10 }
        ];

        XLSX.writeFile(workbook, `periodos_vacacionales_${new Date().toISOString().split('T')[0]}.xlsx`);

        Swal.fire({
            icon: 'success',
            title: 'Excel Generado',
            background: '#243447',
            text: 'El reporte se ha descargado correctamente',
            confirmButtonColor: '#14b8a6',
            timer: 2000,
            color: '#fff'
        });
    };

    const filteredPeriods = periods.filter(period => {
        const matchesSearch =
            period.period_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            period.year_period?.toString().includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || period.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        if (status === 'A') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Activo
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Inactivo
            </span>
        );

    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 text-lg">Cargando períodos vacacionales...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a2332] p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            Gestión de Períodos Vacacionales
                        </h1>
                        <p className="text-slate-400 mt-2 ml-1">Administra los períodos anuales de vacaciones</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportPDF}
                            className="px-5 py-2.5 bg-[#243447] border-2 border-red-500 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 shadow-md font-medium"
                        >
                            <FileText className="w-4 h-4" />
                            PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="px-5 py-2.5 bg-[#243447] border-2 border-green-500 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 shadow-md font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Excel
                        </button>
                        <button
                            onClick={() => {
                                setEditingPeriod(null);
                                setIsModalOpen(true);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Período
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#243447] rounded-2xl shadow-xl p-6 border border-slate-700 hover:border-blue-500 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Total Períodos</p>
                            <h3 className="text-5xl font-bold text-white mt-2">{metrics.total}</h3>
                            <p className="text-slate-500 text-xs mt-1">Registrados en el sistema</p>
                        </div>
                        <div className="bg-blue-500 bg-opacity-20 p-4 rounded-2xl">
                            <Calendar className="w-10 h-10 text-blue-200" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#243447] rounded-2xl shadow-xl p-6 border border-slate-700 hover:border-emerald-500 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Períodos Activos</p>
                            <h3 className="text-5xl font-bold text-white mt-2">{metrics.active}</h3>
                            <p className="text-slate-500 text-xs mt-1">En vigencia</p>
                        </div>
                        <div className="bg-emerald-500 bg-opacity-20 p-4 rounded-2xl">
                            <Check className="w-10 h-10 text-blue-50" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#243447] rounded-2xl shadow-xl p-6 border border-slate-700 hover:border-[#cb1f1f] transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Períodos Inactivos</p>
                            <h3 className="text-5xl font-bold text-white mt-2">{metrics.inactive}</h3>
                            <p className="text-slate-500 text-xs mt-1">Futuros o cerrados   </p>
                        </div>
                        <div className="bg-[#cf1616fe] bg-opacity-20 p-4 rounded-2xl">
                            <Ban className="w-10 h-10 text-blue-50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#243447] rounded-2xl shadow-xl p-5 mb-8 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por año o nombre del período..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border-2 border-slate-600 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filterStatus === 'all'
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-600 hover:border-teal-500'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterStatus('A')}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filterStatus === 'A'
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                                : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-600 hover:border-emerald-500'
                                }`}
                        >
                            Activos
                        </button>
                        <button
                            onClick={() => setFilterStatus('I')}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filterStatus === 'I'
                                ? 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg'
                                : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500'
                                }`}
                        >
                            Inactivos
                        </button>

                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#243447] rounded-2xl shadow-xl overflow-hidden border border-slate-700">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-[#1a2332]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Año</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Período</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha Inicio</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha Fin</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Días</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#243447] divide-y divide-slate-700">
                                {filteredPeriods.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                                            <Calendar className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                                            <p className="text-lg font-medium">No se encontraron períodos</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPeriods.map((period) => (
                                        <tr key={period.period_id} className="hover:bg-[#2a3f5f] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-white">{period.year_period}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-white font-medium">{period.period_name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-400">{period.start_date}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-400">{period.end_date}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-teal-400">{period.total_days}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(period.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(period)}
                                                    className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <VacationPeriodModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPeriod(null);
                }}
                onSave={handleSavePeriod}
                editData={editingPeriod}
            />
        </div>
    );
};

export default VacationPeriodList;