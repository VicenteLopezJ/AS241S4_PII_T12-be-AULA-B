// src/components/valeProvisional/Tracking/VoucherTracking.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  Filter,
  RefreshCw,
  X,
  FileText,
  Send,
  AlertCircle,
  CheckSquare,
  User,
  DollarSign,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { TrackingService } from "../../../services/valeProvisional/trackingApi";
import "../../../styles/valeProvisional/Tracking/voucherTracking.css";
import CompleteProcessButton from "./CompleteProcessButton";

const VoucherTracking = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadTrackings();
  }, []);

  const loadTrackings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando trackings desde API...");

      const response = await TrackingService.getAll();
      console.log("📦 Respuesta completa:", response);

      // Axios devuelve los datos en response.data
      const responseData = response.data;

      if (responseData.status === "success") {
        console.log(
          "✅ Trackings cargados:",
          responseData.data?.length || 0,
          "registros"
        );
        setTrackings(responseData.data || []);
      } else {
        throw new Error(
          responseData.message || "Error en la respuesta del servidor"
        );
      }
    } catch (error) {
      console.error("❌ Error cargando trackings:", error);
      setError(`Error al cargar los seguimientos: ${error.message}`);
      setTrackings([]); // Asegurar que esté vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Estados del tracking
  const getTrackingStatusInfo = (status) => {
    const statusMap = {
      P: {
        label: "Pendiente de Entrega",
        color: "#F59E0B",
        icon: <Clock size={14} />,
      },
      D: {
        label: "Entregado",
        color: "#10B981",
        icon: <CheckCircle size={14} />,
      },
      J: {
        label: "Justificado",
        color: "#8B5CF6",
        icon: <FileText size={14} />,
      },
      O: {
        label: "Vencido",
        color: "#EF4444",
        icon: <AlertCircle size={14} />,
      },
      C: {
        label: "Completado",
        color: "#3B82F6",
        icon: <CheckSquare size={14} />,
      },
      A: { label: "Activo", color: "#10B981", icon: <CheckCircle size={14} /> },
      I: { label: "Inactivo", color: "#6B7280", icon: <X size={14} /> },
    };
    return (
      statusMap[status] || {
        label: status,
        color: "#6B7280",
        icon: <FileText size={14} />,
      }
    );
  };

  // Formateadores
  const formatDate = (dateString) => {
    if (!dateString) return "No asignada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES");
    } catch {
      return "Fecha inválida";
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Calcular días hasta/deadline
  const getDaysUntilDeadline = (deadlineDate) => {
    if (!deadlineDate) return null;
    try {
      const today = new Date();
      const deadline = new Date(deadlineDate);
      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // Verificar si está vencido
  const isOverdue = (deadlineDate) => {
    const daysUntil = getDaysUntilDeadline(deadlineDate);
    return daysUntil !== null && daysUntil < 0;
  };

  // Filtrar trackings
  const filteredTrackings = trackings.filter((tracking) => {
    const matchesSearch =
      searchTerm === "" ||
      (tracking.CORRELATIVE || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (tracking.FIRST_NAME || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (tracking.LAST_NAME || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || tracking.STATUS === selectedStatus;

    // Filtro por pestañas
    let matchesTab = true;
    if (activeTab === "pending") {
      matchesTab = tracking.STATUS === "P";
    } else if (activeTab === "overdue") {
      matchesTab = isOverdue(tracking.DEADLINE_DATE);
    } else if (activeTab === "delivered") {
      matchesTab = tracking.STATUS === "D";
    }

    return matchesSearch && matchesStatus && matchesTab;
  });

  // Estadísticas
  const stats = {
    total: trackings.length,
    pending: trackings.filter((t) => t.STATUS === "P").length,
    delivered: trackings.filter((t) => t.STATUS === "D").length,
    overdue: trackings.filter((t) => isOverdue(t.DEADLINE_DATE)).length,
    completed: trackings.filter((t) => t.STATUS === "C").length,
  };

  // Manejo de modales
  const handleViewTracking = (tracking) => {
    setSelectedTracking(tracking);
    setShowTrackingModal(true);
  };

  const handleCloseModals = () => {
    setShowTrackingModal(false);
    setSelectedTracking(null);
  };

  if (loading) {
    return (
      <div className="vale-provisional-tracking-loading">
        <Loader className="vale-provisional-tracking-loading-spinner" />
        <p>Cargando seguimientos...</p>
      </div>
    );
  }

  return (
    <div className="vale-provisional-tracking">
      {/* Header */}
      <div className="vale-provisional-tracking-header">
        <div className="vale-provisional-tracking-header-main">
          <h1>Sistema de Seguimiento</h1>
          <p>Gestión y monitoreo de entregas de vales</p>
          {error && (
            <div className="vale-provisional-tracking-error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
      {/* Pestañas */}
      <div className="vale-provisional-tracking-tabs">
        <button
          className={`vale-provisional-tracking-tab-btn ${activeTab === "all" ? "vale-provisional-tracking-tab-active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Todos ({stats.total})
        </button>
        <button
          className={`vale-provisional-tracking-tab-btn ${activeTab === "pending" ? "vale-provisional-tracking-tab-active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pendientes ({stats.pending})
        </button>
        <button
          className={`vale-provisional-tracking-tab-btn ${activeTab === "overdue" ? "vale-provisional-tracking-tab-active" : ""}`}
          onClick={() => setActiveTab("overdue")}
        >
          Vencidos ({stats.overdue})
        </button>
        <button
          className={`vale-provisional-tracking-tab-btn ${activeTab === "delivered" ? "vale-provisional-tracking-tab-active" : ""}`}
          onClick={() => setActiveTab("delivered")}
        >
          Entregados ({stats.delivered})
        </button>
      </div>
      {/* Controles */}
      <div className="vale-provisional-tracking-controls">
        <div className="vale-provisional-tracking-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por código, nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="vale-provisional-tracking-filter-box">
          <Filter size={16} />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="P">Pendientes</option>
            <option value="J">Justificados</option>
            <option value="C">Completados</option>
          </select>
        </div>
      </div>
      {/* Lista de seguimientos */}
      <div className="vale-provisional-tracking-list">
        <div className="vale-provisional-tracking-list-header">
          <h3>Seguimientos de Vales</h3>
          <span className="vale-provisional-tracking-results-count">
            {filteredTrackings.length} de {trackings.length} registros
          </span>
        </div>

        {filteredTrackings.length > 0 ? (
          <div className="vale-provisional-trackings-grid">
            {filteredTrackings.map((tracking) => {
              console.log("🔍 Datos del tracking:", tracking); // ← Agrega esta línea
              const statusInfo = getTrackingStatusInfo(tracking.STATUS);
              const daysUntilDeadline = getDaysUntilDeadline(
                tracking.DEADLINE_DATE
              );
              const overdue = isOverdue(tracking.DEADLINE_DATE);

              return (
                <div key={tracking.ID_TRACKING} className="vale-provisional-tracking-card">
                  <div className="vale-provisional-tracking-card-header">
                    <div className="vale-provisional-tracking-info">
                      <strong>Vale #{tracking.CORRELATIVE}</strong>
                      <span className="vale-provisional-tracking-applicant">
                        {tracking.FIRST_NAME} {tracking.LAST_NAME}
                      </span>
                    </div>
                    <div
                      className="vale-provisional-tracking-status-badge"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="vale-provisional-tracking-card-body">
                    <div className="vale-provisional-tracking-dates-info">
                      <div className="vale-provisional-tracking-date-item">
                        <Calendar size={14} />
                        <span>
                          Entrega: {formatDate(tracking.DELIVERY_DATE)}
                        </span>
                      </div>
                      <div className="vale-provisional-tracking-date-item">
                        <Clock size={14} />
                        <span>
                          Límite: {formatDate(tracking.DEADLINE_DATE)}
                        </span>
                        {daysUntilDeadline !== null && (
                          <span
                            className={`vale-provisional-tracking-days-indicator ${
                              overdue
                                ? "vale-provisional-tracking-days-overdue"
                                : daysUntilDeadline <= 3
                                ? "vale-provisional-tracking-days-warning"
                                : "vale-provisional-tracking-days-normal"
                            }`}
                          >
                            {overdue
                              ? `Vencido hace ${Math.abs(
                                  daysUntilDeadline
                                )} días`
                              : `${daysUntilDeadline} días`}
                          </span>
                        )}
                      </div>
                      <div className="vale-provisional-tracking-date-item">
                        <FileText size={14} />
                        <span>
                          Justificación:{" "}
                          {formatDate(tracking.JUSTIFICATION_DATE)}
                        </span>
                      </div>
                    </div>

                    <div className="vale-provisional-tracking-notification-info">
                      <span>Notificación: {tracking.NOTIFICATION_SENT}</span>
                    </div>
                  </div>

                  <div className="vale-provisional-tracking-card-actions">
                    <button
                      onClick={() => handleViewTracking(tracking)}
                      className="vale-provisional-tracking-btn-view"
                    >
                      <Eye size={16} />
                      Detalles
                    </button>

                    <CompleteProcessButton
                      voucher={tracking}
                      onCompleted={loadTrackings}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="vale-provisional-tracking-empty-state">
            <FileText size={48} />
            <p>No se encontraron seguimientos</p>
            <small>
              {trackings.length === 0
                ? "No hay datos de seguimiento en el sistema"
                : "No hay resultados que coincidan con los filtros aplicados"}
            </small>
          </div>
        )}
      </div>
      {/* Modal de Detalles de Tracking */}
      {showTrackingModal && selectedTracking && (
        <div className="vale-provisional-tracking-modal-overlay vale-provisional-tracking-dark-overlay" onClick={handleCloseModals}>
          <div
            className="vale-provisional-tracking-modal-content vale-provisional-tracking-dark-card-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vale-provisional-tracking-modal-header vale-provisional-tracking-dark-header">
              <h2>Detalles del Seguimiento</h2>
              <button
                className="vale-provisional-tracking-modal-close-btn vale-provisional-tracking-dark-close"
                onClick={handleCloseModals}
              >
                <X size={20} />
              </button>
            </div>

            <div className="vale-provisional-tracking-modal-body">
              <div className="vale-provisional-tracking-details-card vale-provisional-tracking-dark-card">
                {/* Header de la tarjeta */}
                <div className="vale-provisional-tracking-card-header-main vale-provisional-tracking-dark-card-header">
                  <div className="vale-provisional-tracking-user-info">
                    <User size={20} />
                    <div>
                      <h3>
                        {selectedTracking.FIRST_NAME}{" "}
                        {selectedTracking.LAST_NAME}
                      </h3>
                      <p>Solicitante</p>
                    </div>
                  </div>
                  <div className="vale-provisional-tracking-voucher-info">
                    <DollarSign size={20} />
                    <div>
                      <h3>#{selectedTracking.CORRELATIVE}</h3>
                      <p>N° de Vale</p>
                    </div>
                  </div>
                </div>

                {/* Estado principal */}
                <div className="vale-provisional-tracking-card-status-section vale-provisional-tracking-dark-status">
                  <div
                    className="vale-provisional-tracking-main-status-badge"
                    style={{
                      backgroundColor: getTrackingStatusInfo(
                        selectedTracking.STATUS
                      ).color,
                    }}
                  >
                    {getTrackingStatusInfo(selectedTracking.STATUS).icon}
                    <span>
                      {getTrackingStatusInfo(selectedTracking.STATUS).label}
                    </span>
                  </div>
                  {isOverdue(selectedTracking.DEADLINE_DATE) && (
                    <div className="vale-provisional-tracking-overdue-alert">
                      <AlertTriangle size={16} />
                      <span>VENCIDO</span>
                    </div>
                  )}
                </div>

                {/* Fechas en diseño lineal */}
                <div className="vale-provisional-tracking-card-dates-section vale-provisional-tracking-dark-dates">
                  <div className="vale-provisional-tracking-date-line">
                    <div className="vale-provisional-tracking-modal-date-item">
                      <Calendar size={16} />
                      <div>
                        <label>Entrega</label>
                        <span>
                          {formatDate(selectedTracking.DELIVERY_DATE)}
                        </span>
                      </div>
                    </div>

                    <div className="vale-provisional-tracking-modal-date-item">
                      <Clock size={16} />
                      <div>
                        <label>Límite</label>
                        <span>
                          {formatDate(selectedTracking.DEADLINE_DATE)}
                        </span>
                      </div>
                    </div>

                    <div className="vale-provisional-tracking-modal-date-item">
                      <FileText size={16} />
                      <div>
                        <label>Justificación</label>
                        <span>
                          {formatDate(selectedTracking.JUSTIFICATION_DATE)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="vale-provisional-tracking-card-additional-info vale-provisional-tracking-dark-additional">
                  <div className="vale-provisional-tracking-modal-info-item">
                    <Send size={16} />
                    <div>
                      <label>Notificación</label>
                      <span>{selectedTracking.NOTIFICATION_SENT}</span>
                    </div>
                  </div>

                  {selectedTracking.DEADLINE_DATE && (
                    <div className="vale-provisional-tracking-modal-info-item">
                      <AlertCircle size={16} />
                      <div>
                        <label>Tiempo restante</label>
                        <span
                          className={`vale-provisional-tracking-time-remaining ${
                            isOverdue(selectedTracking.DEADLINE_DATE)
                              ? "vale-provisional-tracking-time-overdue"
                              : getDaysUntilDeadline(
                                  selectedTracking.DEADLINE_DATE
                                ) <= 3
                              ? "vale-provisional-tracking-time-warning"
                              : "vale-provisional-tracking-time-normal"
                          }`}
                        >
                          {isOverdue(selectedTracking.DEADLINE_DATE)
                            ? `Vencido hace ${Math.abs(
                                getDaysUntilDeadline(
                                  selectedTracking.DEADLINE_DATE
                                )
                              )} días`
                            : `${getDaysUntilDeadline(
                                selectedTracking.DEADLINE_DATE
                              )} días restantes`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="vale-provisional-tracking-modal-actions">
              <CompleteProcessButton
                voucher={selectedTracking}
                onCompleted={() => {
                  handleCloseModals();
                  loadTrackings();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherTracking;