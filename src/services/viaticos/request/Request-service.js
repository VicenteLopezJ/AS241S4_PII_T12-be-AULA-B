import { post } from "../api";
import { get } from "../api";
import { put } from "../api";


export const registrarViatico = async (datos) => {
  return await post("spent/save", datos);
};

export const listarViaticos = async () => {
  return await get("/spent");
};

export const actualizarViatico = async (id, datos) => {
  return await put(`/spent/${id}`, datos)
};

export const obtenerViaticoPorId = async (id) => {
  return await get(`/spent/${id}`);
}


export const enviarFirma = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await post("/spent/upload-signature", formData);
};

export const obtenerTicket = async () => {
  return await get("/generate");
};

export const listarViaticosPendientes = async (page = 1, per_page = 20) => {
  const response = await get(`/spent/P?page=${page}&per_page=${per_page}`);
  return response.spents || [];
};

export const descargarPDF = async (id_spent) => {
  console.log("Descargando PDF con ID:", id_spent);

  const response = await fetch(`https://fearful-spell-pjg9gr9px5v6f6x7w-5000.app.github.dev/spent/pdf/${id_spent}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Error al generar PDF: " + errorText);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_gasto_${id_spent}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const descargarExcel = async (id_spent) => {
  const response = await fetch(`https://fearful-spell-pjg9gr9px5v6f6x7w-5000.app.github.dev/spent/excel/${id_spent}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Error al generar Excel: " + errorText);
  }

  console.log(response.headers.get("content-type"));
  console.log("Descargando Excel con id:", id_spent);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_gasto_${id_spent}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};