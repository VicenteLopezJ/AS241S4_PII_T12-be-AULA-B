import React, { useState, useEffect } from "react";
import { X, Building2, User, Mail, Briefcase, Calendar } from "lucide-react";
import { areaService } from "../../../services/boleta_permiso/areaService";

export const AreaDetailsModal = ({ area, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);

  const handleLoadEmployees = async () => {
    if (!area?.id_area) return;
    try {
      setLoadingEmployees(true);
      setEmployeesError(null);
      const data = await areaService.getAreaEmployees(area.id_area);
      setEmployees(data || []);
    } catch (err) {
      console.error('Error al cargar empleados del área:', err);
      setEmployeesError(err.message || 'Error al cargar empleados del área');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Cargar empleados automáticamente al abrir el modal o cambiar de área
  useEffect(() => {
    if (area?.id_area) {
      handleLoadEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area?.id_area]);

  if (!area) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">{area.nombre_area}</h3>
            </div>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              area.estado === 'A' 
                ? 'bg-green-900/30 text-green-400 border border-green-600' 
                : 'bg-red-900/30 text-red-400 border border-red-600'
            }`}>
              {area.estado_texto}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              Descripción
            </h4>
            <p className="text-white bg-gray-700/50 rounded-lg p-4">
              {area.descripcion || "Sin descripción"}
            </p>
          </div>

          {/* Información del Jefe */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Jefe de Área
            </h4>
            {area.jefe_area ? (
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-5 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 rounded-full p-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">
                      {area.jefe_area.nombre_completo}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 pl-11">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{area.jefe_area.cargo}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${area.jefe_area.correo}`} className="text-sm hover:underline">
                      {area.jefe_area.correo}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-5 text-center">
                <p className="text-gray-400 italic">Sin jefe asignado</p>
              </div>
            )}
          </div>

          {/* Información Adicional */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Información Adicional
            </h4>
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">ID de Área</span>
                <span className="text-white font-mono">{area.id_area}</span>
              </div>
              {area.codigo_area && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Código</span>
                  <span className="text-white font-mono">{area.codigo_area}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Fecha de Registro</span>
                <span className="text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(area.fecha_registro).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Empleados del área */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Empleados del Área
              </h4>
              <button
                type="button"
                onClick={handleLoadEmployees}
                disabled={loadingEmployees}
                className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loadingEmployees ? 'Cargando...' : 'Cargar empleados'}
              </button>
            </div>

            {employeesError && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-3 text-red-400 text-xs">
                {employeesError}
              </div>
            )}

            {employees && employees.length > 0 ? (
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                {employees.map((emp) => (
                  <div
                    key={emp.id_usuario}
                    className="flex flex-col border-b border-gray-600 last:border-b-0 pb-2 mb-2 last:pb-0 last:mb-0"
                  >
                    <span className="text-white text-sm">{emp.nombre_completo}</span>
                    <span className="text-gray-400 text-xs">{emp.cargo}</span>
                    <span className="text-blue-400 text-xs">{emp.correo}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                {loadingEmployees ? 'Cargando empleados...' : 'No hay empleados cargados para esta área'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};