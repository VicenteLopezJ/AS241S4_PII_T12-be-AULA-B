import { INASISTENCIAS_API as API } from '../../api';

export const userService = {

    login: async (credentials) => {
        try {
            const response = await API.post('/api/v1/users/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Error en userService.login:', error);
            
            if (error.code === 'ERR_NETWORK') {
                throw {
                    message: 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.',
                    code: 'ERR_NETWORK'
                };
            }
            
            throw error.response?.data || { message: 'Error en el login' };
        }
    },

 
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },


    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },


    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },


    getCurrentRole: () => {
        const user = userService.getCurrentUser();
        return user?.role?.toLowerCase() || null;
    },


    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default userService;