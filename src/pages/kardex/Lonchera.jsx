import React, { useEffect, useMemo, useState } from "react";
import LoncheraForm from "../../components/kardex/LoncheraForm"; 
import Notification from "../../components/kardex/Notification"; 
import ConfirmModal from "../../components/kardex/ConfirmModal"; 
import DetailModal from "../../components/kardex/DetailModal"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import loncheraService from "../../services/kardex/loncheraService"; 
import "../../styles/kardex/lonchera/Lonchera.css";

export default function Lonchera() {
  const [loncheras, setLoncheras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroEscuela, setFiltroEscuela] = useState("");

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
    console.log("🚀 Lonchera component mounted");
    loadLoncheras();
  }, []);

  const loadLoncheras = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando loncheras desde el servicio...");

      const data = await loncheraService.getAll();
      console.log("📊 Datos recibidos del servicio:", data);

      // Normalizar datos para consistencia
      const normalizedData = Array.isArray(data) ? data.map(item => ({
        id: item.id,
        idLonchera: item.id,
        nombreLonchera: item.nombreLonchera || '',
        item: item.item || '',
        cantidadActual: item.cantidadActual || 0,
        cantidadMinima: item.cantidadMinima || 0,
        ciclo: item.ciclo || '',
        escuela: item.escuela || '',
        estado: item.estado || 'A'
      })) : [];

      console.log(`✅ ${normalizedData.length} loncheras normalizadas`);
      setLoncheras(normalizedData);

    } catch (error) {
      console.error("❌ Error al cargar loncheras:", error);

      let errorMessage = "Error al cargar loncheras";

      if (error.response) {
        console.error("📊 Detalles del error:", {
          status: error.response.status,
          data: error.response.data,
          url: error.response.config?.url
        });

        if (error.response.status === 404) {
          errorMessage = "Ruta no encontrada. Verifica la conexión con el backend.";
        } else if (error.response.status === 500) {
          errorMessage = "Error interno del servidor.";
        } else {
          errorMessage = error.response.data?.error || `Error ${error.response.status}`;
        }
      } else if (error.request) {
        console.error("🌐 No se recibió respuesta del servidor");
        errorMessage = "No se pudo conectar con el servidor.";
      } else {
        console.error("🚫 Error en la petición:", error.message);
        errorMessage = `Error: ${error.message}`;
      }

      showNotification(errorMessage, "error");
      setLoncheras([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    console.log(`📢 Notificación: ${type} - ${message}`);
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleDelete = (lonchera) => {
    const id = lonchera.idLonchera || lonchera.id;
    const nombre = lonchera.nombreLonchera || "esta lonchera";

    setConfirmModal({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Seguro que deseas eliminar la lonchera "${nombre}"?`,
      onConfirm: async () => {
        try {
          console.log(`🗑️ Eliminando lonchera ID: ${id}`);
          await loncheraService.delete(id);
          showNotification("Lonchera eliminada correctamente");
          await loadLoncheras();
        } catch (error) {
          console.error("Error eliminando lonchera:", error);
          showNotification("Error al eliminar lonchera", "error");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRestore = async (lonchera) => {
    try {
      const id = lonchera.idLonchera || lonchera.id;
      console.log(`🔄 Restaurando lonchera ID: ${id}`);
      await loncheraService.restore(id);
      showNotification("Lonchera restaurada correctamente", "success");
      await loadLoncheras();
    } catch (error) {
      console.error("Error restaurando lonchera:", error);
      showNotification("Error al restaurar lonchera", "error");
    }
  };

  const handleSave = async (data) => {
    try {
      console.log("💾 Guardando lonchera:", data);

      // Normalizar datos
      const normalizedData = {
        ...data,
        cantidadActual: parseInt(data.cantidadActual) || 0,
        cantidadMinima: parseInt(data.cantidadMinima) || 0
      };

      const id = normalizedData.idLonchera || normalizedData.id;

      if (id) {
        console.log(`📝 Editando lonchera ID: ${id}`);
        await loncheraService.update(id, normalizedData);
        showNotification("Lonchera actualizada correctamente");
      } else {
        console.log("➕ Creando nueva lonchera");
        await loncheraService.create(normalizedData);
        showNotification("Lonchera registrada correctamente");
      }

      // Recargar datos
      await loadLoncheras();
      setFormModal({ isOpen: false, initialData: null, readOnly: false });

    } catch (error) {
      console.error("❌ Error guardando lonchera:", error);

      let errorMessage = "Error al guardar";
      if (error.response) {
        errorMessage = error.response.data?.error || `Error ${error.response.status}`;
      }

      showNotification(errorMessage, "error");
    }
  };

  const stats = useMemo(() => {
    const total = loncheras.length;
    const activas = loncheras.filter(l => l.estado === "A" || l.estado === "ACTIVO").length;
    const inactivas = loncheras.filter(l => l.estado === "I" || l.estado === "INACTIVO").length;
    const bajoStock = loncheras.filter(l => {
      const actual = parseInt(l.cantidadActual) || 0;
      const minima = parseInt(l.cantidadMinima) || 0;
      return actual <= minima;
    }).length;

    return { total, activas, inactivas, bajoStock };
  }, [loncheras]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return loncheras.filter((l) => {
      const matchesQuery = !q ||
        (l.nombreLonchera && l.nombreLonchera.toLowerCase().includes(q)) ||
        (l.item && l.item.toLowerCase().includes(q)) ||
        (l.escuela && l.escuela.toLowerCase().includes(q)) ||
        (l.ciclo && l.ciclo.toLowerCase().includes(q)) ||
        String(l.idLonchera || l.id).includes(q);

      const matchesEstado = !filtroEstado ||
        (filtroEstado === "A" && (l.estado === "A" || l.estado === "ACTIVO")) ||
        (filtroEstado === "I" && (l.estado === "I" || l.estado === "INACTIVO"));

      const matchesEscuela = !filtroEscuela || l.escuela === filtroEscuela;

      return matchesQuery && matchesEstado && matchesEscuela;
    });
  }, [loncheras, query, filtroEstado, filtroEscuela]);

  const downloadPDF = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Reporte de Loncheras", 14, 15);

      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [["ID", "Nombre", "Ítem", "Cantidad", "Mínimo", "Ciclo", "Escuela", "Estado"]],
        body: filtered.map(l => [
          l.idLonchera || l.id,
          l.nombreLonchera || "Sin nombre",
          l.item || "Sin ítem",
          l.cantidadActual || "0",
          l.cantidadMinima || "0",
          l.ciclo || "No especificado",
          l.escuela || "No especificada",
          l.estado === "A" || l.estado === "ACTIVO" ? "Activo" : "Inactivo"
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save(`loncheras_${new Date().toISOString().slice(0, 10)}.pdf`);
      showNotification("PDF generado correctamente");
    } catch (error) {
      console.error("Error generando PDF:", error);
      showNotification("Error al generar PDF", "error");
    }
  };

  const downloadExcel = () => {
    if (filtered.length === 0) {
      showNotification("No hay datos para exportar", "warning");
      return;
    }

    try {
      const data = filtered.map(l => ({
        ID: l.idLonchera || l.id,
        Nombre: l.nombreLonchera || "Sin nombre",
        Ítem: l.item || "Sin ítem",
        "Cantidad Actual": l.cantidadActual || "0",
        "Cantidad Mínima": l.cantidadMinima || "0",
        Ciclo: l.ciclo || "No especificado",
        Escuela: l.escuela || "No especificada",
        Estado: l.estado === "A" || l.estado === "ACTIVO" ? "Activo" : "Inactivo"
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Loncheras");
      XLSX.writeFile(wb, `loncheras_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showNotification("Excel generado correctamente");
    } catch (error) {
      console.error("Error generando Excel:", error);
      showNotification("Error al generar Excel", "error");
    }
  };

  const escuelas = [...new Set(loncheras.map(l => l.escuela).filter(Boolean))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando loncheras...</p>
        <small>Verificando conexión con el servidor...</small>
      </div>
    );
  }

  return (
    <div className="lonchera-container">
      <h1 className="title">Gestión de Loncheras</h1>

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
        <div className="stat-card warning">
          <h3>Bajo Stock</h3>
          <p className="stat-value">{stats.bajoStock}</p>
        </div>
      </div>

      <div className="controls">
        <input
          className="search-input"
          placeholder="Buscar por nombre, ítem, escuela o ciclo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={filtroEscuela}
          onChange={(e) => setFiltroEscuela(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las escuelas</option>
          {escuelas.map((escuela) => (
            <option key={escuela} value={escuela}>{escuela}</option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los estados</option>
          <option value="A">Activas</option>
          <option value="I">Inactivas</option>
        </select>

        <button
          className="btn add-btn"
          onClick={() => setFormModal({ isOpen: true, initialData: null, readOnly: false })}
        >
          ➕ Nueva Lonchera
        </button>

        <button className="btn pdf" onClick={downloadPDF} disabled={filtered.length === 0}>
          📄 PDF
        </button>

        <button className="btn excel" onClick={downloadExcel} disabled={filtered.length === 0}>
          📊 Excel
        </button>

        <button
          className="btn refresh"
          onClick={loadLoncheras}
          title="Actualizar"
        >
          ↻
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-count">
            Mostrando {filtered.length} de {loncheras.length} loncheras
          </span>
          {loncheras.length === 0 && (
            <span className="table-hint">
              La tabla está vacía. ¡Crea tu primera lonchera!
            </span>
          )}
        </div>

        <table className="lonchera-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Ítem</th>
              <th>Cantidad</th>
              <th>Mínimo</th>
              <th>Ciclo</th>
              <th>Escuela</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  <div className="empty-state">
                    {loncheras.length === 0 ? (
                      <>
                        <p>📭 No hay loncheras registradas</p>
                        <p className="empty-subtitle">Comienza creando tu primera lonchera</p>
                        <button
                          className="btn add-btn"
                          onClick={() => setFormModal({ isOpen: true, initialData: null, readOnly: false })}
                        >
                          ➕ Crear primera lonchera
                        </button>
                      </>
                    ) : (
                      <>
                        <p>🔍 No se encontraron resultados</p>
                        <p className="empty-subtitle">Intenta con otros términos de búsqueda</p>
                        <button
                          className="btn clear-btn"
                          onClick={() => {
                            setQuery("");
                            setFiltroEstado("");
                            setFiltroEscuela("");
                          }}
                        >
                          Limpiar filtros
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((l) => {
                const isInactive = l.estado === "I" || l.estado === "INACTIVO";
                const isLowStock = (parseInt(l.cantidadActual) || 0) <= (parseInt(l.cantidadMinima) || 0);

                return (
                  <tr key={l.idLonchera || l.id} className={isInactive ? 'inactive-row' : ''}>
                    <td>#{l.idLonchera || l.id}</td>
                    <td>
                      <strong>{l.nombreLonchera || "Sin nombre"}</strong>
                      {isLowStock && !isInactive && (
                        <small className="low-stock-warning">⚠️ Bajo stock</small>
                      )}
                    </td>
                    <td>{l.item || "Sin ítem"}</td>
                    <td className={isLowStock && !isInactive ? 'warning-cell' : ''}>
                      {l.cantidadActual || "0"}
                    </td>
                    <td>{l.cantidadMinima || "0"}</td>
                    <td>{l.ciclo || "No especificado"}</td>
                    <td>{l.escuela || "No especificada"}</td>
                    <td>
                      <span className={`badge ${l.estado === "A" || l.estado === "ACTIVO" ? "active" : "inactive"}`}>
                        {l.estado === "A" || l.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="view"
                          onClick={() => setFormModal({ isOpen: true, initialData: l, readOnly: true })}
                          title="Ver detalles"
                        >
                          👁 Ver
                        </button>

                        {(l.estado === "A" || l.estado === "ACTIVO") ? (
                          <>
                            <button
                              className="edit"
                              onClick={() => setFormModal({ isOpen: true, initialData: l, readOnly: false })}
                              title="Editar"
                            >
                              ✏ Editar
                            </button>
                            <button
                              className="delete"
                              onClick={() => handleDelete(l)}
                              title="Eliminar"
                            >
                              🗑 Eliminar
                            </button>
                          </>
                        ) : (
                          <button
                            className="restore"
                            onClick={() => handleRestore(l)}
                            title="Restaurar"
                          >
                            ♻ Restaurar
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
        <LoncheraForm
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