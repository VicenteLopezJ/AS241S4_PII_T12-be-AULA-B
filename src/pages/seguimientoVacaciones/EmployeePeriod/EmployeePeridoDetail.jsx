import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Edit2, Save, X, Calendar, User, TrendingUp, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';

import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';
import employeePeriodService from '../../../services/seguimientoVacaciones/employeePeriodService';


const EmployeePeriodDetail = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employeePeriod, setEmployeePeriod] = useState(null);
  const [vacationRequests, setVacationRequests] = useState([]);
  const [editingObservation, setEditingObservation] = useState(false);
  const [observationText, setObservationText] = useState('');
  const [savingObservation, setSavingObservation] = useState(false);

  // Obtener el ID del URL
  const getEmployeePeriodIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  };

  useEffect(() => {
    const id = getEmployeePeriodIdFromUrl();
    if (id) {
      fetchEmployeePeriodDetail(id);
      fetchVacationRequests(id);
    }
  }, []);

  const fetchEmployeePeriodDetail = async (id) => {
    setLoading(true);
    try {
      const result = await employeePeriodService.getEmployeePeriodById(id);
      if (result.success) {
        setEmployeePeriod(result.data);
        setObservationText(result.data.observation || '');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error || 'No se pudo cargar la información',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff'
        });
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVacationRequests = async (employeePeriodId) => {
    try {
      // Las solicitudes ya vienen en el response de fetchEmployeePeriodDetail
      // No necesitamos hacer otra llamada
    } catch (error) {
      console.error('Error fetching vacation requests:', error);
    }
  };

  const handleSaveObservation = async () => {
    const id = getEmployeePeriodIdFromUrl();
    setSavingObservation(true);

    try {
      const result = await employeePeriodService.updateObservation(id, observationText);

      if (result.success) {
        setEmployeePeriod(prev => ({
          ...prev,
          observation: observationText,
          updated_at: new Date().toISOString()
        }));
        setEditingObservation(false);

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Observación guardada correctamente',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          timer: 2000
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la observación',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    } finally {
      setSavingObservation(false);
    }
  };

  const handleExportPDF = () => {
    if (!employeePeriod) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text('Reporte Individual de Vacaciones', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 30);

    // Datos del empleado
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('INFORMACIÓN DEL EMPLEADO', 14, 42);

    doc.setFontSize(10);
    doc.text(`Nombre: ${employeePeriod.employee_name}`, 14, 50);
    doc.text(`Cargo: ${employeePeriod.employee_position}`, 14, 56);
    doc.text(`Estado: ${employeePeriod.status_label}`, 14, 62);
    if (employeePeriod.observation) {
      doc.text(`Observación: ${employeePeriod.observation}`, 14, 68);
    }

    // Resumen de días
    doc.setFontSize(12);
    doc.text('RESUMEN DE DÍAS', 14, 80);

    doc.setFontSize(10);
    doc.text(`Días Asignados: ${employeePeriod.total_available_days}`, 14, 88);
    doc.text(`Días Usados: ${employeePeriod.total_used_days}`, 14, 94);
    doc.text(`Días Acumulados: ${employeePeriod.total_accumulated_days}`, 14, 100);
    doc.text(`Días Por Gozar: ${employeePeriod.total_pending_days}`, 14, 106);

    // Tabla de períodos
    autoTable(doc, {
      startY: 115,
      head: [['Período', 'Año', 'Estado', 'Asignados', 'Usados', 'Acumulados', 'Por Gozar']],
      body: employeePeriod.periods.map(p => [
        p.period_name,
        p.year_period,
        p.period_status === 'A' ? 'Activo' : 'Inactivo',
        p.available_days,
        p.used_days,
        p.accumulated_previous_days,
        p.pending_days
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

    // Historial de Salidas (si hay solicitudes aprobadas)
    if (employeePeriod.approved_requests && employeePeriod.approved_requests.length > 0) {
      const finalY = doc.lastAutoTable.finalY || 115;

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('HISTORIAL DE SALIDAS (SOLICITUDES APROBADAS)', 14, finalY + 15);

      // Preparar datos para la tabla
      const requestRows = [];
      employeePeriod.approved_requests.forEach(request => {
        // Crear una fila por cada rango de fechas
        request.details.forEach((detail, index) => {
          const startDate = new Date(detail.start_date);
          const endDate = new Date(detail.end_date);
          const requestDate = new Date(request.request_date);

          // Formatear como DD/MM/YYYY sin espacios
          const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };

          requestRows.push([
            index === 0 ? formatDate(requestDate) : '',
            index === 0 ? request.period_name : '',
            `${formatDate(startDate)} → ${formatDate(endDate)}`,
            detail.days_count,
            index === 0 ? request.total_days : '',
            index === 0 ? (request.observation || '-') : '',
            index === 0 ? (request.approved_by_name || 'N/A') : ''
          ]);
        });
      });

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Fecha Sol.', 'Período', 'Rango de Fechas', 'Días', 'Total', 'Observación', 'Aprobado Por']],
        body: requestRows,
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 12 },
          4: { cellWidth: 12 },
          5: { cellWidth: 30 },
          6: { cellWidth: 30 }
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });
    }

    doc.save(`reporte_vacaciones_${employeePeriod.employee_name.replace(/,/g, '')}_${new Date().toISOString().split('T')[0]}.pdf`);

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
    if (!employeePeriod) return;

    const workbook = XLSX.utils.book_new();

    // Hoja 1: Información general
    const infoData = [
      ['INFORMACIÓN DEL EMPLEADO'],
      ['Nombre', employeePeriod.employee_name],
      ['Cargo', employeePeriod.employee_position],
      ['Estado', employeePeriod.status_label],
      ['Observación', employeePeriod.observation || 'Sin observaciones'],
      [],
      ['RESUMEN DE DÍAS'],
      ['Días Asigandos', employeePeriod.total_available_days],
      ['Días Usados', employeePeriod.total_used_days],
      ['Días Acumulados', employeePeriod.total_accumulated_days],
      ['Días Por gozar', employeePeriod.total_pending_days]
    ];

    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Información');

    // Hoja 2: Detalle de períodos
    const periodsData = employeePeriod.periods.map(p => ({
      'Período': p.period_name,
      'Año': p.year_period,
      'Estado': p.period_status === 'A' ? 'Activo' : 'Inactivo',
      'Días Asignados': p.available_days,
      'Días Usados': p.used_days,
      'Días Acumulados': p.accumulated_previous_days,
      'Días Por Gozar': p.pending_days
    }));

    const periodsSheet = XLSX.utils.json_to_sheet(periodsData);
    XLSX.utils.book_append_sheet(workbook, periodsSheet, 'Períodos');

    // Hoja 3: Historial de Salidas (si hay solicitudes aprobadas)
    if (employeePeriod.approved_requests && employeePeriod.approved_requests.length > 0) {
      const requestsData = [];

      employeePeriod.approved_requests.forEach(request => {
        // ✅ IMPORTANTE: forEach para crear UNA FILA por cada detail
        request.details.forEach((detail, index) => {
          const requestDate = new Date(request.request_date);
          const startDate = new Date(detail.start_date);
          const endDate = new Date(detail.end_date);

          const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };

          requestsData.push({
            'Fecha Solicitud': index === 0 ? formatDate(requestDate) : '',
            'Período': index === 0 ? request.period_name : '',
            'Fecha Inicio': formatDate(startDate),  // ✅ Cada rango en su fila
            'Fecha Fin': formatDate(endDate),       // ✅ Cada rango en su fila
            'Días del Rango': detail.days_count,
            'Total Días Solicitud': index === 0 ? request.total_days : '',
            'Días Extra': index === 0 ? request.additional_days : '',
            'Observación': index === 0 ? (request.observation || '-') : '',
            'Aprobado Por': index === 0 ? (request.approved_by_name || 'N/A') : '',
            'Cargo Aprobador': index === 0 ? (request.approved_by_position || '') : ''
          });
        });
      });

      const requestsSheet = XLSX.utils.json_to_sheet(requestsData);

      // Ajustar anchos de columna
      requestsSheet['!cols'] = [
        { wch: 15 },  // Fecha Solicitud
        { wch: 30 },  // Período
        { wch: 15 },  // Fecha Inicio
        { wch: 15 },  // Fecha Fin
        { wch: 12 },  // Días del Rango
        { wch: 12 },  // Total Días
        { wch: 10 },  // Días Extra
        { wch: 30 },  // Observación
        { wch: 25 },  // Aprobado Por
        { wch: 20 }   // Cargo Aprobador
      ];

      XLSX.utils.book_append_sheet(workbook, requestsSheet, 'Historial de Salidas');
    }

    XLSX.writeFile(workbook, `reporte_vacaciones_${employeePeriod.employee_name.replace(/,/g, '')}_${new Date().toISOString().split('T')[0]}.xlsx`);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!employeePeriod) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No se pudo cargar la información</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-[#243447] border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                Detalle de Período Vacacional
              </h1>
              <p className="text-slate-400 mt-2 ml-1">{employeePeriod.employee_name}</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-[#243447] border-2 border-red-500 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-medium"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-[#243447] border-2 border-green-500 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">ASIGNADOS</p>
              <h3 className="text-3xl font-bold text-white mt-1">{employeePeriod.total_available_days}</h3>
            </div>
            <div className="bg-teal-500 bg-opacity-20 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-100" />
            </div>
          </div>
        </div>

        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">Usados</p>
              <h3 className="text-3xl font-bold text-white mt-1">{employeePeriod.total_used_days}</h3>
            </div>
            <div className="bg-orange-500 bg-opacity-20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-100" />
            </div>
          </div>
        </div>

        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">Acumulados</p>
              <h3 className="text-3xl font-bold text-white mt-1">{employeePeriod.total_accumulated_days}</h3>
            </div>
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-100" />
            </div>
          </div>
        </div>

        <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">POR GOZAR</p>
              <h3 className="text-3xl font-bold text-white mt-1">{employeePeriod.total_pending_days}</h3>
            </div>
            <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div className="bg-[#243447] rounded-2xl shadow-xl border border-slate-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Información del Empleado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Nombre Completo</p>
            <p className="text-white font-medium">{employeePeriod.employee_name}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Cargo</p>
            <p className="text-white font-medium">{employeePeriod.employee_position}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Estado del Registro</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${employeePeriod.status === 'C'
              ? 'bg-green-500 bg-opacity-20 text-green-100 border border-green-500 border-opacity-30'
              : 'bg-yellow-500 bg-opacity-20 text-yellow-100 border border-yellow-500 border-opacity-30'
              }`}>
              {employeePeriod.status_label}
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Fecha de Registro</p>
            <p className="text-white font-medium">{new Date(employeePeriod.registration_date).toLocaleDateString('es-PE')}</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Observaciones</p>
              {!editingObservation && (
                <button
                  onClick={() => setEditingObservation(true)}
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              )}
            </div>
            {editingObservation ? (
              <div className="space-y-2">
                <textarea
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a2332] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Escribe una observación..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveObservation}
                    disabled={savingObservation}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingObservation(false);
                      setObservationText(employeePeriod.observation || '');
                    }}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white font-medium bg-[#1a2332] p-3 rounded-lg">
                {employeePeriod.observation || 'Sin observaciones'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Periods Table */}
      <div className="bg-[#243447] rounded-2xl shadow-xl border border-slate-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Detalle por Período</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-[#1a2332]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Período</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Año</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">ASIGNADOS</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Usados</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Acumulados</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">POR GOZAR</th>
              </tr>
            </thead>
            <tbody className="bg-[#243447] divide-y divide-slate-700">
              {employeePeriod.periods.map((period) => (
                <tr key={period.detail_id} className="hover:bg-[#2a3f5f] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">{period.period_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-white">{period.year_period}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${period.period_status === 'A'
                      ? 'bg-green-500 bg-opacity-20 text-green-100'
                      : 'bg-gray-500 bg-opacity-20 text-gray-100'
                      }`}>
                      {period.period_status === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-teal-400">{period.available_days}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-orange-400">{period.used_days}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-blue-400">{period.accumulated_previous_days}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-emerald-400">{period.pending_days}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Salidas */}
      {employeePeriod.approved_requests && employeePeriod.approved_requests.length > 0 && (
        <div className="bg-[#243447] rounded-2xl shadow-xl border border-slate-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-teal-400" />
              Historial de Salidas (Solicitudes Aprobadas)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-[#1a2332]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Fecha Solicitud</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Período</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Rangos de Fechas</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Días</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Observación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Aprobado Por</th>
                </tr>
              </thead>
              <tbody className="bg-[#243447] divide-y divide-slate-700">
                {employeePeriod.approved_requests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-[#2a3f5f] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">
                        {new Date(request.request_date).toLocaleDateString('es-PE')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">{request.period_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {request.details.map((detail) => (
                          <div key={detail.detail_id} className="flex items-center gap-2 text-sm">
                            <span className="text-teal-400 font-medium">
                              {new Date(detail.start_date).toLocaleDateString('es-PE')}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="text-teal-400 font-medium">
                              {new Date(detail.end_date).toLocaleDateString('es-PE')}
                            </span>
                            <span className="text-slate-500 text-xs">
                              ({detail.days_count} día{detail.days_count !== 1 ? 's' : ''})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold text-white">{request.total_days}</span>
                        {request.additional_days > 0 && (
                          <span className="text-xs text-green-400">
                            (+{request.additional_days} extra)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{request.observation || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">
                          {request.approved_by_name || 'N/A'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {request.approved_by_position || ''}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePeriodDetail;