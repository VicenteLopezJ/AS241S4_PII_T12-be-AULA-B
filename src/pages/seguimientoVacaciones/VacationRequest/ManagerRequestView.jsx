import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Download,
  Search,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  ChevronDown,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import vacationPeriodService from '../../../services/seguimientoVacaciones/vacationPeriodService';
import vacationRequestService from '../../../services/seguimientoVacaciones/vacationRequestService';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';


// Modal para Ver Detalles de la Solicitud
const RequestDetailsModal = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(26, 35, 50, 0.7)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }}
    >
      <div className="bg-[#243447] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Eye className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Detalles de la Solicitud</h2>
              <p className="text-teal-50 text-sm">Información completa de la solicitud de vacaciones</p>
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
        <div className="p-6 space-y-5">
          {/* Información del Empleado */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              Información del Empleado
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre Completo</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                  {request.employee_name}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cargo</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                  {request.employee_position}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Área</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                  {request.area_name}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Período</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                  {request.period_name}
                </div>
              </div>
            </div>
          </div>

          {/* Información de la Solicitud */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              Detalles de la Solicitud
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha de Solicitud</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                  {request.request_date?.split(' ')[0] || '-'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Estado</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 rounded-lg">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${
                    request.status === 'P' ? 'bg-amber-500' :
                    request.status === 'A' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}>
                    {request.status === 'P' && <Clock className="w-4 h-4" />}
                    {request.status === 'A' && <CheckCircle className="w-4 h-4" />}
                    {request.status === 'R' && <XCircle className="w-4 h-4" />}
                    {request.status_label}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Días Solicitados</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm font-medium">
                  {request.total_days_requested}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Días Adicionales</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm font-medium">
                  {request.additional_days}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Total de Días</label>
                <div className="px-4 py-3 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500 border-opacity-30 rounded-lg">
                  <p className="text-3xl font-bold text-teal-400">{request.total_days}</p>
                </div>
              </div>
            </div>

            {request.observation && (
              <div className="mt-4">
                <label className="block text-xs text-slate-400 mb-1">Observación</label>
                <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                  {request.observation}
                </div>
              </div>
            )}
          </div>

          {/* Rangos de Fechas */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Rangos de Fechas</label>
            <div className="space-y-3">
              {request.details?.map((detail, index) => (
                <div key={detail.detail_id} className="bg-[#1a2332] p-4 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                      <div>
                        <p className="text-xs text-slate-400">Desde</p>
                        <p className="text-sm font-medium text-white">{detail.start_date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Hasta</p>
                        <p className="text-sm font-medium text-white">{detail.end_date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Días</p>
                      <p className="text-lg font-bold text-teal-400">{detail.days_count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información de Aprobación/Rechazo */}
          {(request.status === 'A' || request.status === 'R') && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-400" />
                Información de {request.status === 'A' ? 'Aprobación' : 'Rechazo'}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {request.status === 'A' ? 'Aprobado por' : 'Rechazado por'}
                  </label>
                  <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                    {request.status === 'A' ? request.approved_by_name : request.rejected_by_name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fecha</label>
                  <div className="px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg text-sm">
                    {request.status === 'A'
                      ? request.approval_date?.split(' ')[0]
                      : request.rejection_date?.split(' ')[0]}
                  </div>
                </div>
              </div>
              {request.rejection_reason && (
                <div className="mt-4">
                  <label className="block text-xs text-slate-400 mb-1">Motivo del Rechazo</label>
                  <div className="px-4 py-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 text-white rounded-lg text-sm">
                    {request.rejection_reason}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Separador */}
          <div className="border-t border-slate-600 my-2"></div>

          {/* Botón Cerrar */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all font-medium shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal - Vista Manager/Jefe
const ManagerRequestView = () => {
  const { user, isLoading: authLoading, isAuthenticated, hasPermission } = useAuth();

  const [requests, setRequests] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('P');
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const AREA_ID = user?.area_id;
  const USER_ID = user?.users_id;

  const fetchPeriods = async () => {
    const periodsResult = await vacationPeriodService.getAllPeriods();
    if (periodsResult.success) {
      setPeriods(periodsResult.data);

      const activePeriod = periodsResult.data.find(p => p.status === 'A');
      if (activePeriod) {
        setSelectedPeriod(activePeriod.period_id);
      }
    }
  };

  const fetchRequests = async () => {
    if (!AREA_ID) return;

    setLoading(true);

    const status = statusFilter === 'all' ? null : statusFilter;
    const period = selectedPeriod || null;
    const result = await vacationRequestService.getRequestsByArea(AREA_ID, status, period);

    if (result.success) {
      const EMPLOYEE_ID = user?.employee_id;
      const filteredRequests = result.data.filter(
        req => req.employee_id !== EMPLOYEE_ID
      );

      setRequests(filteredRequests);
      calculateMetrics(filteredRequests);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar solicitudes',
        text: result.error || 'No se pudieron cargar las solicitudes del área',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    // Cargar períodos si tiene permisos de Manager o Admin
    if (!authLoading && isAuthenticated && user && (hasPermission('can_approve_requests') || hasPermission('can_manage_users'))) {
      fetchPeriods();
    }
  }, [authLoading, isAuthenticated, user, hasPermission]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && AREA_ID) {
      fetchRequests();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user, AREA_ID, selectedPeriod, statusFilter]);

  const calculateMetrics = (data) => {
    setMetrics({
      total: data.length,
      pending: data.filter(r => r.status === 'P').length,
      approved: data.filter(r => r.status === 'A').length,
      rejected: data.filter(r => r.status === 'R').length
    });
  };

  const handleApprove = async (requestId) => {
    const requestToApprove = requests.find(req => req.request_id === requestId);

    if (requestToApprove && requestToApprove.employee_id === user?.employee_id) {
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: 'No puedes aprobar tu propia solicitud',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Aprobar solicitud?',
      text: 'Esta acción descontará los días del empleado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      background: '#243447',
      color: '#fff'
    });

    if (result.isConfirmed) {
      const approveResult = await vacationRequestService.approveRequest(requestId, USER_ID);

      if (approveResult.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Solicitud aprobada!',
          text: 'La solicitud ha sido aprobada y los días han sido descontados',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          timer: 2000
        });
        fetchRequests();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: approveResult.error,
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff'
        });
      }
    }
  };

  const handleReject = async (requestId) => {
    const requestToReject = requests.find(req => req.request_id === requestId);

    if (requestToReject && requestToReject.employee_id === user?.employee_id) {
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: 'No puedes rechazar tu propia solicitud',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Rechazar solicitud?',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo (obligatorio)',
      inputPlaceholder: 'Escribe el motivo del rechazo...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      background: '#243447',
      color: '#fff',
      inputAttributes: {
        maxlength: 200
      },
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return 'El motivo debe tener al menos 10 caracteres';
        }
      }
    });

    if (result.isConfirmed) {
      const rejectionReason = result.value;
      const rejectResult = await vacationRequestService.rejectRequest(requestId, USER_ID, rejectionReason);

      if (rejectResult.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Solicitud rechazada!',
          text: 'La solicitud ha sido rechazada',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          timer: 2000
        });
        fetchRequests();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: rejectResult.error,
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff'
        });
      }
    }
  };

  const handleViewDetails = async (requestId) => {
    const result = await vacationRequestService.getRequestById(requestId);
    if (result.success) {
      setSelectedRequest(result.data);
      setShowDetailsModal(true);
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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text('Solicitudes de Vacaciones - Área', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 30);

    const selectedPeriodData = periods.find(p => p.period_id === selectedPeriod);
    doc.text(`Período: ${selectedPeriodData?.period_name || 'Todos'}`, 14, 36);
    doc.text(`Estado: ${statusFilter === 'all' ? 'Todos' : statusFilter === 'P' ? 'Pendientes' : statusFilter === 'A' ? 'Aprobadas' : 'Rechazadas'}`, 14, 42);

    autoTable(doc, {
      startY: 50,
      head: [['Empleado', 'Cargo', 'Fecha', 'Días', 'Estado']],
      body: filteredRequests.map(req => [
        req.employee_name,
        req.employee_position,
        req.request_date?.split(' ')[0] || '-',
        req.total_days,
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

    doc.save(`solicitudes_area_${new Date().toISOString().split('T')[0]}.pdf`);

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
        'Empleado': req.employee_name,
        'Cargo': req.employee_position,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes');

    XLSX.writeFile(workbook, `solicitudes_area_${new Date().toISOString().split('T')[0]}.xlsx`);

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
    const matchesSearch = req.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employee_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.observation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const displayedRequests = showAll ? filteredRequests : filteredRequests.slice(0, 15);

  // SOLUCIÓN: Validar permisos ANTES de mostrar loading
  // Esto previene que se muestre contenido incorrecto mientras carga
  const hasRequiredPermissions = hasPermission('can_approve_requests') || hasPermission('can_manage_users');

  // Si no está autenticado o no tiene permisos, mostrar error inmediatamente
  if (!authLoading && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sesión no iniciada</h2>
          <p className="text-slate-400">Por favor, inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  // Validar permisos: Admin o Manager pueden acceder
  if (!authLoading && !hasRequiredPermissions) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-slate-400">No tienes permisos para acceder a esta vista</p>
          <p className="text-slate-500 text-sm mt-2">Esta vista es solo para jefes de área</p>
        </div>
      </div>
    );
  }

  // Mostrar loading solo si está autenticado y tiene permisos
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
                <Users className="w-8 h-8 text-white" />
              </div>
              Gestión de Solicitudes - Jefe de Área
            </h1>
            <p className="text-slate-400 mt-2 ml-1">Aprueba o rechaza solicitudes de tu área</p>
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
              <p className="text-slate-500 text-xs mt-0.5">Requieren acción</p>
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
            <label className="block text-sm font-semibold text-slate-300 mb-2">Período:</label>
            <select
              value={selectedPeriod || ''}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">Todos los períodos</option>
              {periods.map(period => (
                <option key={period.period_id} value={period.period_id}>
                  {period.period_name} {period.status === 'A' && '(Activo)'}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="P">Pendientes</option>
              <option value="A">Aprobadas</option>
              <option value="R">Rechazadas</option>
              <option value="all">Todos los estados</option>
            </select>
          </div>

          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por empleado, cargo u observación..."
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
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
                      <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                        <Users className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                        <p className="text-lg font-medium">No hay solicitudes</p>
                      </td>
                    </tr>
                  ) : (
                    displayedRequests.map((req) => {
                      const StatusIcon = getStatusBadge(req.status).icon;
                      return (
                        <tr key={req.request_id} className="hover:bg-[#2a3f5f] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{req.employee_name}</span>
                              <span className="text-xs text-slate-400">{req.employee_position}</span>
                            </div>
                          </td>
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
                                ({req.total_days_requested} + {req.additional_days})
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(req.status).bg} ${getStatusBadge(req.status).text}`}>
                              <StatusIcon className="w-4 h-4" />
                              {req.status_label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-300">{req.observation || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(req.request_id)}
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:bg-blue-500 hover:bg-opacity-20 px-3 py-1.5 rounded-lg transition-all font-medium text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </button>
                              {req.status === 'P' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(req.request_id)}
                                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:bg-emerald-500 hover:bg-opacity-20 px-3 py-1.5 rounded-lg transition-all font-medium text-sm"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    Aprobar
                                  </button>
                                  <button
                                    onClick={() => handleReject(req.request_id)}
                                    className="text-red-400 hover:text-red-300 flex items-center gap-1 hover:bg-red-500 hover:bg-opacity-20 px-3 py-1.5 rounded-lg transition-all font-medium text-sm"
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                    Rechazar
                                  </button>
                                </>
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
            {filteredRequests.length > 15 && (
              <div className="bg-[#1a2332] border-t border-slate-700 p-4 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-lg"
                >
                  {showAll ? 'Ver menos' : `Ver más (${filteredRequests.length - 15} restantes)`}
                  <ChevronDown className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default ManagerRequestView;
