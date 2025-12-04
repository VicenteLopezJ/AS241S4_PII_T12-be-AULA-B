// src/pages/asistencia/admin/studentAdmin/StudentManagementPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import StudentStats from '../../../../components/asistencia/admin/studentAdmin/StudentStats';
import StudentList from '../../../../components/asistencia/admin/studentAdmin/StudentList';
import StudentModal from '../../../../components/asistencia/admin/studentAdmin/StudentModal';
import {
  getStudents,
  getStudentStats,
  createStudent,
  updateStudent,
  deactivateStudent,
  restoreStudent,
  getCareers,
  exportStudentsExcel,
  exportStudentsPDF
} from '../../../../services/asistencia/admin/studentAdmin/studentService';
import '../../../../styles/asistencia/admin/studentAdmin/studentManagement.css';

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    withdrawn: 0
  });
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    careerId: '',
    semester: '',
    status: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);
  
  // 🔥 Estados para exportación
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      loadDataSilently();
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [filters.careerId, filters.semester, filters.status]);

  useEffect(() => {
    loadStudents();
  }, [filters.careerId, filters.semester, filters.status]);

  const loadDataSilently = async () => {
    try {
      setIsRefreshing(true);
      const filterParams = {
        ...(filters.careerId && { careerId: parseInt(filters.careerId) }),
        ...(filters.semester && { semester: parseInt(filters.semester) }),
        ...(filters.status && { status: filters.status })
      };

      const [studentsData, statsData] = await Promise.all([
        getStudents(filterParams),
        getStudentStats()
      ]);

      setStudents(studentsData);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error en actualización automática:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsData, statsData, careersData] = await Promise.all([
        getStudents(),
        getStudentStats(),
        getCareers()
      ]);

      setStudents(studentsData);
      setStats(statsData);
      setCareers(careersData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const filterParams = {
        ...(filters.careerId && { careerId: parseInt(filters.careerId) }),
        ...(filters.semester && { semester: parseInt(filters.semester) }),
        ...(filters.status && { status: filters.status })
      };

      const data = await getStudents(filterParams);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getStudentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateStudent = async (formData) => {
    try {
      await createStudent(formData);
      setIsModalOpen(false);
      setSelectedStudent(null);
      await loadStudents();
      await loadStats();
      alert('✅ Estudiante creado exitosamente');
    } catch (error) {
      console.error('Error creating student:', error);
      const errorMessage = error.response?.data?.detail || 'Error al crear el estudiante';
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleUpdateStudent = async (formData) => {
    try {
      await updateStudent(selectedStudent.studentId, formData);
      setIsModalOpen(false);
      setSelectedStudent(null);
      await loadStudents();
      await loadStats();
      alert('✅ Estudiante actualizado exitosamente');
    } catch (error) {
      console.error('Error updating student:', error);
      alert('❌ Error al actualizar el estudiante');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('¿Está seguro de desactivar este estudiante?')) {
      return;
    }

    try {
      await deactivateStudent(studentId);
      await loadStudents();
      await loadStats();
      alert('✅ Estudiante desactivado exitosamente');
    } catch (error) {
      console.error('Error deactivating student:', error);
      alert('❌ Error al desactivar el estudiante');
    }
  };

  const handleRestoreStudent = async (studentId) => {
    if (!window.confirm('¿Desea restaurar este estudiante?')) {
      return;
    }

    try {
      await restoreStudent(studentId);
      await loadStudents();
      await loadStats();
      alert('✅ Estudiante restaurado exitosamente');
    } catch (error) {
      console.error('Error restoring student:', error);
      alert('❌ Error al restaurar el estudiante');
    }
  };

  const handleOpenModal = (student = null) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  // 🔥 EXPORTAR A EXCEL
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setExportType('excel');
      
      const exportFilters = {
        careerId: filters.careerId,
        semester: filters.semester,
        status: filters.status
      };

      await exportStudentsExcel(exportFilters);
      
      alert('✅ Archivo Excel descargado exitosamente');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('❌ Error al exportar a Excel. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 🔥 EXPORTAR A PDF
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setExportType('pdf');
      
      const exportFilters = {
        careerId: filters.careerId,
        semester: filters.semester,
        status: filters.status
      };

      await exportStudentsPDF(exportFilters);
      
      alert('✅ Archivo PDF descargado exitosamente');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('❌ Error al exportar a PDF. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = filters.search.toLowerCase();
    return (
      student.studentCode.toLowerCase().includes(searchLower) ||
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.dni.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="student-management-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Estudiantes</h1>
          <p>Administra estudiantes, docentes y personal del sistema</p>
        </div>
        <div className="header-actions">
          {/* 🔥 Botón Excel */}
          <button 
            onClick={handleExportExcel} 
            className="action-btn action-btn--excel"
            disabled={isExporting || loading || filteredStudents.length === 0}
          >
            {isExporting && exportType === 'excel' ? (
              <>⏳ Generando...</>
            ) : (
              <>📊 Exportar Excel</>
            )}
          </button>
          
          {/* 🔥 Botón PDF */}
          <button 
            onClick={handleExportPDF} 
            className="action-btn action-btn--pdf"
            disabled={isExporting || loading || filteredStudents.length === 0}
          >
            {isExporting && exportType === 'pdf' ? (
              <>⏳ Generando...</>
            ) : (
              <>📄 Exportar PDF</>
            )}
          </button>
          
          {/* Botón Actualizar */}
          <button 
            onClick={handleRefresh} 
            className={`action-btn action-btn--secondary ${isRefreshing ? 'spinning' : ''}`}
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <StudentStats stats={stats} />

      <div className="filters-section">
        <h2>Filtros y Búsqueda</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar:</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Nombre, email o código..."
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Carrera:</label>
            <select
              name="careerId"
              value={filters.careerId}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todas las carreras</option>
              {careers.map(career => (
                <option key={career.careerId} value={career.careerId}>
                  {career.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Semestre:</label>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos los semestres</option>
              {[1, 2, 3, 4, 5, 6].map(sem => (
                <option key={sem} value={sem}>{sem}° Semestre</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Estado:</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="graduated">Graduado</option>
              <option value="withdrawn">Retirado</option>
            </select>
          </div>

          <div className="filter-actions">
            <button
              className="btn-create"
              onClick={() => handleOpenModal()}
            >
              ➕ Crear Nuevo Estudiante
            </button>
          </div>
        </div>
      </div>

      <StudentList
        students={filteredStudents}
        onEdit={handleOpenModal}
        onDelete={handleDeleteStudent}
        onRestore={handleRestoreStudent}
      />

      <StudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={selectedStudent ? handleUpdateStudent : handleCreateStudent}
        student={selectedStudent}
        careers={careers}
      />
    </div>
  );
};

export default StudentManagementPage;