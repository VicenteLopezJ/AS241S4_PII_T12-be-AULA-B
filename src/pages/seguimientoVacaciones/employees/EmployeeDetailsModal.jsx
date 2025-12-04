import {
  X,
  User,
  Mail,
  FileText,
  Briefcase,
  Building2,
  Calendar,
  Hash,
  Clock
} from 'lucide-react';

/**
 * Modal de detalles de empleado - Diseño profesional sin scroll
 */
const EmployeeDetailsModal = ({ employee, onClose }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAreaColor = (areaName) => {
    const colors = {
      'Recursos Humanos': 'bg-blue-100 text-blue-800 border-blue-200',
      'Tecnología': 'bg-purple-100 text-purple-800 border-purple-200',
      'Ventas': 'bg-green-100 text-green-800 border-green-200',
      'Marketing': 'bg-pink-100 text-pink-800 border-pink-200',
      'Finanzas': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Operaciones': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[areaName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-200 relative">

        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white rounded-t-2xl p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-t-2xl"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-2 backdrop-blur-sm hover:bg-white/20 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
              <User className="w-12 h-12 text-white" />
            </div>

            {/* Info Principal */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {employee.first_name} {employee.last_name}
                </h1>
              </div>

              <p className="text-blue-200 text-xl font-medium mb-3">{employee.employee_position}</p>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getAreaColor(employee.area_name)}`}>
                  <Building2 className="w-4 h-4 inline mr-2" />
                  {employee.area_name}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${employee.status === 'A'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                  }`}>
                  {employee.status === 'A' ? '✓ Activo' : '✗ Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal - Grid de 3 columnas */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Columna 1: Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                Información Personal
              </h3>

              <div className="space-y-3">
                <DetailItem
                  icon={User}
                  label="Nombre Completo"
                  value={`${employee.first_name} ${employee.last_name}`}
                />
                <DetailItem
                  icon={Hash}
                  label="ID Empleado"
                  value={employee.employee_id}
                />
                <DetailItem
                  icon={FileText}
                  label="Tipo Documento"
                  value={employee.document_type || 'No especificado'}
                />
                <DetailItem
                  icon={Hash}
                  label="Número Documento"
                  value={employee.document_number || 'No especificado'}
                />
              </div>
            </div>

            {/* Columna 2: Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-green-600" />
                Contacto
              </h3>

              <div className="space-y-3">
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={employee.email || employee.gmail || 'No especificado'}
                  copyable
                />
              </div>
            </div>

            {/* Columna 3: Información Laboral */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Información Laboral
              </h3>

              <div className="space-y-3">
                <DetailItem
                  icon={Briefcase}
                  label="Cargo"
                  value={employee.employee_position}
                />
                <DetailItem
                  icon={Building2}
                  label="Área"
                  value={employee.area_name}
                />
                <DetailItem
                  icon={Calendar}
                  label="Fecha Registro"
                  value={formatDate(employee.registration_date)}
                />
                <DetailItem
                  icon={Clock}
                  label="Estado"
                  value={employee.status === 'A' ? 'Activo' : 'Inactivo'}
                  statusColor={employee.status === 'A' ? 'text-green-600' : 'text-red-600'}
                />
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="flex justify-center gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para cada item de detalle
const DetailItem = ({ icon: Icon, label, value, copyable = false, statusColor = 'text-gray-900' }) => {
  const handleCopy = () => {
    if (copyable && value) {
      navigator.clipboard.writeText(value);
      // Aquí podrías agregar una notificación de copiado
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-sm font-semibold ${statusColor} break-words ${copyable ? 'cursor-pointer hover:text-blue-600' : ''}`}
          onClick={copyable ? handleCopy : undefined}
          title={copyable ? 'Click para copiar' : undefined}>
          {value || 'No especificado'}
        </p>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;