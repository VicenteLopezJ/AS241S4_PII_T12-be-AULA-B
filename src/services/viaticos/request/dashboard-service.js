import { get } from "../api";

export const listarViaticos = async () => {
  return await get("/spent");
};

export const listarCentroDeCostos = async () => {
  return await get("cost_center");
};

export const listarTrabajadores = async () => {
  return await get("worker");
};

export const listarJefesArea = async () => {
  return await get("/manager");
};

export const listarMotivos = async () => {
  try {
    const data = await get("/spent/reasons");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error cargando motivos:", error);
    return [];
  }
};

