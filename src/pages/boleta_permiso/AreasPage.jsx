import React, { useState, useEffect } from "react";
import { Plus, Users, Loader2, Search } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { AreaCard } from "../../components/boleta_permiso/areas/AreaCard";
import { AreaDetailsModal } from "../../components/boleta_permiso/areas/AreaDetailsModal";
import { AreaFormModal } from "../../components/boleta_permiso/areas/AreaFormModal";
import { areaService } from "../../services/boleta_permiso/areaService";

const AreasPage = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, A, I

  // Cargar áreas al montar el componente
  useEffect(() => {
    loadAreas();
    loadStats();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;

      // Si hay texto de búsqueda, siempre usamos searchAreas y luego filtramos por estado en memoria
      if (searchTerm && searchTerm.trim().length > 0) {
        const results = await areaService.searchAreas(searchTerm.trim());
        if (statusFilter === 'A' || statusFilter === 'I') {
          data = results.filter((a) => a.estado === statusFilter);
        } else {
          data = results;
        }
      } else if (statusFilter === 'A' || statusFilter === 'I') {
        // Sin búsqueda pero con filtro de estado
        data = await areaService.getAreasByStatus(statusFilter);
      } else {
        // Sin búsqueda y sin filtro de estado
        data = await areaService.getAllAreas();
      }
      setAreas(data);

    } catch (err) {
      setError(err.message);
      console.error('Error al cargar áreas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await areaService.getStatistics();
      setStats(data || null);
    } catch (err) {
      console.error('Error al obtener estadísticas de áreas:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateArea = async (id, formData) => {
    try {
      // Si recibe 2 argumentos, es actualización
      if (formData) {
        console.log(' Actualizando área ID:', id, 'con datos:', formData);
        await areaService.updateArea(id, formData);
      } 
      // Si recibe 1 argumento, es creación (id es realmente formData)
      else {
        console.log(' Creando nueva área con datos:', id);
        await areaService.createArea(id);
      }
      await loadAreas();
      await loadStats();
      setShowForm(false);
      setEditData(null);
    } catch (err) {
      console.error(' Error en handleCreateArea:', err);
      throw new Error(err.message);
    }
  };

  const handleViewDetails = (area) => {
    setSelectedArea(area);
    setShowDetails(true);
  };

  const handleEdit = (area) => {
    console.log(' Editando área:', area); // Debug
    setEditData(area);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    console.log(' Creando nueva área'); // Debug
    setEditData(null);
    setShowForm(true);
  };

  const handleToggleStatus = async (area) => {
    const action = area.estado === 'A' ? 'inactivar' : 'activar';
    
    if (!confirm(`¿Está seguro que desea ${action} esta área?`)) {
      return;
    }
    
    try {
      if (area.estado === 'A') {
        await areaService.deleteArea(area.id_area);
      } else {
        await areaService.restoreArea(area.id_area);
      }
      
      await loadAreas();
      await loadStats();
      
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDownloadExcel = async () => {
    try {
      await areaService.downloadReporteExcel();
    } catch (err) {
      alert(err.message || 'No se pudo descargar el reporte de áreas');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestión de Empleados</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/usuarios")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
          >
            <Users className="w-4 h-4" />
            <span>Usuarios</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm">
            <span>Áreas</span>
          </button>
        </div>
      </div>

      {/* Sección de Áreas */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Gestión de Áreas</h3>
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-end gap-3">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar por nombre o código..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full md:w-40 bg-gray-700 text-sm text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todas</option>
                <option value="A">Activas</option>
                <option value="I">Inactivas</option>
              </select>
              <button
                onClick={handleDownloadExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
              >
                <span>Exportar a Excel</span>
              </button>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Área</span>
              </button>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-sm">
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-xs">Total de áreas</p>
                <p className="text-white text-lg font-semibold">{stats.total}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-xs">Áreas activas</p>
                <p className="text-green-400 text-lg font-semibold">{stats.activas}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-xs">Áreas inactivas</p>
                <p className="text-red-400 text-lg font-semibold">{stats.inactivas}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-400">Cargando áreas...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Error al cargar áreas</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={loadAreas}
                className="mt-3 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Tarjetas de Áreas */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <p>No hay áreas registradas</p>
                  <button
                    onClick={handleCreateNew}
                    className="mt-4 text-blue-500 hover:text-blue-400"
                  >
                    Crear primera área
                  </button>
                </div>
              ) : (
                areas.map((area) => (
                  <AreaCard
                    key={area.id_area}
                    area={area}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      <div className="mt-8">
        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
          Cerrar Sesión
        </button>
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <AreaFormModal
          key={editData ? `edit-${editData.id_area}` : 'create'}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSubmit={handleCreateArea}
          editData={editData}
        />
      )}

      {/* Modal Detalles */}
      {showDetails && (
        <AreaDetailsModal
          area={selectedArea}
          onClose={() => {
            setShowDetails(false);
            setSelectedArea(null);
          }}
        />
      )}
    </div>
  );
};

export default AreasPage;