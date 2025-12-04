import React, { useState, useEffect } from "react";
import "../../styles/kardex/Dashboard.css";
import { FaPills, FaBell, FaUserTie } from "react-icons/fa";

// 👉 Importar servicios 
import { medicamentoService } from "../../services/kardex/medicamentoService";
import { proveedorService } from "../../services/kardex/proveedorService"; 
import { notificacionService } from "../../services/kardex/notificacionService";

const Dashboard = () => {
  const [medicamentos, setMedicamentos] = useState(0);
  const [proveedores, setProveedores] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  /* ==========================
      CARGA DE DATOS DINÁMICA
  ============================*/
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // 🔹 Medicamentos totales
      const meds = await medicamentoService.getAll();
      setMedicamentos(meds.length);

      // 🔹 Proveedores totales
      const provs = await proveedorService.getAll();
      setProveedores(provs.length);

      // 🔹 Notificaciones desde BD
      const notifs = await notificacionService.getAll();
      setNotificaciones(notifs);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    }
  };

  /* ==========================
      MARCAR NOTIFICACIÓN COMO ACEPTADA
  ============================*/
  const manejarNotificacionVista = async (id) => {
    try {
      await notificacionService.marcarAceptada(id);

      // actualizar visual
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, estado: "aceptada" } : n
        )
      );
    } catch (error) {
      console.error("Error al actualizar notificación:", error);
    }
  };

  /* ==========================
      FILTRO DE BÚSQUEDA
  ============================*/
  const notificacionesFiltradas = notificaciones.filter((n) =>
    n.texto.toLowerCase().includes(busqueda.toLowerCase())
  );

  const cantidadNotificacionesPendientes = notificaciones.filter(
    (n) => n.estado === "pendiente"
  ).length;

  return (
    <div className="dashboard-container">
      {/* 🔍 Buscador */}
      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Buscar notificación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* 🧮 Tarjetas resumen */}
      <div className="dashboard-cards">
        <div className="card card-blue">
          <FaPills className="icon" />
          <h3>Medicamentos</h3>
          <p>{medicamentos}</p>
        </div>

        <div className="card card-purple">
          <FaBell className="icon" />
          <h3>Notificaciones</h3>
          <p>{cantidadNotificacionesPendientes}</p>
        </div>

        <div className="card card-green">
          <FaUserTie className="icon" />
          <h3>Proveedores</h3>
          <p>{proveedores}</p>
        </div>
      </div>

      {/* 🧾 Lista de notificaciones */}
      <div className="notificaciones-lista">
        {notificacionesFiltradas.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.7 }}>
            No hay notificaciones
          </p>
        ) : (
          notificacionesFiltradas.map((n) => (
            <div
              key={n.id}
              className={`notificacion ${n.estado}`}
              onClick={() => manejarNotificacionVista(n.id)}
            >
              <span>{n.texto}</span>
              <button className={`estado-btn ${n.estado}`}>
                {n.estado === "pendiente" ? "Pendiente" : "Aceptada"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
