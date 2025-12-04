import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const ObservacionModal = ({ open, onClose, onSubmit, defaultComentario = '' }) => {
  // Comentario general (opcional)
  const [comentarioGeneral, setComentarioGeneral] = useState(defaultComentario || '');
  // Descripción específica de la observación (obligatoria)
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('OTRO');
  const [esCritica, setEsCritica] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      setError('La descripción de la observación es obligatoria');
      return;
    }

    onSubmit?.({
      comentario_general: comentarioGeneral.trim() || null,
      observacion: {
        id_documento_ref: null,
        tipo_observacion: tipo,
        descripcion_observacion: descripcion.trim(),
        es_critica: esCritica ? 'S' : 'N',
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Registrar Observación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Comentario general (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comentario general (opcional)
            </label>
            <textarea
              value={comentarioGeneral}
              onChange={(e) => {
                setComentarioGeneral(e.target.value);
              }}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px] text-sm"
              placeholder="Ej: Revisar horarios, verificar documentos, etc."
            />
          </div>

          {/* Descripción específica de la observación */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detalle de la observación <span className="text-red-400">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                if (error) setError(null);
              }}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px] text-sm"
              placeholder="Describe exactamente qué debe corregir el empleado..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de observación
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="DOCUMENTO_INCOMPLETO">DOCUMENTO_INCOMPLETO</option>
                <option value="DOCUMENTO_ILEGIBLE">DOCUMENTO_ILEGIBLE</option>
                <option value="FECHA_INVALIDA">FECHA_INVALIDA</option>
                <option value="HORARIO_CONFLICTO">HORARIO_CONFLICTO</option>
                <option value="JUSTIFICACION_INSUFICIENTE">JUSTIFICACION_INSUFICIENTE</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-7">
              <input
                id="obs-es-critica"
                type="checkbox"
                checked={esCritica}
                onChange={(e) => setEsCritica(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 bg-gray-700"
              />
              <label htmlFor="obs-es-critica" className="text-sm text-gray-300">
                ¿Es observación crítica?
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-700 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
            >
              Confirmar Observación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
