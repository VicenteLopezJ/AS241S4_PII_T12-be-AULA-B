import React, { useState, useEffect } from 'react';
import { X, User, Clock, Search, UserPlus, AlertCircle, CheckCircle, Building } from 'lucide-react';

import Swal from 'sweetalert2';
import { employeesService } from '../../../services/seguimientoVacaciones/employeesService';
import employeePeriodService from '../../../services/seguimientoVacaciones/employeePeriodService';


const CreateIndividualEmployeePeriod = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.document_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);


  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const result = await employeesService.getEligibleForVacation();

      if (result.success && result.data) {
        setEmployees(result.data);
        setFilteredEmployees(result.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error || 'No se pudieron cargar los empleados',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff'
        });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al cargar los empleados',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const calculateServiceYears = (registrationDate) => {
    if (!registrationDate) return 0;
    const start = new Date(registrationDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const monthDiff = now.getMonth() - start.getMonth();
    return monthDiff < 0 ? years - 1 : years;
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor selecciona un empleado',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear período vacacional?',
      html: `
      <p class="text-slate-300">Se creará el período vacacional para:</p>
      <p class="text-white font-bold mt-2">${selectedEmployee.first_name} ${selectedEmployee.last_name}</p>
    `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      background: '#243447',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const response = await employeePeriodService.createIndividualEmployeePeriod(selectedEmployee.employee_id);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Período vacacional creado correctamente',
          confirmButtonColor: '#14b8a6',
          background: '#243447',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false
        });

        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error creating period:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear el período vacacional',
        confirmButtonColor: '#14b8a6',
        background: '#243447',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="w-full max-w-4xl bg-[#1a2332]/95 rounded-xl shadow-2xl border border-slate-700/50 p-5 max-h-[85vh] overflow-y-auto backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Crear Período Individual</h1>
              <p className="text-slate-400 text-sm mt-0.5">Asigna período vacacional a un empleado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-[#243447]/50 rounded-lg shadow-lg border border-slate-700/30 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white" />
                <h2 className="text-base font-semibold text-white">Seleccionar Empleado</h2>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#1a2332] border border-slate-600 text-white text-sm placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Selected Employee */}
              {selectedEmployee && (
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-300 font-medium">Seleccionado</p>
                        <p className="text-sm font-bold text-white">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                        <p className="text-xs text-slate-400">{selectedEmployee.employee_position || 'Sin cargo'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEmployee(null)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-1.5 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Requirements Alert */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-200">
                    <p className="font-semibold mb-1">Requisitos:</p>
                    <ul className="space-y-0.5 ml-3 text-[11px]">
                      <li>• Empleado <strong>Activo</strong></li>
                      <li>• Al menos <strong>1 año de antigüedad</strong></li>
                      <li>• <strong>Cuenta de usuario</strong> registrada</li>
                      <li>• Sin período vacacional previo</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Employee Table */}
              <div className="bg-[#1a2332] border border-slate-600 rounded-lg overflow-hidden">
                {loadingEmployees ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-500 mx-auto mb-3"></div>
                      <p className="text-slate-400 text-sm">Cargando empleados...</p>
                    </div>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">No se encontraron empleados</p>
                      <p className="text-slate-500 text-xs mt-1">Intenta ajustar tu búsqueda</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-80">
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead className="bg-[#243447] sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Empleado
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Cargo
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Antigüedad
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Acción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#1a2332] divide-y divide-slate-700">
                        {filteredEmployees.map((employee) => {
                          const serviceYears = calculateServiceYears(employee.registration_date);
                          const isSelected = selectedEmployee?.employee_id === employee.employee_id;

                          return (
                            <tr
                              key={employee.employee_id}
                              className={`hover:bg-[#243447] transition-colors cursor-pointer ${isSelected ? 'bg-blue-500/10' : ''}`}
                              onClick={() => handleSelectEmployee(employee)}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <User className="h-4 w-4 text-slate-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-white">
                                      {employee.last_name}, {employee.first_name}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      DNI: {employee.document_number || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-slate-500" />
                                  <span className="text-sm text-slate-300">
                                    {employee.employee_position || 'Sin especificar'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Clock className="h-4 w-4 text-slate-400" />
                                  <span className={`text-sm font-medium ${serviceYears >= 1 ? 'text-green-400' : 'text-amber-400'}`}>
                                    {serviceYears} {serviceYears === 1 ? 'año' : 'años'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectEmployee(employee);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-blue-500 hover:text-white'
                                    }`}
                                >
                                  {isSelected ? (
                                    <CheckCircle className="w-4 h-4 inline" />
                                  ) : (
                                    'Seleccionar'
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#1a2332] border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700 font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !selectedEmployee}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Crear Período
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateIndividualEmployeePeriod;