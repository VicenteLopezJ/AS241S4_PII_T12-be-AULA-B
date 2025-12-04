// src/components/Sidebar.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";
import { PermisosList } from "./permisos/permisosList";
import { PermisosPendientesRevision } from "./permisos/PermisosPendientesRevision";
import { PermisosAprobadosJefe } from "./permisos/PermisosAprobadosJefe";
import { UsuariosList } from "./usuarios/UsuariosList";
import DashboardPage from "../pages/DashboardPage";
import AreasPage from "../pages/AreasPage";
import FormularioAreaPage from "../pages/FormularioAreaPage";
import AutorizacionesPage from "../pages/AutorizacionesPage";
import DocumentosPage from "../pages/DocumentosPage";
import RegistrosPage from "../pages/RegistrosPage";
import RegistrosHistorialPage from "../pages/RegistrosHistorialPage";
import RegistroAsistenciaPrintPage from "../pages/RegistroAsistenciaPrintPage";
import { EmpresaList } from "./empresa/empresaList";
import LoginPage from "../pages/LoginPage";
import MiAsistenciaPage from "../pages/MiAsistenciaPage";
import BoletaPrintPage from "../pages/BoletaPrintPage";
import AprobacionPrintPage from "../pages/AprobacionPrintPage";

const RequireAuth = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";

  if (isLoginRoute) {
    const hasToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (hasToken) {
      // Si ya hay sesión activa, no mostramos el login: redirigimos al dashboard
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <Header />

      {/* Layout principal */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Contenido principal */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            {/* Ruta raíz - Redirecciona al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />

            {/* Rutas de Usuarios */}
            <Route
              path="/usuarios"
              element={
                <RequireAuth>
                  <UsuariosList />
                </RequireAuth>
              }
            />

            {/* Rutas de Áreas */}
            <Route
              path="/areas"
              element={
                <RequireAuth>
                  <AreasPage />
                </RequireAuth>
              }
            />
            <Route
              path="/areas/nueva"
              element={
                <RequireAuth>
                  <FormularioAreaPage />
                </RequireAuth>
              }
            />
            <Route
              path="/areas/:id/editar"
              element={
                <RequireAuth>
                  <FormularioAreaPage />
                </RequireAuth>
              }
            />

            {/* Rutas de Permisos */}
            <Route
              path="/permisos"
              element={
                <RequireAuth>
                  <PermisosList />
                </RequireAuth>
              }
            />

            <Route
              path="/boletas/:id/print"
              element={
                <RequireAuth>
                  <BoletaPrintPage />
                </RequireAuth>
              }
            />

            <Route
              path="/aprobaciones/:idAprobacion/print"
              element={
                <RequireAuth>
                  <AprobacionPrintPage />
                </RequireAuth>
              }
            />

            <Route
              path="/jefe/permisos/revision"
              element={
                <RequireAuth>
                  <PermisosPendientesRevision />
                </RequireAuth>
              }
            />

            <Route
              path="/jefe/permisos/aprobados"
              element={
                <RequireAuth>
                  <PermisosAprobadosJefe />
                </RequireAuth>
              }
            />

            {/* Rutas de Autorizaciones */}
            <Route
              path="/autorizaciones"
              element={
                <RequireAuth>
                  <AutorizacionesPage />
                </RequireAuth>
              }
            />

            {/* Rutas de Documentos */}
            <Route
              path="/documentos"
              element={
                <RequireAuth>
                  <DocumentosPage />
                </RequireAuth>
              }
            />

            {/* Rutas de Empresas */}
            <Route
              path="/empresa"
              element={
                <RequireAuth>
                  <EmpresaList />
                </RequireAuth>
              }
            />

            {/* Registros de asistencia (solo admin, control por rol en UI) */}
            <Route
              path="/registros"
              element={
                <RequireAuth>
                  <RegistrosPage />
                </RequireAuth>
              }
            />
            <Route
              path="/registros/historial"
              element={
                <RequireAuth>
                  <RegistrosHistorialPage />
                </RequireAuth>
              }
            />
            <Route
              path="/registros/:idRegistro/print"
              element={
                <RequireAuth>
                  <RegistroAsistenciaPrintPage />
                </RequireAuth>
              }
            />

            {/* Mi Asistencia y Descuentos (empleados) */}
            <Route
              path="/mi-asistencia"
              element={
                <RequireAuth>
                  <MiAsistenciaPage />
                </RequireAuth>
              }
            />

            {/* Cualquier otra ruta va al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
