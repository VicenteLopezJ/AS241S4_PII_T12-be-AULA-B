import React, { useState } from "react";
import { Building, FileSignature, DollarSign, Grid, X } from "lucide-react";
import AreaPage from "../../pages/valeProvisional/areaPage";
import FirmaPage from "../../pages/valeProvisional/areaSignaturePage";
import CentroCostosPage from "../../pages/valeProvisional/costCenterPage";
import "../../styles/valeProvisional/administracion/administracionPage.css";

const AdministracionPage = () => {
  const [moduloActivo, setModuloActivo] = useState(null);

  const modulos = [
    {
      id: "areas",
      nombre: "Gestión de Áreas",
      icono: <Building size={48} />,
      color: "#3B82F6",
      descripcion: "Administrar departamentos y áreas de la empresa",
      componente: <AreaPage />
    },
    {
      id: "firmas", 
      nombre: "Gestión de Firmas",
      icono: <FileSignature size={48} />,
      color: "#10B981",
      descripcion: "Gestionar firmas y autorizaciones",
      componente: <FirmaPage />
    },
    {
      id: "centro-costos",
      nombre: "Centro de Costos",
      icono: <DollarSign size={48} />,
      color: "#8B5CF6",
      descripcion: "Administrar centros de costo y presupuestos",
      componente: <CentroCostosPage />
    }
  ];

  const abrirModulo = (moduloId) => {
    setModuloActivo(moduloId);
  };

  const cerrarModulo = () => {
    setModuloActivo(null);
  };

  return (
    <div className="administracion-container">
      {/* Header */}
      <div className="administracion-header">
        <Grid size={32} />
        <h1>Módulos de Administración</h1>
        <p>Selecciona un módulo para gestionar</p>
      </div>

      {/* Grid de Tarjetas */}
      <div className="modulos-grid">
        {modulos.map((modulo) => (
          <div
            key={modulo.id}
            className="modulo-card"
            onClick={() => abrirModulo(modulo.id)}
            style={{ borderLeft: `4px solid ${modulo.color}` }}
          >
            <div className="modulo-icon" style={{ color: modulo.color }}>
              {modulo.icono}
            </div>
            <div className="modulo-content">
              <h3 className="modulo-title">{modulo.nombre}</h3>
              <p className="modulo-description">{modulo.descripcion}</p>
            </div>
            <div className="modulo-badge" style={{ backgroundColor: modulo.color }}>
              Acceder
            </div>
          </div>
        ))}
      </div>

      {/* Overlay del Módulo Activo */}
      {moduloActivo && (
        <div className="modulo-overlay">
          <div className="modulo-container">
            {/* Header del Overlay */}
            <div className="modulo-header">
              <div className="modulo-header-info">
                <div 
                  className="modulo-header-icon" 
                  style={{ color: modulos.find(m => m.id === moduloActivo)?.color }}
                >
                  {modulos.find(m => m.id === moduloActivo)?.icono}
                </div>
                <div>
                  <h2>{modulos.find(m => m.id === moduloActivo)?.nombre}</h2>
                  <p>{modulos.find(m => m.id === moduloActivo)?.descripcion}</p>
                </div>
              </div>
              <button onClick={cerrarModulo} className="close-button">
                <X size={24} />
              </button>
            </div>

            {/* Contenido del Módulo */}
            <div className="modulo-content-overlay">
              {modulos.find(m => m.id === moduloActivo)?.componente}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministracionPage;