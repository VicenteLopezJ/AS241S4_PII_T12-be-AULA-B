import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { CostCenterService } from "../../services/valeProvisional/costCenterApi";
import CostCenterForm from "../../components/valeProvisional/CostCenter/costCenterForm";
import CostCenterList from "../../components/valeProvisional/CostCenter/costCenterList";
import "../../styles/valeProvisional/costCenter/costCenterPage.css";

const CostCenterPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState(null);
  const [viewingCostCenter, setViewingCostCenter] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleCreate = () => {
    setEditingCostCenter(null);
    setShowForm(true);
  };

  const handleEdit = (costCenter) => {
    setEditingCostCenter(costCenter);
    setShowForm(true);
  };

  const handleView = (costCenter) => {
    setViewingCostCenter(costCenter);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingCostCenter(null);
  };

  const handleSubmit = async (formData) => {
    console.log("📨 handleSubmit llamado en CostCenterPage:", formData);
    try {
      if (editingCostCenter) {
        console.log("✏️ Modo edición");
        const updateData = {
          ID_COST_CENTER: editingCostCenter.ID_COST_CENTER,
          COST_CENTER_NAME: formData.cost_center_name,
          DESCRIPTION: formData.description,
          AREA_ID: formData.area_id,
        };

        console.log("📤 Enviando update:", updateData);
        const response = await CostCenterService.update(updateData);
        console.log("✅ Update exitoso:", response.data);

        alert("Centro de costo actualizado exitosamente");
      } else {
        console.log("🆕 Modo creación");
        const createData = {
          COST_CENTER_NAME: formData.cost_center_name,
          DESCRIPTION: formData.description,
          AREA_ID: formData.area_id,
        };

        console.log("📤 Enviando create:", createData);
        const response = await CostCenterService.create(createData);
        console.log("✅ Create exitoso:", response.data);

        alert("Centro de costo creado exitosamente con estado ACTIVO");
      }
      setShowForm(false);
    } catch (error) {
      console.error("💥 Error completo en handleSubmit:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al guardar el centro de costo";
      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCostCenter(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar este centro de costo?")) return;
    try {
      await CostCenterService.delete(id);
      alert("Centro de costo eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting cost center:", error);
      alert("Error al eliminar el centro de costo");
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("¿Está seguro de restaurar este centro de costo?")) return;
    try {
      await CostCenterService.restore(id);
      alert("Centro de costo restaurado exitosamente");
    } catch (error) {
      console.error("Error restoring cost center:", error);
      alert("Error al restaurar el centro de costo");
    }
  };

  return (
    <div className="cost-center-page-container">
      {/* Header */}
      <div className="cost-center-page-header">
        {!showForm && (
          <button onClick={handleCreate} className="cost-center-page-create-btn">
            <Plus size={20} />
            Nuevo Centro de Costo
          </button>
        )}
      </div>

      {/* Mostrar Formulario o Lista */}
      {showForm ? (
        <div className="cost-center-form-section">
          <div className="cost-center-form-header">
            <h2 className="cost-center-form-title">
              {editingCostCenter ? "Editar Centro de Costo" : "Nuevo Centro de Costo"}
            </h2>
          </div>
          <CostCenterForm
            initialData={editingCostCenter}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="cost-center-list-section">
          <CostCenterList
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        </div>
      )}

      {/* Modal de Ver Detalles con fondo borroso */}
      {isViewModalOpen && (
        <div className="cost-center-modal-overlay" onClick={closeViewModal}>
          <div className="cost-center-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cost-center-modal-header">
              <h2 className="cost-center-modal-title">
                📋 Detalles del Centro de Costo
              </h2>
              <button className="cost-center-modal-close" onClick={closeViewModal}>
                <X size={24} />
              </button>
            </div>

            <div className="cost-center-modal-body">
              <div className="cost-center-detail-group">
                <label className="cost-center-detail-label">ID del Centro:</label>
                <span className="cost-center-detail-value">
                  {viewingCostCenter?.ID_COST_CENTER}
                </span>
              </div>

              <div className="cost-center-detail-group">
                <label className="cost-center-detail-label">Nombre:</label>
                <span className="cost-center-detail-value">
                  {viewingCostCenter?.COST_CENTER_NAME}
                </span>
              </div>

              <div className="cost-center-detail-group">
                <label className="cost-center-detail-label">Descripción:</label>
                <span className="cost-center-detail-value">
                  {viewingCostCenter?.DESCRIPTION || "No tiene descripción"}
                </span>
              </div>

              <div className="cost-center-detail-group">
                <label className="cost-center-detail-label">Área ID:</label>
                <span className="cost-center-detail-value">
                  {viewingCostCenter?.AREA_ID}
                </span>
              </div>

              <div className="cost-center-detail-group">
                <label className="cost-center-detail-label">Estado:</label>
                <span
                  className={`cost-center-detail-status ${
                    viewingCostCenter?.STATUS === "A" 
                      ? "cost-center-status-active" 
                      : "cost-center-status-inactive"
                  }`}
                >
                  {viewingCostCenter?.STATUS === "A" ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>
            </div>

            <div className="cost-center-modal-footer">
              <button 
                className="cost-center-modal-btn cost-center-modal-btn-cancel" 
                onClick={closeViewModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCenterPage;