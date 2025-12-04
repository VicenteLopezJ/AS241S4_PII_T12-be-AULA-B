import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Users,
    Clock,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    FileText,
    PieChart,
    Activity,
    Loader2,
    ChevronRight
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { areasService } from '../../services/seguimientoVacaciones/areasService';
import { employeesService } from '../../services/seguimientoVacaciones/employeesService';
import vacationRequestService from '../../services/seguimientoVacaciones/vacationRequestService';
import employeePeriodService from '../../services/seguimientoVacaciones/employeePeriodService';
import vacationPeriodService from '../../services/seguimientoVacaciones/vacationPeriodService';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        employeesWithVacation: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalDaysUsed: 0,
        totalDaysPending: 0,
        totalAreas: 0,
        activePeriod: null
    });
    const [requestsByStatus, setRequestsByStatus] = useState([]);
    const [vacationByArea, setVacationByArea] = useState([]);
    const [usageTrend, setUsageTrend] = useState([]);
    const [topUsers, setTopUsers] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Obtener empleados
            const employeesRes = await employeesService.getAll();
            const employees = Array.isArray(employeesRes) ? employeesRes : (employeesRes.success ? employeesRes.data : []);

            // 2. Obtener áreas
            const areasRes = await areasService.getAll();
            const areas = Array.isArray(areasRes) ? areasRes : (areasRes.success ? areasRes.data : []);

            // 3. Obtener período activo
            const activePeriodRes = await vacationPeriodService.getActivePeriod();
            const activePeriod = activePeriodRes.success ? activePeriodRes.data : null;

            // 4. Obtener todos los períodos de empleados
            const employeePeriodsRes = await employeePeriodService.getAllEmployeePeriods();
            const employeePeriods = employeePeriodsRes.success ? employeePeriodsRes.data : [];

            // 5. Obtener todas las solicitudes
            const allRequestsRes = await vacationRequestService.getAllRequests();
            const allRequests = allRequestsRes.success ? allRequestsRes.data : [];

            // Calcular métricas principales
            const totalEmployees = employees.filter(e => e.status === 'A').length;
            const employeesWithVacation = employeePeriods.length;

            // Calcular días totales
            let totalUsed = 0;
            let totalPending = 0;

            employeePeriods.forEach(ep => {
                totalUsed += ep.total_used_days || 0;
                totalPending += ep.total_pending_days || 0;
            });

            // Contar solicitudes por estado
            const pendingRequests = allRequests.filter(r => r.status === 'P').length;
            const approvedRequests = allRequests.filter(r => r.status === 'A').length;
            const rejectedRequests = allRequests.filter(r => r.status === 'R').length;

            const totalAreas = areas.length;

            // Gráfico de solicitudes por estado
            const requestStatusData = [
                { name: 'Pendientes', value: pendingRequests, color: '#f59e0b' },
                { name: 'Aprobadas', value: approvedRequests, color: '#10b981' },
                { name: 'Rechazadas', value: rejectedRequests, color: '#ef4444' }
            ];

            // Gráfico de empleados por área (Top 5)
            const areaEmployeeData = areas.slice(0, 5).map(area => {
                const areaEmployees = employees.filter(e => e.area_id === area.area_id && e.status === 'A');
                return {
                    name: area.area_name,
                    empleados: areaEmployees.length
                };
            }).sort((a, b) => b.empleados - a.empleados);


            // Top 5 empleados con más días usados
            const topEmployees = employeePeriods
                .map(ep => ({
                    name: ep.employee_name,
                    days: ep.total_used_days || 0
                }))
                .sort((a, b) => b.days - a.days)
                .slice(0, 5);

            // Tendencia de meses con más salidas (basado en solicitudes aprobadas)
            const monthlyVacations = {
                'Ene': 0, 'Feb': 0, 'Mar': 0, 'Abr': 0, 'May': 0, 'Jun': 0,
                'Jul': 0, 'Ago': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dic': 0
            };

            // Contar solicitudes aprobadas por mes
            allRequests.filter(r => r.status === 'A').forEach(request => {
                if (request.details && request.details.length > 0) {
                    request.details.forEach(detail => {
                        const startDate = new Date(detail.start_date);
                        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                        const monthKey = monthNames[startDate.getMonth()];
                        if (monthlyVacations[monthKey] !== undefined) {
                            monthlyVacations[monthKey]++;
                        }
                    });
                }
            });

            const monthlyData = Object.keys(monthlyVacations).map(month => ({
                month,
                empleados: monthlyVacations[month]
            }));

            setStats({
                totalEmployees,
                employeesWithVacation,
                pendingRequests,
                approvedRequests,
                rejectedRequests,
                totalDaysUsed: totalUsed,
                totalDaysPending: totalPending,
                totalAreas: totalAreas,
                activePeriod
            });

            setRequestsByStatus(requestStatusData);
            setVacationByArea(areaEmployeeData);
            setUsageTrend(monthlyData);
            setTopUsers(topEmployees);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
            </div>
        );
    }

    const utilizationPercentage = stats.totalEmployees > 0
        ? ((stats.totalDaysUsed / (stats.employeesWithVacation * (stats.activePeriod?.total_days || 30))) * 100).toFixed(1)
        : 0;

    const approvalRate = (stats.approvedRequests + stats.rejectedRequests) > 0
        ? ((stats.approvedRequests / (stats.approvedRequests + stats.rejectedRequests)) * 100).toFixed(0)
        : 0;

    const rejectionRate = (stats.approvedRequests + stats.rejectedRequests) > 0
        ? ((stats.rejectedRequests / (stats.approvedRequests + stats.rejectedRequests)) * 100).toFixed(0)
        : 0;

    return (
        <div className="min-h-screen bg-[#1a2332] p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">Dashboard de Vacaciones</h1>
                        <p className="text-slate-400 mt-1">Vista general del sistema de gestión vacacional</p>
                    </div>
                </div>

                {/* Período Activo */}
                {stats.activePeriod && (
                    <div className="mt-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-teal-400" />
                            <div>
                                <p className="text-teal-400 font-semibold">Período Activo</p>
                                <p className="text-white text-sm">{stats.activePeriod.period_name} - {stats.activePeriod.total_days} días</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4 Cards de Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1: Total de Empleados con Período */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700 hover:border-cyan-500 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Empleados Activos</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{stats.employeesWithVacation}</h3>
                            <p className="text-slate-500 text-xs mt-1">de {stats.totalEmployees} totales</p>
                        </div>
                        <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
                            <Users className="w-8 h-8 text-cyan-100" />
                        </div>
                    </div>
                </div>

                {/* Card 2: Solicitudes Aprobadas */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700 hover:border-emerald-500 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Solicitudes Aprobadas</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{stats.approvedRequests}</h3>
                            <p className="text-slate-500 text-xs mt-1">Total aprobadas</p>
                        </div>
                        <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                            <CheckCircle className="w-8 h-8 text-emerald-100" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Solicitudes Rechazadas */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700 hover:border-red-500 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Solicitudes Rechazadas</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{stats.rejectedRequests}</h3>
                            <p className="text-slate-500 text-xs mt-1">Total rechazadas</p>
                        </div>
                        <div className="bg-red-500 bg-opacity-20 p-3 rounded-xl">
                            <AlertCircle className="w-8 h-8 text-red-100" />
                        </div>
                    </div>
                </div>

                {/* Card 4: Solicitudes Pendientes */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700 hover:border-orange-500 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Solicitudes Pendientes</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{stats.pendingRequests}</h3>
                            <p className="text-slate-500 text-xs mt-1">Requieren atención</p>
                        </div>
                        <div className="bg-orange-500 bg-opacity-20 p-3 rounded-xl">
                            <Clock className="w-8 h-8 text-orange-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico: Solicitudes por Estado */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <PieChart className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Estado de Solicitudes</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                            <Pie
                                data={requestsByStatus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {requestsByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPie>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                            <p className="text-orange-400 font-bold text-2xl">{stats.pendingRequests}</p>
                            <p className="text-slate-400 text-xs">Pendientes</p>
                        </div>
                        <div className="text-center">
                            <p className="text-emerald-400 font-bold text-2xl">{stats.approvedRequests}</p>
                            <p className="text-slate-400 text-xs">Aprobadas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-red-400 font-bold text-2xl">{stats.rejectedRequests}</p>
                            <p className="text-slate-400 text-xs">Rechazadas</p>
                        </div>
                    </div>
                </div>

                {/* Gráfico: Empleados por Área */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Empleados por Área (Top 5)</h3>
                    </div>
                    {vacationByArea.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={vacationByArea}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="empleados" fill="#14b8a6" name="Empleados" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <p className="text-slate-500">No hay datos de áreas disponibles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección Inferior */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tendencia de Uso */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Meses con Más Salidas</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart data={usageTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 50]} ticks={[10, 20, 30, 40, 50]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="empleados" stroke="#14b8a6" strokeWidth={3} name="Empleados de Vacaciones" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top 5 Empleados */}
                <div className="bg-[#243447] rounded-xl shadow-lg p-6 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Top 5 Empleados (Días Usados)</h3>
                    </div>
                    <div className="space-y-4">
                        {topUsers.map((user, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                        index === 1 ? 'bg-gray-400' :
                                            index === 2 ? 'bg-orange-600' :
                                                'bg-slate-600'
                                        }`}>
                                        N°{index + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{user.name}</p>
                                        <p className="text-slate-400 text-sm">{user.days} días usados</p>
                                    </div>
                                </div>
                                <Users className="w-5 h-5 text-slate-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-6 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Total Áreas</p>
                        <p className="text-3xl font-bold text-white">{stats.totalAreas}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Tasa de Rechazo</p>
                        <p className="text-3xl font-bold text-red-400">{rejectionRate}%</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Utilización</p>
                        <p className="text-3xl font-bold text-cyan-400">{utilizationPercentage}%</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Tasa Aprobación</p>
                        <p className="text-3xl font-bold text-emerald-400">{approvalRate}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;