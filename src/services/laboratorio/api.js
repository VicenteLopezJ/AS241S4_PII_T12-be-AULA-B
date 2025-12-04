// Use VITE_API_BASE if provided, otherwise default to the local backend address
const BASE = 'https://as241s4-pii-t06-be.onrender.com/api';

async function safeFetch(url, options = {}) {
  try {
    // Log request info for debugging
    try { console.debug('[api] request ->', { url, options }); } catch (_) {}

    // Support optional timeout in milliseconds via options.timeout
    const timeout = options.timeout;
    let controller;
    let timer;
    // If caller provided a signal, prefer it (don't override)
    if (typeof AbortController !== 'undefined' && !options.signal && timeout && Number(timeout) > 0) {
      controller = new AbortController();
      options.signal = controller.signal;
      timer = setTimeout(() => {
        try { controller.abort(); } catch (_) {}
      }, Number(timeout));
    }

    const fetchOptions = { ...options };
    // Remove our custom timeout prop so native fetch doesn't see it
    if (fetchOptions.timeout) delete fetchOptions.timeout;

    const res = await fetch(url, fetchOptions);
    if (timer) clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    if (res.status === 204) {
      try { console.debug('[api] response ->', { url, status: res.status, body: null }); } catch (_) {}
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return null;
    }

    if (contentType.includes('application/json')) {
      const json = await res.json();
      try { console.debug('[api] response ->', { url, status: res.status, body: json }); } catch (_) {}
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} ${res.statusText}`);
        err.status = res.status;
        err.body = json;
        err.url = url;
        console.error('[api] response error ->', { url, status: res.status, body: json });
        throw err;
      }
      return json;
    }

    // If not JSON (empty body or plain text), return text or null
    const text = await res.text();
    try { console.debug('[api] response ->', { url, status: res.status, body: text }); } catch (_) {}
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
      err.status = res.status;
      err.body = text;
      err.url = url;
      console.error('[api] response error ->', { url, status: res.status, body: text });
      throw err;
    }
    return text ? text : null;
  } catch (e) {
    // If the error was caused by an abort due to timeout, make message clearer
    const isAbort = e && (e.name === 'AbortError' || (e.message && e.message.toLowerCase().includes('aborted')));
    try { console.error('[api] fetch error ->', { url, error: e && (e.message || e), stack: e && e.stack, timeout: options && options.timeout }); } catch (_) {}
    if (isAbort) {
      const err = new Error('Request aborted (timeout)');
      err.cause = e;
      err.name = 'AbortError';
      throw err;
    }
    // rethrow so callers can decide to fallback
    throw e;
  }
}

export async function getCompanies() {
  return await safeFetch(`${BASE}/empresas`);
}

export async function getCompany(companyId) {
  return await safeFetch(`${BASE}/empresas/${companyId}`);
}

export async function getCompanyContacts(companyId) {
  // Our backend exposes /api/empresaContactos/:id according to the server routes.
  try {
    return await safeFetch(`${BASE}/empresaContactos/${companyId}`);
  } catch {
    // fallback: try to fetch the company and read contactos if available
    try {
      const company = await getCompany(companyId);
      return company && company.contactos ? company.contactos : [];
    } catch {
      return [];
    }
  }
}

export async function createCompanyContact(companyId, payload) {
  // Backwards-compatible wrapper: prefer /contactos POST (backend) but accept older /empresaContactos
  const body = { ...payload, idEmpresa: companyId, empresaId: companyId };
  try {
    return await safeFetch(`${BASE}/contactos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    return await safeFetch(`${BASE}/empresaContactos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }
}

export async function updateCompanyContact(contactId, payload) {
  // Prefer /contactos PATCH, fallback to empresaContactos
  try {
    return await safeFetch(`${BASE}/contactos/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    return await safeFetch(`${BASE}/empresaContactos/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}

export async function deleteCompanyContact(contactId) {
  // Prefer DELETE /contactos/:id (logical delete) and fallback
  try {
    return await safeFetch(`${BASE}/contactos/${contactId}`, { method: 'DELETE' });
  } catch (e) {
    return await safeFetch(`${BASE}/empresaContactos/${contactId}`, { method: 'DELETE' });
  }
}

// Restore a logically deleted contact: PATCH /contactos/:id/restaurar (backend)
export async function restoreCompanyContact(contactId) {
  try {
    return await safeFetch(`${BASE}/contactos/${contactId}/restaurar`, { method: 'PATCH' });
  } catch (e) {
    // fallback to empresaContactos if needed
    return await safeFetch(`${BASE}/empresaContactos/${contactId}/restaurar`, { method: 'PATCH' });
  }
}

// New explicit contact helpers (alias to the above wrappers)
export async function createContact(companyId, payload) { return await createCompanyContact(companyId, payload); }
export async function updateContact(contactId, payload) { return await updateCompanyContact(contactId, payload); }
export async function deleteContact(contactId) { return await deleteCompanyContact(contactId); }
export async function restoreContact(contactId) { return await restoreCompanyContact(contactId); }

export async function deactivateCompany(companyId) {
  // Backend uses DELETE to set empresa as INACTIVO (logical delete)
  return await safeFetch(`${BASE}/empresas/${companyId}`, { method: 'DELETE' });
}

// Restaurar empresa (backend expone PATCH /empresas/:id/restaurar)
export async function restoreCompany(companyId) {
  return await safeFetch(`${BASE}/empresas/${companyId}/restaurar`, { method: 'PATCH' });
}

export async function createCompany(payload) {
  // Send both camelCase and snake_case fields to maximize compatibility
  const bodyPayload = {
    ...payload,
    // common aliases
    razon_social: payload.razonSocial ?? payload.razon_social ?? undefined,
    razonSocial: payload.razonSocial ?? payload.razon_social ?? undefined,
    direccion: payload.direccion ?? payload.address ?? payload.direccionFiscal ?? undefined,
    distrito: payload.distrito ?? undefined,
    provincia: payload.provincia ?? undefined,
    ruc: payload.ruc ?? payload.RUC ?? undefined
  };
  try {
    return await safeFetch(`${BASE}/empresas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });
  } catch (e) {
    // Re-throw after logging to keep caller behavior
    console.error('[api] createCompany failed ->', { url: `${BASE}/empresas`, error: e && (e.message || e), status: e && e.status, body: e && e.body });
    throw e;
  }
}

export async function getCotizaciones() {
  return await safeFetch(`${BASE}/cotizaciones`);
}

export async function getContratos(empresaId, contactoId) {
  // Build query params: support common param names the backend might expect
  const params = [];
  if (empresaId !== undefined && empresaId !== null) {
    // if empresaId looks numeric, include idEmpresa param (backend sometimes expects this)
    if (!isNaN(Number(empresaId))) {
      params.push(`idEmpresa=${encodeURIComponent(empresaId)}`);
    } else {
      params.push(`empresaId=${encodeURIComponent(empresaId)}`);
    }
  }
  if (contactoId !== undefined && contactoId !== null) {
    // try both contactoId and idContacto names
    params.push(`contactoId=${encodeURIComponent(contactoId)}`);
    params.push(`idContacto=${encodeURIComponent(contactoId)}`);
  }
  const qs = params.length ? `?${params.join('&')}` : '';
  const url = `${BASE}/contratos${qs}`;
  return await safeFetch(url);
}

export async function getContratosNoUsados(empresaId) {
  if (!empresaId) return { contratos: [], cotizaciones: [] };
  return await safeFetch(`${BASE}/empresas/${empresaId}/contratos/no-usados`);
}

export async function getTiposEnsayos() {
  return await safeFetch(`${BASE}/tiposEnsayos`);
}

export async function patchCotizacionUsada(numCotizacion, body = { usada: true }) {
  // Apply a reasonable timeout to avoid UI hanging indefinitely
  return await safeFetch(`${BASE}/cotizaciones/${numCotizacion}/usar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeout: 20000
  });
}

export async function createMuestreo(payload) {
  // backend may or may not expose /muestreos; try it and let caller handle errors
  return await safeFetch(`${BASE}/muestreos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

/**
 * Crea un muestreo y sus detalles de forma transaccional usando el contrato
 * Endpoint esperado: POST /muestreo/contrato/{contratoId}/transactional
 * Implementa reintentos para errores 5xx y soporta Idempotency-Key opcional.
 */
export async function createMuestreoTransactional(contratoId, payload, options = {}) {
  if (!contratoId) throw new Error('createMuestreoTransactional requires contratoId');
  const url = `${BASE}/muestreo/contrato/${encodeURIComponent(contratoId)}/transactional`;
  const maxRetries = options.maxRetries ?? 2;
  const idempotency = options.idempotencyKey;

  let attempt = 0;
  let lastError = null;
  while (attempt <= maxRetries) {
    attempt += 1;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (idempotency) headers['Idempotency-Key'] = idempotency;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      const contentType = res.headers.get('content-type') || '';
      const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;

      if (res.status >= 200 && res.status < 300) {
        return body;
      }

      if (res.status >= 500 && res.status < 600) {
        lastError = new Error(`Server error ${res.status} - ${res.statusText}: ${text}`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }

      const err = new Error(`Request failed ${res.status} - ${res.statusText}`);
      err.status = res.status;
      err.body = body;
      throw err;
    } catch (e) {
      lastError = e;
      if (attempt <= maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

export async function getMuestreos() {
  // Algunos backends exponen el recurso en singular o plural.
  // Intentamos plural primero y si da 404 probamos singular.
  const candidates = [`${BASE}/muestreos`, `${BASE}/muestreo`];
  let lastError = null;
  for (const url of candidates) {
    try {
      console.debug('[api] trying muestreos url ->', url);
      const res = await safeFetch(url);
      console.debug('[api] getMuestreos success ->', { url, sample: Array.isArray(res) ? (res.length ? res[0] : null) : (res && res.data ? res.data[0] : null) });
      return res;
    } catch (e) {
      lastError = e;
      console.warn('[api] getMuestreos attempt failed ->', { url, error: e && (e.message || e), status: e && e.status, body: e && e.body });
      // si no es 404 continuamos pero si es otro error seguimos intentando solo para logging
      // en cualquier caso probamos la siguiente ruta
      continue;
    }
  }
  // Si fallaron ambos GET y el servidor responde 405 (Method Not Allowed),
  // algunos backends requieren POST para listar recursos. Intentamos
  // una llamada POST a los mismos endpoints en ese caso.
  console.warn('[api] getMuestreos: GET attempts failed', { candidates, lastError });

  const lastStatus = lastError && lastError.status;
  if (lastStatus === 405) {
    console.info('[api] getMuestreos: server returned 405, trying POST fallback to candidates');
    for (const url of candidates) {
      try {
        console.debug('[api] trying muestreos POST fallback ->', url);
        const res = await safeFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        console.debug('[api] getMuestreos POST fallback success ->', { url, sample: Array.isArray(res) ? (res.length ? res[0] : null) : (res && res.data ? res.data[0] : null) });
        return res;
      } catch (pe) {
        lastError = pe;
        console.warn('[api] getMuestreos POST fallback failed ->', { url, error: pe && (pe.message || pe), status: pe && pe.status, body: pe && pe.body });
        continue;
      }
    }
  }

  console.error('[api] getMuestreos failed for all candidates', { candidates, lastError });
  throw lastError;
}

export async function getMuestreo(id) {
  if (!id) throw new Error('getMuestreo requires id');
  const candidates = [`${BASE}/muestreo/${id}`, `${BASE}/muestreos/${id}`];
  let lastError = null;
  for (const url of candidates) {
    try {
      console.debug('[api] trying getMuestreo ->', url);
      const res = await safeFetch(url);
      return res;
    } catch (e) {
      lastError = e;
      console.warn('[api] getMuestreo attempt failed ->', { url, error: e && (e.message || e), status: e && e.status });
      continue;
    }
  }
  console.error('[api] getMuestreo failed for all candidates', { id, lastError });
  throw lastError;
}

export function getMuestreoUrl(id) {
  return `${BASE}/muestreo/${id}`;
}

export async function getMuestreoDetalle(id) {
  if (!id) throw new Error('getMuestreoDetalle requires id');
  // Prefer endpoint that returns all detalles for a muestreo: /muestreo/:id/detalles
  const candidates = [`${BASE}/muestreo/${id}/detalles`, `${BASE}/muestreo/detalle/${id}`, `${BASE}/muestreos/${id}/detalles`];
  let lastError = null;
  for (const url of candidates) {
    try {
      const res = await safeFetch(url);
      return res;
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError;
}

export async function getRecepcionEstado(id) {
  if (!id) throw new Error('getRecepcionEstado requires id');
  return await safeFetch(`${BASE}/recepcion/muestreo/${id}/estado`);
}

export async function patchMuestreo(id, payload) {
  if (!id) throw new Error('patchMuestreo requires id');
  return await safeFetch(`${BASE}/muestreo/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeout: 20000
  });
}

export async function patchMuestreoDetalle(idDetalle, payload) {
  if (!idDetalle) throw new Error('patchMuestreoDetalle requires idDetalle');
  // backend exposes detalle by id at /muestreo/detalle/:id (get) so PATCH to same path
  return await safeFetch(`${BASE}/muestreo/detalle/${idDetalle}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeout: 20000
  });
}

// Flexible updater for muestreo detalle that tries multiple endpoint formats.
export async function patchMuestreoDetalleFlexible(muestreoId, idDetalle, payload) {
  // candidates: PATCH /muestreo/detalle/{idDetalle}, PATCH /muestreo/{muestreoId}/detalles
  const candidates = [];
  if (idDetalle) candidates.push(`${BASE}/muestreo/detalle/${idDetalle}`);
  if (muestreoId) candidates.push(`${BASE}/muestreo/${muestreoId}/detalles`);
  // fallback plural path
  if (muestreoId) candidates.push(`${BASE}/muestreos/${muestreoId}/detalles`);

  let lastErr = null;
  for (const url of candidates) {
    try {
      return await safeFetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 20000
      });
    } catch (e) {
      lastErr = e;
      if (e && e.status && e.status !== 404) {
        // for non-404 errors, rethrow immediately
        throw e;
      }
      // otherwise try next candidate
    }
  }
  throw lastErr;
}

export async function patchRecepcionEstado(id, payload) {
  if (!id) throw new Error('patchRecepcionEstado requires id');
  // Try multiple candidate endpoints for compatibility with different backends:
  // 1) PATCH /recepcion/{id}/estado (reception id)
  // 2) PATCH /recepcion/muestreo/{id}/estado (muestreo id)
  // 3) PATCH /recepcion/estado/{id}
  const candidates = [
    `${BASE}/recepcion/${id}/estado`,
    `${BASE}/recepcion/muestreo/${id}/estado`,
    `${BASE}/recepcion/estado/${id}`
  ];
  let lastErr = null;
  for (const url of candidates) {
    try {
      return await safeFetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 20000
      });
    } catch (e) {
      lastErr = e;
      // if 404 try next candidate, otherwise rethrow early for other errors
      if (e && e.status && e.status !== 404) {
        throw e;
      }
      // else continue to next candidate
    }
  }
  // if all attempts failed, throw the last error
  throw lastErr;
}

/**
 * Envia un muestreo + detalles + recepción en una sola llamada al endpoint
 * /recepcion/formulario. Implementa reintentos para errores 5xx y permite
 * incluir un header Idempotency-Key para evitar duplicados.
 */
export async function createRecepcionFormulario(payload, options = {}) {
  const url = `${BASE}/recepcion/formulario`;
  const maxRetries = options.maxRetries ?? 2;
  const idempotency = options.idempotencyKey;

  let attempt = 0;
  let lastError = null;
  while (attempt <= maxRetries) {
    attempt += 1;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (idempotency) headers['Idempotency-Key'] = idempotency;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      const contentType = res.headers.get('content-type') || '';
      const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;

      if (res.status >= 200 && res.status < 300) {
        return body;
      }

      // 5xx -> retry
      if (res.status >= 500 && res.status < 600) {
        lastError = new Error(`Server error ${res.status} - ${res.statusText}: ${text}`);
        // short backoff
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }

      // 4xx or other: throw and don't retry
      const err = new Error(`Request failed ${res.status} - ${res.statusText}`);
      err.status = res.status;
      err.body = body;
      throw err;
    } catch (e) {
      // network or parsing error -> treat as transient and retry up to maxRetries
      lastError = e;
      if (attempt <= maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

export async function updateCompany(companyId, payload) {
  return await safeFetch(`${BASE}/empresas/${companyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// Export default convenience object
export default {
  getCompanies,
  getCompany,
  getCompanyContacts,
  deactivateCompany,
  restoreCompany
  ,createCompany,
  updateCompany
  ,createCompanyContact,
  updateCompanyContact,
  deleteCompanyContact,
  restoreCompanyContact,
  // aliases using /contactos paths
  createContact,
  updateContact,
  deleteContact,
  restoreContact
  ,getCotizaciones
  ,patchCotizacionUsada
  ,createMuestreo
  ,createMuestreoTransactional
  ,getMuestreos
  ,getMuestreo
  ,getMuestreoUrl
  ,getMuestreoDetalle
  ,getRecepcionEstado
  ,patchMuestreo
  ,patchMuestreoDetalle
  ,patchRecepcionEstado
  ,getTiposEnsayos
  ,createRecepcionFormulario
  ,getContratos
  ,getContratosNoUsados
};
