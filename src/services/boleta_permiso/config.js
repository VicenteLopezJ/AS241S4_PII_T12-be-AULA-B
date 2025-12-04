// src/services/config.js
import axios from "axios";

// Base URL configurable (puede venir de .env)
const API_URL = "https://as241s4-pii-t16-be-2.onrender.com/";

// Crear instancia de Axios (por si la necesitas en el futuro)
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Exportar la URL para usarla con fetch
export default API_URL;