import React, { useEffect, useState } from 'react';
import tipoService from '../../../services/intranet/tipos/tipoService';
import solicitudService from '../../../services/intranet/solicitudes/solicitudService';
import { userService } from '../../../services/intranet/user/userService';

export default function SolicitudFormModal({ initialData, onSubmit, onCancel }) {
  const [tipos, setTipos] = useState([]);
  const [tipoId, setTipoId] = useState(initialData?.tipo_id ?? initialData?.id_tipos_solicitudes ?? '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || initialData?.detalles || '');
  const [users, setUsers] = useState([]);
  const [usuarioId, setUsuarioId] = useState(initialData?.usuario_id ?? '');
  const [fechaInicio, setFechaInicio] = useState(initialData?.fecha_inicio ? String(initialData.fecha_inicio).slice(0, 10) : '');
  const [fechaFin, setFechaFin] = useState(initialData?.fecha_fin ? String(initialData.fecha_fin).slice(0, 10) : '');
  const [estado, setEstado] = useState(initialData?.estado ?? '');
  const [prioridad, setPrioridad] = useState(() => {
    const p = Number(initialData?.prioridad);
    return Number.isFinite(p) && p >= 1 && p <= 10 ? p : 1;
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    tipoService.getAll().then(data => {
      if (!mounted) return;
      setTipos(data || []);
      if (!tipoId && (data || []).length) {
        const first = data[0];
        const val = first?.id ?? first?.id_tipos_solicitudes ?? first?.value ?? '';
        setTipoId(String(val));
      }
    });
    // Only load users for create flow (no initialData)
    if (!initialData) {
      userService.getUsers().then(list => {
        if (!mounted) return;
        setUsers(Array.isArray(list) ? list : []);
        const firstUser = (Array.isArray(list) ? list : [])[0];
        if (firstUser && !usuarioId) setUsuarioId(String(firstUser.user_id ?? firstUser.id));
      }).catch(() => setUsers([]));
    }
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    setTipoId(initialData?.tipo_id ?? initialData?.id_tipos_solicitudes ?? '');
    setDescripcion(initialData?.descripcion || initialData?.detalles || '');
    setUsuarioId(initialData?.usuario_id ?? usuarioId);
    setFechaInicio(initialData?.fecha_inicio ? String(initialData.fecha_inicio).slice(0, 10) : '');
    setFechaFin(initialData?.fecha_fin ? String(initialData.fecha_fin).slice(0, 10) : '');
    setEstado(initialData?.estado ?? '');
    const p = Number(initialData?.prioridad);
    setPrioridad(Number.isFinite(p) && p >= 1 && p <= 10 ? p : 1);
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!tipoId) newErrors.tipoId = 'El tipo es obligatorio.';
    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria.';
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
      const tipoValue = tipoId ? (isNaN(Number(tipoId)) ? tipoId : Number(tipoId)) : null;
      const payload = {
        id_tipos_solicitudes: tipoValue,
        tipo_id: tipoValue,
        tipo: tipoValue,
        detalles: descripcion,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        prioridad: Math.min(10, Math.max(1, Number(prioridad) || 1)),
        // Creation: estado = 'espera'; Edit: send selected estado
        ...(initialData ? { estado } : { estado: 'espera' }),
        // For create, prefer explicit usuario selector; fallback to localStorage if missing
        ...(initialData
          ? {}
          : (() => {
              if (usuarioId) return { usuario_id: isNaN(Number(usuarioId)) ? usuarioId : Number(usuarioId) };
              try {
                const raw = localStorage.getItem('user');
                if (raw) {
                  const parsed = JSON.parse(raw);
                  const uid = parsed?.id ?? parsed?.user_id ?? parsed?.userId;
                  if (uid) return { usuario_id: uid };
                }
              } catch {}
              return {};
            })())
      };
      console.debug('SolicitudFormModal submitting payload:', payload, { initialData });
      if (typeof onSubmit === 'function') await onSubmit(payload);
      else await solicitudService.create(payload);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al guardar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 m-0">{initialData ? 'Editar Solicitud' : 'Nueva Solicitud'}</h3>
      {!initialData && (
        <div>
          <label className="text-sm text-slate-300">Usuario</label>
          <select
            className={`mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 ${errors.usuarioId ? 'border-red-500' : ''}`}
            value={usuarioId}
            onChange={(e) => {
              setUsuarioId(e.target.value);
              if (errors.usuarioId) setErrors(prev => ({ ...prev, usuarioId: '' }));
            }}
            required
          >
            <option value="">Seleccione...</option>
            {users.map(u => (
              <option key={u.user_id ?? u.id} value={u.user_id ?? u.id}>{u.user_name ?? u.name} ({u.role || '—'})</option>
            ))}
          </select>
          {errors.usuarioId && <p className="text-red-500 text-xs mt-1">{errors.usuarioId}</p>}
        </div>
      )}

      <div>
        <label className="text-sm text-slate-300">Tipo</label>
        <select
          className={`mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 ${errors.tipoId ? 'border-red-500' : ''}`}
          value={tipoId}
          onChange={(e) => {
            const v = e.target.value;
            setTipoId(v);
            if (errors.tipoId) setErrors(prev => ({ ...prev, tipoId: '' }));
          }}
          required
        >
          <option value="">Seleccione...</option>
          {tipos.map(t => (
            <option key={t.id_tipos_solicitudes ?? t.id ?? t.value} value={t.id_tipos_solicitudes ?? t.id ?? t.value}>{t.nombre ?? t.name}</option>
          ))}
        </select>
        {errors.tipoId && <p className="text-red-500 text-xs mt-1">{errors.tipoId}</p>}
      </div>

      {initialData && (
        <div>
          <label className="text-sm text-slate-300">Estado</label>
          <select
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Seleccione...</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="espera">En espera</option>
          </select>
        </div>
      )}

      <div>
        <label className="text-sm text-slate-300">Descripción</label>
        <textarea
          className={`mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 ${errors.descripcion ? 'border-red-500' : ''}`}
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value);
            if (errors.descripcion) setErrors(prev => ({ ...prev, descripcion: '' }));
          }}
          rows={5}
        />
        {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-300">Fecha inicio</label>
          <input
            type="date"
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Fecha fin</label>
          <input
            type="date"
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-300">Prioridad: <span className="font-semibold">{prioridad}</span></label>
        <input
          type="range"
          min="1"
          max="10"
          value={prioridad}
          onChange={(e) => setPrioridad(Number(e.target.value))}
          className="w-full mt-2"
        />
        <div className="flex justify-between text-xs text-slate-400"><span>1</span><span>10</span></div>
      </div>

      <div className="flex justify-end items-center gap-3">
        <button type="button" onClick={onCancel} className="bg-slate-900 text-slate-200 px-4 py-2 rounded shadow hover:bg-slate-800">Cancelar</button>
        <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-500 disabled:opacity-60">{submitting ? 'Enviando...' : 'Enviar'}</button>
      </div>
    </form>
  );
}
