import React, { useState, useEffect } from 'react';
import tipoService from '../../../services/intranet/tipos/tipoService';

export default function TipoFormModal({ initialData, onSubmit, onCancel }) {
  const [nombre, setNombre] = useState(initialData?.nombre || initialData?.name || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || initialData?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setNombre(initialData?.nombre ?? initialData?.name ?? '');
    setDescripcion(initialData?.descripcion ?? initialData?.description ?? '');
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    } else {
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre.trim())) {
        newErrors.nombre = 'El nombre solo debe contener letras y espacios, sin números ni signos.';
      }
    }
    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({ nombre, descripcion });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 m-0">{initialData ? 'Editar Tipo' : 'Crear Tipo'}</h3>

      <div>
        <label className="text-sm text-slate-300">Nombre</label>
        <input
          className={`mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.nombre ? 'border-red-500' : ''}`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
      </div>

      <div>
        <label className="text-sm text-slate-300">Descripción</label>
        <textarea
          className={`mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.descripcion ? 'border-red-500' : ''}`}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
        />
        {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
      </div>

      <div className="flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-900 text-slate-200 px-4 py-2 rounded shadow hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-700 text-white px-4 py-2 rounded shadow hover:bg-amber-600 disabled:opacity-60"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
