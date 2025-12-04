import API from './api';

// Transformar datos del backend al frontend
const transformInventarioFromAPI = (inv) => ({
  idInventory: inv.cabecera.idInventory,
  idMedication: inv.detalle.idMedication,
  medicationName: inv.detalle.medicationName,
  currentStock: inv.detalle.currentStock,
  minStock: inv.detalle.minStock,
  maxStock: inv.detalle.maxStock,
  updateDate: inv.cabecera.updateDate,
  status: inv.cabecera.status
});

// Transformar datos del frontend al backend
const transformInventarioToAPI = (inv) => ({
  idMedication: inv.idMedication,
  currentStock: parseInt(inv.currentStock) || 0,
  minStock: parseInt(inv.minStock) || 0,
  maxStock: parseInt(inv.maxStock) || 0
});

export const inventarioService = {
  getAll: async () => {
    const response = await API.get('/inventario');
    return response.data.map(transformInventarioFromAPI);
  },
  getByEstado: async (estado) => {
    const response = await API.get(`/inventario/estado/${estado}`);
    return response.data.map(transformInventarioFromAPI);
  },
  getById: async (id) => {
    const response = await API.get(`/inventario/${id}`);
    return transformInventarioFromAPI(response.data);
  },
  create: async (data) => {
    const payload = transformInventarioToAPI(data);
    const response = await API.post('/inventario', payload);
    return transformInventarioFromAPI(response.data);
  },
  update: async (id, data) => {
    const payload = transformInventarioToAPI(data);
    const response = await API.put(`/inventario/${id}`, payload);
    return transformInventarioFromAPI(response.data);
  },
  delete: async (id) => {
    const response = await API.patch(`/inventario/${id}`);
    return response.data;
  },
  restore: async (id) => {
    const response = await API.patch(`/inventario/restore/${id}`);
    return response.data;
  }
};
