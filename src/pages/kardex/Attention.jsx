import React, { useState, useEffect, useMemo } from "react";
import { attentionService } from "../../services/kardex/attentionService"; 
import AttentionForm from "../../components/kardex/AttentionForm"; 
import Notification from "../../components/kardex/Notification"; 
import ConfirmModal from "../../components/kardex/ConfirmModal"; 
import DetailModal from "../../components/kardex/DetailModal"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../styles/kardex/attention/Attention.css"; 

export default function Attention() {
  const [attentions, setAttentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: ""
  });

  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    title: "",
    data: null
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null
  });

  const [formModal, setFormModal] = useState({
    isOpen: false,
    initialData: null
  });

  useEffect(() => {
    loadAttentions();
  }, []);

  const loadAttentions = async () => {
    try {
      setLoading(true);
      const data = await attentionService.getAll();
      setAttentions(data || []);
    } catch (error) {
      console.error("Error al cargar atenciones:", error);
      showNotification("Error al cargar atenciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "-";
    }
  };

  const getStatusLabel = (status) => {
    const statusStr = String(status).toUpperCase();
    switch (statusStr) {
      case 'A': return 'Activo';
      case 'P': return 'Pendiente';
      case 'C': return 'Completado';
      case 'I': return 'Inactivo';
      default: return statusStr;
    }
  };

  const getStatusBadge = (status) => {
    const statusStr = String(status).toUpperCase();
    let className = "badge ";

    switch (statusStr) {
      case 'P': className += "pending"; break;
      case 'A': className += "active"; break;
      case 'C': className += "completed"; break;
      case 'I': className += "inactive"; break;
      default: className += "default";
    }

    return <span className={className}>{getStatusLabel(status)}</span>;
  };

  const handleDelete = async (attention) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Atención",
      message: `¿Seguro que deseas eliminar la atención de ${attention.firstName} ${attention.lastName}?`,
      onConfirm: async () => {
        try {
          await attentionService.delete(attention.id);
          loadAttentions();
          showNotification("Atención eliminada correctamente");
        } catch (error) {
          console.error("Error eliminando atención:", error);
          showNotification("Error al eliminar atención", "error");
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const handleRestore = async (attention) => {
    try {
      await attentionService.restore(attention.id);
      loadAttentions();
      showNotification("Atención restaurada correctamente");
    } catch (error) {
      console.error("Error restaurando atención:", error);
      showNotification("Error al restaurar atención", "error");
    }
  };

  const handleComplete = async (attention) => {
    setConfirmModal({
      isOpen: true,
      title: "Completar Atención",
      message: `¿Marcar como completada la atención de ${attention.firstName} ${attention.lastName}?`,
      onConfirm: async () => {
        try {
          await attentionService.update(attention.id, { ...attention, status: 'C' });
          loadAttentions();
          showNotification("Atención marcada como completada");
        } catch (error) {
          console.error("Error completando atención:", error);
          showNotification("Error al completar atención", "error");
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await attentionService.update(data.id, data);
        showNotification("Atención actualizada correctamente");
      } else {
        await attentionService.create(data);
        showNotification("Atención registrada correctamente");
      }
      loadAttentions();
      setFormModal({ isOpen: false, initialData: null });
    } catch (error) {
      console.error("Error guardando atención:", error);
      showNotification(`Error al guardar: ${error.message}`, "error");
    }
  };

  const stats = useMemo(() => {
    return {
      total: attentions.length,
      pending: attentions.filter(a => a.status === "P").length,
      active: attentions.filter(a => a.status === "A").length,
      completed: attentions.filter(a => a.status === "C").length,
      inactive: attentions.filter(a => a.status === "I").length,
      today: attentions.filter(a => {
        if (!a.dateAttended) return false;
        try {
          const today = new Date().toDateString();
          const attentionDate = new Date(a.dateAttended).toDateString();
          return today === attentionDate;
        } catch {
          return false;
        }
      }).length
    };
  }, [attentions]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return attentions.filter((att) => {
      const matchesQuery = !q ||
        (att.firstName && att.firstName.toLowerCase().includes(q)) ||
        (att.lastName && att.lastName.toLowerCase().includes(q)) ||
        (att.dni && att.dni.toLowerCase().includes(q)) ||
        (att.diagnosis && att.diagnosis.toLowerCase().includes(q)) ||
        String(att.id).includes(q);

      const matchesStatus = !statusFilter || att.status === statusFilter;

      const matchesDate = !dateFilter ||
        (att.dateAttended &&
          formatDateForDisplay(att.dateAttended) ===
          formatDateForDisplay(new Date(dateFilter).toISOString()));

      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [attentions, query, statusFilter, dateFilter]);

  const downloadPDF = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Atenciones Médicas", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["ID", "Fecha", "Paciente", "Edad", "Género", "DNI", "Estado"]],
      body: filtered.map(a => [
        a.id,
        formatDateForDisplay(a.dateAttended),
        `${a.firstName} ${a.lastName}`,
        a.age || "-",
        a.gender === 'M' ? 'M' : a.gender === 'F' ? 'F' : '-',
        a.dni || "-",
        getStatusLabel(a.status)
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`atenciones_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadExcel = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const data = filtered.map(a => ({
      ID: a.id,
      Fecha: formatDateForDisplay(a.dateAttended),
      Paciente: `${a.firstName} ${a.lastName}`,
      Edad: a.age,
      Género: a.gender === 'M' ? 'Masculino' : 'Femenino',
      DNI: a.dni,
      Ocupación: a.occupation,
      Programa: a.program,
      Diagnóstico: a.diagnosis,
      Tratamiento: a.treatment,
      Estado: getStatusLabel(a.status)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Atenciones");
    XLSX.writeFile(wb, `atenciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando atenciones...</p>
      </div>
    );
  }

  return (
    <div className="attention-container">
      <h1 className="title">Gestión de Atenciones Médicas</h1>

      <div className="stats-cards">
        <div className="stat-card total">
          <h3>Total</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card active">
          <h3>Activas</h3>
          <p className="stat-value">{stats.active}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pendientes</h3>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card completed">
          <h3>Completadas</h3>
          <p className="stat-value">{stats.completed}</p>
        </div>
        <div className="stat-card inactive">
          <h3>Inactivas</h3>
          <p className="stat-value">{stats.inactive}</p>
        </div>
        <div className="stat-card today">
          <h3>Hoy</h3>
          <p className="stat-value">{stats.today}</p>
        </div>
      </div>

      {/* CONTROLES MEJORADOS - COMO INVENTARIO */}
      <div className="controls">
        <input
          className="search-input"
          placeholder="Buscar por nombre, DNI, diagnóstico..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los estados</option>
          <option value="P">Pendientes</option>
          <option value="A">Activas</option>
          <option value="C">Completadas</option>
          <option value="I">Inactivas</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="date-filter"
          placeholder="Filtrar por fecha"
        />

        <button
          className="btn add-btn"
          onClick={() => setFormModal({ isOpen: true, initialData: null })}
        >
          ➕ Nueva Atención
        </button>

        <button className="btn pdf" onClick={downloadPDF} disabled={filtered.length === 0}>
          📄 PDF
        </button>

        <button className="btn excel" onClick={downloadExcel} disabled={filtered.length === 0}>
          📊 Excel
        </button>

        <button
          className="btn refresh"
          onClick={loadAttentions}
          title="Actualizar"
        >
          ↻
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-count">
            Mostrando {filtered.length} de {attentions.length} atenciones
          </span>
        </div>

        <table className="attention-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Edad</th>
              <th>Género</th>
              <th>DNI</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="empty-state">
                    <p>No se encontraron atenciones</p>
                    <button
                      className="btn add-btn"
                      onClick={() => setFormModal({ isOpen: true, initialData: null })}
                    >
                      ➕ Crear primera atención
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((attention) => {
                const isInactive = attention.status === "I";

                return (
                  <tr key={attention.id} className={isInactive ? 'inactive-row' : ''}>
                    <td>#{attention.id}</td>
                    <td>{formatDateForDisplay(attention.dateAttended)}</td>
                    <td>
                      <strong>{attention.firstName} {attention.lastName}</strong>
                      {attention.diagnosis && <small><br />{attention.diagnosis}</small>}
                    </td>
                    <td>{attention.age || "-"}</td>
                    <td>{attention.gender === 'M' ? 'M' : attention.gender === 'F' ? 'F' : '-'}</td>
                    <td>{attention.dni || "-"}</td>
                    <td>{getStatusBadge(attention.status)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="view"
                          onClick={() => setFormModal({ isOpen: true, initialData: attention, readOnly: true })}
                          title="Ver detalles"
                        >
                          👁 Ver
                        </button>

                        {attention.status === "P" || attention.status === "A" ? (
                          <>
                            <button
                              className="edit"
                              onClick={() => setFormModal({ isOpen: true, initialData: attention })}
                              title="Editar"
                            >
                              ✏ Editar
                            </button>

                            {attention.status === "P" && (
                              <button
                                className="complete"
                                onClick={() => handleComplete(attention)}
                                title="Marcar como completada"
                              >
                                ✓ Completar
                              </button>
                            )}

                            <button
                              className="delete"
                              onClick={() => handleDelete(attention)}
                              title="Eliminar"
                            >
                              🗑 Eliminar
                            </button>
                          </>
                        ) : attention.status === "I" ? (
                          <button
                            className="restore"
                            onClick={() => handleRestore(attention)}
                            title="Restaurar"
                          >
                            ♻ Restaurar
                          </button>
                        ) : (
                          <button
                            className="edit"
                            onClick={() => setFormModal({ isOpen: true, initialData: attention })}
                            title="Editar"
                          >
                            ✏ Editar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {formModal.isOpen && (
        <AttentionForm
          onClose={() => setFormModal({ isOpen: false, initialData: null })}
          onSave={handleSave}
          initialData={formModal.initialData}
          readOnly={formModal.readOnly || false} 
        />
      )}

      {detailModal.isOpen && detailModal.data && (
        <DetailModal
          title={detailModal.title}
          data={detailModal.data}
          onClose={() => setDetailModal({ isOpen: false, data: null })}
        />
      )}

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />
      )}
    </div>
  );
}