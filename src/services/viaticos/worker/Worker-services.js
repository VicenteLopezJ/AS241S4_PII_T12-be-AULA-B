import { patch, post } from "../api";
import { get } from "../api";
import { put } from "../api";

export const registrarTrabajador = async (datos) => {
  return await post("worker/save", datos);
};

export const listarTrabajadores = async () => {
  return await get("worker");
};

export const actualizarTrabajador = async (id, datos) => {
  return await put(`worker/update/${id}`, datos);
}

export const obtenerTrabajadorPorId = async (id) => {
  return await get(`worker/${id}`);
};

export const eliminarTrabajador = async (id) => {
  return await patch(`worker/delete/${id}`);
}

export const restaurarTrabajador = async (id) => {
  return await patch(`worker/restore/${id}`);
}