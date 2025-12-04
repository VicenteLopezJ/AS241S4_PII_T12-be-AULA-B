import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { areaService } from "../../services/valeProvisional/areaApi";
import AreaForm from "../../components/valeProvisional/Area/areaForm";
import AreaList from "../../components/valeProvisional/Area/areaList";
import Modal from "../../components/valeProvisional/Area/Modal";
import "../../styles/valeProvisional/area/areaPage.css";

const AreaPage = () => {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("A");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAreas();
  }, [statusFilter]);

  useEffect(() => {
    filterAreas();
  }, [searchTerm, areas, statusFilter]);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const response = await areaService.getAll();
      if (response.data.status === "success") {
        setAreas(response.data.data);
      }
    } catch (error) {
      console.error("Error loading areas:", error);
      alert("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const filterAreas = () => {
    let filtered = areas;

    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter(area => area.STATUS === statusFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (area) =>
          area.AREA_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          area.AREA_TYPE?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAreas(filtered);
  };

  const handleCreate = () => {
    setEditingArea(null);
    setIsModalOpen(true);
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingArea) {
        // Modo edición
        const updateData = {
          id_area: editingArea.ID_AREA,
          area_name: formData.area_name,
          area_type: formData.area_type,
        };
        await areaService.update(updateData);
        alert("Área actualizada exitosamente");
      } else {
        // Modo creación
        const createData = {
          area_name: formData.area_name,
          area_type: formData.area_type,
        };
        await areaService.create(createData);
        alert("Área creada exitosamente con estado ACTIVO");
      }
      setIsModalOpen(false);
      loadAreas();
    } catch (error) {
      console.error("Error saving area:", error);
      alert(error.response?.data?.message || "Error al guardar el área");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta área?")) return;

    try {
      await areaService.delete(id);
      alert("Área eliminada exitosamente");
      loadAreas();
    } catch (error) {
      console.error("Error deleting area:", error);
      alert("Error al eliminar el área");
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("¿Está seguro de restaurar esta área?")) return;

    try {
      await areaService.restore(id);
      alert("Área restaurada exitosamente");
      loadAreas();
    } catch (error) {
      console.error("Error restoring area:", error);
      alert("Error al restaurar el área");
    }
  };

  return (
    <div className="area-page">

      {/* Controles de búsqueda y filtros */}
      <div className="area-page-controls">
        <div className="area-search-container">
          <Search className="area-search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="area-search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="area-status-filter"
        >
          <option value="A">Activas</option>
          <option value="I">Inactivas</option>
          <option value="">Todas</option>
        </select>
                <button onClick={handleCreate} className="area-page-create-btn">
          <Plus size={20} />
          Nueva Área
        </button>
      </div>

      {/* Lista de áreas */}
      <div className="area-list-section">
        {loading ? (
          <div className="area-loading-container">
            <div className="area-loading-spinner"></div>
            <p className="area-loading-text">Cargando áreas...</p>
          </div>
        ) : (
          <AreaList
            areas={filteredAreas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        )}
      </div>

      {/* Modal para formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArea ? "Editar Área" : "Crear Nueva Área"}
      >
        <AreaForm
          initialData={editingArea}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AreaPage;