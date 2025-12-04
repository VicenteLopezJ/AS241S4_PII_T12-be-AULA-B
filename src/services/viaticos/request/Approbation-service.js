import { get, post, patch } from "../api";

// Aprobar gasto desde frontend (PATCH con manager_id)
export const aprobarViatico = async (id, datos) => {
  return await patch(`approbation/approve/${id}`, datos);
};

// Aprobar gasto directo desde correo (GET sin manager_id)
export const aprobarViaticoPorCorreo = async (id) => {
  return await get(`approbation/approve/${id}`);
};

// Rechazar gasto desde frontend (PATCH con manager_id)
export const rechazarViatico = async (id, datos) => {
  return await patch(`approbation/reject/${id}`, datos);
};

// Rechazar gasto directo desde correo (GET sin manager_id)
export const rechazarViaticoPorCorreo = async (id) => {
  return await get(`approbation/reject/${id}`);
};

// Enviar correo de aprobación
export const enviarCorreoAprobacion = async (id) => {
  return await post(`send-approval/${id}`);
};