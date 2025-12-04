import React, { useState, useEffect } from "react";
import { Plus, FileText, Edit2, Eye, Trash2, X } from "lucide-react";
import DocumentList from "../../components/valeProvisional/Document/documentList";
import DocumentForm from "../../components/valeProvisional/Document/documentForm";
import { DocumentService } from "../../services/valeProvisional/documentApi";
import "../../styles/valeProvisional/document/documentPage.css";

const DocumentPage = () => {
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  
  const [currentFilter, setCurrentFilter] = useState("A");

  useEffect(() => {
    loadAllDocuments();
  }, []);

  const loadAllDocuments = async () => {
    try {
      setLoading(true);
      console.log("📥 Cargando TODOS los documentos...");
      
      const response = await DocumentService.getAll(true);
      const documentsData = response.data?.data || response.data || [];

      console.log("📊 Total documentos cargados (incluyendo eliminados):", documentsData.length);
      console.log("🔍 Documentos eliminados encontrados:", documentsData.filter(doc => doc.STATUS === 'I').length);
      
      setAllDocuments(documentsData);
      setError("");
    } catch (error) {
      console.error("Error cargando documentos:", error);
      setError("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType) => {
    console.log("🔄 Cambiando filtro a:", filterType);
    setCurrentFilter(filterType);
  };

  const handleDocumentListFilter = (filter) => {
    console.log("📋 Filtro cambiado desde lista:", filter);
    setCurrentFilter(filter);
  };

  const handleCreateDocument = () => {
    setEditingDocument(null);
    setShowFormModal(true);
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setShowFormModal(true);
  };

  const handleViewDocument = (document) => {
    setViewingDocument(document);
  };

  const handleDeleteDocument = async (idDocument) => {
    try {
      console.log("🗑️ Eliminando documento:", idDocument);
      await DocumentService.delete(idDocument);
      
      await loadAllDocuments();
    } catch (error) {
      console.error("Error eliminando documento:", error);
      setError("Error al eliminar documento");
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      console.log("📤 Enviando formulario:", formData);
      
      if (editingDocument) {
        const response = await DocumentService.update(formData);
        console.log("✅ Documento actualizado:", response.data);
      } else {
        const response = await DocumentService.create(formData);
        console.log("✅ Documento creado:", response.data);
      }

      setShowFormModal(false);
      setEditingDocument(null);
      await loadAllDocuments();
      
    } catch (error) {
      console.error("Error enviando formulario:", error);
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowFormModal(false);
    setEditingDocument(null);
  };

  const handleCloseView = () => {
    setViewingDocument(null);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.keyCode === 27) {
        if (showFormModal) {
          setShowFormModal(false);
          setEditingDocument(null);
        }
        if (viewingDocument) {
          setViewingDocument(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showFormModal, viewingDocument]);

  useEffect(() => {
    if (showFormModal || viewingDocument) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFormModal, viewingDocument]);

  const activeDocuments = allDocuments.filter(doc => doc.STATUS === 'A').length;
  const deletedDocuments = allDocuments.filter(doc => doc.STATUS === 'I').length;
  const totalDocuments = allDocuments.length;

  console.log("📊 Estadísticas calculadas:", {
    total: totalDocuments,
    activos: activeDocuments,
    eliminados: deletedDocuments
  });

  const getCardClass = (filterType) => {
    return `vale-provisional-document-stat-card ${currentFilter === filterType ? 'vale-provisional-document-stat-card-active' : ''}`;
  };

  if (loading) {
    return (
      <div className="vale-provisional-document-loading-page">
        <div className="vale-provisional-document-loading-spinner-page"></div>
        <p className="vale-provisional-document-loading-text-page">Cargando documentos...</p>
      </div>
    );
  }

  return (
    <div className="vale-provisional-document-page">
      {/* Header */}
      <div className="vale-provisional-document-page-header">
        <div className="vale-provisional-document-page-title">
          <div>
            <h1>Gestión de Documentos</h1>
            <p className="vale-provisional-document-page-subtitle">
              Administra los documentos de justificación de vales provisionales
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleCreateDocument}
          className="vale-provisional-document-page-primary-btn"
          disabled={showFormModal}
        >
          <Plus size={20} />
          Nuevo Documento
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="vale-provisional-document-stat-cards">
        <div 
          className={getCardClass("ALL")}
          onClick={() => handleFilterChange("ALL")}
          style={{cursor: 'pointer'}}
        >
          <div className="vale-provisional-document-stat-icon vale-provisional-document-stat-icon-total">
            <FileText size={24} />
          </div>
          <div className="vale-provisional-document-stat-content">
            <span className="vale-provisional-document-stat-value">{totalDocuments}</span>
            <span className="vale-provisional-document-stat-label">Total Documentos</span>
          </div>
        </div>
        
        <div 
          className={getCardClass("A")}
          onClick={() => handleFilterChange("A")}
          style={{cursor: 'pointer'}}
        >
          <div className="vale-provisional-document-stat-icon vale-provisional-document-stat-icon-active">
            <Eye size={24} />
          </div>
          <div className="vale-provisional-document-stat-content">
            <span className="vale-provisional-document-stat-value">{activeDocuments}</span>
            <span className="vale-provisional-document-stat-label">Activos</span>
          </div>
        </div>
        
        <div 
          className={getCardClass("I")}
          onClick={() => handleFilterChange("I")}
          style={{cursor: 'pointer'}}
        >
          <div className="vale-provisional-document-stat-icon vale-provisional-document-stat-icon-deleted">
            <Trash2 size={24} />
          </div>
          <div className="vale-provisional-document-stat-content">
            <span className="vale-provisional-document-stat-value">{deletedDocuments}</span>
            <span className="vale-provisional-document-stat-label">Eliminados</span>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="vale-provisional-document-page-error">
          <span>{error}</span>
          <button onClick={loadAllDocuments} className="vale-provisional-document-page-retry-btn">
            Reintentar
          </button>
        </div>
      )}

      {/* Contenido principal */}
      <div className="vale-provisional-document-main-content">
        <div className="vale-provisional-document-list-section">
          <DocumentList
            onEdit={handleEditDocument}
            onView={handleViewDocument}
            onDelete={handleDeleteDocument}
            currentFilter={currentFilter}
            onFilterChange={handleDocumentListFilter}
            allDocuments={allDocuments}
          />
        </div>
      </div>

      {/* Modal del Formulario */}
      {showFormModal && (
        <div className="vale-provisional-document-modal-overlay vale-provisional-document-modal-blur">
          <div className="vale-provisional-document-modal-content vale-provisional-document-modal-form">
            <div className="vale-provisional-document-modal-header">
              <h3>
                {editingDocument ? 'Editar Documento' : 'Nuevo Documento'}
              </h3>
              <button 
                onClick={handleCancelForm}
                className="vale-provisional-document-modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="vale-provisional-document-modal-body vale-provisional-document-modal-form-body">
              <DocumentForm
                initialData={editingDocument}
                onSubmit={handleSubmitForm}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualización */}
      {viewingDocument && (
        <div className="vale-provisional-document-modal-overlay vale-provisional-document-modal-blur">
          <div className="vale-provisional-document-modal-content">
            <div className="vale-provisional-document-modal-header">
              <h3>Vista Previa del Documento</h3>
              <button 
                onClick={handleCloseView}
                className="vale-provisional-document-modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="vale-provisional-document-modal-body">
              <div className="vale-provisional-document-info">
                <div className="vale-provisional-document-info-field">
                  <label>Tipo:</label>
                  <span>{viewingDocument.DOCUMENT_TYPE}</span>
                </div>
                <div className="vale-provisional-document-info-field">
                  <label>ID Vale:</label>
                  <span>#{viewingDocument.TRACKING_ID}</span>
                </div>
                <div className="vale-provisional-document-info-field">
                  <label>Fecha Recepción:</label>
                  <span>
                    {new Date(viewingDocument.RECEPTION_DATE).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="vale-provisional-document-info-field">
                  <label>Estado:</label>
                  <span className={`vale-provisional-document-status-badge-page ${
                    viewingDocument.STATUS === 'A' ? 'vale-provisional-document-status-active-page' : 'vale-provisional-document-status-deleted-page'
                  }`}>
                    {viewingDocument.STATUS === 'A' ? 'Activo' : 'Eliminado'}
                  </span>
                </div>
                <div className="vale-provisional-document-info-field vale-provisional-document-info-field-full">
                  <label>URL del Documento:</label>
                  <span className="vale-provisional-document-url">{viewingDocument.DOCUMENT_URL}</span>
                </div>
              </div>
              
              <div className="vale-provisional-document-modal-actions">
                <button 
                  onClick={() => window.open(viewingDocument.DOCUMENT_URL, '_blank')}
                  className="vale-provisional-document-modal-secondary-btn"
                  disabled={!viewingDocument.DOCUMENT_URL}
                >
                  <Eye size={16} />
                  Abrir Documento
                </button>
                <button 
                  onClick={() => {
                    handleEditDocument(viewingDocument);
                    handleCloseView();
                  }}
                  className="vale-provisional-document-modal-secondary-btn"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPage;