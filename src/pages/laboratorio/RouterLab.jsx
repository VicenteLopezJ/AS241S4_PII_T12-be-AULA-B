import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LaboratorioPage from './LaboratorioPage.jsx';
import CompanyContacts from './empresas/contactos/CompanyContacts.jsx';
import CotizacionesPage from './cotizaciones/CotizacionesPage.jsx';
import MuestrasLab from './muestreo/MuestrasLab.jsx';
import MuestrasLayout from './muestreo/MuestrasLayout.jsx';
import NuevoMuestreo from './muestreo/NuevoMuestreo.jsx';

// RouterLab ahora registra rutas relativas según el prefijo montado.
// Se usa useLocation para detectar el prefijo actual y exponer rutas
// relativas apropiadas cuando este componente se monta en:
// - /empresaListado/*
// - /cotizaciones/*
// - /muestreo/*
export default function RouterLab() {
  const { pathname } = useLocation();

  // Si la URL inicia con /empresaListado -> exponer rutas relativas para empresas
  if (pathname.startsWith('/empresaListado')) {
    return (
      <Routes>
        <Route path="/" element={<LaboratorioPage initialTab={'empresas'} />} />
        <Route path="Contactos/:id" element={<CompanyContacts />} />
        {/* Fallback: si solo se monta en /empresaListado/* y no hay path, mostramos index */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Si la URL inicia con /cotizaciones -> exponer el listado de cotizaciones
  if (pathname.startsWith('/cotizaciones')) {
    return (
      <Routes>
        <Route path="/" element={<CotizacionesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Si la URL inicia con /muestreo -> exponer las rutas de muestreo (relativas)
  if (pathname.startsWith('/muestreo')) {
    return (
      <Routes>
        <Route path="/" element={<MuestrasLayout />}>
          <Route index element={<MuestrasLab />} />
          <Route path="nuevo" element={<NuevoMuestreo />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Soporte para nuevo prefijo /laboratorio -> registra subrutas internas
  if (pathname.startsWith('/laboratorio')) {
    return (
      <Routes>
        <Route path="/" element={<LaboratorioPage />} />
        <Route path="empresas" element={<LaboratorioPage />} />
        <Route path="empresas/contactos/:id" element={<CompanyContacts />} />
        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="muestreo" element={<MuestrasLayout />}>
          <Route index element={<MuestrasLab />} />
          <Route path="nuevo" element={<NuevoMuestreo />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Si no coinciden los prefijos, mostramos un 404 simple dentro del módulo
  return (
    <Routes>
      <Route path="*" element={<div style={{ padding: 20, color: '#fff' }}>Módulo laboratorio: ruta no encontrada</div>} />
    </Routes>
  );
}
