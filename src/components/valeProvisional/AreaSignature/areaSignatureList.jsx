import React, { useState, useEffect } from "react";
import { Edit2, Trash2, RotateCcw, Eye, Download } from "lucide-react";
import { AreaSignatureService } from "../../../services/valeProvisional/areaSignatureApi";
import "../../../styles/valeProvisional/areaSignature/areaSignatureList.css";

const AreaSignatureList = ({ onEdit, onView, onDelete, onRestore }) => {
  const [signatures, setSignatures] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("A");

  useEffect(() => {
    loadSignatures();
    loadAreas();
  }, [statusFilter]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      console.log("📥 Cargando firmas con filtro:", statusFilter);
      const response = await AreaSignatureService.getAll();
      const signaturesData = response.data?.data || response.data || [];

      // ✅ AGREGAR ESTO para ver el estado de TODAS las firmas
      console.log("🔍 ESTADO de TODAS las firmas:");
      signaturesData.forEach((sig) => {
        console.log(`   - ID: ${sig.ID_SIGNATURE}, STATUS: '${sig.STATUS}'`);
      });

      console.log("📊 Total firmas cargadas:", signaturesData.length);

      // Filtra por estado
      const filteredData = signaturesData.filter(
        (sig) => sig.STATUS === statusFilter
      );
      console.log("🎯 Firmas después del filtro:", filteredData.length);

      setSignatures(filteredData);
      setError("");
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar firmas de área");
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await AreaSignatureService.getAreas();
      // ✅ CORREGIDO: Probar diferentes estructuras
      const areasData = response.data?.data || response.data || [];
      console.log("🏢 Áreas cargadas:", areasData);
      setAreas(areasData);
    } catch (error) {
      console.error("Error cargando áreas:", error);
    }
  };

  const handleDelete = async (idSignature) => {
    if (!window.confirm("¿Está seguro de eliminar esta firma de área?")) return;

    try {
      console.log("🗑️ ELIMINANDO - ID:", idSignature);
      await AreaSignatureService.delete(idSignature);
      console.log("✅ Firma eliminada en backend");

      // Recargar manteniendo el filtro actual
      await loadSignatures();

      //if (onDelete) onDelete(idSignature);
    } catch (error) {
      console.error("Error eliminando:", error);
      setError("Error al eliminar firma de área");
    }
  };

  const handleRestore = async (idSignature) => {
    try {
      console.log(
        "🔄 RESTAURANDO - ID:",
        idSignature,
        "| Filtro actual:",
        statusFilter
      );

      // SOLO UNA LLAMADA A LA API
      await AreaSignatureService.restore(idSignature);
      console.log("✅ Firma restaurada en backend");

      // Si estamos en "Inactivos", cambiar automáticamente a "Activos"
      if (statusFilter === "I") {
        console.log("🎛️ Cambiando filtro a 'Activos' automáticamente");
        setStatusFilter("A");
      } else {
        // Si ya estamos en "Activos", solo recargar
        console.log("🔄 Recargando lista con filtro actual");
        await loadSignatures();
      }

      // ⚠️ ELIMINAR ESTA LÍNEA o comentarla si no es necesaria
      // if (onRestore) onRestore(idSignature);
    } catch (error) {
      console.error("❌ Error restaurando:", error);
      console.error("🔧 Error response:", error.response?.data);
      setError("Error al restaurar firma de área");
    }
  };

  // Obtener nombre del área
  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.ID_AREA === areaId);
    return area ? area.AREA_NAME : `ID: ${areaId}`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  // Filtrar firmas
  const filteredSignatures = signatures.filter((signature) => {
    if (signature.STATUS !== statusFilter) return false;

    const searchLower = searchTerm.toLowerCase();
    const areaName = getAreaName(signature.ID_AREA).toLowerCase();
    const managerFullName = `${signature.MANAGER_NAME || ""} ${
      signature.MANAGER_LASTNAME || ""
    }`.toLowerCase();

    return (
      signature.AREA?.toLowerCase().includes(searchLower) ||
      managerFullName.includes(searchLower) ||
      signature.MANAGER_POSITION?.toLowerCase().includes(searchLower) ||
      areaName.includes(searchLower)
    );
  });

  // Ver firma en nueva pestaña
  const handleViewSignature = (signatureUrl) => {
    if (signatureUrl) {
      window.open(signatureUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="vale-provisional-area-signature-loading-container">
        <div className="vale-provisional-area-signature-loading-spinner"></div>
        <p className="vale-provisional-area-signature-loading-text">
          Cargando firmas de área...
        </p>
      </div>
    );
  }

  return (
    <div className="vale-provisional-area-signature-management">
      {/* Controles de búsqueda y filtro */}
      <div className="vale-provisional-area-signature-search-controls">
        <div className="vale-provisional-area-signature-search-input-container">
          <input
            type="text"
            placeholder="Buscar por área, gerente o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vale-provisional-area-signature-search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="vale-provisional-area-signature-status-filter"
        >
          <option value="A">Activos</option>
          <option value="I">Inactivos</option>
        </select>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="vale-provisional-area-signature-error-message">
          {error}
          <button 
            onClick={loadSignatures} 
            className="vale-provisional-area-signature-retry-button"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="vale-provisional-area-signature-table-container">
        <table className="vale-provisional-area-signature-table">
          <thead>
            <tr>
              <th className="vale-provisional-area-signature-table-header">
                CÓDIGO
              </th>
              <th className="vale-provisional-area-signature-table-header">
                ÁREA
              </th>
              <th className="vale-provisional-area-signature-table-header">
                GERENTE
              </th>
              <th className="vale-provisional-area-signature-table-header">
                CARGO
              </th>
              <th className="vale-provisional-area-signature-table-header">
                FECHA FIRMA
              </th>
              <th className="vale-provisional-area-signature-table-header">
                FIRMA
              </th>
              <th className="vale-provisional-area-signature-table-header">
                ESTADO
              </th>
              <th className="vale-provisional-area-signature-table-header vale-provisional-area-signature-table-header-actions">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSignatures.map((signature, index) => (
              <tr 
                key={signature.ID_SIGNATURE} 
                className="vale-provisional-area-signature-table-row"
              >
                <td className="vale-provisional-area-signature-table-cell">
                  <div className="vale-provisional-area-signature-code-container">
                    <div className="vale-provisional-area-signature-code-badge">
                      {index + 1}
                    </div>
                    <span className="vale-provisional-area-signature-code-text">
                      {signature.ID_SIGNATURE}
                    </span>
                  </div>
                </td>
                <td className="vale-provisional-area-signature-table-cell">
                  <div className="vale-provisional-area-signature-info">
                    <div className="vale-provisional-area-signature-name">
                      {signature.AREA || getAreaName(signature.ID_AREA)}
                    </div>
                    <div className="vale-provisional-area-signature-id">
                      ID: {signature.ID_AREA}
                    </div>
                  </div>
                </td>
                <td className="vale-provisional-area-signature-table-cell">
                  <div className="vale-provisional-area-signature-manager-info">
                    <div className="vale-provisional-area-signature-manager-name">
                      {signature.MANAGER_NAME} {signature.MANAGER_LASTNAME}
                    </div>
                  </div>
                </td>
                <td className="vale-provisional-area-signature-table-cell">
                  <div className="vale-provisional-area-signature-position-text">
                    {signature.MANAGER_POSITION || "-"}
                  </div>
                </td>
                <td className="vale-provisional-area-signature-table-cell">
                  <div className="vale-provisional-area-signature-date-text">
                    {formatDate(signature.SIGNATURE_DATE)}
                  </div>
                </td>
                <td className="vale-provisional-area-signature-table-cell">
                  <div className="vale-provisional-area-signature-url">
                    {signature.SIGNATURE_URL ? (
                      <button
                        onClick={() => handleViewSignature(signature.SIGNATURE_URL)}
                        className="vale-provisional-area-signature-link"
                        title="Ver firma"
                      >
                        📄 Ver
                      </button>
                    ) : (
                      <span className="vale-provisional-area-signature-no-signature">
                        -
                      </span>
                    )}
                  </div>
                </td>
                <td className="vale-provisional-area-signature-table-cell">
                  <span
                    className={`vale-provisional-area-signature-status-badge ${
                      signature.STATUS === "A"
                        ? "vale-provisional-area-signature-status-active"
                        : "vale-provisional-area-signature-status-inactive"
                    }`}
                  >
                    {signature.STATUS === "A" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="vale-provisional-area-signature-table-cell">
                  <div className="vale-provisional-area-signature-actions-container">
                    {/* Ver detalles */}
                    <button
                      onClick={() => onView && onView(signature)}
                      className="vale-provisional-area-signature-action-btn vale-provisional-area-signature-view-btn"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Ver firma */}
                    <button
                      onClick={() =>
                        handleViewSignature(signature.SIGNATURE_URL)
                      }
                      className="vale-provisional-area-signature-action-btn vale-provisional-area-signature-download-btn"
                      title="Ver firma"
                      disabled={!signature.SIGNATURE_URL}
                    >
                      <Download size={18} />
                    </button>

                    {/* Editar - Solo disponible para firmas activas */}
                    <button
                      onClick={() => onEdit && onEdit(signature)}
                      className="vale-provisional-area-signature-action-btn vale-provisional-area-signature-edit-btn"
                      title="Editar"
                      disabled={signature.STATUS !== "A"}
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Eliminar o Restaurar */}
                    {signature.STATUS === "A" ? (
                      <button
                        onClick={() => handleDelete(signature.ID_SIGNATURE)}
                        className="vale-provisional-area-signature-action-btn vale-provisional-area-signature-delete-btn"
                        title="Eliminar (Cambiar a Inactivo)"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(signature.ID_SIGNATURE)}
                        className="vale-provisional-area-signature-action-btn vale-provisional-area-signature-restore-btn"
                        title="Restaurar (Cambiar a Activo)"
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

        {filteredSignatures.length === 0 && (
          <div className="vale-provisional-area-signature-empty-state">
            {searchTerm || statusFilter !== "A"
              ? "No se encontraron firmas de área con los filtros aplicados"
              : "No hay firmas de área registradas"}
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="vale-provisional-area-signature-results-counter">
        Mostrando {filteredSignatures.length} de {signatures.length} firmas de
        área
      </div>
    </div>
  );
};

export default AreaSignatureList;