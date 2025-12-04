import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  FileText,
  Download,
  Search,
  X,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';
import vacationRequestService from '../../../services/seguimientoVacaciones/vacationRequestService';
import vacationPeriodService from '../../../services/seguimientoVacaciones/vacationPeriodService';

// Helper para obtener fecha actual en formato YYYY-MM-DD
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Validación de fechas
const validateDateRange = (startDate, endDate) => {
  const errors = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!startDate || !endDate) {
    errors.push('Ambas fechas son requeridas');
    return errors;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validar que las fechas no sean pasadas
  if (start < today) {
    errors.push('La fecha de inicio no puede ser una fecha pasada');
  }

  if (end < today) {
    errors.push('La fecha de fin no puede ser una fecha pasada');
  }

  // Validar que la fecha de fin sea mayor o igual a la fecha de inicio
  if (end < start) {
    errors.push('La fecha de fin debe ser posterior o igual a la fecha de inicio');
  }

  // Validar que no sea más de 1 año en el futuro
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (start > oneYearFromNow || end > oneYearFromNow) {
    errors.push('Las fechas no pueden ser más de 1 año en el futuro');
  }

  return errors;
};

// Modal de Formulario para Crear/Editar Solicitud
const RequestFormModal = ({ request, employeeId, periods, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    period_id: request?.period_id || '',
    observation: request?.observation || '',
    date_ranges: request?.details?.map(d => ({
      start_date: d.start_date,
      end_date: d.end_date
    })) || [{ start_date: '', end_date: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [dateErrors, setDateErrors] = useState({});

  const addDateRange = () => {
    setFormData(prev => ({
      ...prev,
      date_ranges: [...prev.date_ranges, { start_date: '', end_date: '' }]
    }));
  };

  const removeDateRange = (index) => {
    setFormData(prev => ({
      ...prev,
      date_ranges: prev.date_ranges.filter((_, i) => i !== index)
    }));
    
    // Limpiar errores del rango eliminado
    setDateErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[index];
      // Reindexar errores
      const reindexed = {};
      Object.keys(newErrors).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = newErrors[key];
        } else {
          reindexed[key] = newErrors[key];
        }
      });
      return reindexed;
    });
  };

  const updateDateRange = (index, field, value) => {
    setFormData(prev => {
      const newRanges = [...prev.date_ranges];
      newRanges[index][field] = value;
      
      // Validar el rango actualizado
      const range = newRanges[index];
      const errors = validateDateRange(range.start_date, range.end_date);
      
      setDateErrors(prevErrors => ({
        ...prevErrors,
        [index]: errors.length > 0 ? errors : null
      }));
      
      return { ...prev, date_ranges: newRanges };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.period_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Selecciona un período vacacional',
        confirmButtonColor: '#10b981',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    if (formData.date_ranges.some(r => !r.start_date || !r.end_date)) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Completa todas las fechas',
        confirmButtonColor: '#10b981',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    // Validar todas las fechas
    let hasErrors = false;
    const newDateErrors = {};

    formData.date_ranges.forEach((range, index) => {
      const errors = validateDateRange(range.start_date, range.end_date);
      if (errors.length > 0) {
        hasErrors = true;
        newDateErrors[index] = errors;
      }
    });

    if (hasErrors) {
      setDateErrors(newDateErrors);
      Swal.fire({
        icon: 'error',
        title: 'Fechas inválidas',
        text: 'Por favor corrige los errores en las fechas antes de continuar',
        confirmButtonColor: '#10b981',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    setLoading(true);

    const payload = {
      employee_id: employeeId,
      period_id: formData.period_id,
      observation: formData.observation,
      date_ranges: formData.date_ranges
    };

    let result;
    if (request) {
      // Actualizar
      result = await vacationRequestService.updateRequest(request.request_id, {
        observation: formData.observation,
        date_ranges: formData.date_ranges
      });
    } else {
      // Crear
      result = await vacationRequestService.createRequest(payload);
    }

    setLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: request ? '¡Solicitud actualizada!' : '¡Solicitud creada!',
        text: result.message || 'La operación se realizó correctamente',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff',
        timer: 2000
      });
      onSuccess();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.error,
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(26, 35, 50, 0.7)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }}
    >
      <div className="bg-[#243447] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {request ? 'Editar Solicitud' : 'Nueva Solicitud de Vacaciones'}
              </h2>
              <p className="text-teal-50 text-sm">
                {request ? 'Modifica los datos de tu solicitud' : 'Completa la información de tu solicitud'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Período */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Período Vacacional <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.period_id}
                onChange={(e) => setFormData({ ...formData, period_id: e.target.value })}
                disabled={!!request}
                className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder-slate-500 disabled:opacity-50"
              >
                <option value="">Seleccione un período</option>
                {periods.map(period => (
                  <option key={period.period_id} value={period.period_id}>
                    {period.period_name} {period.status === 'A' && '(Activo)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Observación */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Observación
              </label>
              <input
                type="text"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                placeholder="Ej: Viaje familiar, descanso, etc."
                maxLength={50}
                className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder-slate-500"
              />
            </div>

            {/* Rangos de Fechas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-300">
                  Rangos de Fechas <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={addDateRange}
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Agregar rango
                </button>
              </div>

              <div className="space-y-3">
                {formData.date_ranges.map((range, index) => (
                  <div key={index} className="bg-[#1a2332] p-4 rounded-lg border border-slate-600">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Fecha Inicio</label>
                          <input
                            type="date"
                            value={range.start_date}
                            min={getTodayDate()}
                            onChange={(e) => updateDateRange(index, 'start_date', e.target.value)}
                            className={`w-full px-4 py-3 bg-[#243447] border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-white ${
                              dateErrors[index] ? 'border-red-500' : 'border-slate-600'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Fecha Fin</label>
                          <input
                            type="date"
                            value={range.end_date}
                            min={range.start_date || getTodayDate()}
                            onChange={(e) => updateDateRange(index, 'end_date', e.target.value)}
                            className={`w-full px-4 py-3 bg-[#243447] border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-white ${
                              dateErrors[index] ? 'border-red-500' : 'border-slate-600'
                            }`}
                          />
                        </div>
                      </div>
                      {formData.date_ranges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDateRange(index)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {/* Mostrar errores de validación */}
                    {dateErrors[index] && dateErrors[index].length > 0 && (
                      <div className="mt-3 space-y-1">
                        {dateErrors[index].map((error, errorIndex) => (
                          <p key={errorIndex} className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[#1a2332] text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium border border-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {request ? 'Actualizar Solicitud' : 'Crear Solicitud'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Principal - Vista Empleado
const EmployeeRequestView = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const EMPLOYEE_ID = user?.employee_id;

  const [requests, setRequests] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && EMPLOYEE_ID) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user, EMPLOYEE_ID]);

  const loadVacationPeriods = async () => {
    // Usar endpoint de mis períodos (accesible para Empleados y Managers)
    const myPeriodsResult = await vacationPeriodService.getMyPeriods();

    if (myPeriodsResult.success && myPeriodsResult.data?.length > 0) {
      return myPeriodsResult.data;
    }

    // Si no hay períodos asignados, retornar array vacío
    return [];
  };

  const showNoPeriodsAlert = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Sin períodos disponibles',
      html: `
        <p>No se encontraron períodos vacacionales activos.</p>
        <p class="text-sm mt-2">Posibles causas:</p>
        <ul class="text-sm text-left mt-2 ml-4">
          <li>No tienes días de vacaciones asignados</li>
          <li>No hay períodos activos configurados</li>
          <li>Problema de conexión con el servidor</li>
        </ul>
        <p class="text-sm mt-3 font-semibold">Contacta con RRHH para más información.</p>
      `,
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff'
    });
  };

  const loadEmployeeRequests = async () => {
    const result = await vacationRequestService.getAllRequests(null, EMPLOYEE_ID, null);

    if (result.success) {
      return result.data;
    }

    Swal.fire({
      icon: 'error',
      title: 'Error al cargar solicitudes',
      text: result.error || 'No se pudieron cargar tus solicitudes de vacaciones',
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff'
    });

    return [];
  };

  const fetchData = async () => {
    setLoading(true);

    const [loadedPeriods, loadedRequests] = await Promise.all([
      loadVacationPeriods(),
      loadEmployeeRequests()
    ]);

    setPeriods(loadedPeriods);
    setRequests(loadedRequests);
    calculateMetrics(loadedRequests);

    if (loadedPeriods.length === 0) {
      showNoPeriodsAlert();
    }

    setLoading(false);
  };

  const calculateMetrics = (data) => {
    setMetrics({
      total: data.length,
      pending: data.filter(r => r.status === 'P').length,
      approved: data.filter(r => r.status === 'A').length,
      rejected: data.filter(r => r.status === 'R').length
    });
  };

  const handleEdit = (request) => {
    if (request.status !== 'P') {
      Swal.fire({
        icon: 'warning',
        title: 'No permitido',
        text: 'Solo puedes editar solicitudes en estado Pendiente',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
      return;
    }
    setEditingRequest(request);
    setShowFormModal(true);
  };

  const handleCancel = async (requestId) => {
    const result = await Swal.fire({
      title: '¿Cancelar solicitud?',
      text: 'Esta acción eliminará la solicitud completamente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      background: '#243447',
      color: '#fff'
    });

    if (result.isConfirmed) {
      const cancelResult = await vacationRequestService.cancelRequest(requestId, EMPLOYEE_ID);

      if (cancelResult.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Solicitud cancelada!',
          text: 'La solicitud ha sido eliminada',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          timer: 2000
        });
        fetchData();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: cancelResult.error,
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff'
        });
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text('Mis Solicitudes de Vacaciones', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Fecha', 'Período', 'Días', 'Estado']],
      body: filteredRequests.map(req => [
        req.request_date?.split(' ')[0] || '-',
        req.period_name || '-',
        req.total_days || 0,
        req.status_label
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

    doc.save(`mis_solicitudes_${new Date().toISOString().split('T')[0]}.pdf`);

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
      filteredRequests.map(req => ({
        'Fecha Solicitud': req.request_date?.split(' ')[0] || '-',
        'Período': req.period_name,
        'Días Solicitados': req.total_days_requested,
        'Días Adicionales': req.additional_days,
        'Total Días': req.total_days,
        'Estado': req.status_label,
        'Observación': req.observation || '-'
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mis Solicitudes');

    XLSX.writeFile(workbook, `mis_solicitudes_${new Date().toISOString().split('T')[0]}.xlsx`);

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

  const getStatusBadge = (status) => {
    const badges = {
      P: { bg: 'bg-amber-500', text: 'text-white', icon: Clock },
      A: { bg: 'bg-emerald-500', text: 'text-white', icon: CheckCircle },
      R: { bg: 'bg-red-500', text: 'text-white', icon: XCircle }
    };
    return badges[status] || badges.P;
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.period_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.observation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedRequests = showAll ? filteredRequests : filteredRequests.slice(0, 10);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Cargando solicitudes...</p>
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
              Mis Solicitudes de Vacaciones
            </h1>
            <p className="text-slate-400 mt-2 ml-1">Gestiona tus solicitudes de vacaciones</p>
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
                setEditingRequest(null);
                setShowFormModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Nueva Solicitud
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-cyan-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total</p>
              <h3 className="text-4xl font-bold text-white mt-1">{metrics.total}</h3>
              <p className="text-slate-500 text-xs mt-0.5">Solicitudes</p>
            </div>
            <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-cyan-100" />
            </div>
          </div>
        </div>

        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Pendientes</p>
              <h3 className="text-4xl font-bold text-white mt-1">{metrics.pending}</h3>
              <p className="text-slate-500 text-xs mt-0.5">En revisión</p>
            </div>
            <div className="bg-amber-500 bg-opacity-20 p-3 rounded-xl">
              <Clock className="w-8 h-8 text-amber-100" />
            </div>
          </div>
        </div>

        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Aprobadas</p>
              <h3 className="text-4xl font-bold text-white mt-1">{metrics.approved}</h3>
              <p className="text-slate-500 text-xs mt-0.5">Confirmadas</p>
            </div>
            <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
              <CheckCircle className="w-8 h-8 text-emerald-100" />
            </div>
          </div>
        </div>

        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-red-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Rechazadas</p>
              <h3 className="text-4xl font-bold text-white mt-1">{metrics.rejected}</h3>
              <p className="text-slate-500 text-xs mt-0.5">No aprobadas</p>
            </div>
            <div className="bg-red-500 bg-opacity-20 p-3 rounded-xl">
              <XCircle className="w-8 h-8 text-red-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#243447] rounded-2xl shadow-xl p-5 mb-8 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Filtrar por estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="all">Todos los estados</option>
              <option value="P">Pendientes</option>
              <option value="A">Aprobadas</option>
              <option value="R">Rechazadas</option>
            </select>
          </div>

          <div className="md:col-span-9 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por período o observación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha Solicitud</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Período</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Días</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Observación</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-[#243447] divide-y divide-slate-700">
                  {displayedRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                        <Calendar className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                        <p className="text-lg font-medium">No tienes solicitudes</p>
                      </td>
                    </tr>
                  ) : (
                    displayedRequests.map((req) => {
                      const StatusIcon = getStatusBadge(req.status).icon;
                      return (
                        <tr key={req.request_id} className="hover:bg-[#2a3f5f] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-white">{req.request_date?.split(' ')[0] || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-white">{req.period_name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-teal-400">{req.total_days}</span>
                              <span className="text-xs text-slate-500">
                                ({req.total_days_requested} + {req.additional_days} extra)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(req.status).bg} ${getStatusBadge(req.status).text}`}>
                                <StatusIcon className="w-4 h-4" />
                                {req.status_label}
                              </span>
                              {req.status === 'R' && req.rejection_reason && (
                                <div className="mt-1 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                                  <p className="text-xs text-red-300 font-medium mb-1">Motivo del rechazo:</p>
                                  <p className="text-xs text-red-200">{req.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-300">{req.observation || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {req.status === 'P' && (
                                <>
                                  <button
                                    onClick={() => handleEdit(req)}
                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:bg-blue-500 hover:bg-opacity-20 px-3 py-1.5 rounded-lg transition-all font-medium text-sm"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleCancel(req.request_id)}
                                    className="text-red-400 hover:text-red-300 flex items-center gap-1 hover:bg-red-500 hover:bg-opacity-20 px-3 py-1.5 rounded-lg transition-all font-medium text-sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Cancelar
                                  </button>
                                </>
                              )}
                              {req.status !== 'P' && (
                                <span className="text-slate-500 text-sm">-</span>
                              )}
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
            {filteredRequests.length > 10 && (
              <div className="bg-[#1a2332] border-t border-slate-700 p-4 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-lg"
                >
                  {showAll ? 'Ver menos' : `Ver más (${filteredRequests.length - 10} restantes)`}
                  <ChevronDown className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Formulario */}
      {showFormModal && (
        <RequestFormModal
          request={editingRequest}
          employeeId={EMPLOYEE_ID}
          periods={periods}
          onClose={() => {
            setShowFormModal(false);
            setEditingRequest(null);
          }}
          onSuccess={() => {
            setShowFormModal(false);
            setEditingRequest(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeRequestView;
