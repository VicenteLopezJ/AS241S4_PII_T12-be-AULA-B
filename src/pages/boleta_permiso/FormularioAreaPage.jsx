import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

const FormularioAreaPage = ({ onClose, onSubmit }) => {
  const [newAreaForm, setNewAreaForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateArea = async () => {
    if (!newAreaForm.name.trim()) {
      setError("El nombre del área es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(newAreaForm);
      // El modal se cierra desde el padre después del éxito
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Agregar Nueva Área</h3>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="space-y-5">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Nombre del Área <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newAreaForm.name}
            onChange={(e) =>
              setNewAreaForm({ ...newAreaForm, name: e.target.value })
            }
            disabled={loading}
            className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            placeholder="Ingrese el nombre del área"
            maxLength={100}
          />
          <p className="text-gray-500 text-xs mt-1">
            {newAreaForm.name.length}/100 caracteres
          </p>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Descripción
          </label>
          <textarea
            value={newAreaForm.description}
            onChange={(e) =>
              setNewAreaForm({ ...newAreaForm, description: e.target.value })
            }
            disabled={loading}
            className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all disabled:opacity-50"
            rows="4"
            placeholder="Ingrese una descripción (opcional)"
            maxLength={200}
          />
          <p className="text-gray-500 text-xs mt-1">
            {newAreaForm.description.length}/200 caracteres
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex space-x-3 mt-7">
        <button
          onClick={handleCreateArea}
          disabled={!newAreaForm.name.trim() || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{loading ? 'Creando...' : 'Crear Área'}</span>
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default FormularioAreaPage;