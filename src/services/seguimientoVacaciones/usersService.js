// serviceUsers.js
import api from "./api";

// Listar todos los usuarios
export const listarUsers = async () => {
  const response = await api.get("/users/");
  return response.data;
};

// Buscar usuario por ID
export const buscarUserPorId = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Buscar usuarios por estado
export const buscarUsersPorEstado = async (estado) => {
  const response = await api.get(`/users/estado/${estado}`);
  return response.data;
};

// Agregar un nuevo usuario
export const agregarUser = async (user) => {
  const response = await api.post("/users/save", user);
  return response.data;
};

// Actualizar un usuario
export const actualizarUser = async (id, user) => {
  const response = await api.put(`/users/update/${id}`, user);
  return response.data;
};

// Eliminar lógicamente un usuario
export const eliminarUser = async (id) => {
  const response = await api.patch(`/users/eliminar/${id}`);
  return response.data;
};

// Restaurar un usuario
export const restaurarUser = async (id) => {
  const response = await api.patch(`/users/restaurar/${id}`);
  return response.data;
};

// Listar empleados activos sin usuario (para crear nuevos usuarios)
export const listarEmpleadosSinUsuario = async () => {
  const response = await api.get("/users/empleados-sin-usuario");
  return response.data;
};
