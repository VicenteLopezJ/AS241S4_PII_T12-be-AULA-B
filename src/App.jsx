import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/intranet/user/Login';
import Register from './pages/intranet/user/Register';
import Dashboard from './components/intranet/user/Dashboard';
import Roles from './pages/intranet/role/Roles';
import MainDashboard from './pages/DashboardMain';
import AcademicHome from './pages/intranet/AcademicHome.jsx';
import AdminHome from './pages/intranet/AdminHome.jsx';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import TipoList from './pages/intranet/tipos/TipoList';
import TipoForm from './pages/intranet/tipos/TipoForm';
import SolicitudList from './pages/intranet/solicitudes/SolicitudList';
import SolicitudForm from './pages/intranet/solicitudes/SolicitudForm';
import SolicitudDetail from './pages/intranet/solicitudes/SolicitudDetail';
import AsistenciaPage from './pages/asistencia/admin/AsistentAdmin/AsistenciaPage';
import AdminLayout from './components/intranet/AdminLayout';
import StudentDashboardPage from './pages/asistencia/student/dashboard/StudentDashboardPage';
import StudentAttendancePage from './pages/asistencia/student/asistencia/StudentAttendancePage';
import CursosPage from './pages/asistencia/student/cursos/CursosPage';
import JustificacionPage from './pages/asistencia/student/justificacion/JustificacionPage';
import AlertsPage from './pages/asistencia/student/alert/AlertsPage';
import StudentManagementPage from './pages/asistencia/admin/studentAdmin/StudentManagementPage';
import Layout from './components/intranet/user/Layout';
import AttendancePage from './pages/asistencia/teacher/attendancePage';
import JustificationManagementPage from './pages/asistencia/teacher/justificationsPage';
import ReportsPage from './pages/asistencia/teacher/reportsPage';
import InicialPage from './pages/asistencia/teacher/inicialPage';
import UnifiedLayout from './components/asistencia/layout/UnifiedLayout';
import LoginPage from './pages/asistencia/LoginPage';
import InitialPage from "./pages/asistencia/admin/initialPage";
import { AuthProvider } from './components/asistencia/context/AuthContext';

// ========== IMPORTS MÓDULO DECLARACIÓN JURADA ==========
import { AuthProvider as DJAuthProvider } from './pages/declaracionJurada/AuthContext';
import DJProtectedRoute from './components/DJurada/ProtectedRoute';
import DJLogin from './pages/declaracionJurada/Login';
import DJRegister from './pages/declaracionJurada/Register';
import DJDashboard from './pages/declaracionJurada/Dashboard';
import DJAprobaciones from './pages/declaracionJurada/Aprobaciones';
import DJCentroCostos from './pages/declaracionJurada/CentroCostos';
import DJProyectos from './pages/declaracionJurada/Proyectos';
// ========== FIN IMPORTS DECLARACIÓN JURADA ==========

//hackathon
import StudentsPage from './pages/hackathon/teacher/students/studentsPage';
import GroupsPage from './pages/hackathon/teacher/groups/groupsPage';
import EvaluationDayPage from './pages/hackathon/teacher/evaluation/EvaluationDayPage';
import EvaluationSetupPage from './pages/hackathon/teacher/evaluation/EvaluationSetupPage';
import { ThemeProvider } from './styles/hackathon/ThemeContext';
import AttendancePageHackathon from './pages/hackathon/teacher/attendance/AttendancePage';
import StudentAttendance from './pages/hackathon/student/StudentAttendance';
import HackathonLogin from './pages/hackathon/HackathonLogin';
import TeacherAuthGuard from './components/hackathon/teacher/guards/TeacherAuthGuard.jsx';
import TeacherSetup from './pages/hackathon/TeacherSetup.jsx';
import TeachersPage from './pages/hackathon/teacher/teachers/TeacherPage.jsx';
// ✅ IMPORTAR LOS COMPONENTES DEL MÓDULO DE ASISTENCIAS
import UserList from './pages/asistencia/admin/usuarios';
import TeacherManagementPage from './pages/asistencia/admin/manageTeacher';

// Laboratorio module pages
import LaboratorioPage from './pages/laboratorio/LaboratorioPage';
import CotizacionesPage from './pages/laboratorio/cotizaciones/CotizacionesPage';
import MuestrasLayout from './pages/laboratorio/muestreo/MuestrasLayout';
import MuestrasLab from './pages/laboratorio/muestreo/MuestrasLab';
import NuevoMuestreo from './pages/laboratorio/muestreo/NuevoMuestreo';
import RouterLab from './pages/laboratorio/RouterLab';
import LabLayout from './pages/laboratorio/LabLayout';


// Módulo boleta_permiso (RRHH)
import DashboardPage from './pages/boleta_permiso/DashboardPage';
import AreasPage from './pages/boleta_permiso/AreasPage';
import FormularioAreaPage from './pages/boleta_permiso/FormularioAreaPage';
import AutorizacionesPage from './pages/boleta_permiso/AutorizacionesPage';
import DocumentosPage from './pages/boleta_permiso/DocumentosPage';
import MiAsistenciaPage from './pages/boleta_permiso/MiAsistenciaPage';
import BoletaPrintPage from './pages/boleta_permiso/BoletaPrintPage';
import AprobacionPrintPage from './pages/boleta_permiso/AprobacionPrintPage';
import RegistrosPage from './pages/boleta_permiso/RegistrosPage';
import RegistrosHistorialPage from './pages/boleta_permiso/RegistrosHistorialPage';
import RegistroAsistenciaPrintPage from './pages/boleta_permiso/RegistroAsistenciaPrintPage';
import { PermisosList as PermisosPage } from './components/boleta_permiso/permisos/permisosList';
import { PermisosPendientesRevision } from './components/boleta_permiso/permisos/PermisosPendientesRevision';
import { PermisosAprobadosJefe } from './components/boleta_permiso/permisos/PermisosAprobadosJefe';
import { UsuariosList as RrhhUsuariosList } from './components/boleta_permiso/usuarios/UsuariosList';
import { EmpresaList as RrhhEmpresaList } from './components/boleta_permiso/empresa/empresaList';
import BoletaLayout from './components/boleta_permiso/Layout';
import RrhhLoginPage from './pages/boleta_permiso/LoginPage';
import LoginPageEmpleado from './pages/boleta_permiso/LoginPageEmpleado';

// ========== IMPORTS MÓDULO SEGUIMIENTO DE VACACIONES ==========

import { EmployeeList } from './pages/seguimientoVacaciones/employees';
import ManagerList from './pages/seguimientoVacaciones/users/usersList';
import VacationPeriodList from './pages/seguimientoVacaciones/VacationPeriod/VacationPeriodList';
import EmployeePeriodList from './pages/seguimientoVacaciones/EmployeePeriod/EmployeePeriodList';
import EmployeePeriodDetail from './pages/seguimientoVacaciones/EmployeePeriod/EmployeePeridoDetail';
import { EmployeeRequestView, ManagerRequestView } from './pages/seguimientoVacaciones/VacationRequest';
import MyVacationBalance from './pages/seguimientoVacaciones/MyVacationBalance/MyVacationBalance';
import VacacionesLogin from './pages/seguimientoVacaciones/Auth/login';
import EmployeeLoginVacaciones from './pages/seguimientoVacaciones/Auth/employeeLogin';
import VacacionesDashboard from './pages/seguimientoVacaciones/Dashboard';
import { AuthProvider as VacacionesAuthProvider, useAuth as useVacacionesAuth } from './components/seguimientoVacaciones/context/AuthContext';
import VacacionesSidebar from './components/seguimientoVacaciones/layouts/VacacionesSidebar.jsx';
// ========== FIN IMPORTS SEGUIMIENTO DE VACACIONES ==========

// ========== IMPORTS MÓDULO VALE PROVISIONAL ==========
import UnifiedLayoutVales from './components/valeProvisional/layout/UnifiedLayout';
import DashboardPageVales from './pages/valeProvisional/DashboardPage';
import VoucherPage from './pages/valeProvisional/voucherPage';
import ApplicantPageVales from './pages/valeProvisional/ApplicantPage';
import DocumentPageVales from './pages/valeProvisional/documentPage';
import AdministracionPageVales from './pages/valeProvisional/administracionPage';
import AreaPageVales from './pages/valeProvisional/areaPage';
import CostCenterPageVales from './pages/valeProvisional/costCenterPage';
import AreaSignaturePageVales from './pages/valeProvisional/areaSignaturePage';
import AreaDetails from './pages/seguimientoVacaciones/areas/AreaDetails.jsx';
import AreaList from './pages/seguimientoVacaciones/areas/AreaList.jsx';

// ========== IMPORTS MÓDULO VIATICOS Y MOVILIDAD ==========
import VTWorkerList from "./pages/viaticos/worker/Worker-list";
import VTCostList from "./pages/viaticos/cost/Cost-list.jsx";
import VTManagerList from "./pages/viaticos/manager/manager-list";
import VTDashboard from "./pages/viaticos/dashboard/dashboard";
import VTRequestList from "./pages/viaticos/request/requests-list";
import VTLogin from "./pages/viaticos/Login";
import VTPendingList from "./pages/viaticos/request/pending-list";

// ========== IMPORTS MÓDULO KARDEX ==========
import { autoLoginToKardex } from './utils/autoLoginKardex';
import KardexLayout from './components/kardex/Layout';
import KardexDashboard from './components/kardex/Dashboard';
import Medicamentos from './pages/kardex/Medicamentos';
import Proveedor from './pages/kardex/Proveedor';
import Inventario from './pages/kardex/Inventario';
import Lonchera from './pages/kardex/Lonchera';
import Compras from './pages/kardex/Compras';
import Attention from './pages/kardex/Attention';
// ========== FIN IMPORTS KARDEX ==========

import './App.css';




const RequireRrhhAuth = ({ children }) => {
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const hasUserInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;

  if (!hasToken || !hasUserInfo) {
    return <Navigate to="/rrhh/login" replace />;
  }

  return children;
};

// ========== COMPONENTE DE PROTECCIÓN SEGUIMIENTO VACACIONES ==========
const RequireVacacionesAuth = ({ children }) => {
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const hasUserInfo = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;

  if (!hasToken || !hasUserInfo) {
    return <Navigate to="/vacaciones/login" replace />;
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/vt/login" replace />;
  return children;
};


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App.jsx - Estado del usuario cambió:', user);
  }, [user]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    console.log('App.jsx - Verificando usuario guardado:', { savedUser, savedToken });

    if (savedUser && savedToken && savedUser !== 'undefined' && savedToken !== 'undefined' && savedUser !== 'null' && savedToken !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('App.jsx - Usuario parseado:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('App.jsx - Limpiando localStorage con datos inválidos');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('App.jsx - handleLogin llamado con:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#4a5568'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="w-full min-h-screen">
          <Routes>
            {/* ========== RUTAS DEL SISTEMA PRINCIPAL (INTRANET) ========== */}
            <Route
              path="/login"
              element={<Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={
                user ? <Navigate to="/dashboard" replace /> : <Register />
              }
            />

            {/* ✅ RUTA /dashboard CORREGIDA - SISTEMA PRINCIPAL */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  (() => {
                    console.log('App.jsx - Valor de user.role:', user.role);
                    const roleLower = (user.role || '').toLowerCase();

                    // ✅ Solo usuarios académicos van a /academic
                    if (roleLower === 'estudiante' ||
                      roleLower === 'student' ||
                      roleLower === 'profesor' ||
                      roleLower === 'teacher') {
                      return <Navigate to="/academic" replace />;
                    }

                    // ✅ Empleados van a su vista específica
                    if (roleLower === 'administrativo') {
                      return <Navigate to="/empleado" replace />;
                    }

                    // ✅ Admins se quedan aquí y muestran MainDashboard con Sidebar completo
                    return <MainDashboard user={user} onLogout={handleLogout} />;
                  })()
                ) : <Navigate to="/login" replace />
              }
            />

            {/* ✅ RUTAS ADICIONALES DEL SISTEMA PRINCIPAL */}
            <Route
              path="/empleado"
              element={
                user ? <EmployeeDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/users"
              element={
                user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/roles"
              element={
                user ? <Roles user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/tipos"
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}><TipoList user={user} onLogout={handleLogout} /></Layout>
                ) : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/tipos/new"
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}><TipoForm user={user} onLogout={handleLogout} /></Layout>
                ) : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/tipos/:id"
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}><TipoForm user={user} onLogout={handleLogout} /></Layout>
                ) : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/solicitudes"
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}><SolicitudList user={user} onLogout={handleLogout} /></Layout>
                ) : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/solicitudes/new"
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}><SolicitudForm user={user} onLogout={handleLogout} /></Layout>
                ) : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/solicitudes/:id"
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}><SolicitudDetail user={user} onLogout={handleLogout} /></Layout>
                ) : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/modules"
              element={
                user ? <Modules user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/modules/:id"
              element={
                user ? <ModuleDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
              }
            />

            <Route path="/modules/5" element={<Navigate to="/dashboard" replace />} />

            {/* Rutas para el módulo Laboratorio (mapeo desde el sidebar) */}
            <Route
              path="/modules/Empresas"
              element={
                user ? <Layout user={user} onLogout={handleLogout}><LaboratorioPage /></Layout> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/modules/Cotizaciones"
              element={
                user ? <Layout user={user} onLogout={handleLogout}><CotizacionesPage /></Layout> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/modules/MuestreoLaboratorio/*"
              element={
                user ? <Layout user={user} onLogout={handleLogout}><MuestrasLayout /></Layout> : <Navigate to="/login" replace />
              }
            />
            {/* Rutas directas para muestreo (lista e crear) */}
            <Route
              path="/modules/MuestreoLaboratorio"
              element={
                user ? <Layout user={user} onLogout={handleLogout}><MuestrasLab /></Layout> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/modules/MuestreoLaboratorio/nuevo"
              element={
                user ? <Layout user={user} onLogout={handleLogout}><NuevoMuestreo /></Layout> : <Navigate to="/login" replace />
              }
            />

            {/* Ruta para vista académica */}
            <Route
              path="/academic"
              element={user ? <AcademicHome user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            />

            {/* ========== RUTAS DEL MÓDULO DE VALES PROVISIONALES ========== */}
            <Route
              path="/valeProvisional/*"
              element={<UnifiedLayoutVales user={user} />}
            >
              {/* Dashboard de Vale Provisional */}
              <Route path="DashboardPage" element={<DashboardPageVales />} />
              <Route path="dashboard" element={<DashboardPageVales />} />

              {/* Módulo de Vales */}
              <Route path="vales" element={<VoucherPage />} />

              {/* Módulo de Documentos */}
              <Route path="documentos" element={<DocumentPageVales />} />

              {/* Módulo de Solicitantes */}
              <Route path="solicitantes" element={<ApplicantPageVales />} />

              {/* Módulo de Administración */}
              <Route path="administracion" element={<AdministracionPageVales />} />

              {/* Submódulos de Administración */}
              <Route path="administracion/areas" element={<AreaPageVales />} />
              <Route path="administracion/centros-costo" element={<CostCenterPageVales />} />
              <Route path="administracion/firmas" element={<AreaSignaturePageVales />} />
            </Route>
            {/* ========== FIN RUTAS VALE PROVISIONAL ========== */}

            {/* ========== RUTAS DEL MÓDULO DE ASISTENCIAS CON PREFIJO /asistencia ========== */}

            {/* Login del módulo de asistencias */}
            <Route
              path="/asistencia/login"
              element={<LoginPage />}
            />

            {/* Rutas con UnifiedLayout */}
            <Route element={<UnifiedLayout />}>
              {/* ✅ Rutas de Admin del módulo de asistencias */}
              <Route path="/asistencia/admin/initial" element={<InitialPage />} />
              <Route path="/asistencia/admin/usuarios" element={<UserList />} />
              <Route path="/asistencia/admin/manage-teacher" element={<TeacherManagementPage />} />
              <Route path="/asistencia/admin/contro-asistencias" element={<AsistenciaPage />} />
              <Route path="/asistencia/admin/estudiantes" element={<StudentManagementPage />} />

              {/* ✅ Rutas de Estudiantes */}
              <Route path="/asistencia/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/asistencia/student/asistencias" element={<StudentAttendancePage />} />
              <Route path="/asistencia/student/cursos" element={<CursosPage />} />
              <Route path="/asistencia/student/justificaciones" element={<JustificacionPage />} />
              <Route path="/asistencia/student/alertas" element={<AlertsPage />} />

              {/* ✅ Rutas de Profesores */}
              <Route path="/asistencia/teacher/inicial" element={<InicialPage />} />
              <Route path="/asistencia/teacher/attendance" element={<AttendancePage />} />
              <Route path="/asistencia/teacher/justifications" element={<JustificationManagementPage />} />
              <Route path="/asistencia/teacher/reports" element={<ReportsPage />} />
            </Route>

            {/* Rutas del módulo laboratorio que usan RouterLab internamente */}
            <Route
              path="/empresaListado/*"
              element={user ? <LabLayout /> : <Navigate to="/login" replace />}
            >
              <Route path="*" element={<RouterLab />} />
            </Route>
            <Route
              path="/cotizaciones/*"
              element={user ? <Layout user={user} onLogout={handleLogout}><RouterLab /></Layout> : <Navigate to="/login" replace />}
            />
            <Route
              path="/muestreo/*"
              element={user ? <Layout user={user} onLogout={handleLogout}><RouterLab /></Layout> : <Navigate to="/login" replace />}
            />

            {/* Nuevo prefijo /laboratorio con layout propio */}
            <Route
              path="/laboratorio/*"
              element={user ? <LabLayout /> : <Navigate to="/login" replace />}
            >
              <Route path="*" element={<RouterLab />} />
            </Route>
            {/* ========== RUTAS MÓDULO RRHH / BOLETA_PERMISO ========== */}
            {/* Prefijo /rrhh para no interferir con las rutas actuales */}
            {/* Login propio de RRHH */}
            <Route path="/rrhh/login" element={<RrhhLoginPage />} />

            {/* Login de empleados RRHH (SIN autologeo) */}
            <Route path="/rrhh/login-empleado" element={<LoginPageEmpleado />} />

            {/* Ruta raíz RRHH - Redirecciona al dashboard RRHH (protegido) */}
            <Route path="/rrhh" element={<Navigate to="/rrhh/dashboard" replace />} />

            {/* Layout de RRHH con sidebar propio, protegido por RequireRrhhAuth */}
            <Route element={<RequireRrhhAuth><BoletaLayout /></RequireRrhhAuth>}>
              {/* Dashboard RRHH */}
              <Route path="/rrhh/dashboard" element={<DashboardPage />} />

              {/* Rutas de Áreas RRHH */}
              <Route path="/rrhh/areas" element={<AreasPage />} />
              <Route path="/rrhh/areas/nueva" element={<FormularioAreaPage />} />
              <Route path="/rrhh/areas/:id/editar" element={<FormularioAreaPage />} />

              {/* Rutas de Autorizaciones RRHH */}
              <Route path="/rrhh/autorizaciones" element={<AutorizacionesPage />} />

              {/* Rutas de Documentos RRHH */}
              <Route path="/rrhh/documentos" element={<DocumentosPage />} />

              {/* Rutas de Permisos RRHH */}
              <Route path="/rrhh/permisos" element={<PermisosPage />} />
              <Route path="/rrhh/jefe/permisos/revision" element={<PermisosPendientesRevision />} />
              <Route path="/rrhh/jefe/permisos/aprobados" element={<PermisosAprobadosJefe />} />
              <Route path="/rrhh/boletas/:id/print" element={<BoletaPrintPage />} />
              <Route path="/rrhh/aprobaciones/:idAprobacion/print" element={<AprobacionPrintPage />} />

              {/* Registros de asistencia RRHH */}
              <Route path="/rrhh/registros" element={<RegistrosPage />} />
              <Route path="/rrhh/registros/historial" element={<RegistrosHistorialPage />} />
              <Route path="/rrhh/registros/:idRegistro/print" element={<RegistroAsistenciaPrintPage />} />

              {/* Usuarios y Empresa RRHH */}
              <Route path="/rrhh/usuarios" element={<RrhhUsuariosList />} />
              <Route path="/rrhh/empresa" element={<RrhhEmpresaList />} />

              {/* Mi Asistencia y Descuentos (empleados RRHH) */}
              <Route path="/rrhh/mi-asistencia" element={<MiAsistenciaPage />} />
            </Route>

            {/* ========== RUTAS MÓDULO SEGUIMIENTO DE VACACIONES ========== */}
            {/* Login SIN protección */}
            <Route
              path="/vacaciones/login"
              element={
                <VacacionesAuthProvider>
                  <VacacionesLogin />
                </VacacionesAuthProvider>
              }
            />

            {/* Login de EMPLEADO vacaciones (manual) */}
            <Route
              path="/vacaciones/login-empleado"
              element={
                <VacacionesAuthProvider>
                  <EmployeeLoginVacaciones />
                </VacacionesAuthProvider>
              }
            />

            {/* Ruta raíz vacaciones - Redirecciona al panel */}
            <Route path="/vacaciones" element={<Navigate to="/vacaciones/panel" replace />} />

            {/* Rutas protegidas de vacaciones */}
            <Route
              path="/vacaciones/*"
              element={
                <VacacionesAuthProvider>
                  <RequireVacacionesAuth>
                    <div className="bg-gray-50 min-h-screen">
                      <VacacionesSidebar />
                      <main className="ml-64 min-h-screen">
                        <Routes>
                          {/* Panel/Dashboard */}
                          <Route path="panel" element={<VacacionesDashboard />} />

                          {/* Gestión Administrativa */}
                          <Route path="areas" element={<AreaList />} />
                          <Route path="areaDetails" element={<AreaDetails />} />
                          <Route path="trabajadores" element={<EmployeeList />} />
                          <Route path="usuarios" element={<ManagerList />} />

                          {/* Períodos y Control */}
                          <Route path="periodosVacacionales" element={<VacationPeriodList />} />
                          <Route path="empleadoPeriodo" element={<EmployeePeriodList />} />
                          <Route path="employee-period/detail" element={<EmployeePeriodDetail />} />

                          {/* Solicitudes */}
                          <Route path="solicitudEmpleado" element={<EmployeeRequestView />} />
                          <Route path="solicitudJefe" element={<ManagerRequestView />} />

                          {/* Mi Saldo */}
                          <Route path="miSaldoVacaciones" element={<MyVacationBalance />} />

                          {/* Redirección por defecto */}
                          <Route path="*" element={<Navigate to="/vacaciones/panel" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </RequireVacacionesAuth>
                </VacacionesAuthProvider>
              }
            />
            {/* ========== FIN RUTAS SEGUIMIENTO DE VACACIONES ========== */}


            {/* ========== RUTAS MÓDULO VIATICOS Y MOVILIDAD ========== */}

            <Route path="/vt/dashboard-movil" element={<VTDashboard />} />

            <Route
              path="/vt/dashboard-movil"
              element={
                //<ProtectedRoute>
                <VTDashboard />
                //</ProtectedRoute>
              }
            />

            <Route
              path="/vt/request"
              element={
                //<ProtectedRoute>
                <VTRequestList />
                //</ProtectedRoute>
              }
            />

            <Route
              path="/vt/cost-center"
              element={
                //<ProtectedRoute>
                <VTCostList />
                //</ProtectedRoute>
              }
            />

            <Route
              path="/vt/worker"
              element={
                //<ProtectedRoute>
                <VTWorkerList></VTWorkerList>
                //</ProtectedRoute>
              }
            />

            <Route
              path="/vt/manager"
              element={
                //<ProtectedRoute>
                <VTManagerList></VTManagerList>
                //</ProtectedRoute>
              }
            />

            <Route
              path="/vt/pending"
              element={
                //<ProtectedRoute>
                <VTPendingList></VTPendingList>
                //</ProtectedRoute>
              }
            />

            {/* ========== FIN RUTAS SEGUIMIENTO DE VACACIONES ========== */}

            {/* ========== RUTAS MÓDULO DECLARACIÓN JURADA ========== */}
            {/* Rutas públicas de declaración jurada */}
            <Route path="/dj/login" element={<DJAuthProvider><DJLogin /></DJAuthProvider>} />
            <Route path="/dj/register" element={<DJAuthProvider><DJRegister /></DJAuthProvider>} />

            {/* Ruta raíz de /dj - Redirecciona al dashboard DJ */}
            {/* <Route path="/dj" element={<Navigate to="/dj/dashboard" replace />} /> */}

            {/* Rutas protegidas de declaración jurada */}
            <Route
              path="/dj/*"
              element={
                <DJAuthProvider>
                  <Routes>
                    {/* Dashboard DJ - accesible para todos los usuarios autenticados */}
                    <Route
                      path="dashboard"
                      element={
                        <DJProtectedRoute>
                          <DJDashboard />
                        </DJProtectedRoute>
                      }
                    />

                    {/* Aprobaciones - ADMIN, APROBADOR, SUPERVISOR */}
                    <Route
                      path="aprobaciones"
                      element={
                        <DJProtectedRoute allowedRoles={['ADMIN', 'APROBADOR', 'SUPERVISOR']}>
                          <DJAprobaciones />
                        </DJProtectedRoute>
                      }
                    />

                    {/* Centros de Costos - Solo ADMIN */}
                    <Route
                      path="centros-costos"
                      element={
                        <DJProtectedRoute allowedRoles={['ADMIN']}>
                          <DJCentroCostos />
                        </DJProtectedRoute>
                      }
                    />

                    {/* Proyectos - Solo ADMIN */}
                    <Route
                      path="proyectos"
                      element={
                        <DJProtectedRoute allowedRoles={['ADMIN']}>
                          <DJProyectos />
                        </DJProtectedRoute>
                      }
                    />

                    {/* Catch all dentro de /dj - redirige a login de DJ */}
                    <Route path="*" element={<Navigate to="/dj/login" replace />} />
                  </Routes>
                </DJAuthProvider>
              }
            />
            {/* ========== FIN RUTAS DECLARACIÓN JURADA ========== */}

            {/* Ruta raíz */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />

            {/*hackathon*/}
            <Route
            path="/hackathon/*"
            element={
              <ThemeProvider>
                <Routes>
                  <Route path="login" element={<HackathonLogin />} />
                  <Route path="teacherSetup" element={<TeacherSetup />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="teachers" element={<TeachersPage />} />
                  <Route path="groups" element={<GroupsPage />} />
                  <Route path="evaluationday" element={<TeacherAuthGuard>
                        <EvaluationDayPage />
                    </TeacherAuthGuard>
                    } />
                    <Route path="evaluationday/setup" element={<EvaluationSetupPage />} />
                    <Route path="attendance" element={<AttendancePageHackathon />} />
                    <Route path="student" element={<StudentAttendance />} />
                    <Route path="*" element={<h1>404 | Hackathon no encontrada</h1>} />
                  </Routes>
                </ThemeProvider>
              }
            />
            {/* ========== RUTAS MÓDULO KARDEX ========== */}
            <Route
              path="/kardex/*"
              element={
                // Auto-login al entrar al módulo Kardex
                (() => {  
                  console.log('🚀 Entrando al módulo Kardex...');
                  autoLoginToKardex();

                  // Obtener usuario de Kardex
                  const kardexUser = JSON.parse(localStorage.getItem('kardex_user') || '{"user_id":999,"rol":"admin","user_name":"kardex_admin"}');

                  return (
                    <KardexLayout user={kardexUser}>
                      <Routes>
                        <Route index element={<KardexDashboard />} />
                        <Route path="dashboard" element={<KardexDashboard />} />
                        <Route path="medicamentos" element={<Medicamentos />} />
                        <Route path="proveedor" element={<Proveedor />} />
                        <Route path="inventario" element={<Inventario />} />
                        <Route path="lonchera" element={<Lonchera />} />
                        <Route path="compras" element={<Compras />} />
                        <Route path="attention" element={<Attention />} />
                        <Route path="*" element={<Navigate to="/kardex/dashboard" replace />} />
                      </Routes>
                    </KardexLayout>
                  );
                })()
              }
            />
            {/* ========== FIN RUTAS KARDEX ========== */}

            {/* Ruta raíz */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;