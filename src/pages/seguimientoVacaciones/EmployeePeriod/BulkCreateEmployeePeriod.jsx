import React, { useState, useEffect } from 'react';
import { X, Users, AlertCircle, CheckCircle, Calendar, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import vacationPeriodService from '../../../services/seguimientoVacaciones/vacationPeriodService';
import employeePeriodService from '../../../services/seguimientoVacaciones/employeePeriodService';


const BulkCreateEmployeePeriod = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periodInfo, setPeriodInfo] = useState(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      const period = periods.find(p => p.period_id === parseInt(selectedPeriod));
      setPeriodInfo(period);
    } else {
      setPeriodInfo(null);
    }
  }, [selectedPeriod, periods]);

  const fetchPeriods = async () => {
    try {
      const result = await vacationPeriodService.getAllPeriods();
      if (result.success) {
        setPeriods(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPeriod) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor selecciona un período vacacional',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Confirmar asignación masiva?',
      html: `
        <div style="text-align: left; color: #cbd5e1;">
          <p style="margin-bottom: 12px;">Se crearán registros para <strong>todos los empleados elegibles</strong>:</p>
          <ul style="list-style: disc; padding-left: 20px; margin-bottom: 12px;">
            <li>Empleados con estado <strong>Activo</strong></li>
            <li>Con <strong>más de 1 año</strong> de antigüedad</li>
            <li>Que tengan cuenta de usuario registrada</li>
          </ul>
          <p style="color: #f59e0b; font-size: 14px;">
            <strong>Nota:</strong> Si el empleado ya tiene registro, solo se agregará el período nuevo.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar',
      background: '#243447',
      color: '#fff',
      width: '550px'
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const response = await employeePeriodService.bulkCreateForPeriod(selectedPeriod);

      if (response.success) {
        const hasErrors = response.errors && response.errors.length > 0;

        Swal.fire({
          icon: hasErrors ? 'warning' : 'success',
          title: hasErrors ? '¡Proceso completado con advertencias!' : '¡Asignación exitosa!',
          html: `
            <div style="text-align: left; color: #cbd5e1;">
              <div style="margin-bottom: 16px;">
                <p style="margin-bottom: 8px;"><strong>📊 Resultados:</strong></p>
                <ul style="list-style: none; padding-left: 0;">
                  <li style="margin-bottom: 4px;">✅ <strong>Headers creados:</strong> ${response.created_headers}</li>
                  <li style="margin-bottom: 4px;">📝 <strong>Detalles creados:</strong> ${response.created_details}</li>
                  <li style="margin-bottom: 4px;">⏭️ <strong>Omitidos:</strong> ${response.skipped}</li>
                </ul>
              </div>
              
              ${hasErrors ? `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px; margin-top: 12px;">
                  <p style="color: #fca5a5; font-weight: 600; margin-bottom: 8px;">⚠️ Empleados no elegibles:</p>
                  <div style="max-height: 200px; overflow-y: auto; font-size: 13px;">
                    <ul style="list-style: disc; padding-left: 20px; color: #e5e7eb;">
                      ${response.errors.slice(0, 10).map(err => `<li style="margin-bottom: 4px;">${err}</li>`).join('')}
                      ${response.errors.length > 10 ? `<li style="color: #f59e0b;">...y ${response.errors.length - 10} empleados más</li>` : ''}
                    </ul>
                  </div>
                </div>
              ` : ''}
            </div>
          `,
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          width: '600px'
        });

        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error in bulk creation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al procesar la asignación masiva',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="w-full max-w-3xl bg-[#1a2332]/95 rounded-xl shadow-2xl border border-slate-700/50 p-5 max-h-[85vh] overflow-y-auto backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2 rounded-lg shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Asignación Masiva de Períodos</h1>
              <p className="text-slate-400 text-sm mt-0.5">Asigna períodos vacacionales a empleados elegibles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-[#243447]/50 rounded-lg shadow-lg border border-slate-700/30 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-teal-500/90 to-emerald-600/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white" />
                <h2 className="text-base font-semibold text-white">Seleccionar Período</h2>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Período Vacacional <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#1a2332] border border-slate-600 text-white text-sm rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
                >
                  <option value="">Seleccione un período</option>
                  {periods.map(period => (
                    <option key={period.period_id} value={period.period_id}>
                      {period.period_name} - {period.year_period} {period.status === 'A' && '(Activo)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Info */}
              {periodInfo && (
                <div className="bg-[#1a2332] border border-slate-600 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xs font-semibold text-slate-300 mb-2">Información del Período</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500">Nombre</p>
                          <p className="text-white font-medium">{periodInfo.period_name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Año</p>
                          <p className="text-white font-medium">{periodInfo.year_period}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Días Totales</p>
                          <p className="text-teal-400 font-bold">{periodInfo.total_days} días</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Estado</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${periodInfo.status === 'A'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                            {periodInfo.status === 'A' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Alert */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-200">
                    <p className="font-semibold mb-1">Procesamiento Automático:</p>
                    <ul className="space-y-0.5 ml-3 text-[11px]">
                      <li>• <strong>Nuevos:</strong> Se crea registro completo (header + detail)</li>
                      <li>• <strong>Existentes:</strong> Solo se agrega el período</li>
                      <li>• <strong>Días acumulados:</strong> Cálculo automático</li>
                    </ul>
                    <div className="flex items-center gap-1 mt-2 text-amber-300">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium text-[11px]">Solo empleados activos con +1 año y cuenta de usuario</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div className="bg-[#1a2332] border border-slate-600 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  Criterios de Elegibilidad
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span className="text-slate-400">Estado <strong className="text-white">Activo</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span className="text-slate-400">Antigüedad mínima <strong className="text-white">1 año</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span className="text-slate-400">Cuenta de usuario <strong className="text-white">registrada</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#1a2332] border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700 font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !selectedPeriod}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm rounded-lg hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Asignar a Todos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateEmployeePeriod;