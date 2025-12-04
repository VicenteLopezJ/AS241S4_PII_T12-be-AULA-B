import React, { useEffect, useState, useRef } from 'react';
import { Plus, Eye, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/laboratorio/api.js';
import PageShell from '../PageShell.jsx';

export default function MuestrasLab() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMuestreo, setEditingMuestreo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingRecepcion, setEditingRecepcion] = useState(null);
  const [editingDetalle, setEditingDetalle] = useState(null);
  const [savingDetalleId, setSavingDetalleId] = useState(null);
  const [hasPendingDetalleChanges, setHasPendingDetalleChanges] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'success'|'error'|'info', text }
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [originalEditingMuestreo, setOriginalEditingMuestreo] = useState(null);
  const [tiposEnsayos, setTiposEnsayos] = useState([]);

  // global loading provider removed — we use local loading state/messages

  const isMuestreoChanged = (edited, original) => {
    if (!edited || !original) return Boolean(edited || original);
    const eFundo = edited.fundo ?? edited.fundo ?? '';
    const oFundo = original.fundo ?? original.fundo ?? '';
    const eObs = edited.observaciones ?? edited.observaciones_muestreo ?? '';
    const oObs = original.observaciones ?? original.observaciones_muestreo ?? '';
    return String(eFundo) !== String(oFundo) || String(eObs) !== String(oObs);
  };
  // helper: intenta extraer una fecha válida del objeto muestreo (varias claves posibles)
  const getMuestreoDate = (item) => {
    if (!item) return null;
    // soportar objetos con clave `muest` o `muestreo`, o el objeto directo
    const m = item.muest ?? item.muestreo ?? item;
    if (!m) return null;
    const candidates = [m.fecha_muestreo, m.fecha, m.created_at, m.fecha_creacion, m.fecha_muestreo_iso];
    for (const c of candidates) {
      if (!c && c !== 0) continue;
      try {
        const d = new Date(c);
        if (!isNaN(d.getTime())) return d;
      } catch (_) {
        continue;
      }
    }
    return null;
  };
  // helper: obtener nombre legible de la empresa probando distintas claves
  const getEmpresaDisplayName = (empresa) => {
    if (!empresa) return '—';
    const candidates = [
      empresa.razon_social,
      empresa.razonSocial,
      empresa.nombre,
      empresa.nombre_comercial,
      empresa.razon_social_cliente,
      empresa.empresa_nombre,
      empresa.razon
    ];
    for (const c of candidates) {
      if (c || c === 0) return String(c);
    }
    return '—';
  };
  // helper: intentar extraer fecha de última modificación
  const getLastModifiedDate = (item) => {
    if (!item) return null;
    // soportar `muest`, `muestreo` o el objeto raíz
    const m = item.muest ?? item.muestreo ?? item;
    const candidates = [
      m && (m.updated_at ?? m.updatedAt),
      m && (m.fecha_modificacion ?? m.fecha_actualizacion),
      m && (m.modified_at ?? m.ultima_modificacion),
      item && (item.updated_at ?? item.updatedAt)
    ];
    for (const c of candidates) {
      if (!c && c !== 0) continue;
      try {
        const d = new Date(c);
        if (!isNaN(d.getTime())) return d;
      } catch (_) { }
    }
    return null;
  };

  const formatDateTime = (d) => {
    if (!d) return '—';
    const date = (d instanceof Date) ? d : new Date(d);
    if (isNaN(date.getTime())) return String(d);
    const pad = (n) => String(n).padStart(2, '0');
    const Y = date.getFullYear();
    const M = pad(date.getMonth() + 1);
    const D = pad(date.getDate());
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    return `${Y}-${M}-${D} ${h}:${m}`;
  };
  // pagination and caching
  const [rows, setRows] = useState([]); // raw list from API
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;
  const [displayRows, setDisplayRows] = useState(null); // enriched rows for current page; null = not yet loaded for page
  const enrichedCache = useRef({});

  const openMuestreo26 = () => {
    try {
      const url = api && typeof api.getMuestreoUrl === 'function' ? api.getMuestreoUrl(26) : '/api/muestreo/26';
      window.open(url, '_blank');
    } catch (e) {
      console.error('openMuestreo26 error', e);
      alert('Error abriendo /api/muestreo/26');
    }
  };

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load raw list of muestreos but DO NOT enrich everything at once.
      const res = await api.getMuestreos();
      const list = Array.isArray(res) ? res : (res && res.data ? res.data : [res]);

      // Ordenar por fecha (más reciente primero). Extraemos la fecha de cada
      // elemento (soportando varias claves posibles) y ordenamos descendente.
      const sorted = (list || []).slice().sort((a, b) => {
        const da = getMuestreoDate(a);
        const db = getMuestreoDate(b);
        if (da && db) return db.getTime() - da.getTime();
        if (da && !db) return -1; // a tiene fecha -> antes
        if (!da && db) return 1;  // b tiene fecha -> antes
        return 0;
      });

      setRows(sorted);
      enrichedCache.current = {};
      // load first page from sorted list
      await loadPage(1, sorted);
    } catch (e) {
      console.error('Error cargando listado /api/muestreo', e);
      setError(e);
      setRows([]);
      setDisplayRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Load and enrich only the items for a given page (1-based)
  const loadPage = async (pageNum, sourceList) => {
    setLoading(true);
    setError(null);
    try {
      // clear current page immediately so UI does not show previous page while loading
      setDisplayRows([]);
      const list = sourceList || rows || [];
      const start = (pageNum - 1) * perPage;
      const slice = list.slice(start, start + perPage);

      const enriched = await Promise.all(slice.map(async (mRaw) => {
        // If primitive id
        let m = mRaw;
        if (mRaw === null || (typeof mRaw !== 'object')) {
          const id = mRaw;
          try {
            const fetched = await api.getMuestreo(id);
            m = fetched && typeof fetched === 'object' ? fetched : { id_muestreo: id };
          } catch (e) {
            m = { id_muestreo: id };
          }
        }

        // Try to extract id
        const possibleId = m.id_muestreo ?? m.id ?? (m.muestreo && (m.muestreo.id_muestreo ?? m.muestreo.id));
        if (!possibleId) {
          return { ...m, detalles: [], recepcionEstado: null };
        }

        // If cached, return cached
        if (enrichedCache.current[possibleId]) return enrichedCache.current[possibleId];

        // optionally fetch full muestreo if minimal
        if (possibleId && (!m.muestreo && !m.detalles && !m.recepcionEstado)) {
          try {
            const full = await api.getMuestreo(possibleId);
            if (full && typeof full === 'object') m = full;
          } catch (e) {
            // ignore
          }
        }

        const muestreoId = m.muestreo ? (m.muestreo.id_muestreo ?? m.muestreo.id) : (m.id_muestreo ?? m.id);
        if (!muestreoId) {
          const minimal = { ...m, detalles: [], recepcionEstado: null };
          enrichedCache.current[possibleId] = minimal;
          return minimal;
        }

        const [detalleRes, estadoRes] = await Promise.allSettled([
          api.getMuestreoDetalle(muestreoId),
          api.getRecepcionEstado(muestreoId)
        ]);

        const detalles = detalleRes.status === 'fulfilled' ? (Array.isArray(detalleRes.value) ? detalleRes.value : [detalleRes.value]) : [];
        const recepcionEstado = estadoRes.status === 'fulfilled' ? estadoRes.value : null;

        const result = { ...m, detalles, recepcionEstado };
        enrichedCache.current[possibleId] = result;
        return result;
      }));

      setDisplayRows(enriched);
      setCurrentPage(pageNum);
      // Keep a simple top-level `data` for compatibility with other code
      setData(enriched);
    } catch (e) {
      console.error('Error cargando página de muestreos', e);
      setError(e);
      setDisplayRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    // cargar tipos de ensayos para edición de detalle
    (async () => {
      try {
        // local fetch for tipos de ensayos — no global loader
        const t = await api.getTiposEnsayos();
        const arr = Array.isArray(t) ? t : (t && Array.isArray(t.data) ? t.data : (t && Array.isArray(t.tipos) ? t.tipos : []));
        setTiposEnsayos(arr || []);
      } catch (e) {
        console.error('Error cargando tipos de ensayos', e);
        setTiposEnsayos([]);
      } finally {
      }
    })();
  }, []);

  // Helpers to toggle condiciones/opciones while editing recepcion
  const toggleCondicion = (key) => {
    setEditingRecepcion(prev => {
      if (!prev) return prev;
      const current = prev.condiciones?.[key];
      const next = (String(current).toLowerCase() === 'si') ? 'NO' : 'SI';
      return { ...prev, condiciones: { ...(prev.condiciones || {}), [key]: next } };
    });
  };

  const toggleOpcion = (key) => {
    setEditingRecepcion(prev => {
      if (!prev) return prev;
      const current = prev.opciones?.[key];
      const next = (String(current).toLowerCase() === 'si') ? 'NO' : 'SI';
      return { ...prev, opciones: { ...(prev.opciones || {}), [key]: next } };
    });
  };

  // extract save logic so we can call it from footer
  const saveEditing = async () => {
    if (!editingMuestreo) return;
    const muestreoId = editingMuestreo.id_muestreo ?? editingMuestreo.id ?? modalData.muest?.id_muestreo ?? modalData.muest?.id;
    if (!muestreoId) { setNotice({ type: 'error', text: 'ID de muestreo no disponible' }); setTimeout(() => setNotice(null), 3500); return; }
    setSaving(true);
    if (typeof setGlobalLoading !== 'undefined' && setGlobalLoading) setGlobalLoading(true);
    let attemptedPayload = null;
    try {
      // Force fecha/hora to current system date/time when saving (usuario solicitó automatizar)
      const now = new Date();
      const fechaNow = now.toISOString().split('T')[0];
      const horaNow = now.toTimeString().slice(0,5);
      const payload = {
        id_contrato: editingMuestreo.id_contrato ?? editingMuestreo.idContrato ?? undefined,
        fecha_muestreo: fechaNow,
        hora_muestreo: horaNow,
        fundo: editingMuestreo.fundo,
        observaciones: editingMuestreo.observaciones ?? editingMuestreo.observaciones_muestreo ?? undefined
      };
      attemptedPayload = payload;
      try { console.debug('[MuestrasLab] patchMuestreo payload ->', { muestreoId, payload }); } catch(_) {}
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      await api.patchMuestreo(muestreoId, payload);

      if (editingRecepcion) {
        const recepcionPayload = {
          condiciones: editingRecepcion.condiciones || {},
          opciones: editingRecepcion.opciones || {}
        };
        const recepcionId = editingRecepcion?.id_recepcion ?? editingRecepcion?.id ?? modalData.recepcionEstado?.id_recepcion ?? modalData.recepcionEstado?.id ?? null;
        try {
          if (recepcionId) {
            await api.patchRecepcionEstado(recepcionId, recepcionPayload);
          } else {
            await api.patchRecepcionEstado(muestreoId, recepcionPayload);
          }
        } catch (errRec) {
          console.error('Error guardando recepcionEstado', errRec);
          setNotice({ type: 'error', text: 'Muestreo guardado, pero error guardando estado de recepción: ' + (errRec && errRec.message ? errRec.message : errRec) });
          setTimeout(() => setNotice(null), 4500);
        }
        setEditingRecepcion(null);
      }
      // If there are pending detalle changes, send them now as part of the "guardar todo" flow
      if (modalData && Array.isArray(modalData.detalles)) {
        const pendientes = modalData.detalles.filter(d => d._dirty);
        if (pendientes.length > 0) {
          try {
            await Promise.all(pendientes.map(async (d) => {
              const id = d.id_detalle_muestreo ?? d.id;
              if (!id) return;
              const payload = {
                cod_laboratorio: d.cod_laboratorio,
                cod_campo: d.cod_campo,
                matriz: d.matriz,
                observaciones_muestra: d.observaciones_muestra || d.observaciones,
                id_tipo_ensayo: d.id_tipo_ensayo ? Number(d.id_tipo_ensayo) : null
              };
              // Try flexible updater that supports both /muestreo/detalle/{id} and /muestreo/{muestreoId}/detalles
              return api.patchMuestreoDetalleFlexible(muestreoId, id, payload);
            }));
            // clear _dirty flags locally
            setModalData(prev => {
              if (!prev) return prev;
              const updated = (prev.detalles || []).map(d => ({ ...d, _dirty: false }));
              return { ...prev, detalles: updated };
            });
            setHasPendingDetalleChanges(false);
          } catch (errPend) {
            console.error('Error guardando detalles pendientes', errPend);
            setNotice({ type: 'error', text: 'Muestreo guardado pero hubo errores guardando detalles pendientes.' });
            setTimeout(() => setNotice(null), 4500);
          }
        }
      }
      // If save succeeds, clear pending flags, refresh list and close
      setHasPendingChanges(false);
      setHasPendingDetalleChanges(false);
      setOriginalEditingMuestreo(null);
      // refresh full list for consistency
      await loadList();
      setIsEditing(false);
      setModalOpen(false);
      setNotice({ type: 'success', text: 'Muestreo actualizado' });
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      // Extract server-sent body if available for better diagnostics
      const serverBody = e && e.body ? (typeof e.body === 'object' ? JSON.stringify(e.body) : String(e.body)) : null;
      console.error('Error guardando muestreo', e, { serverBody, attemptedPayload });
      const noticeTextBase = e && e.message ? e.message : String(e || 'Error desconocido');
      const extra = serverBody ? ` - servidor: ${serverBody}` : '';
      setNotice({ type: 'error', text: 'Error actualizando muestreo: ' + noticeTextBase + extra });
      setTimeout(() => setNotice(null), 4500);
    } finally {
      setSaving(false);
      if (typeof setGlobalLoading !== 'undefined' && setGlobalLoading) setGlobalLoading(false);
    }
  };

  // Detail edit handlers
  const startEditDetalle = (d) => {
    const id = d.id_detalle_muestreo ?? d.id;
    setEditingDetalle({
      id,
      cod_campo: d.cod_campo || '',
      cod_laboratorio: d.cod_laboratorio || '',
      matriz: d.matriz || '',
      observaciones_muestra: (d.observaciones_muestra ?? d.observaciones) || '',
      id_tipo_ensayo: d.id_tipo_ensayo ?? d.idTipoEnsayo ?? null
    });
  };

  const cancelEditDetalle = () => setEditingDetalle(null);

  const updateEditingDetalleField = (field, value) => setEditingDetalle(prev => {
    const base = prev || {};
    return { ...base, [field]: value };
  });

  const selectDetalleToEdit = (detalleId) => {
    if (!modalData || !Array.isArray(modalData.detalles)) return;
    const det = modalData.detalles.find(x => (x.id_detalle_muestreo ?? x.id) === detalleId);
    if (det) startEditDetalle(det);
  };

  const saveDetalle = async (detalleId) => {
    if (!editingDetalle || (editingDetalle.id !== detalleId)) return;
    // Mark as saving locally (UI disabled)
    setSavingDetalleId(detalleId);
    try {
      // Update modalData locally and mark detalle as pending (_dirty)
      setModalData(prev => {
        if (!prev) return prev;
        const updatedDetalles = (prev.detalles || []).map(d => {
          const id = d.id_detalle_muestreo ?? d.id;
          if (id !== detalleId) return d;
          return {
            ...d,
            cod_laboratorio: editingDetalle.cod_laboratorio,
            cod_campo: editingDetalle.cod_campo,
            matriz: editingDetalle.matriz,
            observaciones_muestra: editingDetalle.observaciones_muestra,
            id_tipo_ensayo: editingDetalle.id_tipo_ensayo ?? d.id_tipo_ensayo ?? null,
            _dirty: true
          };
        });
        return { ...prev, detalles: updatedDetalles };
      });
      setHasPendingDetalleChanges(true);
      setEditingDetalle(null);
      // show non-blocking notice
      setNotice({ type: 'success', text: 'Detalle marcado como modificado (guardar muestreo para aplicar cambios).' });
      setTimeout(() => setNotice(null), 3500);
    } catch (e) {
      console.error('Error marcando detalle', e);
      setNotice({ type: 'error', text: 'Error guardando detalle en memoria.' });
      setTimeout(() => setNotice(null), 3500);
    } finally {
      setSavingDetalleId(null);
    }
  };

  return (
    <PageShell title="Muestreo" subtitle="Muestreos registrados">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Muestreos (modo prueba)</h3>
            <p className="text-sm text-gray-500">Listado completo de muestreos (GET <code>/api/muestreo</code>). Cada fila se enriquece con detalle y estado de recepción.</p>
          </div>
          {/* Modal fuera de la tabla - renderiza cuando modalOpen está activo */}
          {modalOpen && modalData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{isEditing ? 'Editar Muestreo' : 'Resumen Muestreo'}</h3>
                    <div className="text-sm text-gray-600">Muestreo ID: {modalData.muest?.id_muestreo ?? modalData.muest?.id}</div>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => { setModalOpen(false); setIsEditing(false); setEditingDetalle(null); setEditingRecepcion(null); setHasPendingDetalleChanges(false); setHasPendingChanges(false); setOriginalEditingMuestreo(null); setNotice(null); }} className="px-3 py-1 bg-gray-100 rounded">Cerrar</button>
                  </div>
                </div>

                  <div className="p-4">
                    {notice && (
                      <div className={`mb-3 p-2 rounded text-sm ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-800' : notice.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                        {notice.text}
                      </div>
                    )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold">Empresa</h5>
                      <div className="text-sm">{getEmpresaDisplayName(modalData.empresa)}</div>
                      <div className="text-xs text-gray-500">RUC: {modalData.empresa?.ruc || '—'}</div>
                    </div>
                    <div>
                      <h5 className="font-semibold">Contacto</h5>
                      <div className="text-sm">{modalData.contacto?.nombreCompleto || `${modalData.contacto?.nombre || ''} ${modalData.contacto?.apellido || ''}`}</div>
                      <div className="text-xs text-gray-500">{modalData.contacto?.email || (modalData.contacto?.telefono ? 'Tel: ' + modalData.contacto.telefono : '')}</div>
                    </div>
                    <div>
                      <h5 className="font-semibold">Muestreo</h5>
                      <div className="text-sm">{formatDateTime(getMuestreoDate(modalData))}</div>
                    </div>
                    <div>
                      <h5 className="font-semibold">Fundo</h5>
                      <div className="text-sm">{modalData.muest?.fundo || '—'}</div>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <h6 className="font-medium mb-2">Fundo / Observaciones</h6>
                    {!isEditing ? (
                      <>
                        <div className="text-sm">{modalData.muest?.fundo || '—'}</div>
                        <div className="text-sm mt-2 text-gray-600">{modalData.muest?.observaciones || modalData.muest?.observaciones_muestreo || '—'}</div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Fundo</label>
                          <input type="text" value={editingMuestreo?.fundo ?? ''} onChange={(e) => {
                              const val = e.target.value;
                              setEditingMuestreo(prev => {
                                const next = { ...(prev||{}), fundo: val };
                                if (originalEditingMuestreo) {
                                  setHasPendingChanges(isMuestreoChanged(next, originalEditingMuestreo));
                                } else {
                                  setHasPendingChanges(true);
                                }
                                return next;
                              });
                            }} className="w-full border rounded px-2 py-1" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Observaciones</label>
                          <textarea value={editingMuestreo?.observaciones ?? editingMuestreo?.observaciones_muestreo ?? ''} onChange={(e) => {
                              const val = e.target.value;
                              setEditingMuestreo(prev => {
                                const next = { ...(prev||{}), observaciones: val };
                                if (originalEditingMuestreo) {
                                  setHasPendingChanges(isMuestreoChanged(next, originalEditingMuestreo));
                                } else {
                                  setHasPendingChanges(true);
                                }
                                return next;
                              });
                            }} className="w-full border rounded px-2 py-1" rows={3} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h6 className="font-medium mb-2">Detalle(s)</h6>
                    <div className="text-sm text-gray-600 mb-2">Haz click en la tarjeta del detalle para editar (si estás en modo edición).</div>
                    <div className="flex gap-4 overflow-x-auto py-2 pb-4">
                      {(modalData.detalles || []).map((d,i) => {
                        const detId = d.id_detalle_muestreo ?? d.id ?? i;
                        const isSel = editingDetalle && (editingDetalle.id === detId);
                        return (
                          <div key={detId} onClick={() => isEditing && startEditDetalle(d)} className={`relative min-w-[260px] p-3 bg-white rounded border shadow-sm ${isEditing ? 'cursor-pointer hover:shadow-md' : ''} ${isSel ? 'ring-2 ring-emerald-300' : ''}`}>
                            {d._dirty && (
                              <div className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Pendiente</div>
                            )}
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-sm font-semibold">{`Detalle #${d.id_detalle_muestreo ?? d.id ?? (i+1)}`}</div>
                              <div className="text-xs text-gray-400">{d.id_detalle_muestreo ? `ID ${d.id_detalle_muestreo}` : ''}</div>
                            </div>
                            <div className="text-sm mb-1"><span className="font-semibold">Código campo:</span> {d.cod_campo || '—'}</div>
                            <div className="text-sm mb-1"><span className="font-semibold">Código laboratorio:</span> {d.cod_laboratorio || '—'}</div>
                            <div className="text-sm mb-1"><span className="font-semibold">Matriz:</span> {d.matriz || '—'}</div>
                            <div className="text-sm"><span className="font-semibold">Observaciones:</span> {d.observaciones_muestra || d.observaciones || '—'}</div>
                          </div>
                        );
                      })}
                    </div>

                    {editingDetalle && (
                      <div className="mt-3 p-3 bg-white border rounded">
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                          <div className="flex items-center"><span className="text-gray-500 w-36">Código campo:</span><input className="ml-2 border rounded px-2 py-1 w-full" value={editingDetalle.cod_campo} onChange={(e) => updateEditingDetalleField('cod_campo', e.target.value)} /></div>
                          <div className="flex items-center"><span className="text-gray-500 w-36">Código laboratorio:</span><input className="ml-2 border rounded px-2 py-1 w-full" value={editingDetalle.cod_laboratorio} onChange={(e) => updateEditingDetalleField('cod_laboratorio', e.target.value)} /></div>
                          <div className="flex items-center"><span className="text-gray-500 w-36">Matriz:</span><input className="ml-2 border rounded px-2 py-1 w-full" value={editingDetalle.matriz} onChange={(e) => updateEditingDetalleField('matriz', e.target.value)} /></div>
                          <div className="flex items-center mt-2"><span className="text-gray-500 w-36">Tipo de ensayo:</span>
                            <select className="ml-2 border rounded px-2 py-1 w-full" value={editingDetalle.id_tipo_ensayo ?? ''} onChange={(e) => updateEditingDetalleField('id_tipo_ensayo', e.target.value)}>
                              <option value="">-- Seleccione tipo de ensayo --</option>
                              {tiposEnsayos.map(t => (
                                <option key={t.id_tipo_ensayo ?? t.id ?? t.value ?? t.id_tipo} value={t.id_tipo_ensayo ?? t.id ?? t.value ?? t.id_tipo}>{t.nombre_ensayo ?? t.nombre ?? t.descripcion ?? String(t.id_tipo_ensayo ?? t.id ?? t.value ?? t.id_tipo)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="text-sm mt-3 text-gray-700">Observaciones: <textarea className="ml-2 border rounded px-2 py-1 w-full" value={editingDetalle.observaciones_muestra} onChange={(e) => updateEditingDetalleField('observaciones_muestra', e.target.value)} /></div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 justify-end">
                          <button onClick={cancelEditDetalle} className="px-3 py-1 bg-gray-100 rounded">Cancelar</button>
                          <button onClick={() => saveDetalle(editingDetalle.id)} disabled={savingDetalleId === editingDetalle.id} className="px-3 py-1 bg-emerald-600 text-white rounded">{savingDetalleId === editingDetalle.id ? 'Guardando...' : 'Guardar detalle'}</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <h6 className="font-medium mb-2">Recepción / Estado</h6>
                    { (modalData.recepcionEstado || editingRecepcion) ? (
                      <div className="text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="mb-2"><strong>Condiciones:</strong></div>
                            <div className="flex flex-col gap-2 text-sm">
                              {Object.entries((isEditing ? (editingRecepcion?.condiciones || {}) : (modalData.recepcionEstado?.condiciones || {}))).map(([k,v]) => (
                                <div key={k} className="flex items-center gap-3">
                                  <div className="text-sm text-gray-700 mr-2 w-48">{k}</div>
                                  {!isEditing ? (
                                    <div className={`text-xs font-semibold px-3 py-1 rounded-md border ${String(v).toLowerCase() === 'si' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-600 bg-red-50'}`}>{String(v).toUpperCase()}</div>
                                  ) : (
                                    <button onClick={() => toggleCondicion(k)} className={`text-xs font-semibold px-3 py-1 rounded-md border ${String(v).toLowerCase() === 'si' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-600 bg-red-50'}`}>{String(v).toUpperCase()}</button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="mb-2"><strong>Opciones:</strong></div>
                            <div className="flex flex-col gap-2 text-sm">
                              {Object.entries((isEditing ? (editingRecepcion?.opciones || {}) : (modalData.recepcionEstado?.opciones || {}))).map(([k,v]) => (
                                <div key={k} className="flex items-center gap-3">
                                  <div className="text-sm text-gray-700 mr-2 w-48">{k}</div>
                                  {!isEditing ? (
                                    <div className={`text-xs font-semibold px-3 py-1 rounded-md border ${String(v).toLowerCase() === 'si' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 bg-white'}`}>{String(v).toUpperCase()}</div>
                                  ) : (
                                    <button onClick={() => toggleOpcion(k)} className={`text-xs font-semibold px-3 py-1 rounded-md border ${String(v).toLowerCase() === 'si' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 bg-white'}`}>{String(v).toUpperCase()}</button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No hay información de recepción.</div>
                    )}
                  </div>

                </div>

                <div className="p-4 border-t flex items-center justify-between gap-2">
                  <div>
                    {isEditing && (hasPendingDetalleChanges || editingDetalle || hasPendingChanges) && (
                      <div className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded">{editingDetalle ? 'Editando detalle' : 'Cambios pendientes'}</div>
                    )}
                  </div>
                  <div>
                    {isEditing && (
                      <button onClick={saveEditing} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">{saving ? 'Guardando...' : 'Guardar'}</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/laboratorio/muestreo/nuevo')} className="text-sm px-3 py-2 bg-orange-500 text-white rounded-md flex items-center gap-2"><Plus className="w-4 h-4"/> Nueva Cadena</button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
              <strong>Error al cargar:</strong>
              <div className="mt-2 text-sm whitespace-pre-wrap">{(error && (error.message || JSON.stringify(error))) || 'Error desconocido'}</div>
            </div>
          )}

          {/* Table always renders headers; tbody content depends on loading/data state */}
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Muestreo (Fecha y hora)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fundo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  if (loading && (!displayRows || displayRows.length === 0)) {
                    return (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-600 py-8">Cargando muestreos...</td>
                      </tr>
                    );
                  }

                  const rowsToShow = (displayRows !== null) ? displayRows : (Array.isArray(data) ? data : (data ? [data] : []));
                  if (!rowsToShow || rowsToShow.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-600 py-8">No hay datos cargados todavía.</td>
                      </tr>
                    );
                  }

                  return rowsToShow.map((item, idx) => {
                    const obj = item.muestreo ? item : { muestreo: item };
                    const empresa = obj.empresa || obj.contrato?.empresa || {};
                    const contacto = obj.contacto || {};
                    const muest = obj.muestreo || {};
                    const detallesCount = (obj.detalles || muest.detalles || []).length;

                    return (
                      <tr key={muest.id_muestreo ?? muest.id ?? idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getEmpresaDisplayName(empresa)}</div>
                          <div className="text-xs text-gray-500">RUC: {empresa.ruc || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contacto.nombreCompleto || (contacto.nombre ? `${contacto.nombre} ${contacto.apellido || ''}` : 'Sin contacto principal')}</div>
                          <div className="text-xs text-gray-500">{contacto.email || `${(contacto && contacto.telefono) ? 'Tel: ' + contacto.telefono : ''}`}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{formatDateTime(getMuestreoDate(obj))}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{muest.fundo || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{detallesCount} detalle{detallesCount !== 1 ? 's' : ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <button title="Ver" onClick={() => {
                              const md = { empresa, contacto, muest, muestreo: muest, recepciones: obj.recepciones, detalles: obj.detalles, recepcionEstado: obj.recepcionEstado };
                                setModalData(md);
                                // When opening in "Ver" mode, hide the pending badge (do not clear server-side flags)
                                setHasPendingDetalleChanges(false);
                                setHasPendingChanges(false);
                                setOriginalEditingMuestreo(null);
                                setEditingDetalle(null);
                                setIsEditing(false);
                                setModalOpen(true);
                              }} className="p-2 rounded hover:bg-gray-100 text-indigo-600">
                              <Eye />
                            </button>
                            <button title="Editar" onClick={() => {
                              const md = { empresa, contacto, muest, muestreo: muest, recepciones: obj.recepciones, detalles: obj.detalles, recepcionEstado: obj.recepcionEstado };
                                setIsEditing(true);
                                setEditingMuestreo(muest);
                                setOriginalEditingMuestreo(muest ? { ...muest } : null);
                                setEditingRecepcion(obj.recepcionEstado || null);
                                setModalData(md);
                                setHasPendingDetalleChanges(Boolean((md.detalles || []).some(d => d._dirty)));
                                setHasPendingChanges(false);
                                setEditingDetalle(null);
                                setModalOpen(true);
                              }} className="p-2 rounded hover:bg-gray-100 text-green-600">
                              <Edit2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 rounded ${currentPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border'}`}
                onClick={() => { if (currentPage > 1) loadPage(currentPage - 1); }}
                disabled={currentPage <= 1}
              >Anterior</button>

              <div className="px-3 py-1 text-sm text-gray-700">{currentPage}/{Math.max(1, Math.ceil((rows?.length || 0) / perPage))}</div>

              <button
                className={`px-3 py-1 rounded ${currentPage >= Math.ceil((rows?.length || 0) / perPage) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border'}`}
                onClick={() => { const total = Math.max(1, Math.ceil((rows?.length || 0) / perPage)); if (currentPage < total) loadPage(currentPage + 1); }}
                disabled={currentPage >= Math.ceil((rows?.length || 0) / perPage)}
              >Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

