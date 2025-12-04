import React, { useState, useEffect } from "react";
import VoucherList from "../../components/valeProvisional/Voucher/voucherList";
import VoucherForm from "../../components/valeProvisional/Voucher/voucherForm";
import VoucherTracking from "../../components/valeProvisional/Tracking/voucherTracking";
import "../../styles/valeProvisional/voucher/voucherPage.css";

const VoucherPage = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleNavigate = (view, voucher = null) => {
    setCurrentView(view);
    if (voucher) {
      setSelectedVoucher(voucher);
    } else {
      setSelectedVoucher(null);
    }
    
    // Refrescar datos para vistas principales
    if (['list', 'workflow', 'tracking'].includes(view)) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleOpenModal = (voucher = null) => {
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVoucher(null);
  };

  const handleSaveVoucher = async (savedVoucher) => {
    try {
      console.log('✅ Vale guardado exitosamente:', savedVoucher);
      alert(selectedVoucher ? 'Vale actualizado exitosamente' : 'Vale creado exitosamente');
      
      // Cerrar modal si estamos en vista dashboard
      if (showModal) {
        handleCloseModal();
      } else {
        handleNavigate('list');
      }
      
      setRefreshTrigger(prev => prev + 1); // Refrescar datos
    } catch (error) {
      console.error('Error en handleSaveVoucher:', error);
      alert('Error al procesar el vale');
    }
  };

  // Componente Modal
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="vale-provisional-page-modal-overlay" onClick={handleCloseModal}>
        <div className="vale-provisional-page-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="vale-provisional-page-modal-header">
            <h2>
              {selectedVoucher ? 'Editar Vale Provisional' : 'Nuevo Vale Provisional'}
            </h2>
            <button className="vale-provisional-page-modal-close-btn" onClick={handleCloseModal}>
              ×
            </button>
          </div>
          
          <div className="vale-provisional-page-modal-body">
            <VoucherForm 
              initialData={selectedVoucher}
              onSubmit={handleSaveVoucher}
              onCancel={handleCloseModal}
              isModal={true}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <VoucherList 
            onEdit={(voucher) => handleOpenModal(voucher)}
            onView={(voucher) => handleNavigate('details', voucher)}
            onCreate={() => handleOpenModal()}
            onNavigate={handleNavigate}
            initialFilter=""
            key={`list-${refreshTrigger}`}
          />
        );
      
      case 'form':
        return (
          <div className="vale-provisional-page-form-view-container">
            <div className="vale-provisional-page-form-header">
              <button 
                onClick={() => handleNavigate('list')}
                className="vale-provisional-page-back-button"
              >
                ← Volver a la Lista
              </button>
              <h1>
                {selectedVoucher ? 'Editar Vale Provisional' : 'Nuevo Vale Provisional'}
              </h1>
            </div>
            
            <VoucherForm 
              initialData={selectedVoucher}
              onSubmit={handleSaveVoucher}
              onCancel={() => handleNavigate('list')}
            />
          </div>
        );
      
      case 'workflow':
        return (
          <VoucherList 
            onEdit={(voucher) => handleOpenModal(voucher)}
            onView={(voucher) => handleNavigate('details', voucher)}
            onCreate={() => handleOpenModal()}
            onNavigate={handleNavigate}
            initialFilter="P"
            key={`workflow-${refreshTrigger}`}
          />
        );
      
      case 'tracking':
        return (
          <VoucherTracking 
            onNavigate={handleNavigate}
            key={`tracking-${refreshTrigger}`}
          />
        );
      
      case 'details':
        return (
          <div className="vale-provisional-page-details-view-container">
            <div className="vale-provisional-page-details-header">
              <button 
                onClick={() => handleNavigate('list')}
                className="vale-provisional-page-back-button"
              >
                ← Volver a la Lista
              </button>
              <h1>Detalles del Vale</h1>
            </div>
            
            <div className="vale-provisional-page-details-content">
              {selectedVoucher ? (
                <div className="vale-provisional-page-voucher-details">
                  <div className="vale-provisional-page-detail-section">
                    <h3>Información General</h3>
                    <div className="vale-provisional-page-detail-grid">
                      <div className="vale-provisional-page-detail-item">
                        <label>Código:</label>
                        <span>#{selectedVoucher.CORRELATIVE || selectedVoucher.correlative}</span>
                      </div>
                      <div className="vale-provisional-page-detail-item">
                        <label>Monto:</label>
                        <span>${(selectedVoucher.AMOUNT || selectedVoucher.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="vale-provisional-page-detail-item">
                        <label>Actividad:</label>
                        <span>{selectedVoucher.ACTIVITY_TO_PERFORM || selectedVoucher.activityToPerform || 'N/A'}</span>
                      </div>
                      <div className="vale-provisional-page-detail-item">
                        <label>Fecha Solicitud:</label>
                        <span>
                          {selectedVoucher.REQUEST_DATE || selectedVoucher.requestDate 
                            ? new Date(selectedVoucher.REQUEST_DATE || selectedVoucher.requestDate).toLocaleDateString('es-ES')
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="vale-provisional-page-detail-item">
                        <label>Estado:</label>
                        <span>{getStatusLabel(selectedVoucher.STATUS || selectedVoucher.status)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="vale-provisional-page-detail-actions">
                    <button 
                      onClick={() => handleOpenModal(selectedVoucher)}
                      className="vale-provisional-page-btn-edit"
                    >
                      Editar Vale
                    </button>
                    <button 
                      onClick={() => handleNavigate('tracking')}
                      className="vale-provisional-page-btn-tracking"
                    >
                      Ir a Seguimiento
                    </button>
                    <button 
                      onClick={() => handleNavigate('list')}
                      className="vale-provisional-page-btn-back"
                    >
                      Volver a la Lista
                    </button>
                  </div>
                </div>
              ) : (
                <div className="vale-provisional-page-no-data">
                  <p>No hay datos del vale seleccionado</p>
                  <button onClick={() => handleNavigate('list')} className="vale-provisional-page-btn-back">
                    Volver a la Lista
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="vale-provisional-page-default-view">
            <h2>Vista no encontrada</h2>
            <button onClick={() => handleNavigate('list')} className="vale-provisional-page-btn-back">
              Volver a la Lista
            </button>
          </div>
        );
    }
  };

  // Función auxiliar para estados
  const getStatusLabel = (status) => {
    const statusMap = {
      'P': 'Pendiente',
      'A': 'Aprobado', 
      'R': 'Rechazado',
      'J': 'Justificado',
      'C': 'Completado'
    };
    return statusMap[status] || status;
  };

  return (
    <div className={`vale-provisional-voucher-page ${showModal ? 'vale-provisional-page-modal-open' : ''}`}>
      <div className="vale-provisional-page-content">
        {renderCurrentView()}
      </div>
      {renderModal()}
    </div>
  );
};

export default VoucherPage;