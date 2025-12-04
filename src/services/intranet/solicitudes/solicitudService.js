import { INTRANET_VVG_API as API } from '../../api';

const LOCAL_KEY = 'mock_solicitudes';

const readMock = () => {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeMock = (data) => localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

const STATE_MAP = { a: 'aprobado', e: 'espera', r: 'rechazado' };
const STATE_MAP_INV = Object.fromEntries(Object.entries(STATE_MAP).map(([k, v]) => [v, k]));

const mapStateToBackend = (s) => {
  if (!s) return s;
  if (STATE_MAP[s]) return STATE_MAP[s];
  return s;
};

const mapStateFromBackend = (s) => {
  if (!s) return s;
  if (STATE_MAP_INV[s]) return STATE_MAP_INV[s];
  return s;
};

const mapToBackendPayload = (p) => {
  const out = { ...p };
  if (out.estado) out.estado = mapStateToBackend(out.estado);
  const tipoVal = out.id_tipos_solicitudes ?? out.tipo_id ?? out.tipo ?? out.tipoId ?? out.id_tipo;
  if (typeof tipoVal !== 'undefined' && tipoVal !== null) out.id_tipos_solicitudes = tipoVal;
  if (typeof out.descripcion !== 'undefined' && !out.detalles) out.detalles = out.descripcion;
  const usuarioVal = out.usuario_id ?? out.user_id ?? out.userId ?? out.usuarioId;
  if (typeof usuarioVal !== 'undefined' && usuarioVal !== null) out.usuario_id = usuarioVal;
  return out;
};

const normalizeFromBackend = (obj) => {
  if (!obj) return obj;
  const o = { ...obj };
  const idVal = o.id_solicitudes ?? o.id ?? o.id_solicitud ?? o.idSolicitud;
  if (typeof idVal !== 'undefined') {
    o.id_solicitudes = idVal;
    o.id = idVal;
  }
  o.usuario_id = o.usuario_id ?? o.user_id ?? o.userId ?? o.usuarioId;
  o.id_tipos_solicitudes = o.id_tipos_solicitudes ?? o.tipo_id ?? o.tipo ?? o.id_tipo ?? o.tipoId;
  o.detalles = o.detalles ?? o.descripcion ?? o.detalle;
  o.estado = mapStateFromBackend(o.estado);
  return o;
};

export const solicitudService = {
  async getAll(estado = null) {
    try {
      let url = '/solicitudes/';
      if (estado === 'e') url = '/solicitudes/espera';
      else if (estado === 'a') url = '/solicitudes/aprobadas';
      else if (estado === 'r') url = '/solicitudes/rechazadas';
      console.debug('[solicitudService.getAll] GET', url, 'estado=', estado);
      const res = await API.get(url);
      const data = (res.data || []).map(normalizeFromBackend);
      try { writeMock(data); } catch { }
      return data;
    } catch (err) {
      console.error('solicitudService.getAll error:', err?.response?.data || err.message || err);
      return readMock();
    }
  },

  async getById(id) {
    try {
      const res = await API.get(`/solicitudes/${id}`);
      return normalizeFromBackend(res.data);
    } catch (err) {
      console.error('solicitudService.getById error:', err?.response?.data || err.message || err);
      const all = readMock();
      return all.find(s => String(s.id) === String(id)) || null;
    }
  },

  async create(payload) {
    try {
      const send = mapToBackendPayload(payload || {});
      if (!send.estado) send.estado = 'espera';
      console.debug('[solicitudService.create] POST /solicitudes/ payload:', send);
      const res = await API.post('/solicitudes/', send);
      console.debug('[solicitudService.create] response:', res && res.data ? res.data : res);
      return normalizeFromBackend(res.data);
    } catch (err) {
      console.error('solicitudService.create error:', err?.response?.data || err.message || err);
      const all = readMock();
      const id = all.length ? Math.max(...all.map(x => x.id)) + 1 : 1;
      const now = new Date().toISOString();
      const fallback = normalizeFromBackend({ id_solicitudes: id, fecha_creacion: now, ...mapToBackendPayload(payload || {}) });
      all.push(fallback);
      writeMock(all);
      return fallback;
    }
  },

  async update(id, payload) {
    try {
      const send = mapToBackendPayload(payload || {});
      console.debug('[solicitudService.update] PUT /solicitudes/' + id + ' payload:', send);
      const res = await API.put(`/solicitudes/${id}`, send);
      console.debug('[solicitudService.update] response:', res && res.data ? res.data : res);
      return normalizeFromBackend(res.data);
    } catch (err) {
      console.error('solicitudService.update error:', err?.response?.data || err.message || err);
      const all = readMock();
      const idx = all.findIndex(x => String(x.id) === String(id));
      if (idx !== -1) {
        const merged = { ...all[idx], ...normalizeFromBackend(mapToBackendPayload(payload || {})) };
        if ((merged.estado === 'a' || merged.estado === 'r') && !merged.fecha_fin) {
          merged.fecha_fin = new Date().toISOString();
        }
        all[idx] = merged;
        writeMock(all);
        return merged;
      }
      throw err;
    }
  },

  async changeState(id, nuevoEstado) {
    try {
      const backendEstado = mapStateToBackend(nuevoEstado);
      console.debug('[solicitudService.changeState] PUT /solicitudes/' + id + '/estado ->', backendEstado);
      const res = await API.put(`/solicitudes/${id}/estado`, { estado: backendEstado });
      console.debug('[solicitudService.changeState] response:', res && res.data ? res.data : res);
      return normalizeFromBackend(res.data);
    } catch (err) {
      console.error('solicitudService.changeState error:', err?.response?.data || err.message || err);
      if (err && err.response) throw err;
      const all = readMock();
      const idx = all.findIndex(x => String(x.id) === String(id));
      if (idx !== -1) {
        all[idx].estado = nuevoEstado;
        if ((nuevoEstado === 'a' || nuevoEstado === 'r') && !all[idx].fecha_fin) {
          all[idx].fecha_fin = new Date().toISOString();
        }
        writeMock(all);
        return all[idx];
      }
      throw err;
    }
  },

  async remove(id) {
    try {
      await API.delete(`/solicitudes/${id}`);
      return true;
    } catch (err) {
      console.error('solicitudService.remove error:', err?.response?.data || err.message || err);
      const all = readMock().filter(x => String(x.id) !== String(id));
      writeMock(all);
      return true;
    }
  }
};

export default solicitudService;
