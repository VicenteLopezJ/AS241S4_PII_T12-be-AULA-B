import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  X,
  User,
  Eye,
  UserX,
  FilterX,
  FileText,
  Download
} from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { employeesService } from '../../../services/seguimientoVacaciones/employeesService';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';
import { useAreas } from '../../../components/seguimientoVacaciones/hooks/useArea';
import EmployeeForm from './EmployeeForm';
import EmployeeDetailsModal from './EmployeeDetailsModal';

const EmployeeList = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeAreas, loading: areasLoading, error: areasError } = useAreas();

  // Estados principales
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados del modal de detalles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  // Estados de estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

  // Cargar datos iniciales
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadEmployees();
    }
  }, [authLoading, isAuthenticated]);

  // Filtrar empleados cuando cambien los filtros
  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, selectedArea, selectedStatus]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesService.getAll();
      
      // Limpiar y normalizar los datos de empleados
      const cleanedEmployees = (response || []).map(employee => ({
        ...employee,
        status: employee.status?.toString().trim().toUpperCase() || 'A',
        first_name: employee.first_name?.toString().trim() || '',
        last_name: employee.last_name?.toString().trim() || '',
        email: employee.email?.toString().trim() || '',
        area_name: employee.area_name?.toString().trim() || '',
        document_number: employee.document_number?.toString().trim() || ''
      }));
      
      setEmployees(cleanedEmployees);
      calculateStats(cleanedEmployees);
    } catch (err) {
      console.error('Error loading employees:', err);
      setEmployees([]);
      
      showErrorAlert('Error al cargar datos', 'No se pudieron cargar los empleados. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const active = data.filter(emp => emp.status === 'A').length;
    const inactive = data.filter(emp => emp.status === 'I').length;
    setStats({ 
      total: data.length, 
      active, 
      inactive 
    });
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Filtro por estado (Activo/Inactivo)
    if (selectedStatus === 'activos') filtered = filtered.filter(emp => emp.status === 'A');
    else if (selectedStatus === 'inactivos') filtered = filtered.filter(emp => emp.status === 'I');

    // Filtro por área
    if (selectedArea !== 'todos') {
      filtered = filtered.filter(emp => emp.area_name === selectedArea);
    }

    // Filtro por búsqueda (nombre, apellido, email, documento)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(emp =>
        (emp.first_name && emp.first_name.toLowerCase().includes(searchLower)) ||
        (emp.last_name && emp.last_name.toLowerCase().includes(searchLower)) ||
        (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
        (emp.document_number && emp.document_number.toLowerCase().includes(searchLower)) ||
        (emp.area_name && emp.area_name.toLowerCase().includes(searchLower))
      );
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset a la primera página
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedArea('todos');
    setSelectedStatus('todos');
    setCurrentPage(1);
  };

  // Función para determinar el estilo del cargo
  const getPositionStyle = (position) => {
    if (!position) return 'bg-slate-500 bg-opacity-20 text-slate-400 border-slate-500 border-opacity-30';
    
    // Si el cargo contiene "jefe" (case insensitive) - Color morado
    if (position.toLowerCase().includes('jefe')) {
      return 'bg-purple-500 bg-opacity-20 text-purple-100 border-purple-500 border-opacity-30';
    }
    
    // Para cualquier otro cargo - Color azul
    return 'bg-blue-500 bg-opacity-20 text-blue-100 border-blue-500 border-opacity-30';
  };

  // Funciones del modal
  const openModal = (employee = null) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  // Funciones del modal de detalles
  const openDetailsModal = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSave = async (employeeData) => {
    try {
      setSubmitting(true);
      
      // Mapear los datos del frontend al formato del backend
      const backendData = {
        first_name: employeeData.first_name.trim(),
        last_name: employeeData.last_name.trim(),
        gmail: employeeData.gmail.trim(),
        email: employeeData.gmail.trim(),
        document_type: employeeData.document_type,
        document_number: employeeData.document_number.trim(),
        employee_position: employeeData.employee_position.trim(),
        area_id: parseInt(employeeData.area_id),
        status: 'A',
        registration_date: new Date().toISOString().split('T')[0]
      };
      
      if (editingEmployee) {
        const updatedEmployee = await employeesService.update(editingEmployee.employee_id, backendData);
        
        // Actualización optimista: actualizar solo el empleado modificado
        setEmployees(prev => prev.map(emp => 
          emp.employee_id === editingEmployee.employee_id 
            ? { ...emp, ...updatedEmployee }
            : emp
        ));
        
        showSuccessAlert('¡Empleado actualizado!', 'Los datos del empleado se han actualizado correctamente.');
      } else {
        const newEmployee = await employeesService.create(backendData);
        
        // Actualización optimista: agregar el nuevo empleado a la lista
        setEmployees(prev => [...prev, newEmployee]);
        calculateStats([...employees, newEmployee]);
        
        showSuccessAlert('¡Empleado creado!', 'El nuevo empleado se ha registrado correctamente.');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'No se pudo guardar el empleado. Verifica los datos e intenta nuevamente.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      showErrorAlert('Error al guardar', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employeeId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará el empleado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#243447',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await employeesService.delete(employeeId);
        showSuccessAlert('¡Empleado desactivado!', 'El empleado ha sido desactivado correctamente.');
        await loadEmployees();
      } catch (error) {
        console.error(error);
        showErrorAlert('Error', 'No se pudo desactivar el empleado');
      }
    }
  };

  const handleRestore = async (employeeId) => {
    const result = await Swal.fire({
      title: '¿Restaurar empleado?',
      text: 'El empleado volverá a estar activo',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
      background: '#243447',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await employeesService.restore(employeeId);
        showSuccessAlert('¡Empleado restaurado!', 'El empleado ha sido reactivado correctamente.');
        await loadEmployees();
      } catch (error) {
        console.error(error);
        showErrorAlert('Error', 'No se pudo restaurar el empleado');
      }
    }
  };

  // Funciones de exportación
  const handleExportPDF = () => {
    const doc = new jsPDF('landscape'); // Orientación horizontal para más columnas

    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(20, 184, 166);
    doc.text('Reporte Completo de Empleados', 14, 20);

    // Información de generación
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 28);

    // Estadísticas en una línea
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total: ${stats.total} empleados  |  Activos: ${stats.active}  |  Inactivos: ${stats.inactive}`, 14, 36);

    // Tabla con todos los datos
    autoTable(doc, {
      startY: 42,
      head: [['ID', 'Nombres', 'Apellidos', 'Email', 'Tipo Doc.', 'N° Documento', 'Cargo', 'Área', 'F. Registro', 'Estado']],
      body: filteredEmployees.map(emp => [
        `E${emp.employee_id.toString().padStart(2, '0')}`,
        emp.first_name,
        emp.last_name,
        emp.email || emp.gmail || 'N/A',
        emp.document_type || 'DNI',
        emp.document_number,
        emp.employee_position,
        emp.area_name,
        new Date(emp.registration_date).toLocaleDateString('es-PE'),
        emp.status === 'A' ? 'Activo' : 'Inactivo'
      ]),
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // ID
        1: { cellWidth: 25 }, // Nombres
        2: { cellWidth: 25 }, // Apellidos
        3: { cellWidth: 40 }, // Email
        4: { cellWidth: 18, halign: 'center' }, // Tipo Doc
        5: { cellWidth: 22, halign: 'center' }, // N° Doc
        6: { cellWidth: 30 }, // Cargo
        7: { cellWidth: 30 }, // Área
        8: { cellWidth: 22, halign: 'center' }, // Fecha
        9: { cellWidth: 18, halign: 'center' } // Estado
      },
      margin: { left: 14, right: 14 }
    });

    // Footer con número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`empleados_completo_${new Date().toISOString().split('T')[0]}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: 'El reporte completo se ha descargado correctamente',
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff',
      timer: 2000
    });
  };

  const handleExportExcel = () => {
    // Crear hoja con todos los datos completos
    const worksheet = XLSX.utils.json_to_sheet(
      filteredEmployees.map(emp => ({
        'ID Empleado': `E${emp.employee_id.toString().padStart(2, '0')}`,
        'Nombres': emp.first_name,
        'Apellidos': emp.last_name,
        'Nombre Completo': `${emp.first_name} ${emp.last_name}`,
        'Email': emp.email || emp.gmail || 'No especificado',
        'Tipo de Documento': emp.document_type || 'DNI',
        'Número de Documento': emp.document_number,
        'Cargo': emp.employee_position,
        'Área': emp.area_name,
        'Fecha de Registro': new Date(emp.registration_date).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        'Estado': emp.status === 'A' ? 'Activo' : 'Inactivo'
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');

    // Ajustar ancho de columnas para mejor visualización
    worksheet['!cols'] = [
      { wch: 12 },  // ID Empleado
      { wch: 20 },  // Nombres
      { wch: 20 },  // Apellidos
      { wch: 35 },  // Nombre Completo
      { wch: 30 },  // Email
      { wch: 18 },  // Tipo Documento
      { wch: 18 },  // Número Documento
      { wch: 30 },  // Cargo
      { wch: 25 },  // Área
      { wch: 18 },  // Fecha Registro
      { wch: 12 }   // Estado
    ];

    // Agregar hoja de estadísticas
    const statsData = [
      ['ESTADÍSTICAS DE EMPLEADOS'],
      [''],
      ['Total de Empleados', stats.total],
      ['Empleados Activos', stats.active],
      ['Empleados Inactivos', stats.inactive],
      [''],
      ['Fecha de Generación', new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })]
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    statsSheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');

    XLSX.writeFile(workbook, `empleados_completo_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Excel Generado',
      text: 'El reporte completo con estadísticas se ha descargado correctamente',
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff',
      timer: 2000
    });
  };

  // Funciones de alertas
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff',
      timer: 2000
    });
  };

  const showErrorAlert = (title, text) => {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#14b8a6',
      background: '#243447',
      color: '#fff'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              Gestión de Empleados
            </h1>
            <p className="text-slate-400 mt-2 ml-1">Administra los empleados de la organización</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="px-5 py-2.5 bg-[#243447] border-2 border-red-500 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 shadow-md font-medium"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-5 py-2.5 bg-[#243447] border-2 border-green-500 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 shadow-md font-medium"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => openModal()}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Agregar Empleado
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-cyan-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Empleados</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.total}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Registrados en el sistema</p>
              </div>
              <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
                <Users className="w-8 h-8 text-cyan-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Empleados Activos</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.active}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Con acceso al sistema</p>
              </div>
              <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                <UserCheck className="w-8 h-8 text-emerald-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-red-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Empleados Inactivos</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.inactive}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Sin acceso</p>
              </div>
              <div className="bg-red-500 bg-opacity-20 p-3 rounded-xl">
                <UserX className="w-8 h-8 text-red-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Search y filtros */}
        <div className="bg-[#243447] rounded-2xl shadow-xl p-5 mb-6 border border-slate-700">
          <div className="flex flex-col gap-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, email o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3 items-center flex-wrap">
              <button
                onClick={() => setSelectedStatus(selectedStatus === 'activos' ? 'todos' : 'activos')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${selectedStatus === 'activos'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-600 hover:border-emerald-500'
                  }`}
              >
                <UserCheck className="w-4 h-4 inline mr-2" /> Activos
              </button>

              <button
                onClick={() => setSelectedStatus(selectedStatus === 'inactivos' ? 'todos' : 'inactivos')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${selectedStatus === 'inactivos'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-600 hover:border-red-500'
                  }`}
              >
                <UserX className="w-4 h-4 inline mr-2" /> Inactivos
              </button>

              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-5 py-2.5 rounded-xl bg-[#1a2332] border border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="todos">Todas las áreas</option>
                {activeAreas.map(area => (
                  <option key={area.id} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="p-2.5 rounded-xl bg-[#1a2332] text-slate-400 hover:text-red-400 border border-slate-600 hover:border-red-500 transition-all"
                title="Limpiar filtros"
              >
                <FilterX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#243447] rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-[#1a2332]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Apellido</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Área</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>

                <tbody className="bg-[#243447] divide-y divide-slate-700">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-16 text-center text-slate-400">
                        <Users className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                        <p className="text-lg font-medium">No se encontraron empleados</p>
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map((employee) => (
                      <tr key={employee.employee_id} className="hover:bg-[#2a3f5f] transition-colors">
                        <td className="px-6 py-4 text-sm text-teal-400 font-bold">
                          E{employee.employee_id.toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">{employee.first_name}</td>
                        <td className="px-6 py-4 text-sm text-white font-medium">{employee.last_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <span className="bg-slate-700 px-2 py-1 rounded text-xs font-medium">
                            {employee.document_type || 'DNI'}
                          </span>
                          <span className="ml-2 text-slate-400">{employee.document_number}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-lg border ${getPositionStyle(employee.employee_position)}`}>
                            {employee.employee_position}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-teal-400 font-semibold">{employee.area_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                            employee.status === 'A'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${employee.status === 'A' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {employee.status === 'A' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetailsModal(employee)}
                              className="p-2 bg-purple-500/20 text-purple-100 rounded-lg transition-all hover:bg-purple-500 hover:text-purple-50 hover:-translate-y-0.5"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {employee.status === 'A' ? (
                              <>
                                <button
                                  onClick={() => openModal(employee)}
                                  className="p-2 bg-blue-500/20 text-blue-100 rounded-lg transition-all hover:bg-blue-500 hover:text-blue-50 hover:-translate-y-0.5"
                                  title="Editar empleado"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(employee.employee_id)}
                                  className="p-2 bg-red-500/20 text-red-100 rounded-lg transition-all hover:bg-red-500 hover:text-red-50 hover:-translate-y-0.5"
                                  title="Desactivar empleado"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestore(employee.employee_id)}
                                className="p-2 bg-emerald-500/20 text-emerald-100 rounded-lg transition-all hover:bg-emerald-500 hover:text-emerald-50 hover:-translate-y-0.5"
                                title="Restaurar empleado"
                              >
                                <RotateCcw className="w-4 h-4" />
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center py-4 border-t border-slate-700 bg-[#1a2332] gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === i + 1
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-[#243447] text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Formulario */}
      {isModalOpen && (
        <Modal
          title={editingEmployee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
          subtitle={editingEmployee 
            ? 'Modifica los datos del empleado' 
            : 'Completa los siguientes campos para registrar un nuevo empleado'
          }
          onClose={closeModal}
        >
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSave}
            onCancel={closeModal}
            submitting={submitting}
          />
        </Modal>
      )}

      {/* Modal de Detalles */}
      {isDetailsModalOpen && selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
};

// Modal Component con overlay mejorado
const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="bg-slate-800 rounded-xl w-full max-w-2xl shadow-2xl">
      {/* Modal Header - Más compacto */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 px-6 rounded-t-xl text-center relative">
        <div className="flex flex-col items-center">
          {/* Icono de usuario más pequeño */}
          <div className="w-16 h-16 bg-blue-400/30 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm border-2 border-white/20">
            <User className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            <p className="text-blue-100 text-sm opacity-90">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1.5 backdrop-blur-sm hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Body - Sin scroll */}
      <div className="bg-slate-800 rounded-b-xl">
        {children}
      </div>
    </div>
  </div>
);

export default EmployeeList;