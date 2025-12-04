import { post } from "../api";
import { get } from "../api";
import { put } from "../api";

export const registrarJefeArea = async (datos) => {
  return await post("/manager/save", datos);
};

export const listarJefesArea = async () => {
  return await get("/manager");
};

export const actualizarJefeArea = async (id, datos) => {
  return await put(`/manager/update/${id}`, datos);
}

export const obtenerJefeAreaPorId = async (id) => {
  return await get(`/manager/${id}`);
};

export const obtenerFirmaJefeArea = async (id_manager) => {
  try {
    const response = await get(`/manager/${id_manager}/signature`);
    return response.manager_signature; // ✅ ya no accedes a .data.manager_signature
  } catch (error) {
    console.error("❌ Error al obtener firma:", error);
    throw error;
  }
};

export const enviarFirma = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await post("/spent/upload-signature", formData);
};