import { INTRANET_VVG_API as API } from '../../api';

const roleService = {
  getRoles: async (name = '') => {
    try {
      // Use trailing slash to avoid server redirect (preflight OPTIONS cannot follow redirects)
      const url = name ? `/roles/?name=${encodeURIComponent(name)}` : '/roles/';
      console.log('roleService.getRoles url:', url);
      const res = await API.get(url);
      return res.data;
    } catch (err) {
      console.error('roleService.getRoles error:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener roles');
    }
  },

  getAllRoles: async (name = '') => {
    try {
      const url = name ? `/roles/all?name=${encodeURIComponent(name)}` : '/roles/all';
      console.log('roleService.getAllRoles url:', url);
      const res = await API.get(url);
      return res.data;
    } catch (err) {
      console.error('roleService.getAllRoles error:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener todos los roles');
    }
  },

  getInactiveRoles: async (name = '') => {
    try {
      const url = name ? `/roles/inactive?name=${encodeURIComponent(name)}` : '/roles/inactive';
      console.log('roleService.getInactiveRoles url:', url);
      const res = await API.get(url);
      return res.data;
    } catch (err) {
      console.error('roleService.getInactiveRoles error:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener roles inactivos');
    }
  },

  createRole: async (roleData) => {
    try {
      console.log('roleService.createRole payload:', roleData);
      // Post to '/roles/' to avoid possible redirect from '/roles' -> '/roles/'
      const res = await API.post('/roles/', roleData);
      return res.data;
    } catch (err) {
      console.error('roleService.createRole error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al crear rol';
      throw new Error(msg);
    }
  },

  updateRole: async (id, roleData) => {
    try {
      const res = await API.put(`/roles/${id}`, roleData);
      return res.data;
    } catch (err) {
      console.error('roleService.updateRole error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al actualizar rol';
      throw new Error(msg);
    }
  },

  deleteRole: async (id) => {
    try {
      const res = await API.delete(`/roles/${id}`);
      return res.data;
    } catch (err) {
      console.error('roleService.deleteRole error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al eliminar rol';
      throw new Error(msg);
    }
  },

  restoreRole: async (id) => {
    try {
      const res = await API.put(`/roles/${id}/restore`);
      return res.data;
    } catch (err) {
      console.error('roleService.restoreRole error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al reactivar rol';
      throw new Error(msg);
    }
  }
};

export default roleService;
