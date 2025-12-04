import React, { useState } from 'react';
import { Edit2, Trash2, RotateCcw, FileText, User, Mail, Phone, Building, Users, Calendar, Shield, X, Eye, Search, Filter, Download, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { generateApplicantPDF } from '../../../services/valeProvisional/applicantPdfGenerator'; // Crearemos este servicio
import '../../../styles/valeProvisional/Applicant/applicantTable.css';

const ApplicantTable = ({ applicants, onEdit, onDelete, onRestore, onViewDoc, statusFilter, onStatusFilterChange, searchTerm, onSearchChange }) => {
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processing, setProcessing] = useState(null);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Obtener estado de acceso
  const getAccessStatus = (applicant) => {
    if (applicant.STATUS === 'I') return 'Sin acceso';
    return 'Acceso activo';
  };

  // Manejar ver detalles
  const handleViewDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailsModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedApplicant(null);
  };

  // ===== FUNCIONES DE EXPORTACIÓN EXCEL =====
  const exportToExcel = () => {
    try {
      console.log('📊 Generando Excel de solicitantes...');

      // Preparar datos para Excel
      const excelData = applicants.map((applicant) => ({
        'CÓDIGO': applicant.ID_APPLICANT,
        'NOMBRES': applicant.FIRST_NAME,
        'APELLIDOS': applicant.LAST_NAME,
        'DOCUMENTO': applicant.IDENTIFICATION_NUMBER,
        'TIPO DOCUMENTO': applicant.IDENTIFICATION_TYPE,
        'EMAIL': applicant.EMAIL,
        'TELÉFONO': applicant.PHONE || 'No registrado',
        'EMPRESA': applicant.COMPANY,
        'ÁREA': `Área ${applicant.AREA_ID}`,
        'ESTADO': applicant.STATUS === 'A' ? 'Activo' : 'Inactivo',
        'ACCESO': getAccessStatus(applicant),
        'FECHA INGRESO': formatDate(applicant.CREATED_AT),
        'FECHA ACTUALIZACIÓN': formatDate(applicant.UPDATED_AT)
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 10 },  // CÓDIGO
        { wch: 15 },  // NOMBRES
        { wch: 15 },  // APELLIDOS
        { wch: 15 },  // DOCUMENTO
        { wch: 12 },  // TIPO DOCUMENTO
        { wch: 25 },  // EMAIL
        { wch: 15 },  // TELÉFONO
        { wch: 20 },  // EMPRESA
        { wch: 10 },  // ÁREA
        { wch: 10 },  // ESTADO
        { wch: 12 },  // ACCESO
        { wch: 12 },  // FECHA INGRESO
        { wch: 12 }   // FECHA ACTUALIZACIÓN
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Solicitantes');

      // Generar archivo y descargar
      const fileName = `solicitantes_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Excel de solicitantes generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  };

  const exportFilteredToExcel = () => {
    try {
      console.log(`📊 Exportando ${applicants.length} solicitantes a Excel...`);

      const excelData = applicants.map((applicant) => ({
        'CÓDIGO': applicant.ID_APPLICANT,
        'NOMBRES': applicant.FIRST_NAME,
        'APELLIDOS': applicant.LAST_NAME,
        'DOCUMENTO': applicant.IDENTIFICATION_NUMBER,
        'TIPO DOCUMENTO': applicant.IDENTIFICATION_TYPE,
        'EMAIL': applicant.EMAIL,
        'TELÉFONO': applicant.PHONE || 'No registrado',
        'EMPRESA': applicant.COMPANY,
        'ÁREA': `Área ${applicant.AREA_ID}`,
        'ESTADO': applicant.STATUS === 'A' ? 'Activo' : 'Inactivo',
        'ACCESO': getAccessStatus(applicant),
        'FECHA INGRESO': formatDate(applicant.CREATED_AT)
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
        { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Solicitantes');

      const fileName = `solicitantes_filtrados_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Excel con filtros generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  };

  // ===== FUNCIÓN DE EXPORTACIÓN PDF =====
  const handleDownloadApplicantPDF = async (applicant) => {
    try {
      console.log("📄 Generando PDF para solicitante:", applicant.ID_APPLICANT);
      
      // Mostrar indicador de carga
      setProcessing({ id: applicant.ID_APPLICANT, action: "download" });
      
      // Generar PDF (necesitarás crear este servicio)
      const pdfBlob = await generateApplicantPDF(applicant);
      
      // Crear URL para descarga
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `solicitante-${applicant.ID_APPLICANT}-${applicant.FIRST_NAME}-${applicant.LAST_NAME}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar memoria
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
      
      console.log("✅ PDF generado y descargado exitosamente");
      
    } catch (error) {
      console.error("❌ Error generando PDF:", error);
      alert("Error al generar el PDF del solicitante");
    } finally {
      setProcessing(null);
    }
  };

  // Helper para verificar si una acción está en progreso
  const isProcessing = (applicantId, action = null) => {
    if (!processing) return false;
    if (action) {
      return processing.id === applicantId && processing.action === action;
    }
    return processing.id === applicantId;
  };

  return (
    <div className="applicant-management">
      {/* Controles de búsqueda y exportación */}
      <div className="applicant-controls">
        <div className="applicant-search-container">
          <Search size={18} className="applicant-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="applicant-search-input"
          />
        </div>

        <div className="applicant-filters-container">
          <div className="applicant-filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="applicant-filter-select"
            >
              <option value="A">Activos</option>
              <option value="I">Inactivos</option>
              <option value="ALL">Todos</option>
            </select>
          </div>

          {/* Botones de exportación a Excel */}
          <button
            onClick={exportToExcel}
            className="applicant-excel-btn"
            title="Exportar todos los solicitantes a Excel"
          >
            <FileDown size={16} />
            Excel Total
          </button>

          <button
            onClick={exportFilteredToExcel}
            className="applicant-excel-btn"
            title="Exportar solicitantes filtrados a Excel"
            disabled={applicants.length === 0}
          >
            <Download size={16} />
            Excel Filtrado
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="applicant-table-container">
        <table className="applicant-data-table">
          <thead>
            <tr>
              <th className="applicant-table-header">CÓDIGO</th>
              <th className="applicant-table-header">SOLICITANTE</th>
              <th className="applicant-table-header">DOCUMENTO</th>
              <th className="applicant-table-header">EMPRESA</th>
              <th className="applicant-table-header">ÁREA</th>
              <th className="applicant-table-header">ESTADO</th>
              <th className="applicant-table-header">FECHA INGRESO</th>
              <th className="applicant-table-header">ACCESO</th>
              <th className="applicant-table-header applicant-table-header-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant, index) => (
              <tr 
                key={applicant.ID_APPLICANT}
                className="applicant-table-row"
              >
                {/* Código */}
                <td className="applicant-table-cell">
                  <div className="applicant-code-container">
                    <div className="applicant-code-badge">
                      {index + 1}
                    </div>
                    <span className="applicant-code-text">#{applicant.ID_APPLICANT}</span>
                  </div>
                </td>

                {/* Información del Solicitante */}
                <td className="applicant-table-cell">
                  <div className="applicant-info">
                    <div className="applicant-name">
                      {applicant.FIRST_NAME} {applicant.LAST_NAME}
                    </div>
                    <div className="applicant-email">
                      {applicant.EMAIL}
                    </div>
                  </div>
                </td>

                {/* Documento */}
                <td className="applicant-table-cell">
                  <div className="applicant-document-info">
                    <span className="applicant-document-type">
                      {applicant.IDENTIFICATION_TYPE}
                    </span>
                    <span className="applicant-document-number">
                      {applicant.IDENTIFICATION_NUMBER}
                    </span>
                  </div>
                </td>

                {/* Empresa */}
                <td className="applicant-table-cell">
                  <div className="applicant-company-info">
                    {applicant.COMPANY}
                  </div>
                </td>

                {/* Área */}
                <td className="applicant-table-cell">
                  <div className="applicant-area-info">
                    Área {applicant.AREA_ID}
                  </div>
                </td>

                {/* Estado */}
                <td className="applicant-table-cell">
                  <span className={`applicant-status-badge ${applicant.STATUS === 'A' ? 'applicant-status-active' : 'applicant-status-inactive'}`}>
                    {applicant.STATUS === 'A' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                {/* Fecha de Ingreso */}
                <td className="applicant-table-cell">
                  <div className="applicant-date-text">
                    {formatDate(applicant.CREATED_AT)}
                  </div>
                </td>

                {/* Estado de Acceso */}
                <td className="applicant-table-cell">
                  <div className={`applicant-access-status ${applicant.STATUS === 'A' ? 'applicant-access-active' : 'applicant-access-inactive'}`}>
                    <Shield size={14} />
                    <span>{getAccessStatus(applicant)}</span>
                  </div>
                </td>

                {/* Acciones */}
                <td className="applicant-table-cell">
                  <div className="applicant-actions-container">
                    {/* Ver Detalles */}
                    <button
                      onClick={() => handleViewDetails(applicant)}
                      className="applicant-action-btn applicant-view-btn"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Descargar PDF */}
                    <button
                      onClick={() => handleDownloadApplicantPDF(applicant)}
                      className="applicant-action-btn applicant-download-btn"
                      title="Descargar PDF"
                      disabled={isProcessing(applicant.ID_APPLICANT, "download")}
                    >
                      {isProcessing(applicant.ID_APPLICANT, "download") ? (
                        <div className="applicant-loading-spinner"></div>
                      ) : (
                        <FileText size={18} />
                      )}
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => onEdit(applicant)}
                      className="applicant-action-btn applicant-edit-btn"
                      title={statusFilter === 'I' ? "No se puede editar solicitantes inactivos" : "Editar solicitante"}
                      disabled={statusFilter === 'I'}
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Eliminar o Restaurar */}
                    {applicant.STATUS === 'A' ? (
                      <button
                        onClick={() => onDelete(applicant.ID_APPLICANT)}
                        className="applicant-action-btn applicant-delete-btn"
                        title="Eliminar solicitante"
                        disabled={statusFilter === 'I'}
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onRestore(applicant.ID_APPLICANT)}
                        className="applicant-action-btn applicant-restore-btn"
                        title="Restaurar solicitante"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Estado vacío */}
        {applicants.length === 0 && (
          <div className="applicant-empty-state">
            <User size={48} />
            <h3>No hay solicitantes</h3>
            <p>
              {statusFilter === 'A' 
                ? "No se encontraron solicitantes activos" 
                : statusFilter === 'I'
                ? "No se encontraron solicitantes inactivos"
                : "No hay solicitantes registrados en el sistema"
              }
            </p>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="applicant-results-counter">
        {applicants.length} de {applicants.length} registros mostrados
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedApplicant && (
        <div className="applicant-modal-overlay" onClick={handleCloseModal}>
          <div className="applicant-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="applicant-modal-header">
              <h2 className="applicant-modal-title">
                <User size={24} />
                Detalles del Solicitante
              </h2>
              <button onClick={handleCloseModal} className="applicant-modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="applicant-modal-body">
              <div className="applicant-details-grid">
                <div className="applicant-detail-group">
                  <h3 className="applicant-detail-title">Información Personal</h3>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Nombres:</span>
                    <span className="applicant-detail-value">{selectedApplicant.FIRST_NAME}</span>
                  </div>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Apellidos:</span>
                    <span className="applicant-detail-value">{selectedApplicant.LAST_NAME}</span>
                  </div>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Tipo de Documento:</span>
                    <span className="applicant-detail-value">{selectedApplicant.IDENTIFICATION_TYPE}</span>
                  </div>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Número de Documento:</span>
                    <span className="applicant-detail-value">{selectedApplicant.IDENTIFICATION_NUMBER}</span>
                  </div>
                </div>

                <div className="applicant-detail-group">
                  <h3 className="applicant-detail-title">Información de Contacto</h3>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Email:</span>
                    <span className="applicant-detail-value">{selectedApplicant.EMAIL}</span>
                  </div>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Teléfono:</span>
                    <span className="applicant-detail-value">{selectedApplicant.PHONE || 'No registrado'}</span>
                  </div>
                </div>

                <div className="applicant-detail-group">
                  <h3 className="applicant-detail-title">Información Laboral</h3>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Empresa:</span>
                    <span className="applicant-detail-value">{selectedApplicant.COMPANY}</span>
                  </div>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Área:</span>
                    <span className="applicant-detail-value">Área {selectedApplicant.AREA_ID}</span>
                  </div>
                </div>

                <div className="applicant-detail-group">
                  <h3 className="applicant-detail-title">Estado del Registro</h3>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Estado:</span>
                    <span className={`applicant-detail-status ${selectedApplicant.STATUS === 'A' ? 'applicant-status-active' : 'applicant-status-inactive'}`}>
                      {selectedApplicant.STATUS === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Fecha de Ingreso:</span>
                    <span className="applicant-detail-value">{formatDate(selectedApplicant.CREATED_AT)}</span>
                  </div>
                  <div className="applicant-detail-item">
                    <span className="applicant-detail-label">Acceso:</span>
                    <span className={`applicant-detail-access ${selectedApplicant.STATUS === 'A' ? 'applicant-access-active' : 'applicant-access-inactive'}`}>
                      {getAccessStatus(selectedApplicant)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="applicant-modal-actions">
              <button onClick={handleCloseModal} className="applicant-modal-btn applicant-modal-btn-cancel">
                Cerrar
              </button>
              <button 
                onClick={() => handleDownloadApplicantPDF(selectedApplicant)}
                className="applicant-modal-btn applicant-modal-btn-download"
              >
                <FileText size={16} />
                Descargar PDF
              </button>
              <button 
                onClick={() => {
                  onEdit(selectedApplicant);
                  handleCloseModal();
                }}
                className="applicant-modal-btn applicant-modal-btn-edit"
                disabled={statusFilter === 'I'}
              >
                <Edit2 size={16} />
                Editar Solicitante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantTable;