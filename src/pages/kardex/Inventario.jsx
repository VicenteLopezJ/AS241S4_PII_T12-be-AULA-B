import React, { useEffect, useMemo, useState } from "react";
import { inventarioService } from "../../services/kardex/inventarioService"; 
import Notification from "../../components/kardex/Notification"; 
import ConfirmModal from "../../components/kardex/ConfirmModal"; 
import InventarioForm from "../../components/kardex/InventarioForm"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../styles/kardex/inventario/Inventario.css";

export default function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [fechaExacta, setFechaExacta] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [formModal, setFormModal] = useState({ isOpen: false, initialData: null, readOnly: false });

  useEffect(() => { loadInventario(); }, []);

  const loadInventario = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getAll();
      setInventarios(data || []);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      showNotification("Error al cargar inventario", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => setNotification({ show: true, message, type });

  const handleDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Seguro que deseas eliminar el inventario de "${name}"?`,
      onConfirm: async () => {
        await inventarioService.delete(id);
        loadInventario();
        showNotification("Inventario eliminado correctamente");
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleRestore = async (id) => {
    await inventarioService.restore(id);
    loadInventario();
    showNotification("Inventario restaurado correctamente");
  };

  const handleSave = async (data) => {
    try {
      if (data.idInventory) await inventarioService.update(data.idInventory, data);
      else await inventarioService.create(data);

      showNotification(data.idInventory ? "Inventario actualizado" : "Inventario registrado");
      loadInventario();
      setFormModal({ isOpen: false, initialData: null, readOnly: false });
    } catch {
      showNotification("Error al guardar", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return inventarios.filter((inv) => {
      const matchesQuery = !q || inv.medicationName.toLowerCase().includes(q) || String(inv.idInventory).includes(q);
      const matchesEstado = !filtroEstado || inv.status === filtroEstado;
      const matchesFecha = !fechaExacta || (inv.updateDate && new Date(inv.updateDate).toDateString() === new Date(fechaExacta).toDateString());
      return matchesQuery && matchesEstado && matchesFecha;
    });
  }, [inventarios, query, filtroEstado, fechaExacta]);

  const totalInventarios = inventarios.length;
  const activos = inventarios.filter(i => i.status === "A").length;
  const inactivos = inventarios.filter(i => i.status === "I").length;
  const bajoStock = inventarios.filter(i => i.currentStock <= i.minStock).length;

  // Función para descargar PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Inventario", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Medicamento", "Stock", "Mín", "Máx", "Estado", "Últ. Actualización"]],
      body: filtered.map(i => [
        i.idInventory,
        i.medicationName,
        i.currentStock,
        i.minStock,
        i.maxStock,
        i.status === "A" ? "Activo" : "Inactivo",
        i.updateDate ? new Date(i.updateDate).toLocaleDateString() : "-"
      ])
    });
    doc.save("inventario.pdf");
  };

  // Función para descargar Excel
  const downloadExcel = () => {
    const wsData = filtered.map(i => ({
      ID: i.idInventory,
      Medicamento: i.medicationName,
      Stock: i.currentStock,
      Min: i.minStock,
      Max: i.maxStock,
      Estado: i.status === "A" ? "Activo" : "Inactivo",
      "Últ. Actualización": i.updateDate ? new Date(i.updateDate).toLocaleDateString() : "-"
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "inventario.xlsx");
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="inventario-container">
      <h1 className="title">Inventario</h1>
      <div className="stats-cards">
        <div className="stat-card"><h3>Total</h3><p>{totalInventarios}</p></div>
        <div className="stat-card active"><h3>Activos</h3><p>{activos}</p></div>
        <div className="stat-card inactive"><h3>Inactivos</h3><p>{inactivos}</p></div>
        <div className="stat-card warning"><h3>Bajo Stock</h3><p>{bajoStock}</p></div>
      </div>

      <div className="controls">
        <input className="search-input" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="A">Activos</option>
          <option value="I">Inactivos</option>
        </select>
        <input type="date" value={fechaExacta} onChange={e => setFechaExacta(e.target.value)} />
        <button className="btn add-btn" onClick={() => setFormModal({ isOpen: true, initialData: null, readOnly: false })}>➕ Agregar</button>
        <button className="btn pdf-btn" onClick={downloadPDF}>📄 PDF</button>
        <button className="btn excel-btn" onClick={downloadExcel}>📊 Excel</button>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Medicamento</th>
            <th>Stock</th>
            <th>Mín</th>
            <th>Máx</th>
            <th>Estado</th>
            <th>Últ. Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(i => (
            <tr key={i.idInventory}>
              <td>{i.idInventory}</td>
              <td>{i.medicationName}</td>
              <td>{i.currentStock}</td>
              <td>{i.minStock}</td>
              <td>{i.maxStock}</td>
              <td>{i.status === "A" ? "Activo" : "Inactivo"}</td>
              <td>{i.updateDate ? new Date(i.updateDate).toLocaleDateString() : "-"}</td>
              <td>
                <button className="view" onClick={() => setFormModal({ isOpen: true, initialData: i, readOnly: true })}>👁 Ver</button>
                <button className="edit" onClick={() => setFormModal({ isOpen: true, initialData: i, readOnly: false })}>✏ Editar</button>
                {i.status === "A" ? (
                  <button className="delete" onClick={() => handleDelete(i.idInventory, i.medicationName)}>🗑 Eliminar</button>
                ) : (
                  <button className="restore" onClick={() => handleRestore(i.idInventory)}>♻ Restaurar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {formModal.isOpen && (
        <InventarioForm
          initialData={formModal.initialData}
          readOnly={formModal.readOnly}
          onClose={() => setFormModal({ isOpen: false, initialData: null, readOnly: false })}
          onSave={handleSave}
        />
      )}

      {notification.show && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
