import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  X,
  Search,
  ChevronDown,
  User,
  Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import AreaForm from './AreaForm';
import { useAuth } from '../../../components/seguimientoVacaciones/context/AuthContext';
import { employeesService } from '../../../services/seguimientoVacaciones/employeesService';
import { areasService } from '../../../services/seguimientoVacaciones/areasService';

const AreaList = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Estados principales
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados del modal de formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Estados de estadísticas y empleados por área
  const [areasWithEmployees, setAreasWithEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalEmployees: 0,
    areasConJefe: 0,
    areasSinJefe: 0
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadAreas();
      loadStatistics();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (areas.length > 0 && !authLoading && isAuthenticated) {
      loadEmployeesPerArea();
    }
  }, [areas, authLoading, isAuthenticated]);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areasService.getAll();
      setAreas(response || []);
      setError(null);
    } catch (err) {
      console.error('Error loading areas:', err);
      setError(`Error al cargar áreas: ${err.message}`);
      setAreas([]);

      Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        text: 'No se pudieron cargar las áreas. Verifica la conexión con el servidor.',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const statistics = await areasService.getStatistics();
      setStats({
        total: statistics.total_areas || 0,
        active: statistics.total_areas || 0,
        totalEmployees: statistics.total_empleados || 0,
        areasConJefe: statistics.areas_con_jefe || 0,
        areasSinJefe: statistics.areas_sin_jefe || 0
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const loadEmployeesPerArea = async () => {
    try {
      const employees = await employeesService.getAll();
      
      // Calcular empleados por área
      const areasWithCount = areas.map(area => {
        const employeesInArea = employees.filter(emp => emp.area_id === area.area_id);
        return {
          ...area,
          employeeCount: employeesInArea.length,
          employees: employeesInArea
        };
      });
      
      setAreasWithEmployees(areasWithCount);
    } catch (err) {
      console.error('Error loading employees per area:', err);
    }
  };

  const openModal = (area = null) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
  };

  const handleSave = async (formData) => {
    setSubmitting(true);
    try {
      if (editingArea) {
        await areasService.update(editingArea.area_id, formData);
        
        Swal.fire({
          icon: 'success',
          title: '¡Área actualizada!',
          text: 'El área se ha actualizado correctamente.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await areasService.create(formData);
        
        Swal.fire({
          icon: 'success',
          title: '¡Área creada!',
          text: 'La nueva área se ha registrado correctamente.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      await loadAreas();
      closeModal();
    } catch (err) {
      console.error('Error saving area:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: editingArea ? 'No se pudo actualizar el área.' : 'No se pudo crear el área.',
        confirmButtonColor: '#10b981'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (areaId) => {
    // Verificar si hay empleados en esta área
    const areaWithEmployees = areasWithEmployees.find(area => area.area_id === areaId);
    const employeeCount = areaWithEmployees?.employeeCount || 0;
    
    if (employeeCount > 0) {
      const result = await Swal.fire({
        title: '⚠️ Área con empleados',
        html: `
          <p>Esta área tiene <strong>${employeeCount} empleado(s)</strong> asignado(s).</p>
          <p>¿Qué deseas hacer?</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Ver empleados',
        denyButtonText: 'Desactivar área',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        denyButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
      });

      if (result.isConfirmed) {
        // Navegar a empleados filtrados por esta área
        window.location.href = `/employees?area=${areaId}`;
        return;
      } else if (!result.isDenied) {
        return; // Cancelado
      }
    }

    // Confirmar eliminación
    const confirmResult = await Swal.fire({
      title: '¿Desactivar área?',
      text: employeeCount > 0 
        ? `El área será desactivada pero los ${employeeCount} empleados mantendrán su asignación.`
        : 'El área será marcada como inactiva.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      try {
        await areasService.delete(areaId);
        
        Swal.fire({
          icon: 'success',
          title: '¡Área desactivada!',
          text: 'El área ha sido desactivada correctamente.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
        
        await loadAreas();
      } catch (err) {
        console.error('Error al desactivar área:', err);
        
        Swal.fire({
          icon: 'error',
          title: 'Error al desactivar',
          text: 'No se pudo desactivar el área.',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  const handleRestore = async (areaId) => {
    const result = await Swal.fire({
      title: '¿Restaurar área?',
      text: 'El área será marcada como activa nuevamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await areasService.restore(areaId);
        
        Swal.fire({
          icon: 'success',
          title: '¡Área restaurada!',
          text: 'El área ha sido reactivada correctamente.',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
        
        await loadAreas();
      } catch (err) {
        console.error('Error al restaurar área:', err);
        
        Swal.fire({
          icon: 'error',
          title: 'Error al restaurar',
          text: 'No se pudo restaurar el área.',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  const viewEmployeesInArea = (areaId, areaName) => {
    // Navegar a empleados filtrados por esta área
    window.location.href = `/employees?area=${areaId}&areaName=${encodeURIComponent(areaName)}`;
  };

  const viewAreaDetails = (areaId) => {
    // Guardar el ID del área en sessionStorage para acceder desde la página de detalles
    sessionStorage.setItem('selectedAreaId', areaId);
    // Navegar a la página de detalles de área dentro del módulo de vacaciones
    navigate('/vacaciones/areaDetails');
  };

  // Filtrar áreas
  const filteredAreas = areasWithEmployees.filter(area => {
    const matchesSearch = searchTerm === '' || 
      area.area_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.description && area.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === '' || area.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Función para renderizar acciones según el estado
  const renderActions = (area) => {
    if (area.status === 'A') {
      return (
        <div className="flex gap-1">
          <button
            onClick={() => openModal(area)}
            className="p-2 bg-blue-500/20 text-blue-100 rounded-lg transition-all hover:bg-blue-500 hover:text-blue-50 hover:-translate-y-0.5"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(area.area_id)}
            className="p-2 bg-red-500/20 text-red-100 rounded-lg transition-all hover:bg-red-500 hover:text-red-50 hover:-translate-y-0.5"
            title="Desactivar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    } else {
      return (
        <button
          onClick={() => handleRestore(area.area_id)}
          className="p-2 bg-emerald-500/20 text-emerald-100 rounded-lg transition-all hover:bg-emerald-500 hover:text-emerald-50 hover:-translate-y-0.5"
          title="Restaurar"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Cargando áreas...</p>
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
                <Building2 className="w-8 h-8 text-white" />
              </div>
              Gestión de Áreas
            </h1>
            <p className="text-slate-400 mt-2 ml-1">Administra las áreas de la organización</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Agregar Área
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-cyan-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Áreas</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.total}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Activas en el sistema</p>
              </div>
              <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
                <Building2 className="w-8 h-8 text-cyan-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Con Jefe</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.areasConJefe}</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  {stats.total > 0 ? Math.round((stats.areasConJefe / stats.total) * 100) : 0}% del total
                </p>
              </div>
              <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                <User className="w-8 h-8 text-emerald-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-amber-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Sin Jefe</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.areasSinJefe}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Requieren asignación</p>
              </div>
              <div className="bg-amber-500 bg-opacity-20 p-3 rounded-xl">
                <User className="w-8 h-8 text-amber-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Empleados Total</p>
                <h3 className="text-4xl font-bold text-white mt-1">{stats.totalEmployees}</h3>
                <p className="text-slate-500 text-xs mt-0.5">En todas las áreas</p>
              </div>
              <div className="bg-purple-500 bg-opacity-20 p-3 rounded-xl">
                <Users className="w-8 h-8 text-purple-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#243447] rounded-2xl shadow-xl p-5 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar área por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-[#1a2332] border border-slate-600 text-white rounded-lg px-5 py-3 pr-10 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">Todos los Estados</option>
                <option value="A">Activas</option>
                <option value="I">Inactivas</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      <div className="bg-[#243447] rounded-2xl shadow-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-400" />
          Lista de Áreas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAreas.map((area) => (
            <div key={area.area_id} className="bg-[#1a2332] rounded-xl p-5 border border-slate-700 hover:border-teal-500 transition-all shadow-md hover:shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    area.status === 'A' ? 'bg-cyan-500 bg-opacity-20' : 'bg-slate-500 bg-opacity-20'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      area.status === 'A' ? 'text-cyan-100' : 'text-slate-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate text-lg">{area.area_name}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                      area.status === 'A' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${area.status === 'A' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {area.status === 'A' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {renderActions(area)}
                </div>
              </div>

              {area.description && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{area.description}</p>
              )}

              {/* Jefe del Área */}
              {area.jefe ? (
                <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Jefe de Área</span>
                  </div>
                  <p className="text-white font-medium text-sm">{area.jefe.full_name}</p>
                  <p className="text-slate-400 text-xs">{area.jefe.email}</p>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-300 font-medium">Sin jefe asignado</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Users className="w-4 h-4" />
                  <span className="text-white font-medium">{area.employeeCount}</span>
                  <span>empleados</span>
                </div>
                
                {/* Botón Ver detalles */}
                <button
                  onClick={() => viewAreaDetails(area.area_id)}
                  className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1 transition-colors font-medium"
                  title="Ver detalles del área"
                >
                  Ver detalles
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAreas.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">
              {searchTerm || selectedStatus ? 'No se encontraron áreas con los filtros aplicados' : 'No hay áreas registradas'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 px-6 rounded-t-xl text-center relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-400/30 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm border-2 border-white/20">
                  <Building2 className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    {editingArea ? 'Editar Área' : 'Agregar Nueva Área'}
                  </h2>
                  <p className="text-blue-100 text-sm opacity-90">
                    {editingArea 
                      ? 'Modifica los datos del área' 
                      : 'Completa los siguientes campos para registrar una nueva área'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1.5 backdrop-blur-sm hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="bg-slate-800 rounded-b-xl">
              <AreaForm
                area={editingArea}
                onSave={handleSave}
                onCancel={closeModal}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-white hover:text-red-200"
          >
            <X className="w-4 h-4 inline" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AreaList;