import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, Users, UserCheck, UserX } from "lucide-react";
import { applicantService } from "../../services/valeProvisional/applicantApi";
import { AreaService } from "../../services/valeProvisional/areaApi";
import ApplicantStatsCard from "../../components/valeProvisional/Applicant/StatsCard";
import ApplicantModal from "../../components/valeProvisional/Applicant/Modal";
import ApplicantForm from "../../components/valeProvisional/Applicant/ApplicantForm";
import ApplicantTable from "../../components/valeProvisional/Applicant/ApplicantTable";
import "../../styles/valeProvisional/Applicant/applicantPage.css";

const ApplicantPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("A");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    loadApplicants();
    loadAreas();
  }, [statusFilter]);

  useEffect(() => {
    filterApplicants();
  }, [searchTerm, applicants]);

  const loadAreas = async () => {
    setLoadingAreas(true);
    try {
      const response = await AreaService.getAll();
      
      if (response.data) {
        if (response.data.status === "success" && response.data.data) {
          setAreas(response.data.data);
        } else if (Array.isArray(response.data)) {
          setAreas(response.data);
        } else {
          const possibleData = response.data.areas || response.data.result || response.data.items;
          if (Array.isArray(possibleData)) {
            setAreas(possibleData);
          } else {
            setAreas([]);
          }
        }
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error("Error cargando áreas:", error);
      setError("Error al cargar las áreas");
    } finally {
      setLoadingAreas(false);
    }
  };

  const loadApplicants = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await applicantService.getByStatus(statusFilter);
      if (response.data.status === "success") {
        setApplicants(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error("Error loading applicants:", error);
      setError("Error al cargar los solicitantes");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter((a) => a.STATUS === "A").length,
      inactive: data.filter((a) => a.STATUS === "I").length,
    });
  };

  const filterApplicants = () => {
    if (!searchTerm) {
      setFilteredApplicants(applicants);
      return;
    }

    const filtered = applicants.filter(
      (applicant) =>
        applicant.FIRST_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.LAST_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.IDENTIFICATION_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.COMPANY?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApplicants(filtered);
  };

  const handleCreate = () => {
    setEditingApplicant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (applicant) => {
    setEditingApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingApplicant) {
        const updateData = {
          ID_APPLICANT: editingApplicant.ID_APPLICANT,
          ...formData,
          STATUS: editingApplicant.STATUS || "A",
        };
        await applicantService.update(updateData);
      } else {
        const createData = {
          ...formData,
          STATUS: "A",
        };
        await applicantService.create(createData);
      }
      
      setIsModalOpen(false);
      await loadApplicants();
    } catch (error) {
      console.error("Error guardando solicitante:", error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(`Error al guardar el solicitante: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar este solicitante?")) return;

    try {
      await applicantService.delete(id);
      await loadApplicants();
    } catch (error) {
      console.error("Error deleting applicant:", error);
      setError("Error al eliminar el solicitante");
    }
  };

  const handleRestore = async (id) => {
    if (!confirm("¿Está seguro de restaurar este solicitante?")) return;

    try {
      await applicantService.restore(id);
      await loadApplicants();
    } catch (error) {
      console.error("Error restoring applicant:", error);
      setError("Error al restaurar el solicitante");
    }
  };

  const handleViewDoc = (applicant) => {
    console.log(`Ver documento de ${applicant.FIRST_NAME} ${applicant.LAST_NAME}`);
  };

  const handleRefresh = () => {
    loadApplicants();
    loadAreas();
  };

  return (
    <div className="applicant-page">
      {/* Header Principal */}
      <div className="applicant-page__header">
        <div className="applicant-page__header-content">
          <div className="applicant-page__header-text">
            <h1 className="applicant-page__title">Gestión de Solicitantes</h1>
            <p className="applicant-page__subtitle">
              Administra los solicitantes del sistema de vales provisionales
            </p>
          </div>
          <div className="applicant-page__header-actions">
            <button onClick={handleRefresh} className="applicant-page__btn applicant-page__btn--secondary" title="Actualizar datos">
              <RefreshCw size={20} />
            </button>
            <button onClick={handleCreate} className="applicant-page__btn applicant-page__btn--primary">
              <Plus size={20} />
              Nuevo Solicitante
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="applicant-page__stats-section">
        <div className="applicant-page__stats-grid">
          <ApplicantStatsCard
            title="Total Solicitantes"
            value={stats.total}
            variant="total"
            icon={<Users size={24} />}
            subtitle="Todos los registros"
          />
          <ApplicantStatsCard
            title="Solicitantes Activos"
            value={stats.active}
            variant="active"
            icon={<UserCheck size={24} />}
            subtitle="Registros activos"
          />
          <ApplicantStatsCard
            title="Solicitantes Inactivos"
            value={stats.inactive}
            variant="inactive"
            icon={<UserX size={24} />}
            subtitle="Registros inactivos"
          />
        </div>
      </div>

      {/* Sección de Tabla - SIN FILTROS DUPLICADOS */}
      <div className="applicant-page__table-section">
        {loading ? (
          <div className="applicant-page__loading-state">
            <div className="applicant-page__loading-spinner"></div>
            <p className="applicant-page__loading-text">Cargando solicitantes...</p>
          </div>
        ) : (
          <ApplicantTable
            applicants={filteredApplicants}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onViewDoc={handleViewDoc}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
      </div>

      {/* Modal de Formulario */}
      <ApplicantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApplicant ? "Editar Solicitante" : "Nuevo Solicitante"}
        size="large"
      >
        <ApplicantForm
          initialData={editingApplicant}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          areas={areas}
          loadingAreas={loadingAreas}
        />
      </ApplicantModal>

      {/* Mensaje de Error */}
      {error && (
        <div className="applicant-page__error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")} className="applicant-page__error-close">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicantPage;