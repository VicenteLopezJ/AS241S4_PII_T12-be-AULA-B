const BASE_URL = "https://fearful-spell-pjg9gr9px5v6f6x7w-5000.app.github.dev";

export const post = async (endpoint, data) => {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error en POST");
    return await res.json();
  } catch (error) {
    console.error("❌ Error en api.js:", error);
    throw error;
  }
};

// Puedes agregar más métodos:
export const get = async (endpoint) => {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`);
    if (!res.ok) throw new Error("Error en GET");
    return await res.json();
  } catch (error) {
    console.error("❌ Error en api.js:", error);
    throw error;
  }
};

export const put = async (endpoint, data) => {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error en PUT");
    return await res.json();
  } catch (error) {
    console.error("❌ Error en api.js:", error);
    throw error;
  }
};

export const patch = async (endpoint, data) => {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error en PATCH");
    return await res.json();
  } catch (error) {
    console.error("❌ Error en api.js:", error);
    throw error;
  };
  };

export const login = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

    if (!res.ok) throw new Error("Error en LOGIN");

    return await res.json();
  } catch (error) {
    console.error("❌ Error en login:", error);
    throw error;
  }
};




