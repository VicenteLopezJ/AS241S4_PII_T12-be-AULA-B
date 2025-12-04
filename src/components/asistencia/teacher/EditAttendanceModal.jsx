import React, { useState } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import AttendanceService from '../../../services/asistencia/student/asistencia/attendanceeService';

const EditAttendanceModal = ({ attendance, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: attendance.status,
    observations: attendance.observations || ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await AttendanceService.updateAttendance(attendance.attendanceId, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Error al actualizar la asistencia: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-600 bg-opacity-30" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Editar Asistencia</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
              <p className="text-gray-900 font-medium">{attendance.studentName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <p className="text-gray-900">{attendance.courseName} ({attendance.courseCode})</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <p className="text-gray-900">{attendance.classDate}</p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Asistencia
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="P">✅ Presente</option>
                <option value="L">⏰ Tarde</option>
                <option value="A">❌ Ausente</option>
                <option value="J">📄 Justificado</option>
              </select>
            </div>

            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                id="observations"
                name="observations"
                rows="3"
                value={formData.observations}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;