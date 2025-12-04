import React, { useState, useEffect } from 'react';
import Sidebar from "../../../components/viaticos/Sidebar";
import { StatCard } from '../../../components/viaticos/dashboard/StatCards';
import { TransactionsTable } from '../../../components/viaticos/dashboard/TransactionsTable';
import { ExpensesChart } from '../../../components/viaticos/dashboard/ExpensesChart';
import { CircularProgress } from '../../../components/viaticos/dashboard/CircularProgress';
import { Settings, X } from "lucide-react";

import {
  listarViaticos,
  listarCentroDeCostos,
  listarTrabajadores,
  listarJefesArea,
  listarMotivos
} from "../../../services/viaticos/request/dashboard-service";

const WidgetSelectorModal = ({ isOpen, onClose, widgets, onToggle }) => {
    if (!isOpen) return null;

    return (
        // El fondo es semi-transparente (75% opaco, 25% transparente)
        <div className="fixed inset-0 bg-slate-900/50 bg-opacity-75 z-50 flex items-center justify-center p-4"> 
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100 border border-indigo-500/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Gestionar Widgets del Dashboard</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {Object.values(widgets).map(widget => (
                        <div key={widget.id} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                            <span className="text-white font-medium">{widget.title}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={widget.isVisible} 
                                    onChange={() => onToggle(widget.id)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-right">
                    <button 
                        onClick={onClose} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 shadow-lg"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const SettingsCard = ({ onClick }) => (
    <div 
        onClick={onClick}
        className="bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center h-[400px] lg:h-full cursor-pointer hover:bg-slate-700 transition duration-300 border border-transparent hover:border-indigo-600/50"
    >
        <Settings className="w-12 h-12 text-indigo-400 mb-4 animate-spin-slow"/>
        <h3 className="text-xl font-bold text-white mb-2">Personalizar Dashboard</h3>
        <p className="text-sm text-slate-400 mb-6">Muestra u oculta las secciones de tu panel para optimizar la vista.</p>
        <div className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 shadow-lg">
            Administrar Widgets
        </div>
    </div>
);

export default function VTDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Definición de Widgets y su estado de visibilidad
    const INITIAL_WIDGETS = {
        STATS_ROW_1: { id: 'STATS_ROW_1', title: 'Métricas Principales (Fila 1)', isVisible: true },
        STATS_ROW_2: { id: 'STATS_ROW_2', title: 'Métricas de Infraestructura (Fila 2)', isVisible: true },
        TRANSACTIONS_TABLE: { id: 'TRANSACTIONS_TABLE', title: 'Tabla de Viáticos Recientes', isVisible: true },
        APPROVAL_RATE: { id: 'APPROVAL_RATE', title: 'Tasa de Aprobación Circular', isVisible: true },
        EXPENSES_CHART: { id: 'EXPENSES_CHART', title: 'Gráfico de Gastos por Motivo', isVisible: true }
    };

    const [widgetVisibility, setWidgetVisibility] = useState(INITIAL_WIDGETS);

    const toggleWidget = (id) => {
        setWidgetVisibility(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                isVisible: !prev[id].isVisible,
            },
        }));
    };

    const isWidgetVisible = (id) => widgetVisibility[id]?.isVisible;

    const [totalWorkers, setTotalWorkers] = useState(0);
    const [totalCostCenters, setTotalCostCenters] = useState(0);
    const [totalManagers, setTotalManagers] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    // --- Data Fetching ---
    useEffect(() => {
        const calculateTotalSpent = (data) => {
            return data.reduce((sum, item) => sum + (item.spent_value || 0), 0);
        };

        listarViaticos()
            .then(data => {
                const estadoCompleto = (abreviado) => {
                    const mapa = {
                        a: "Aprobado", p: "Pendiente", r: "Rechazado"
                    };
                    return mapa[abreviado?.toLowerCase()] || "Sin estado";
                };

                const mapped = data.map(item => ({
                    trabajador: item.manager_name || 'N/A',
                    destino: item.cost_center_name || 'N/A',
                    monto: `S/ ${item.spent_value ? item.spent_value.toFixed(2) : '0.00'}`,
                    estado: estadoCompleto(item.state)
                }));

                setTransactions(mapped);
                setTotalSpent(calculateTotalSpent(data));
            })
            .catch(err => console.error("Error cargando gastos:", err));

        listarMotivos()
            .then(data => {
                setChartData(data.map(item => ({
                    name: item.reason,
                    valor: item.total
                })));
            })
            .catch(err => console.error("Error cargando motivos:", err));

        listarTrabajadores()
            .then(data => setTotalWorkers(data.length))
            .catch(err => console.error("Error cargando trabajadores:", err));

        listarCentroDeCostos()
            .then(data => setTotalCostCenters(data.length))
            .catch(err => console.error("Error cargando centros de costos:", err));

        listarJefesArea()
            .then(data => setTotalManagers(data.length))
            .catch(err => console.error("Error cargando jefes de área:", err));
    }, []);

    // --- Calculated Metrics ---
    const totalTransactions = transactions.length;
    const approvedCount = transactions.filter(t => t.estado === "Aprobado").length;
    const pendingCount = transactions.filter(t => t.estado === "Pendiente").length;

    const approvalRate = totalTransactions > 0
        ? parseFloat(((approvedCount / totalTransactions) * 100).toFixed(1))
        : 0;

    return (
        <div className="flex h-screen bg-slate-900 font-sans text-slate-200 overflow-hidden">
            {/* 1. La ÚNICA Barra Lateral de Navegación */}
            <Sidebar /> 
            
            <main className="flex-1 p-6 md:p-8 overflow-y-auto h-full">
                <div className="w-full space-y-6 pb-10">
                    
                    {/* Fila 1: Stats Principales (Viáticos) */}
                    {isWidgetVisible('STATS_ROW_1') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Gasto Total (S/)" value={totalSpent.toFixed(2)} subtext="Total de gastos en viaticos" colorClass="bg-indigo-100" textColor="text-slate-900" />
                            <StatCard title="Solicitudes" value={totalTransactions} subtext="Total registradas" colorClass="bg-cyan-50" textColor="text-slate-900" />
                            <StatCard title="Aprobadas" value={approvedCount} subtext="Revisadas" colorClass="bg-emerald-100" />
                            <StatCard title="Pendientes" value={pendingCount} subtext="En espera" colorClass="bg-yellow-50" />
                        </div>
                    )}

                    {/* Fila 2: Infraestructura y Personal */}
                    {isWidgetVisible('STATS_ROW_2') && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            <StatCard title="Total Trabajadores" value={totalWorkers} subtext="Personal activo" colorClass="bg-white/10" textColor="text-cyan-400" />
                            <StatCard title="Jefes de Área" value={totalManagers} subtext="Responsables de CC" colorClass="bg-white/10" textColor="text-purple-400" />
                            <StatCard title="Centros de Costo" value={totalCostCenters} subtext="Destinos registrados" colorClass="bg-white/10" textColor="text-yellow-400" />
                        </div>
                    )}

                    {/* Fila 3: Tabla y Gráfico de Progreso */}
                    {(isWidgetVisible('TRANSACTIONS_TABLE') || isWidgetVisible('APPROVAL_RATE')) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                            {isWidgetVisible('TRANSACTIONS_TABLE') && (
                                <div className={`lg:col-span-2 ${!isWidgetVisible('APPROVAL_RATE') ? 'lg:col-span-3' : ''}`}>
                                    <TransactionsTable transactions={transactions} title="Últimos Reportes de Viáticos" />
                                </div>
                            )}
                            {isWidgetVisible('APPROVAL_RATE') && (
                                <div className={`lg:col-span-1 ${!isWidgetVisible('TRANSACTIONS_TABLE') ? 'lg:col-span-3' : ''}`}>
                                    <CircularProgress percentage={approvalRate} label="Tasa de Aprobación" subLabel="Viáticos aprobados (%)" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fila 4: Gráfico y Tarjeta de Configuración (SettingsCard) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {isWidgetVisible('EXPENSES_CHART') && (
                            <div className="lg:col-span-2 h-[400px]">
                                <ExpensesChart data={chartData} title="Gasto por Motivo de Viático" />
                            </div>
                        )}
                        
                        {/* 2. La TARJETA (SettingsCard) para abrir el modal, NO un sidebar */}
                        <SettingsCard onClick={() => setIsModalOpen(true)} />
                        
                    </div>
                </div>
            </main>

            {/* Modal de Gestión de Widgets */}
            <WidgetSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                widgets={widgetVisibility}
                onToggle={toggleWidget}
            />
        </div>
    );
}