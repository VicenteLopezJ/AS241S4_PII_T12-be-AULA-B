import React, { useState } from 'react';

export default function RoleForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    } else {
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(name.trim())) {
        newErrors.name = 'El nombre solo debe contener letras y espacios, sin números ni signos.';
      }
    }
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
      await onSubmit({ name, description });
    } catch (e) {
      alert(e.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 m-0">{initialData ? 'Editar Rol' : 'Crear Rol'}</h3>

      <div>
        <label className="text-sm text-slate-300">Nombre</label>
        <input
          className={`mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.name ? 'border-red-500' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="text-sm text-slate-300">Descripción</label>
        <textarea
          className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
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
