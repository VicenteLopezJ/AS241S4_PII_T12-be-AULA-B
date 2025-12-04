import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tipoService from '../../../services/intranet/tipos/tipoService';
import '../../../styles/intranet/user/Dashboard.css';

const TipoForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const data = await tipoService.getById(id);
        if (!mounted) return;
        if (data) {
          setNombre(data.nombre ?? data.name ?? data.title ?? '');
          setDescripcion(data.descripcion ?? data.description ?? '');
        }
      } catch (e) {
        console.error('Error loading tipo:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { nombre, descripcion };
      if (isEdit) {
        await tipoService.update(id, payload);
      } else {
        await tipoService.create(payload);
      }
      navigate('/tipos');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="dashboard-header">
        <h1 className="text-2xl m-0">{isEdit ? 'Editar Tipo de Solicitud' : 'Crear Tipo de Solicitud'}</h1>
      </div>

      <form onSubmit={onSubmit} className="max-w-lg mt-6">
        <div className="mb-3">
          <label className="block text-sm mb-1">Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700" />
        </div>
        <div>
          <button className="btn-edit" disabled={saving}>
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TipoForm;
