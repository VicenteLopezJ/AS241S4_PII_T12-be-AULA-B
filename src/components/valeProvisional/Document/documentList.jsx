import React, { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  Download,
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
} from "lucide-react";
import { DocumentService } from "../../../services/valeProvisional/documentApi";
import "../../../styles/valeProvisional/document/documentList.css";

const DocumentList = ({ onEdit, onView, onDelete, currentFilter, onFilterChange, allDocuments }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  const [statusFilter, setStatusFilter] = useState(currentFilter || "A");

  // Sincronizar con el filtro del padre
  useEffect(() => {
    setStatusFilter(currentFilter);
  }, [currentFilter]);

  // Filtrar documentos cuando cambie el filtro, allDocuments, searchTerm o typeFilter
  useEffect(() => {
    filterDocuments();
  }, [statusFilter, allDocuments, searchTerm, typeFilter]);

  const filterDocuments = () => {
    if (!allDocuments || allDocuments.length === 0) {
      setDocuments([]);
      return;
    }

    console.log("🎯 Aplicando filtros:", {
      statusFilter,
      totalDocumentos: allDocuments.length,
      searchTerm,
      typeFilter
    });

    // Primero filtrar por estado
    let filteredData;
    if (statusFilter === "ALL") {
      filteredData = [...allDocuments];
    } else if (statusFilter === "I") {
      filteredData = allDocuments.filter((doc) => doc.STATUS === "I");
    } else {
      filteredData = allDocuments.filter((doc) => doc.STATUS === "A");
    }

    console.log("📊 Después de filtro por estado:", filteredData.length);

    // Luego filtrar por tipo
    if (typeFilter) {
      filteredData = filteredData.filter((document) => 
        document.DOCUMENT_TYPE === typeFilter
      );
      console.log("📊 Después de filtro por tipo:", filteredData.length);
    }

    // Finalmente filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter((document) =>
        document.DOCUMENT_TYPE?.toLowerCase().includes(searchLower) ||
        document.DOCUMENT_URL?.toLowerCase().includes(searchLower) ||
        document.TRACKING_ID?.toString().includes(searchTerm)
      );
      console.log("📊 Después de filtro por búsqueda:", filteredData.length);
    }

    setDocuments(filteredData);
  };

  // Actualizar el filtro y notificar al padre
  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const handleDelete = async (idDocument) => {
    if (!window.confirm("¿Está seguro de eliminar este documento?")) return;

    try {
      console.log("🗑️ ELIMINANDO - ID:", idDocument);
      await DocumentService.delete(idDocument);
      console.log("✅ Documento eliminado en backend");

      // Notificar al padre para que recargue todos los documentos
      if (onDelete) onDelete(idDocument);
    } catch (error) {
      console.error("Error eliminando:", error);
      setError("Error al eliminar documento");
    }
  };

  // Obtener tipos únicos para el filtro - de todos los documentos
  const documentTypes = [...new Set(allDocuments?.map((doc) => doc.DOCUMENT_TYPE) || [])];

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  // Formatear fecha y hora para auditoría
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES");
  };

  // Ver documento en nueva pestaña
  const handleViewDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, "_blank");
    }
  };

  // Descargar documento
  const handleDownloadDocument = (documentUrl, documentName) => {
    if (documentUrl) {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentName || "documento";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Obtener nombre del archivo desde la URL
  const getFileName = (url) => {
    if (!url) return "Sin archivo";
    return url.split("/").pop() || "documento";
  };

  // Obtener icono según tipo de documento
  const getDocumentIcon = (documentType) => {
    switch (documentType) {
      case "FACTURA":
        return "🧾";
      case "BOLETA":
        return "📄";
      case "RECIBO":
        return "🎫";
      case "TICKET":
        return "🎟️";
      case "CONTRATO":
        return "📑";
      case "ORDEN_COMPRA":
        return "📋";
      case "NOTA_CREDITO":
        return "💳";
      case "NOTA_DEBITO":
        return "📉";
      default:
        return "📎";
    }
  };

  // Mostrar loading solo si allDocuments está vacío y debería haber datos
  if (!allDocuments || allDocuments.length === 0) {
    return (
      <div className="vale-provisional-document-loading-container">
        <div className="vale-provisional-document-loading-spinner"></div>
        <p className="vale-provisional-document-loading-text">Cargando documentos...</p>
      </div>
    );
  }

  return (
    <div className="vale-provisional-document-list">
      {/* Controles de búsqueda y filtro */}
      <div className="vale-provisional-document-search-controls">
        <div className="vale-provisional-document-search-input-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por tipo, URL o ID de vale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vale-provisional-document-search-input"
          />
        </div>

        <div className="vale-provisional-document-filters-container">
          <div className="vale-provisional-document-filter-group">
            <Filter size={16} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="vale-provisional-document-filter-select"
            >
              <option value="">Todos los tipos</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="vale-provisional-document-status-filter"
          >
            <option value="A">Activos</option>
            <option value="I">Eliminados</option>
            <option value="ALL">Todos</option>
          </select>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="vale-provisional-document-error-message">
          {error}
          <button onClick={() => window.location.reload()} className="vale-provisional-document-retry-button">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="vale-provisional-document-table-container">
        <table className="vale-provisional-document-table">
          <thead>
            <tr>
              <th className="vale-provisional-document-table-header">CÓDIGO</th>
              <th className="vale-provisional-document-table-header">TIPO</th>
              <th className="vale-provisional-document-table-header">ARCHIVO</th>
              <th className="vale-provisional-document-table-header">ID VALE</th>
              <th className="vale-provisional-document-table-header">FECHA RECEPCIÓN</th>
              <th className="vale-provisional-document-table-header">ESTADO</th>
              <th className="vale-provisional-document-table-header">
                {statusFilter === "I" ? "INFORMACIÓN DE AUDITORÍA" : " "}
              </th>
              <th className="vale-provisional-document-table-header vale-provisional-document-table-header-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document, index) => (
              <tr key={document.ID_DOCUMENT} className="vale-provisional-document-table-row">
                <td className="vale-provisional-document-table-cell">
                  <div className="vale-provisional-document-code-container">
                    <div className="vale-provisional-document-code-badge">{index + 1}</div>
                    <span className="vale-provisional-document-code-text">{document.ID_DOCUMENT}</span>
                  </div>
                </td>
                <td className="vale-provisional-document-table-cell">
                  <div className="vale-provisional-document-type-info">
                    <span className="vale-provisional-document-type-icon">
                      {getDocumentIcon(document.DOCUMENT_TYPE)}
                    </span>
                    <span className="vale-provisional-document-type-text">{document.DOCUMENT_TYPE}</span>
                  </div>
                </td>
                <td className="vale-provisional-document-table-cell">
                  <div className="vale-provisional-document-file-info">
                    <div className="vale-provisional-document-file-name">
                      {getFileName(document.DOCUMENT_URL)}
                    </div>
                    <div className="vale-provisional-document-file-url">{document.DOCUMENT_URL}</div>
                  </div>
                </td>
                <td className="vale-provisional-document-table-cell">
                  <div className="vale-provisional-document-voucher-id">#{document.TRACKING_ID}</div>
                </td>
                <td className="vale-provisional-document-table-cell">
                  <div className="vale-provisional-document-date-text">
                    {formatDate(document.RECEPTION_DATE)}
                  </div>
                </td>
                <td className="vale-provisional-document-table-cell">
                  <span
                    className={`vale-provisional-document-status-badge ${
                      document.STATUS === "A"
                        ? "vale-provisional-document-status-active"
                        : "vale-provisional-document-status-eliminado"
                    }`}
                  >
                    {document.STATUS === "A" ? "Activo" : "Eliminado"}
                  </span>
                </td>

                {/* COLUMNA DE AUDITORÍA - SIEMPRE PRESENTE */}
                <td className="vale-provisional-document-table-cell">
                  {statusFilter === "I" ? (
                    <div className="vale-provisional-document-audit-info">
                      <div className="vale-provisional-document-audit-item">
                        <Calendar size={12} />
                        <span>
                          Eliminado: {formatDate(document.DELETED_AT)}
                        </span>
                      </div>
                      <div className="vale-provisional-document-audit-item">
                        <Clock size={12} />
                        <span>
                          Modificado: {formatDateTime(document.UPDATED_AT)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="vale-provisional-document-text-gray">-</span>
                  )}
                </td>

                <td className="vale-provisional-document-table-cell">
                  <div className="vale-provisional-document-actions-container">
                    {/* Ver documento */}
                    <button
                      onClick={() => handleViewDocument(document.DOCUMENT_URL)}
                      className="vale-provisional-document-action-btn vale-provisional-document-view-btn"
                      title="Ver documento"
                      disabled={!document.DOCUMENT_URL}
                    >
                      <Eye size={18} />
                    </button>

                    {/* Descargar documento */}
                    <button
                      onClick={() =>
                        handleDownloadDocument(
                          document.DOCUMENT_URL,
                          getFileName(document.DOCUMENT_URL)
                        )
                      }
                      className="vale-provisional-document-action-btn vale-provisional-document-download-btn"
                      title="Descargar documento"
                      disabled={!document.DOCUMENT_URL}
                    >
                      <Download size={18} />
                    </button>

                    {/* Editar - Solo disponible para documentos activos */}
                    <button
                      onClick={() => onEdit && onEdit(document)}
                      className="vale-provisional-document-action-btn vale-provisional-document-edit-btn"
                      title="Editar"
                      disabled={document.STATUS !== "A"}
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Eliminar - Solo disponible para documentos activos */}
                    {document.STATUS === "A" && (
                      <button
                        onClick={() => handleDelete(document.ID_DOCUMENT)}
                        className="vale-provisional-document-action-btn vale-provisional-document-delete-btn"
                        title="Eliminar documento"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {documents.length === 0 && (
          <div className="vale-provisional-document-empty-state">
            <FileText size={48} />
            <h3>No hay documentos</h3>
            <p>
              {allDocuments.length === 0
                ? "No se han registrado documentos en el sistema"
                : statusFilter === "I"
                ? "No hay documentos eliminados"
                : "No se encontraron documentos con los filtros aplicados"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;