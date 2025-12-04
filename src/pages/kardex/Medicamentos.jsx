import React, { useState, useMemo, useEffect } from "react";
import MedicationForm from "../../components/kardex/MedicationForm"; 
import Notification from "../../components/kardex/Notification"; 
import ConfirmModal from "../../components/kardex/ConfirmModal"; 
import DetailModal from "../../components/kardex/DetailModal"; 
import { medicamentoService } from "../../services/kardex/medicamentoService"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../styles/kardex/medicamentos/Medicamentos.css";

export default function Medicamentos() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPresentacion, setFiltroPresentacion] = useState("");

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
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    try {
      setLoading(true);
      const data = await medicamentoService.getAll();
      setMeds(data || []);
    } catch (error) {
      console.error("Error al cargar medicamentos:", error);
      showNotification("Error al cargar medicamentos", "error");
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

  const handleDelete = (id, nombre) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Seguro que deseas eliminar el medicamento "${nombre}"?`,
      onConfirm: async () => {
        try {
          await medicamentoService.delete(id);
          loadMedicamentos();
          showNotification("Medicamento eliminado correctamente");
        } catch (error) {
          console.error("Error eliminando medicamento:", error);
          showNotification("Error al eliminar medicamento", "error");
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const handleRestore = async (id, nombre) => {
    try {
      await medicamentoService.restore(id);
      loadMedicamentos();
      showNotification("Medicamento restaurado correctamente", "success");
    } catch (error) {
      console.error("Error restaurando medicamento:", error);
      showNotification("Error al restaurar medicamento", "error");
    }
  };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await medicamentoService.update(data.id, data);
        showNotification("Medicamento actualizado correctamente");
      } else {
        await medicamentoService.create(data);
        showNotification("Medicamento registrada correctamente");
      }
      loadMedicamentos();
      setFormModal({ isOpen: false, initialData: null, readOnly: false });
    } catch (error) {
      console.error("Error guardando medicamento:", error);
      showNotification(`Error al guardar: ${error.message}`, "error");
    }
  };

  const stats = useMemo(() => {
    return {
      total: meds.length,
      activos: meds.filter(m => m.estado === "A").length,
      inactivos: meds.filter(m => m.estado === "I").length,
      categorias: [...new Set(meds.map(m => m.categoria))].length
    };
  }, [meds]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return meds.filter((m) => {
      const matchesQuery = !q ||
        (m.nombre && m.nombre.toLowerCase().includes(q)) ||
        (m.descripcion && m.descripcion.toLowerCase().includes(q)) ||
        (m.categoria && m.categoria.toLowerCase().includes(q)) ||
        String(m.id).includes(q);

      const matchesCategoria = !filtroCategoria || m.categoria === filtroCategoria;
      const matchesEstado = !filtroEstado || m.estado === filtroEstado;
      const matchesPresentacion = !filtroPresentacion || m.presentacion === filtroPresentacion;

      return matchesQuery && matchesCategoria && matchesEstado && matchesPresentacion;
    });
  }, [meds, query, filtroCategoria, filtroEstado, filtroPresentacion]);

  const downloadPDF = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Medicamentos", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["ID", "Nombre", "Presentación", "Categoría", "Estado"]],
      body: filtered.map(m => [
        m.id,
        m.nombre || "Sin nombre",
        m.presentacion || "Sin presentación",
        m.categoria || "Sin categoría",
        m.estado === "A" ? "Activo" : "Inactivo"
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`medicamentos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadExcel = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const data = filtered.map(m => ({
      ID: m.id,
      Nombre: m.nombre || "Sin nombre",
      Presentación: m.presentacion || "Sin presentación",
      Categoría: m.categoria || "Sin categoría",
      Estado: m.estado === "A" ? "Activo" : "Inactivo",
      Descripción: m.descripcion || "Sin descripción"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Medicamentos");
    XLSX.writeFile(wb, `medicamentos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const categorias = [...new Set(meds.map(m => m.categoria).filter(Boolean))];
  const presentaciones = [...new Set(meds.map(m => m.presentacion).filter(Boolean))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando medicamentos...</p>
      </div>
    );
  }

  return (
    <div className="medicamentos-container">
      <h1 className="title">Gestión de Medicamentos</h1>

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
          <h3>Categorías</h3>
          <p className="stat-value">{stats.categorias}</p>
        </div>
      </div>

      {/* CONTROLES MEJORADOS - COMO INVENTARIO */}
      <div className="controls">
        <input
          className="search-input"
          placeholder="Buscar por nombre, categoría o descripción..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filtroPresentacion}
          onChange={(e) => setFiltroPresentacion(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las presentaciones</option>
          {presentaciones.map((pres) => (
            <option key={pres} value={pres}>{pres}</option>
          ))}
        </select>

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
          ➕ Nuevo Medicamento
        </button>

        <button className="btn pdf" onClick={downloadPDF} disabled={filtered.length === 0}>
          📄 PDF
        </button>

        <button className="btn excel" onClick={downloadExcel} disabled={filtered.length === 0}>
          📊 Excel
        </button>

        <button
          className="btn refresh"
          onClick={loadMedicamentos}
          title="Actualizar"
        >
          ↻
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-count">
            Mostrando {filtered.length} de {meds.length} medicamentos
          </span>
        </div>

        <table className="medicamentos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Presentación</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  <div className="empty-state">
                    <p>No se encontraron medicamentos</p>
                    <button
                      className="btn add-btn"
                      onClick={() => setFormModal({ isOpen: true, initialData: null, readOnly: false })}
                    >
                      ➕ Crear primer medicamento
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className={m.estado === "I" ? 'inactive-row' : ''}>
                  <td>#{m.id}</td>
                  <td>
                    <strong>{m.nombre || "Sin nombre"}</strong>
                    {m.descripcion && <small><br />{m.descripcion}</small>}
                  </td>
                  <td>{m.presentacion || "Sin presentación"}</td>
                  <td>{m.categoria || "Sin categoría"}</td>
                  <td>
                    <span className={`badge ${m.estado === "A" ? "active" : "inactive"}`}>
                      {m.estado === "A" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="view"
                        onClick={() => setFormModal({ isOpen: true, initialData: m, readOnly: true })}
                        title="Ver detalles"
                      >
                        👁 Ver
                      </button>

                      {m.estado === "A" ? (
                        <>
                          <button
                            className="edit"
                            onClick={() => setFormModal({ isOpen: true, initialData: m, readOnly: false })}
                            title="Editar"
                          >
                            ✏ Editar
                          </button>
                          <button
                            className="delete"
                            onClick={() => handleDelete(m.id, m.nombre || "este medicamento")}
                            title="Eliminar"
                          >
                            🗑 Eliminar
                          </button>
                        </>
                      ) : (
                        <button
                          className="restore"
                          onClick={() => handleRestore(m.id, m.nombre || "este medicamento")}
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
        <MedicationForm
          onClose={() => setFormModal({ isOpen: false, initialData: null, readOnly: false })}
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