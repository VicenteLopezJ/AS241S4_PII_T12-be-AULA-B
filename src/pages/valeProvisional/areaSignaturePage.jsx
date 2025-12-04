import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { AreaSignatureService } from "../../services/valeProvisional/areaSignatureApi";
import AreaSignatureForm from "../../components/valeProvisional/AreaSignature/areaSignatureForm";
import AreaSignatureList from "../../components/valeProvisional/AreaSignature/areaSignatureList";
import "../../styles/valeProvisional/areaSignature/areaSignaturePage.css";

const AreaSignaturePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);
  const [viewingSignature, setViewingSignature] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleCreate = () => {
    setEditingSignature(null);
    setShowForm(true);
  };

  const handleEdit = (signature) => {
    setEditingSignature(signature);
    setShowForm(true);
  };

  const handleView = (signature) => {
    setViewingSignature(signature);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingSignature(null);
  };

  const handleSubmit = async (formData) => {
    console.log("📨 handleSubmit llamado en AreaSignaturePage:", formData);
    try {
      if (editingSignature) {
        console.log("✏️ Modo edición");
        const updateData = {
          ID_SIGNATURE: editingSignature.ID_SIGNATURE,
          VOUCHER_ID: formData.voucher_id,
          ID_AREA: formData.id_area,
          SIGNATURE_URL: formData.signature_url,
          SIGNATURE_DATE: formData.signature_date,
          MANAGER_NAME: formData.manager_name,
          MANAGER_LASTNAME: formData.manager_lastname,
          MANAGER_POSITION: formData.manager_position,
          AREA: formData.area,
        };

        console.log("📤 Enviando update:", updateData);
        const response = await AreaSignatureService.update(updateData);
        console.log("✅ Update exitoso:", response.data);

        alert("Firma de área actualizada exitosamente");
      } else {
        console.log("🆕 Modo creación");
        const createData = {
          VOUCHER_ID: formData.voucher_id,
          ID_AREA: formData.id_area,
          SIGNATURE_URL: formData.signature_url,
          SIGNATURE_DATE: formData.signature_date,
          MANAGER_NAME: formData.manager_name,
          MANAGER_LASTNAME: formData.manager_lastname,
          MANAGER_POSITION: formData.manager_position,
          AREA: formData.area,
        };

        console.log("📤 Enviando create:", createData);
        const response = await AreaSignatureService.create(createData);
        console.log("✅ Create exitoso:", response.data);

        alert("Firma de área creada exitosamente con estado ACTIVO");
      }
      setShowForm(false);
    } catch (error) {
      console.error("💥 Error completo en handleSubmit:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al guardar la firma de área";
      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSignature(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta firma de área?")) return;
    try {
      await AreaSignatureService.delete(id);
      alert("Firma de área eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting area signature:", error);
      alert("Error al eliminar la firma de área");
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("¿Está seguro de restaurar esta firma de área?")) return;
    try {
      await AreaSignatureService.restore(id);
      alert("Firma de área restaurada exitosamente");
    } catch (error) {
      console.error("Error restoring area signature:", error);
      alert("Error al restaurar la firma de área");
    }
  };

  // Formatear fecha para mostrar en el modal
  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="area-signature-page-container">
      {/* Header */}
      <div className="area-signature-page-header">
        <div className="area-signature-page-title-section">
        </div>
        {!showForm && (
          <button onClick={handleCreate} className="area-signature-page-create-btn">
            <Plus size={20} />
            Nueva Firma
          </button>
        )}
      </div>

      {/* Mostrar Formulario o Lista */}
      {showForm ? (
        <div className="area-signature-form-section">
          <div className="area-signature-form-header">
            <h2 className="area-signature-form-title">
              {editingSignature ? "Editar Firma de Área" : "Nueva Firma de Área"}
            </h2>
          </div>
          <AreaSignatureForm
            initialData={editingSignature}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="area-signature-list-section">
          <AreaSignatureList
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        </div>
      )}

      {/* Modal de Ver Detalles con fondo borroso */}
      {isViewModalOpen && (
        <div className="area-signature-modal-overlay" onClick={closeViewModal}>
          <div className="area-signature-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="area-signature-modal-header">
              <h2 className="area-signature-modal-title">
                📋 Detalles de la Firma
              </h2>
              <button className="area-signature-modal-close" onClick={closeViewModal}>
                <X size={24} />
              </button>
            </div>

            <div className="area-signature-modal-body">
              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">ID de Firma:</label>
                <span className="area-signature-detail-value">
                  {viewingSignature?.ID_SIGNATURE}
                </span>
              </div>

              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">ID del Vale:</label>
                <span className="area-signature-detail-value">
                  #{viewingSignature?.VOUCHER_ID}
                </span>
              </div>

              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">Área:</label>
                <span className="area-signature-detail-value">
                  {viewingSignature?.AREA || `ID: ${viewingSignature?.ID_AREA}`}
                </span>
              </div>

              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">Gerente:</label>
                <span className="area-signature-detail-value">
                  {viewingSignature?.MANAGER_NAME} {viewingSignature?.MANAGER_LASTNAME}
                </span>
              </div>

              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">Cargo:</label>
                <span className="area-signature-detail-value">
                  {viewingSignature?.MANAGER_POSITION || "No especificado"}
                </span>
              </div>

              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">Fecha de Firma:</label>
                <span className="area-signature-detail-value">
                  {formatDate(viewingSignature?.SIGNATURE_DATE)}
                </span>
              </div>

              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">URL de la Firma:</label>
                <div className="area-signature-detail-url">
                  {viewingSignature?.SIGNATURE_URL ? (
                    <a 
                      href={viewingSignature.SIGNATURE_URL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="area-signature-url-link"
                    >
                      {viewingSignature.SIGNATURE_URL}
                    </a>
                  ) : (
                    "No disponible"
                  )}
                </div>
              </div>

              <div className="area-signature-detail-group">
                <label className="area-signature-detail-label">Estado:</label>
                <span
                  className={`area-signature-detail-status ${
                    viewingSignature?.STATUS === "A" 
                      ? "area-signature-status-active" 
                      : "area-signature-status-inactive"
                  }`}
                >
                  {viewingSignature?.STATUS === "A" ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>
            </div>

            <div className="area-signature-modal-footer">
              <button 
                className="area-signature-modal-btn area-signature-modal-btn-cancel" 
                onClick={closeViewModal}
              >
                Cerrar
              </button>
              {viewingSignature?.SIGNATURE_URL && (
                <button 
                  className="area-signature-modal-btn area-signature-modal-btn-primary"
                  onClick={() => window.open(viewingSignature.SIGNATURE_URL, '_blank')}
                >
                  Ver Firma
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaSignaturePage;