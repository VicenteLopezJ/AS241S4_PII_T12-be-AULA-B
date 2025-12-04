import React, { useEffect, useMemo, useState } from "react";
import { proveedorService } from "../../services/kardex/proveedorService"; 
import ProveedorForm from "../../components/kardex/ProveedorForm"; 
import Notification from "../../components/kardex/Notification"; 
import ConfirmModal from "../../components/kardex/ConfirmModal"; 
import DetailModal from "../../components/kardex/DetailModal"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../styles/kardex/proveedor/Proveedor.css";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
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
    initialData: null,
    readOnly: false
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const data = await proveedorService.getAll();
      setProveedores(data || []);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      showNotification("Error al cargar proveedores", "error");
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

  const handleDelete = (id, razonSocial) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Seguro que deseas eliminar el proveedor "${razonSocial}"?`,
      onConfirm: async () => {
        try {
          await proveedorService.delete(id);
          loadProveedores();
          showNotification("Proveedor eliminado correctamente");
        } catch (error) {
          console.error("Error eliminando proveedor:", error);
          showNotification("Error al eliminar proveedor", "error");
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const handleRestore = async (id, razonSocial) => {
    try {
      await proveedorService.restore(id);
      loadProveedores();
      showNotification("Proveedor restaurado correctamente", "success");
    } catch (error) {
      console.error("Error restaurando proveedor:", error);
      showNotification("Error al restaurar proveedor", "error");
    }
  };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await proveedorService.update(data.id, data);
        showNotification("Proveedor actualizado correctamente");
      } else {
        await proveedorService.create(data);
        showNotification("Proveedor registrado correctamente");
      }
      loadProveedores();
      setFormModal({ isOpen: false, initialData: null, readOnly: false });
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      showNotification(`Error al guardar: ${error.message}`, "error");
    }
  };

  const stats = useMemo(() => {
    return {
      total: proveedores.length,
      activos: proveedores.filter(p => p.estado === "A" || p.estado === "Activo").length,
      inactivos: proveedores.filter(p => p.estado === "I" || p.estado === "Inactivo").length,
      sinCorreo: proveedores.filter(p => !p.correo || p.correo.trim() === "").length
    };
  }, [proveedores]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return proveedores.filter((p) => {
      const matchesQuery = !q ||
        (p.razonSocial && p.razonSocial.toLowerCase().includes(q)) ||
        (p.correo && p.correo.toLowerCase().includes(q)) ||
        (p.ruc && p.ruc.includes(q)) ||
        (p.telefono && p.telefono.includes(q));

      const matchesEstado = !filtroEstado ||
        (filtroEstado === "A" && (p.estado === "A" || p.estado === "Activo")) ||
        (filtroEstado === "I" && (p.estado === "I" || p.estado === "Inactivo"));

      return matchesQuery && matchesEstado;
    });
  }, [proveedores, query, filtroEstado]);

  const downloadPDF = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Proveedores", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["ID", "Razón Social", "RUC", "Teléfono", "Correo", "Estado"]],
      body: filtered.map(p => [
        p.id || p.idProveedor,
        p.razonSocial || "Sin nombre",
        p.ruc || "Sin RUC",
        p.telefono || "Sin teléfono",
        p.correo || "Sin correo",
        p.estado === "A" || p.estado === "Activo" ? "Activo" : "Inactivo"
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`proveedores_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadExcel = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const data = filtered.map(p => ({
      ID: p.id || p.idProveedor,
      "Razón Social": p.razonSocial || "Sin nombre",
      RUC: p.ruc || "Sin RUC",
      Teléfono: p.telefono || "Sin teléfono",
      Correo: p.correo || "Sin correo",
      Estado: p.estado === "A" || p.estado === "Activo" ? "Activo" : "Inactivo"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
    XLSX.writeFile(wb, `proveedores_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div className="proveedor-container">
      <h1 className="title">Gestión de Proveedores</h1>

      <div className="stats-cards">
        <div className="stat-card total">
          <h3>Total</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card active">
          <h3>Activos</h3>
          <p className="stat-value">{stats.activos}</p>
        </div>
        <div className="stat-card inactive">
          <h3>Inactivos</h3>
          <p className="stat-value">{stats.inactivos}</p>
        </div>
        <div className="stat-card warning">
          <h3>Sin Correo</h3>
          <p className="stat-value">{stats.sinCorreo}</p>
        </div>
      </div>

      {/* CONTROLES MEJORADOS - COMO INVENTARIO */}
      <div className="controls">
        <input
          className="search-input"
          placeholder="Buscar por razón social, RUC, teléfono o correo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los estados</option>
          <option value="A">Activos</option>
          <option value="I">Inactivos</option>
        </select>

        <button
          className="btn add-btn"
          onClick={() => setFormModal({ isOpen: true, initialData: null, readOnly: false })}
        >
          ➕ Nuevo Proveedor
        </button>

        <button className="btn pdf" onClick={downloadPDF} disabled={filtered.length === 0}>
          📄 PDF
        </button>

        <button className="btn excel" onClick={downloadExcel} disabled={filtered.length === 0}>
          📊 Excel
        </button>

        <button
          className="btn refresh"
          onClick={loadProveedores}
          title="Actualizar"
        >
          ↻
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-count">
            Mostrando {filtered.length} de {proveedores.length} proveedores
          </span>
        </div>

        <table className="proveedor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Razón Social</th>
              <th>RUC</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="empty-state">
                    <p>No se encontraron proveedores</p>
                    <button
                      className="btn add-btn"
                      onClick={() => setFormModal({ isOpen: true, initialData: null, readOnly: false })}
                    >
                      ➕ Crear primer proveedor
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id || p.idProveedor} className={p.estado === "I" || p.estado === "Inactivo" ? 'inactive-row' : ''}>
                  <td>#{p.id || p.idProveedor}</td>
                  <td>
                    <strong>{p.razonSocial || "Sin nombre"}</strong>
                    {p.direccion && <small><br />{p.direccion}</small>}
                  </td>
                  <td>{p.ruc || "Sin RUC"}</td>
                  <td>{p.telefono || "Sin teléfono"}</td>
                  <td>{p.correo || "Sin correo"}</td>
                  <td>
                    <span className={`badge ${p.estado === "A" || p.estado === "Activo" ? "active" : "inactive"}`}>
                      {p.estado === "A" || p.estado === "Activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="view"
                        onClick={() => setFormModal({ isOpen: true, initialData: p, readOnly: true })}
                        title="Ver detalles"
                      >
                        👁 Ver
                      </button>

                      {(p.estado === "A" || p.estado === "Activo") ? (
                        <>
                          <button
                            className="edit"
                            onClick={() => setFormModal({ isOpen: true, initialData: p, readOnly: false })}
                            title="Editar"
                          >
                            ✏ Editar
                          </button>
                          <button
                            className="delete"
                            onClick={() => handleDelete(p.id || p.idProveedor, p.razonSocial || "este proveedor")}
                            title="Eliminar"
                          >
                            🗑 Eliminar
                          </button>
                        </>
                      ) : (
                        <button
                          className="restore"
                          onClick={() => handleRestore(p.id || p.idProveedor, p.razonSocial || "este proveedor")}
                          title="Restaurar"
                        >
                          ♻ Restaurar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formModal.isOpen && (
        <ProveedorForm
          onClose={() => setFormModal({ isOpen: false, initialData: null, readOnly: false })}
          onSave={handleSave}
          initialData={formModal.initialData}
          readOnly={formModal.readOnly || false} // ← AGREGAR
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