import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  ArrowLeft,
  Search,
  Award,
  Mail,
  Briefcase,
  Hash,
  Calendar
} from 'lucide-react';
import { areasService } from '../../../services/seguimientoVacaciones/areasService';
import { employeesService } from '../../../services/seguimientoVacaciones/employeesService';


const AreaDetails = ({ onBack }) => {
  const navigate = useNavigate();
  // Obtener el ID del área desde sessionStorage
  const areaId = sessionStorage.getItem('selectedAreaId');

  const [area, setArea] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

  useEffect(() => {
    if (areaId) {
      loadAreaDetails();
    }
  }, [areaId]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadAreaDetails = async () => {
    try {
      setLoading(true);
      
      // Cargar información del área
      const areaData = await areasService.getById(areaId);
      setArea(areaData);

      // Cargar empleados del área
      const allEmployees = await employeesService.getAll();
      const areaEmployees = allEmployees.filter(emp => emp.area_id === parseInt(areaId));
      setEmployees(areaEmployees);
    } catch (error) {
      console.error('Error loading area details:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(emp =>
        (emp.first_name && emp.first_name.toLowerCase().includes(searchLower)) ||
        (emp.last_name && emp.last_name.toLowerCase().includes(searchLower)) ||
        (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
        (emp.gmail && emp.gmail.toLowerCase().includes(searchLower)) ||
        (emp.employee_position && emp.employee_position.toLowerCase().includes(searchLower))
      );
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Cargando información del área...</p>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg">Área no encontrada</p>
          <button
            onClick={onBack || (() => navigate('/vacaciones/areas'))}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Volver a Áreas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack || (() => navigate('/vacaciones/areas'))}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Áreas
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              {area.area_name}
            </h1>
            <p className="text-slate-400 mt-2 ml-1">{area.description || 'Sin descripción'}</p>
          </div>
        </div>

        {/* Info del Jefe */}
        {area.jefe && (
          <div className="bg-[#243447] rounded-xl p-5 border border-slate-700 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-3 rounded-xl">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Jefe de Área</p>
                <h3 className="text-xl font-bold text-white">{area.jefe.full_name}</h3>
                <p className="text-slate-400 text-sm">{area.jefe.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Empleados</p>
                <h3 className="text-4xl font-bold text-white mt-1">{employees.length}</h3>
              </div>
              <div className="bg-cyan-500 bg-opacity-20 p-3 rounded-xl">
                <Users className="w-8 h-8 text-cyan-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Empleados Activos</p>
                <h3 className="text-4xl font-bold text-white mt-1">
                  {employees.filter(emp => emp.status === 'A').length}
                </h3>
              </div>
              <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                <Users className="w-8 h-8 text-emerald-100" />
              </div>
            </div>
          </div>

          <div className="bg-[#243447] rounded-xl shadow-lg p-5 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Fecha de Registro</p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {area.registration_date ? new Date(area.registration_date).toLocaleDateString('es-PE') : 'N/A'}
                </h3>
              </div>
              <div className="bg-purple-500 bg-opacity-20 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-purple-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-[#243447] rounded-2xl shadow-xl p-5 border border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar empleado por nombre, apellido, email o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-[#243447] rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-[#1a2332]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Registro</th>
              </tr>
            </thead>

            <tbody className="bg-[#243447] divide-y divide-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                    <Users className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                    <p className="text-lg font-medium">
                      {searchTerm ? 'No se encontraron empleados' : 'No hay empleados en esta área'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentEmployees.map((employee) => (
                  <tr key={employee.employee_id} className="hover:bg-[#2a3f5f] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {employee.employee_position?.toLowerCase().includes('jefe') && (
                          <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-white font-medium">
                          {employee.first_name} {employee.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="truncate max-w-xs">{employee.email || employee.gmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        <span>{employee.employee_position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Hash className="w-4 h-4 text-slate-500" />
                        <span className="bg-slate-700 px-2 py-1 rounded text-xs font-medium mr-1">
                          {employee.document_type || 'DNI'}
                        </span>
                        <span>{employee.document_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {employee.registration_date 
                        ? new Date(employee.registration_date).toLocaleDateString('es-PE')
                        : 'N/A'
                      }
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
      </div>
    </div>
  );
};

export default AreaDetails;
