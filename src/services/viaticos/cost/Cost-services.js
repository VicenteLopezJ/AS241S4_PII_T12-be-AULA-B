import { patch, post } from "../api";
import { get } from "../api";
import { put } from "../api";

export const registrarCentroDeCosto = async (datos) => {
  return await post("cost_center/save", datos);
};

export const listarCentroDeCostos = async () => {
  return await get("cost_center");
};

export const actualizarCentroDeCosto = async (id, datos) => {
  return await put(`cost_center/update/${id}`, datos);
}

export const obtenerCentroDeCostoPorId = async (id) => {
  return await get(`cost_center/${id}`);
};

export const eliminarCentroDeCosto = async (id) => {
  return await patch(`cost_center/delete/${id}`);
}

export const restaurarCentroDeCosto = async (id) => {
  return await patch(`cost_center/restore/${id}`);
}

export const enviarFirma = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await post("/spent/upload-signature", formData);
};