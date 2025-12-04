// src/services/user/notificacionService.js

const API_URL = "https://symmetrical-spoon-r4w7jggrr754cpp45-5008.app.github.dev/api/notificaciones";

export const notificacionService = {
  // Obtener todas las notificaciones
  async getAll() {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Error al obtener notificaciones");
    return response.json();
  },

  // Marcar notificación como aceptada
  async marcarAceptada(id) {
    const response = await fetch(`${API_URL}/${id}/aceptar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Error al actualizar notificación");

    return response.json();
  }
};
