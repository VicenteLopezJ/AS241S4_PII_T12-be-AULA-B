import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import solicitudService from '../../../services/intranet/solicitudes/solicitudService';
import tipoService from '../../../services/intranet/tipos/tipoService';
import { userService } from '../../../services/intranet/user/userService';

const SolicitudForm = () => {
  const [tipos, setTipos] = useState([]);
  const [users, setUsers] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [detalles, setDetalles] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [prioridad, setPrioridad] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    tipoService.getAll().then(data => {
      if (!mounted) return;
      setTipos(data || []);
      const firstTipo = (data || [])[0];
      if (firstTipo) setTipoId(String(firstTipo.id_tipos_solicitudes ?? firstTipo.id ?? firstTipo.value ?? ''));
    });
    userService.getUsers().then(list => {
      if (!mounted) return;
      setUsers(Array.isArray(list) ? list : []);
      const firstUser = (Array.isArray(list) ? list : [])[0];
      if (firstUser) setUsuarioId(String(firstUser.user_id ?? firstUser.id));
    }).catch(() => setUsers([]));
    return () => (mounted = false);
  }, []);

  const validate = () => {
    const errs = {};
    if (!usuarioId) errs.usuarioId = 'El usuario es obligatorio';
    if (!tipoId) errs.tipoId = 'El tipo de solicitud es obligatorio';
    if (!detalles.trim()) errs.detalles = 'Los detalles son obligatorios';
    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      errs.fechaFin = 'La fecha fin no puede ser menor que inicio';
    }
    const p = Number(prioridad);
    if (!Number.isFinite(p) || p < 1 || p > 10) errs.prioridad = 'La prioridad debe estar entre 1 y 10';
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setSaving(true);
    try {
      const payload = {
        usuario_id: isNaN(Number(usuarioId)) ? usuarioId : Number(usuarioId),
        id_tipos_solicitudes: isNaN(Number(tipoId)) ? tipoId : Number(tipoId),
        detalles,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        prioridad: Math.min(10, Math.max(1, Number(prioridad) || 1)),
        estado: 'espera',
      };
      await solicitudService.create(payload);
      navigate('/solicitudes');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">➕ Agregar Solicitud</h1>
      <form onSubmit={onSubmit} className="max-w-lg">
        <div className="mb-3">
          <label className="block text-sm mb-1">Usuario</label>
          <select value={usuarioId} onChange={e => setUsuarioId(e.target.value)} className="w-full p-2 rounded bg-slate-900 text-white">
            <option value="">Seleccione...</option>
            {users.map(u => (
              <option key={u.user_id} value={u.user_id}>{u.user_name} ({u.role || '—'})</option>
            ))}
          </select>
          {errors.usuarioId && <p className="text-red-500 text-xs mt-1">{errors.usuarioId}</p>}
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Tipo de Solicitud</label>
          <select value={tipoId} onChange={e => setTipoId(e.target.value)} className="w-full p-2 rounded bg-slate-900 text-white">
            <option value="">Seleccione...</option>
            {tipos.map(t => (
              <option key={t.id_tipos_solicitudes ?? t.id} value={t.id_tipos_solicitudes ?? t.id}>{t.nombre || t.name || t.title}</option>
            ))}
          </select>
          {errors.tipoId && <p className="text-red-500 text-xs mt-1">{errors.tipoId}</p>}
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Detalles</label>
          <textarea value={detalles} onChange={e => setDetalles(e.target.value)} className="w-full p-2 rounded bg-slate-900 text-white" rows={4} />
          {errors.detalles && <p className="text-red-500 text-xs mt-1">{errors.detalles}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="mb-3">
            <label className="block text-sm mb-1">Fecha inicio</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full p-2 rounded bg-slate-900 text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Fecha fin</label>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full p-2 rounded bg-slate-900 text-white" />
            {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Prioridad: <span className="font-semibold">{prioridad}</span></label>
          <input type="range" min="1" max="10" value={prioridad} onChange={e => setPrioridad(Number(e.target.value))} className="w-full" />
          {errors.prioridad && <p className="text-red-500 text-xs mt-1">{errors.prioridad}</p>}
        </div>

        <div>
          <button className="bg-emerald-500 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Guardando...' : 'Enviar'}</button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudForm;
