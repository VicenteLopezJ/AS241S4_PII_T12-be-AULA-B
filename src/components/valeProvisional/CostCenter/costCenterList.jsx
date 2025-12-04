import React, { useState, useEffect } from "react";
import { Edit2, Trash2, RotateCcw, Eye } from "lucide-react";
import { CostCenterService } from "../../../services/valeProvisional/costCenterApi";
import "../../../styles/valeProvisional/costCenter/costCenterList.css";

const CostCenterList = ({ onEdit, onView, onDelete, onRestore }) => {
  const [costCenters, setCostCenters] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("A");

  // SOLO UN useEffect
  useEffect(() => {
    loadCostCenters();
    loadAreas();
  }, [statusFilter]); // ← Se ejecuta cuando cambia el filtro

  const loadCostCenters = async () => {
    try {
      setLoading(true);
      console.log("📥 Cargando centros con filtro:", statusFilter);
      const response = await CostCenterService.getAll();
      const costCentersData = response.data.data || [];
      console.log("📊 Total centros cargados:", costCentersData.length);
      
      // Filtra por estado
      const filteredData = costCentersData.filter(cc => cc.STATUS === statusFilter);
      console.log("🎯 Centros después del filtro:", filteredData.length);
      
      setCostCenters(filteredData);
      setError("");
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar centros de costo");
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await CostCenterService.getAreas();
      setAreas(response.data.data || []);
    } catch (error) {
      console.error("Error cargando áreas:", error);
    }
  };

  const handleDelete = async (idCostCenter) => {
    if (!window.confirm("¿Está seguro de eliminar este centro de costo?")) return;

    try {
      console.log("🗑️ ELIMINANDO - ID:", idCostCenter);
      await CostCenterService.delete(idCostCenter);
      console.log("✅ Centro eliminado en backend");
      
      // Recargar manteniendo el filtro actual
      await loadCostCenters();
      
      if (onDelete) onDelete(idCostCenter);
    } catch (error) {
      console.error("Error eliminando:", error);
      setError("Error al eliminar centro de costo");
    }
  };

  const handleRestore = async (idCostCenter) => {
    try {
      console.log("🔄 RESTAURANDO - ID:", idCostCenter, "| Filtro actual:", statusFilter);
      
      await CostCenterService.restore(idCostCenter);
      console.log("✅ Centro restaurado en backend");
      
      // Si estamos en "Inactivos", cambiar automáticamente a "Activos"
      if (statusFilter === 'I') {
        console.log("🎛️ Cambiando filtro a 'Activos' automáticamente");
        setStatusFilter('A');
      } else {
        // Si ya estamos en "Activos", solo recargar
        console.log("🔄 Recargando lista con filtro actual");
        await loadCostCenters();
      }
      
      if (onRestore) onRestore(idCostCenter);
      
    } catch (error) {
      console.error("❌ Error restaurando:", error);
      console.error("🔧 Error response:", error.response?.data);
      setError("Error al restaurar centro de costo");
    }
  };

  // Obtener nombre del área
  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.ID_AREA === areaId);
    return area ? area.AREA_NAME : `ID: ${areaId}`;
  };

  // Filtrar centros de costo
  const filteredCostCenters = costCenters.filter((costCenter) => {
    if (costCenter.STATUS !== statusFilter) return false;

    const searchLower = searchTerm.toLowerCase();
    const areaName = getAreaName(costCenter.AREA_ID).toLowerCase();

    return (
      costCenter.COST_CENTER_NAME?.toLowerCase().includes(searchLower) ||
      costCenter.DESCRIPTION?.toLowerCase().includes(searchLower) ||
      areaName.includes(searchLower) ||
      costCenter.AREA_ID?.toString().includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="vale-provisional-cost-center-loading-container">
        <div className="vale-provisional-cost-center-loading-spinner"></div>
        <p className="vale-provisional-cost-center-loading-text">
          Cargando centros de costo...
        </p>
      </div>
    );
  }

  return (
    <div className="vale-provisional-cost-center-management">
      {/* Controles de búsqueda y filtro */}
      <div className="vale-provisional-cost-center-search-controls">
        <div className="vale-provisional-cost-center-search-input-container">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vale-provisional-cost-center-search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="vale-provisional-cost-center-status-filter"
        >
          <option value="A">Activos</option>
          <option value="I">Inactivos</option>
        </select>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="vale-provisional-cost-center-error-message">
          {error}
          <button 
            onClick={loadCostCenters} 
            className="vale-provisional-cost-center-retry-button"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="vale-provisional-cost-center-table-container">
        <table className="vale-provisional-cost-center-table">
          <thead>
            <tr>
              <th className="vale-provisional-cost-center-table-header">
                CÓDIGO
              </th>
              <th className="vale-provisional-cost-center-table-header">
                NOMBRE DEL CENTRO DE COSTO
              </th>
              <th className="vale-provisional-cost-center-table-header">
                DESCRIPCIÓN
              </th>
              <th className="vale-provisional-cost-center-table-header">
                ÁREA
              </th>
              <th className="vale-provisional-cost-center-table-header">
                ESTADO
              </th>
              <th className="vale-provisional-cost-center-table-header vale-provisional-cost-center-table-header-actions">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCostCenters.map((costCenter, index) => (
              <tr 
                key={costCenter.ID_COST_CENTER} 
                className="vale-provisional-cost-center-table-row"
              >
                <td className="vale-provisional-cost-center-table-cell">
                  <div className="vale-provisional-cost-center-code-container">
                    <div className="vale-provisional-cost-center-code-badge">
                      {index + 1}
                    </div>
                    <span className="vale-provisional-cost-center-code-text">
                      {costCenter.ID_COST_CENTER}
                    </span>
                  </div>
                </td>
                <td className="vale-provisional-cost-center-table-cell">
                  <div className="vale-provisional-cost-center-info">
                    <div className="vale-provisional-cost-center-name">
                      {costCenter.COST_CENTER_NAME}
                    </div>
                  </div>
                </td>
                <td className="vale-provisional-cost-center-table-cell">
                  <div className="vale-provisional-cost-center-description-text">
                    {costCenter.DESCRIPTION || "-"}
                  </div>
                </td>
                <td className="vale-provisional-cost-center-table-cell">
                  <span className="vale-provisional-cost-center-area-badge">
                    {getAreaName(costCenter.AREA_ID)}
                  </span>
                </td>
                <td className="vale-provisional-cost-center-table-cell">
                  <span
                    className={`vale-provisional-cost-center-status-badge ${
                      costCenter.STATUS === "A"
                        ? "vale-provisional-cost-center-status-active"
                        : "vale-provisional-cost-center-status-inactive"
                    }`}
                  >
                    {costCenter.STATUS === "A" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="vale-provisional-cost-center-table-cell">
                  <div className="vale-provisional-cost-center-actions-container">
                    {/* Ver */}
                    <button
                      onClick={() => onView && onView(costCenter)}
                      className="vale-provisional-cost-center-action-btn vale-provisional-cost-center-view-btn"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Editar - Solo disponible para centros activos */}
                    <button
                      onClick={() => onEdit && onEdit(costCenter)}
                      className="vale-provisional-cost-center-action-btn vale-provisional-cost-center-edit-btn"
                      title="Editar"
                      disabled={costCenter.STATUS !== "A"}
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Eliminar o Restaurar */}
                    {costCenter.STATUS === "A" ? (
                      <button
                        onClick={() => handleDelete(costCenter.ID_COST_CENTER)}
                        className="vale-provisional-cost-center-action-btn vale-provisional-cost-center-delete-btn"
                        title="Eliminar (Cambiar a Inactivo)"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(costCenter.ID_COST_CENTER)}
                        className="vale-provisional-cost-center-action-btn vale-provisional-cost-center-restore-btn"
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

        {filteredCostCenters.length === 0 && (
          <div className="vale-provisional-cost-center-empty-state">
            {searchTerm || statusFilter !== "A"
              ? "No se encontraron centros de costo con los filtros aplicados"
              : "No hay centros de costo registrados"}
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="vale-provisional-cost-center-results-counter">
        Mostrando {filteredCostCenters.length} de {costCenters.length} centros
        de costo
      </div>
    </div>
  );
};

export default CostCenterList;