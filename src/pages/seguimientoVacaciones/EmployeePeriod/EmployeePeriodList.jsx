import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw, FileText, Download, Search, ChevronRight, X, AlertCircle, ChevronDown, CheckCircle, Package, UserPlus, Plus, Upload, Eye, EyeOff, EyeClosed, Octagon, OctagonMinus } from 'lucide-react';

import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import CreateIndividualEmployeePeriod from './CreateIndividualEmployeePeriod';
import BulkCreateEmployeePeriod from './BulkCreateEmployeePeriod';
import vacationPeriodService from '../../../services/seguimientoVacaciones/vacationPeriodService';
import employeePeriodService from '../../../services/seguimientoVacaciones/employeePeriodService';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';

// Componente Principal
const EmployeePeriodList = () => {
    const navigate = useNavigate();
    const { isLoading: authLoading, isAuthenticated } = useAuth();

    const [employeePeriods, setEmployeePeriods] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'P', 'C'
    const [deletedFilter, setDeletedFilter] = useState('visible'); // 'all', 'hidden'

    const [metrics, setMetrics] = useState({
        totalEmployees: 0,
        employeesFullyUsed: 0,
        employeesWithAvailable: 0,
        employeesWithAccumulated: 0
    });

    const [showIndividualModal, setShowIndividualModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchPeriods();
        }
    }, [authLoading, isAuthenticated]);

    useEffect(() => {
        if (selectedPeriod) {
            fetchEmployeePeriods();
        }
    }, [selectedPeriod, statusFilter]);

    const fetchPeriods = async () => {
        const allPeriodsResult = await vacationPeriodService.getAllPeriods();
        if (allPeriodsResult.success) {
            setPeriods(allPeriodsResult.data);

            // Set the first period as selected if none is selected
            if (allPeriodsResult.data.length > 0) {
                const activeResult = await vacationPeriodService.getActivePeriod();
                if (activeResult.success) {
                    setSelectedPeriod(activeResult.data.period_id);
                } else {
                    // If no active period, select the first available period
                    setSelectedPeriod(allPeriodsResult.data[0].period_id);
                }
            }
        }
    };

    const fetchEmployeePeriods = async () => {
        setLoading(true);

        const params = {
            includeDeleted: true,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            period_id: selectedPeriod
        };

        try {
            const result = await employeePeriodService.getAllEmployeePeriods(params);

            if (result.success) {
                // Filtrar empleados que tienen el período seleccionado
                const filteredData = selectedPeriod
                    ? result.data.filter(emp => {
                        return emp.periods?.some(p => p.period_id === Number(selectedPeriod));
                    })
                    : result.data;

                setEmployeePeriods(filteredData);
                calculateMetrics(filteredData);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error || 'Error al cargar los períodos de empleados',
                    confirmButtonColor: '#14b8a6',
                    background: '#243447',
                    color: '#fff'
                });
            }
        } catch (error) {
            console.error('Error en fetchEmployeePeriods:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al cargar los datos',
                confirmButtonColor: '#14b8a6',
                background: '#243447',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = (data) => {
        const fullyUsed = data.filter(ep => ep.total_pending_days === 0).length;
        const withAvailable = data.filter(ep => ep.total_pending_days > 0).length;
        const withAccumulated = data.filter(ep => ep.total_accumulated_days > 0).length;

        setMetrics({
            totalEmployees: data.length,
            employeesFullyUsed: fullyUsed,
            employeesWithAvailable: withAvailable,
            employeesWithAccumulated: withAccumulated
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(20, 184, 166);
        doc.text('Reporte de Control de Días por Empleado', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 30);

        const selectedPeriodData = periods.find(p => p.period_id === selectedPeriod);
        doc.text(`Período: ${selectedPeriodData?.period_name || 'N/A'}`, 14, 36);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total de empleados: ${metrics.totalEmployees}`, 14, 46);
        doc.text(`Empleados con días usados completamente: ${metrics.employeesFullyUsed}`, 14, 52);
        doc.text(`Empleados con días disponibles: ${metrics.employeesWithAvailable}`, 14, 58);
        doc.text(`Empleados con días acumulados: ${metrics.employeesWithAccumulated}`, 14, 64);

        autoTable(doc, {
            startY: 72,
            head: [['Empleado', 'Cargo', 'Disponibles', 'Usados', 'Acumulados', 'Pendientes']],
            body: filteredEmployees.map(ep => [
                ep.employee_name,
                ep.employee_position,
                ep.total_available_days,
                ep.total_used_days,
                ep.total_accumulated_days,
                ep.total_pending_days
            ]),
            headStyles: {
                fillColor: [20, 184, 166],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            }
        });

        doc.save(`control_dias_empleados_${new Date().toISOString().split('T')[0]}.pdf`);

        Swal.fire({
            icon: 'success',
            title: 'PDF Generado',
            text: 'El reporte se ha descargado correctamente',
            confirmButtonColor: '#14b8a6',
            background: '#243447',
            color: '#fff',
            timer: 2000
        });
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filteredEmployees.map(ep => ({
                'Empleado': ep.employee_name,
                'Cargo': ep.employee_position,
                'Días Disponibles': ep.total_available_days,
                'Días Usados': ep.total_used_days,
                'Días Acumulados': ep.total_accumulated_days,
                'Días Pendientes': ep.total_pending_days,
                'Estado': ep.status_label
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Control de Días');

        worksheet['!cols'] = [
            { wch: 30 },
            { wch: 20 },
            { wch: 15 },
            { wch: 12 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 }
        ];

        XLSX.writeFile(workbook, `control_dias_empleados_${new Date().toISOString().split('T')[0]}.xlsx`);

        Swal.fire({
            icon: 'success',
            title: 'Excel Generado',
            text: 'El reporte se ha descargado correctamente',
            confirmButtonColor: '#14b8a6',
            background: '#243447',
            color: '#fff',
            timer: 2000
        });
    };

    const handleViewDetail = (employeePeriodId) => {
        // Navegar al detalle del período de empleado dentro del módulo de vacaciones
        navigate(`/vacaciones/employee-period/detail?id=${employeePeriodId}`);
    };

    const handleToggleVisibility = async (employeePeriod) => {
        console.log('1. Estado inicial del registro:', employeePeriod);
        const isHidden = employeePeriod.deleted === 'S';
        console.log('2. isHidden:', isHidden);

        const result = await Swal.fire({
            title: isHidden ? '¿Restaurar registro?' : '¿Ocultar registro?',
            text: isHidden
                ? 'El registro volverá a ser visible en el sistema'
                : 'El registro se ocultará pero no se eliminará permanentemente',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: isHidden ? '#10b981' : '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: isHidden ? 'Sí, restaurar' : 'Sí, ocultar',
            cancelButtonText: 'Cancelar',
            background: '#243447',
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        try {
            const response = isHidden
                ? await employeePeriodService.restoreEmployeePeriod(employeePeriod.employee_period_id)
                : await employeePeriodService.hideEmployeePeriod(employeePeriod.employee_period_id);

            console.log('3. Respuesta del servicio:', response);

            if (response.success) {
                // Actualizar el estado local inmediatamente
                setEmployeePeriods(prevEmployees => {
                    const updated = prevEmployees.map(emp => {
                        if (emp.employee_period_id === employeePeriod.employee_period_id) {
                            const newDeleted = isHidden ? 'N' : 'S';
                            console.log('4. Actualizando registro:', {
                                id: emp.employee_period_id,
                                deletedAntes: emp.deleted,
                                deletedDespues: newDeleted
                            });
                            return { ...emp, deleted: newDeleted };
                        }
                        return emp;
                    });
                    console.log('5. Estado completo actualizado:', updated);
                    return updated;
                });

                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: isHidden ? 'Registro restaurado correctamente' : 'Registro ocultado correctamente',
                    confirmButtonColor: '#14b8a6',
                    background: '#243447',
                    color: '#fff',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('6. Error completo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo completar la operación',
                confirmButtonColor: '#14b8a6',
                background: '#243447',
                color: '#fff'
            });
        }
    };

    const handleSuccess = () => {
        fetchEmployeePeriods(); // Recargar la lista después de una operación exitosa
    };

    const filteredEmployees = employeePeriods
        .filter(ep => {
            // Filtro por ocultos
            if (deletedFilter === 'hidden') {
                return ep.deleted === 'S';
            } else if (deletedFilter === 'all') {
                return true; // Mostrar todos
            }
            // Por defecto, mostrar solo los no eliminados
            return ep.deleted !== 'S';
        })
        .filter(ep => {
            // Búsqueda por texto
            const searchLower = searchTerm.toLowerCase();
            return (
                ep.employee_name?.toLowerCase().includes(searchLower) ||
                ep.employee_position?.toLowerCase().includes(searchLower)
            );
        });

    const displayedEmployees = showAll ? filteredEmployees : filteredEmployees.slice(0, 15);

    const getProgressPercentage = (used, available) => {
        if (available === 0) return 0;
        return Math.min(((used / available) * 100), 100).toFixed(0);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'from-red-500 to-orange-600';
        if (percentage >= 50) return 'from-yellow-500 to-amber-600';
        return 'from-teal-500 to-emerald-600';
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 text-lg">Cargando control de días...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-[#1a2332] p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                Control de Días por Empleado
                            </h1>
                            <p className="text-slate-400 mt-2 ml-1">Gestiona la asignación de días de vacaciones</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
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
                                onClick={() => setShowIndividualModal(true)}
                                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Asignar Individual
                            </button>
                            <button
                                onClick={() => setShowBulkModal(true)}
                                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg font-medium"
                            >
                                <Upload className="w-5 h-5" />
                                Carga Masiva
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="bg-[#243447] rounded-2xl shadow-xl p-5 mb-8 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Selector de Período */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Período:</label>
                            <select
                                value={selectedPeriod || ''}
                                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            >
                                {periods.map(period => (
                                    <option key={period.period_id} value={period.period_id}>
                                        {period.period_name} {period.status === 'A' && '(Activo)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro de Estado */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Estado:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            >
                                <option value="all">Todos</option>
                                <option value="P">En Progreso</option>
                                <option value="C">Completado</option>
                            </select>
                        </div>

                        {/* Filtro de Ocultos */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Registros:</label>
                            <select
                                value={deletedFilter}
                                onChange={(e) => setDeletedFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            >
                                <option value="visible">Solo visibles</option>
                                <option value="all">Todos</option>
                                <option value="hidden">Solo ocultos</option>
                            </select>
                        </div>

                        {/* Buscador */}
                        <div className="md:col-span-5 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, apellido o cargo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Cards de Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                    <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-cyan-500 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Empleados</p>
                                <h3 className="text-4xl font-bold text-white mt-1">{metrics.totalEmployees}</h3>
                                <p className="text-slate-500 text-xs mt-0.5">Con asignación</p>
                            </div>
                            <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
                                <Users className="w-8 h-8 text-cyan-100" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-red-500 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Días Agotados</p>
                                <h3 className="text-4xl font-bold text-white mt-1">{metrics.employeesFullyUsed}</h3>
                                <p className="text-slate-500 text-xs mt-0.5">Sin días disponibles</p>
                            </div>
                            <div className="bg-red-500 bg-opacity-20 p-3 rounded-xl">
                                <AlertCircle className="w-8 h-8 text-red-100" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-emerald-500 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Con Disponibles</p>
                                <h3 className="text-4xl font-bold text-white mt-1">{metrics.employeesWithAvailable}</h3>
                                <p className="text-slate-500 text-xs mt-0.5">Tienen días por gozar</p>
                            </div>
                            <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                                <CheckCircle className="w-8 h-8 text-emerald-100" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-blue-500 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Con Acumulados</p>
                                <h3 className="text-4xl font-bold text-white mt-1">{metrics.employeesWithAccumulated}</h3>
                                <p className="text-slate-500 text-xs mt-0.5">Días de años anteriores</p>
                            </div>
                            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-xl">
                                <Package className="w-8 h-8 text-blue-100" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-[#243447] rounded-2xl shadow-xl overflow-hidden border border-slate-700">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-700">
                                    <thead className="bg-[#1a2332]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Empleado</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Asignados</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Usados</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Acumulados</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Por Gozar</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Progreso</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[#243447] divide-y divide-slate-700">
                                        {displayedEmployees.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-16 text-center text-slate-400">
                                                    <Users className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                                                    <p className="text-lg font-medium">No se encontraron empleados</p>
                                                    <p className="text-sm text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            displayedEmployees.map((ep) => {
                                                const progressPct = getProgressPercentage(ep.total_used_days, ep.total_available_days);
                                                const progressColor = getProgressColor(progressPct);

                                                return (
                                                    <tr
                                                        key={ep.employee_period_id}
                                                        className={`hover:bg-[#2a3f5f] transition-colors ${ep.deleted === 'S' ? 'opacity-50' : ''}`}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-white">{ep.employee_name || 'N/A'}</span>
                                                                <span className="text-xs text-slate-400">{ep.employee_position || 'Sin cargo'}</span>
                                                                {ep.deleted === 'S' && (
                                                                    <span className="text-xs text-red-400 font-medium mt-1">
                                                                        (Ocultos)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${ep.status === 'C'
                                                                ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30'
                                                                : 'bg-yellow-500 bg-opacity-20 text-yellow-100 border border-yellow-500 border-opacity-30'
                                                                }`}>
                                                                {ep.status_label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-semibold text-white">{ep.total_available_days}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-semibold text-orange-400">{ep.total_used_days}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-semibold text-blue-400">{ep.total_accumulated_days}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-bold text-teal-400">{ep.total_pending_days}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="w-full min-w-[120px]">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs text-slate-400 font-medium">
                                                                        {progressPct}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-slate-700 rounded-full h-2">
                                                                    <div
                                                                        className={`bg-gradient-to-r ${progressColor} h-2 rounded-full transition-all`}
                                                                        style={{ width: `${progressPct}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleViewDetail(ep.employee_period_id)}
                                                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-2 rounded-lg transition-all"
                                                                    title="Ver detalle"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleVisibility(ep)}
                                                                    className={`p-2 rounded-lg transition-all ${ep.deleted === 'S'
                                                                        ? 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                                                                        : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/20'
                                                                        }`}
                                                                    title={ep.deleted === 'S' ? 'Restaurar' : 'Ocultar'}
                                                                >
                                                                    {ep.deleted === 'S' ? (
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    ) : (
                                                                        <OctagonMinus className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Botón Ver Más */}
                            {filteredEmployees.length > 15 && (
                                <div className="bg-[#1a2332] border-t border-slate-700 p-4 flex justify-center">
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-lg"
                                    >
                                        {showAll ? 'Ver menos' : `Ver más (${filteredEmployees.length - 15} restantes)`}
                                        <ChevronDown className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modales */}
            {showIndividualModal && (
                <CreateIndividualEmployeePeriod
                    isOpen={showIndividualModal}
                    onClose={() => setShowIndividualModal(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {showBulkModal && (
                <BulkCreateEmployeePeriod
                    isOpen={showBulkModal}
                    onClose={() => setShowBulkModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );

};

export default EmployeePeriodList;