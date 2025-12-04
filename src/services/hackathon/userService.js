import {HACKATHON_API} from '../api';
const UserBaseUrl = '/user';


export const getUsers = async () => {
  try {
    const response = await HACKATHON_API.get(UserBaseUrl);
    return response.data; 
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    throw error;
  }
};


export const getUsersByRole = async (role) => {
  try {
    const response = await HACKATHON_API.get(`${UserBaseUrl}/${role}`);
    return response.data; 
  } catch (error) {
    console.error(`Error al obtener usuarios con role ${role}:`, error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await HACKATHON_API.get(`${UserBaseUrl}/${userId}`);
    return response.data; 
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${userId}:`, error);
    throw error;
  }
};

export const getStudentsByGroup = async (groupId) => {
    // La ruta en el backend (Flask) es: /api/students/group/<id>
    const url = `user/students/group/${groupId}`; 
    // Nota: Asumo que HACKATHON_API ya tiene configurado el prefijo '/api' o que tu backend
    // espera /students/group/<id> directamente después del dominio. Si no, ajusta '/students'
    // a la ruta base de tu servicio de usuarios si es diferente a 'UserBaseUrl'.

    try {
        const response = await HACKATHON_API.get(url);
        return response.data; 
    } catch (error) {
        console.error(`Error al obtener estudiantes para el Grupo ${groupId}:`, error);
        // Es crucial lanzar el error para que el componente (AttendancePageHackathon) lo maneje.
        throw error;
    }
};

export const createUser = async (userData) => {
  try {
    const response = await HACKATHON_API.post(UserBaseUrl, userData);
    return response.data; 
  } catch (error) {
    console.error('Error al crear usuario base:', error);
    throw error;
  }
};

export const createUserWithRole = async (role, userData) => {
  try {
    const response = await HACKATHON_API.post(`${UserBaseUrl}/${role}`, userData);
    return response.data; 
  } catch (error) {
    console.error(`Error al crear usuario con role ${role}:`, error);
    throw error;
  }
};

export const updateUserWithRole = async (userId, role, updateData) => {
	try {
		const response = await HACKATHON_API.put(`${UserBaseUrl}/${userId}/${role}`, updateData);
		return response.data; 
	} catch (error) {
		console.error(`Error al actualizar ${role} con ID ${userId}:`, error);
		throw error;
	}
};

export const updateUser = async (userId, updateData) => {
  try {
    const response = await HACKATHON_API.put(`${UserBaseUrl}/${userId}`, updateData);
    return response.data; 
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${userId}:`, error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await HACKATHON_API.patch(`${UserBaseUrl}/delete/${userId}`);
    return response.data; 
  } catch (error) {
    console.error(`Error al desactivar usuario con ID ${userId}:`, error);
    throw error;
  }
};

export const restoreUser = async (userId) => {
  try {
    const response = await HACKATHON_API.patch(`${UserBaseUrl}/restore/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al activar usuario con ID ${userId}:`, error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    console.log("Enviando credenciales:", credentials);

    const response = await HACKATHON_API.post(`${UserBaseUrl}/login`, credentials);

    console.log("Respuesta completa:", response);
    console.log("Datos:", response.data);

    
    localStorage.setItem("user", JSON.stringify(response.data));
    localStorage.setItem("token", response.data.token);
    return response.data;

  } catch (error) {
    console.error("Error en login:", error);

    if (error.code === "ERR_NETWORK") {
      throw {
        message: "No se puede conectar al servidor. Asegúrate de que Flask esté corriendo.",
        code: "ERR_NETWORK",
      };
    }

    throw error.response?.data || { message: "Error en el login" };
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};


export const checkUserProvisioning = async (userData) => {
  try {
    const response = await HACKATHON_API.post(`${UserBaseUrl}/checkUser`, userData);
    return response.data; 
  } catch (error) {
    console.error("Error en checkUserProvisioning:", error);
 
    throw error;
  }
};