import React, { useEffect, useMemo, useState } from "react";
import { compraService } from "../../services/kardex/comprasService"; 
import { proveedorService } from "../../services/kardex/proveedorService"; 
import ComprasForm from "../../components/kardex/ComprasForm"; 
import Notification from "../../components/kardex/Notification"; 
import ConfirmModal from "../../components/kardex/ConfirmModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../styles/kardex/compras/Compras.css";

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [proveedores, setProveedores] = useState([]);
  
  const [notification, setNotification] = useState({ 
    show: false, 
    message: "", 
    type: "" 
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
    loadCompras();
    loadProveedores(); // ← AGREGAR ESTA LLAMADA
  }, []);

  const loadCompras = async () => {
    try {
      setLoading(true);
      const data = await compraService.getAll();
      setCompras(data || []);
    } catch (error) {
      console.error("Error al cargar compras:", error);
      showNotification("Error al cargar compras", "error");
    } finally {
      setLoading(false);
    }
  };

  // AGREGAR ESTA FUNCIÓN NUEVA
  const loadProveedores = async () => {
    try {
      console.log("🔍 Cargando proveedores...");
      const data = await proveedorService.getAll();
      console.log(`✅ ${data.length} proveedores cargados:`, data);
      setProveedores(data || []);
    } catch (error) {
      console.error("❌ Error cargando proveedores:", error);
      showNotification("Error al cargar proveedores", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleDelete = (id, supplierName) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Seguro que deseas eliminar la compra del proveedor "${supplierName}"?`,
      onConfirm: async () => {
        try {
          await compraService.delete(id);
          loadCompras();
          showNotification("Compra eliminada correctamente");
        } catch (error) {
          console.error("Error eliminando compra:", error);
          showNotification("Error al eliminar compra", "error");
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const handleRestore = async (id, supplierName) => {
    try {
      await compraService.restore(id);
      loadCompras();
      showNotification("Compra restaurada correctamente");
    } catch (error) {
      console.error("Error restaurando compra:", error);
      showNotification("Error al restaurar compra", "error");
    }
  };

  const handleSave = async (data) => {
    try {
      if (data.idPurchase) {
        await compraService.update(data.idPurchase, data);
        showNotification("Compra actualizada correctamente");
      } else {
        await compraService.create(data);
        showNotification("Compra registrada correctamente");
      }
      loadCompras();
      setFormModal({ isOpen: false, initialData: null, readOnly: false });
    } catch (error) {
      console.error("Error guardando compra:", error);
      showNotification("Error al guardar", "error");
    }
  };

  // 📊 Estadísticas
  const stats = useMemo(() => {
    const total = compras.length;
    const activas = compras.filter(c => c.status === "A").length;
    const inactivas = compras.filter(c => c.status === "I").length;
    const hoy = compras.filter(c => {
      if (!c.purchaseDate) return false;
      const today = new Date().toISOString().split('T')[0];
      return c.purchaseDate.startsWith(today);
    }).length;
    
    return { total, activas, inactivas, hoy };
  }, [compras]);

  // 🔍 Filtrado
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    
    return compras.filter((c) => {
      const matchesQuery = !q ||
        (c.supplierName && c.supplierName.toLowerCase().includes(q)) ||
        String(c.idPurchase || c.id).includes(q);
      
      const matchesEstado = !filtroEstado || c.status === filtroEstado;
      
      return matchesQuery && matchesEstado;
    });
  }, [compras, query, filtroEstado]);

  // 📄 Exportar PDF
  const downloadPDF = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Compras", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 22);
    
    autoTable(doc, {
      startY: 30,
      head: [["ID", "Proveedor", "Fecha", "Total", "Estado"]],
      body: filtered.map(c => [
        c.idPurchase || c.id,
        c.supplierName || "No especificado",
        c.purchaseDate || "No especificada",
        `S/ ${c.total || "0.00"}`,
        c.status === "A" ? "Activo" : "Inactivo"
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`compras_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // 📊 Exportar Excel
  const downloadExcel = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    const data = filtered.map(c => ({
      ID: c.idPurchase || c.id,
      Proveedor: c.supplierName || "No especificado",
      Fecha: c.purchaseDate || "No especificada",
      Total: c.total || "0.00",
      Estado: c.status === "A" ? "Activo" : "Inactivo"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compras");
    XLSX.writeFile(wb, `compras_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Formateadores
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando compras...</p>
      </div>
    );
  }

  return (
    <div className="compras-container">
      <h1 className="title">Gestión de Compras</h1>

      {/* ===== TARJETAS ESTADÍSTICAS ===== */}
      <div className="stats-cards">
        <div className="stat-card total">
          <h3>Total</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card active">
          <h3>Activas</h3>
          <p className="stat-value">{stats.activas}</p>
        </div>
        <div className="stat-card inactive">
          <h3>Inactivas</h3>
          <p className="stat-value">{stats.inactivas}</p>
        </div>
        <div className="stat-card today">
          <h3>Hoy</h3>
          <p className="stat-value">{stats.hoy}</p>
        </div>
      </div>

      {/* ===== CONTROLES ===== */}
      <div className="controls">
        <input 
          className="search-input" 
          placeholder="Buscar por proveedor o ID..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
        />
        
        <select 
          value={filtroEstado} 
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="A">Activas</option>
          <option value="I">Inactivas</option>
        </select>
        
        <button 
          className="btn add-btn" 
          onClick={() => setFormModal({ isOpen: true, initialData: null, readOnly: false })}
        >
          ➕ Agregar
        </button>
        
        <button className="btn pdf-btn" onClick={downloadPDF}>
          📄 PDF
        </button>
        
        <button className="btn excel-btn" onClick={downloadExcel}>
          📊 Excel
        </button>
      </div>

      {/* DEBUG: Mostrar info de proveedores (opcional) */}
      {proveedores.length === 0 && (
        <div style={{
          background: '#2c2c3c',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '5px',
          color: '#fbbf24',
          fontSize: '14px'
        }}>
          ⚠️ No hay proveedores disponibles. Asegúrate de crear proveedores primero.
        </div>
      )}

      {/* ===== TABLA ===== */}
      <table className="compras-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => {
            const isInactive = c.status === "I";
            
            return (
              <tr key={c.idPurchase || c.id} className={isInactive ? 'inactive-row' : ''}>
                <td>#{c.idPurchase || c.id}</td>
                <td>{c.supplierName || "No especificado"}</td>
                <td>{formatDate(c.purchaseDate)}</td>
                <td>{formatCurrency(c.total)}</td>
                <td>
                  <span className={`badge ${c.status === "A" ? "active" : "inactive"}`}>
                    {c.status === "A" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <button 
                    className="view" 
                    onClick={() => setFormModal({ isOpen: true, initialData: c, readOnly: true })}
                  >
                    👁 Ver
                  </button>
                  
                  <button 
                    className="edit" 
                    onClick={() => setFormModal({ isOpen: true, initialData: c, readOnly: false })}
                  >
                    ✏ Editar
                  </button>
                  
                  {c.status === "A" ? (
                    <button 
                      className="delete" 
                      onClick={() => handleDelete(c.idPurchase || c.id, c.supplierName || "esta compra")}
                    >
                      🗑 Eliminar
                    </button>
                  ) : (
                    <button 
                      className="restore" 
                      onClick={() => handleRestore(c.idPurchase || c.id, c.supplierName || "esta compra")}
                    >
                      ♻ Restaurar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ===== MODALES ===== */}
      {formModal.isOpen && (
        <ComprasForm
          onClose={() => setFormModal({ isOpen: false, initialData: null, readOnly: false })}
          onSave={handleSave}
          initialData={formModal.initialData}
          readOnly={formModal.readOnly}
          proveedores={proveedores}
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