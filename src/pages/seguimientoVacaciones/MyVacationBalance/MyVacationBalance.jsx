import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import employeePeriodService from '../../../services/seguimientoVacaciones/employeePeriodService';


const MyVacationBalance = () => {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const balanceResponse = await employeePeriodService.getMyVacationBalance();
      if (balanceResponse.success) {
        setBalance(balanceResponse.data);
      } else {
        setError(balanceResponse.error || 'No se pudo cargar tu saldo de vacaciones');
      }

      const historyResponse = await employeePeriodService.getMyVacationHistory();
      if (historyResponse.success) {
        setHistory(historyResponse.data || []);
      }
    } catch (err) {
      setError('Error al cargar la información');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalDays = balance?.total_available || 0;
  const pendingDays = balance?.pending_current_days + balance?.pending_accumulated_days || 0;
  const availableDays = balance?.available_days + balance?.accumulated_previous_days || 0;
  const usedDays = balance?.used_days + balance?.accumulated_used_days || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
              <div>
                <h3 className="text-red-300 font-semibold mb-1">Error al cargar información</h3>
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              Mi Saldo de Vacaciones
            </h1>
            <p className="text-slate-400 mt-2 ml-1">Consulta tus días disponibles y tu historial de períodos</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-cyan-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Disponible</p>
                <h3 className="text-4xl font-bold text-white mt-1">{totalDays}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Días totales</p>
              </div>
              <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-cyan-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-orange-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Pendientes</p>
                <h3 className="text-4xl font-bold text-white mt-1">{pendingDays}</h3>
                <p className="text-slate-500 text-xs mt-0.5">En espera</p>
              </div>
              <div className="bg-orange-500 bg-opacity-20 p-3 rounded-xl">
                <Clock className="w-8 h-8 text-orange-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Asignados</p>
                <h3 className="text-4xl font-bold text-white mt-1">{availableDays}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Disponibles para usar</p>
              </div>
              <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-red-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Usados</p>
                <h3 className="text-4xl font-bold text-white mt-1">{usedDays}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Ya utilizados</p>
              </div>
              <div className="bg-red-500 bg-opacity-20 p-3 rounded-xl">
                <XCircle className="w-8 h-8 text-red-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#243447] rounded-2xl shadow-xl p-5 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <select className="px-5 py-3 rounded-xl bg-[#1a2332] border border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
              <option>Todos los estados</option>
              <option>Activos</option>
              <option>Cerrados</option>
            </select>
            <input
              type="text"
              placeholder="Buscar por período o año..."
              className="flex-1 px-4 py-3 bg-[#1a2332] border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#243447] rounded-t-2xl border border-slate-700 border-b-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'balance'
                ? 'text-teal-400 border-b-2 border-teal-500 bg-[#1a2332]'
                : 'text-slate-400 hover:text-white hover:bg-[#1a2332]/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Saldo Actual
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'text-teal-400 border-b-2 border-teal-500 bg-[#1a2332]'
                : 'text-slate-400 hover:text-white hover:bg-[#1a2332]/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Historial ({history.length})
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#243447] rounded-b-2xl shadow-xl border border-slate-700 border-t-0">
        {activeTab === 'balance' && balance && (
          <div className="p-8">
            <div className="bg-[#1a2332] rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{balance.period_name}</h2>
                  <p className="text-slate-400">Año {balance.year_period}</p>
                </div>
                <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold border border-emerald-500/30">
                  {balance.status_label || 'Asistente'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Empleado</p>
                  <p className="text-white font-semibold text-lg">{balance.employee_name}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Cargo</p>
                  <p className="text-white font-semibold text-lg">{balance.employee_position}</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg">Uso del Período Actual</h3>
                  <span className="text-teal-400 font-bold text-xl">
                    {balance.used_days} / {balance.available_days} días
                  </span>
                </div>
                <div className="bg-slate-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min((balance.used_days / balance.available_days) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-400">
                  <span>0 días</span>
                  <span>{balance.available_days} días disponibles</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="overflow-hidden">
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-[#1a2332]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Período</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Días Asignados</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Días Usados</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Acumulados</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total Disponible</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#243447] divide-y divide-slate-700">
                    {history.map((period) => (
                      <tr key={period.employee_period_id} className="hover:bg-[#2a3f5f] transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          {period.period_name} ({period.year_period})
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{period.available_days}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{period.used_days}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{period.pending_accumulated_days}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-teal-400 font-bold text-lg">{period.total_available}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                            period.status === 'A' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${period.status === 'A' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {period.status_label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg font-medium">No hay historial disponible</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVacationBalance;