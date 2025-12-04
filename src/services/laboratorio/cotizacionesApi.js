const BASE = 'https://as241s4-pii-t06-be.onrender.com/api';

export async function getCotizaciones() {
  const res = await fetch(`${BASE}/cotizaciones`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getCotizacion(num) {
  const res = await fetch(`${BASE}/cotizaciones/${num}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}

export default { getCotizaciones, getCotizacion };
