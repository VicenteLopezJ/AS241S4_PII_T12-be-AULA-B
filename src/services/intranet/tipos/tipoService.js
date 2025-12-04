import { INTRANET_VVG_API as API } from '../../api';

const LOCAL_KEY = 'mock_tipos_solicitudes';

const readMock = () => {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeMock = (data) => localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

export const tipoService = {
  async getAll() {
    try {
      const res = await API.get('/tipos_solicitudes/');
      return (res.data || []).map(t => ({
        ...t,
        id: t.id_tipos_solicitudes ?? t.id ?? t.value
      }));
    } catch (err) {
      return readMock();
    }
  },

  async getAllWithStatus() {
    try {
      const res = await API.get('/tipos_solicitudes/all');
      return (res.data || []).map(t => ({
        ...t,
        id: t.id_tipos_solicitudes ?? t.id ?? t.value
      }));
    } catch (err) {
      return readMock();
    }
  },

  async getInactive() {
    try {
      const res = await API.get('/tipos_solicitudes/inactive');
      return (res.data || []).map(t => ({
        ...t,
        id: t.id_tipos_solicitudes ?? t.id ?? t.value
      }));
    } catch (err) {
      return readMock().filter(t => t.status === 0);
    }
  },

  async getById(id) {
    try {
      const res = await API.get(`/tipos_solicitudes/${id}`);
      const t = res.data;
      if (!t) return null;
      return { ...t, id: t.id_tipos_solicitudes ?? t.id ?? t.value };
    } catch (err) {
      const all = readMock();
      return all.find(t => String(t.id) === String(id)) || null;
    }
  },

  async create(payload) {
    try {
      const res = await API.post('/tipos_solicitudes/', payload);
      return res.data;
    } catch (err) {
      const all = readMock();
      const id = all.length ? Math.max(...all.map(x => x.id)) + 1 : 1;
      const item = { id, ...payload };
      all.push(item);
      writeMock(all);
      return item;
    }
  },

  async update(id, payload) {
    try {
      const res = await API.put(`/tipos_solicitudes/${id}`, payload);
      return res.data;
    } catch (err) {
      const all = readMock();
      const idx = all.findIndex(x => String(x.id) === String(id));
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...payload };
        writeMock(all);
        return all[idx];
      }
      throw err;
    }
  },

  async remove(id) {
    try {
      await API.delete(`/tipos_solicitudes/${id}`);
      return true;
    } catch (err) {
      const all = readMock().filter(x => String(x.id) !== String(id));
      writeMock(all);
      return true;
    }
  }
  ,
  async restore(id) {
    try {
      const res = await API.put(`/tipos_solicitudes/${id}/restaurar`);
      return res.data;
    } catch (err) {
      const all = readMock();
      const idx = all.findIndex(x => String(x.id) === String(id));
      if (idx !== -1) {
        all[idx].status = 1;
        writeMock(all);
        return all[idx];
      }
      throw err;
    }
  }
};

export default tipoService;
