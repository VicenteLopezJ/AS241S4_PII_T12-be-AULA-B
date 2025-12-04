import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/laboratorio/api';

// Helper local: fetch con timeout (AbortController)
const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    // Normalizar error de timeout para manejo en UI
    if (err.name === 'AbortError') throw new Error('timeout');
    throw err;
  }
};

export default function NuevoMuestreo() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
  const [selectedContactoId, setSelectedContactoId] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresaData, setSelectedEmpresaData] = useState(null);
  const [selectedContactoData, setSelectedContactoData] = useState(null);
  
  const [contratosNoUsados, setContratosNoUsados] = useState([]);
  const [contratosLoading, setContratosLoading] = useState(false);
  const [contratosError, setContratosError] = useState(null);
  const [selectedContratoId, setSelectedContratoId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectionLocked, setSelectionLocked] = useState(false);

  const stepClass = (step) => {
    // Paso actual: color más intenso
    if (currentStep === step) return 'flex items-center gap-3 bg-emerald-600 text-white rounded px-4 py-2 shadow';
    // Pasos ya completados: mantén el color pero añade sombreado sutil y un ring
    if (currentStep > step) return 'flex items-center gap-3 bg-emerald-500 text-white rounded px-4 py-2 shadow-sm ring-1 ring-emerald-700/20';
    // Pasos no alcanzados
    return 'flex items-center gap-3 bg-slate-700 text-slate-300 rounded px-4 py-2';
  };


  // Minimal muestreo state where we'll prefill empresa/contacto
  const [muestreo, setMuestreo] = useState({ id_contrato: null, fecha_muestreo: '', hora_muestreo: '', fundo: '', contacto_id: null, observaciones: '' });
  // etiqueta legible del contrato seleccionado (solo código)
  const getSelectedContratoCodigo = () => {
    if (!selectedContratoId) return null;
    const ct = (contratosNoUsados || []).find(x => String(x.id_contrato ?? x.id) === String(selectedContratoId));
    return ct ? (ct.codigo_cliente ?? (ct.id_contrato ?? ct.id)) : selectedContratoId;
  };

  // Helper: crear un detalle vacío con fecha/hora del sistema
  const createEmptyDetalle = () => {
    const now = new Date();
    const fechaNow = now.toISOString().split('T')[0];
    const horaNow = now.toTimeString().slice(0,5);
    return {
      cod_laboratorio: '',
      cod_campo: '',
      matriz: '',
      observaciones_muestra: '',
      fecha_muestra: fechaNow,
      hora_muestra: horaNow,
      id_tipo_ensayo: ''
    };
  };

  // Paso 2: estados para detalles (varios) y envío
  // Restauramos el comportamiento anterior: iniciar con un detalle vacío por defecto.
  const [detalles, setDetalles] = useState([createEmptyDetalle()]);
  const [tiposEnsayos, setTiposEnsayos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  // Recepción: estados y listas
  const [recepcionOpcionesList, setRecepcionOpcionesList] = useState([]);
  const [recepcionCondicionesList, setRecepcionCondicionesList] = useState([]);
  const [checkedOpciones, setCheckedOpciones] = useState({});
  const [checkedCondiciones, setCheckedCondiciones] = useState({});
  const [fechaHoraRecepcion, setFechaHoraRecepcion] = useState('');
  const [recepcionComentarios, setRecepcionComentarios] = useState('');
  const [submittingRecepcion, setSubmittingRecepcion] = useState(false);
  const [recepcionError, setRecepcionError] = useState(null);
  const [recepcionSuccess, setRecepcionSuccess] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  // Listas fijas de recepción (IDs inmutables solicitados)
  // Opciones (tabla OPCIONES_RECEPCION): 3=Cotizado, 4=Facturado, 21=Pago, 22=Enviado
  const RECEPCION_OPCIONES = [
    { id: 3, nombre: 'Cotizado' },
    { id: 4, nombre: 'Facturado' },
    { id: 21, nombre: 'Pago' },
    { id: 22, nombre: 'Enviado' }
  ];

  // Condiciones (tabla RECEPCION_CONDICION): solo se permiten 3,4,21
  const RECEPCION_CONDICIONES = [
    { id: 3, nombre: 'Muestreo realizado correcto' },
    { id: 4, nombre: 'Recipiente/Envase adecuado' },
    { id: 21, nombre: 'Muestra dentro del periodo' }
  ];
  // Valores por defecto solicitados: opciones 3,4,21 = SI; 22 = NO
  const RECEPCION_OPCIONES_DEFAULT = { 3: 'SI', 4: 'SI', 21: 'SI', 22: 'NO' };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await api.getCotizaciones();
        if (!mounted) return;
        // Normalizar distintas respuestas posibles del backend
        const arr = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.cotizaciones) ? data.cotizaciones :
             (data && Array.isArray(data.data) ? data.data : []));

        setCotizaciones(arr || []);
      } catch (e) {
        console.error('Error cargando cotizaciones', e);
        if (mounted) setError(String(e?.message || e));
        if (mounted) setCotizaciones([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    // cargar empresas en paralelo para poder mostrar su ficha
    (async () => {
      try {
        const comps = await api.getCompanies();
        if (!mounted) return;
        const arr = Array.isArray(comps) ? comps : (comps && Array.isArray(comps.data) ? comps.data : (comps && Array.isArray(comps.empresas) ? comps.empresas : []));
        setEmpresas(arr || []);
      } catch (e) {
        console.error('Error cargando empresas', e);
        if (mounted) setEmpresas([]);
      }
    })();

    // cargar tipos de ensayos para el detalle
    (async () => {
      try {
        const t = await api.getTiposEnsayos();
        const arr = Array.isArray(t) ? t : (t && Array.isArray(t.data) ? t.data : (t && Array.isArray(t.tipos) ? t.tipos : []));
        setTiposEnsayos(arr || []);
      } catch (e) {
        console.error('Error cargando tipos de ensayos', e);
        setTiposEnsayos([]);
      }
    })();

    // inicializar fechaHoraRecepcion por defecto (ahora)
    setFechaHoraRecepcion(new Date().toISOString().slice(0,16));

    return () => { mounted = false; };
  }, []);

  // Cuando ya se haya creado el muestreo (submitSuccess) preparar las listas fijas
  useEffect(() => {
    if (!submitSuccess || !submitSuccess.muestreo) return;
    // Usamos las listas fijas acordadas (IDs 3,4,21,22 y 3,4,21)
    const ops = RECEPCION_OPCIONES;
    const conds = RECEPCION_CONDICIONES;
    setRecepcionOpcionesList(ops);
    setRecepcionCondicionesList(conds);
    // inicializar opciones con los defaults solicitados (SI/NO)
    const opcInit = {};
    ops.forEach(o => { opcInit[o.id] = RECEPCION_OPCIONES_DEFAULT[o.id] ?? 'NO'; });
    // inicializar condiciones como boolean (checkbox) por defecto false
    const condInit = {};
    conds.forEach(c => { condInit[c.id] = false; });
    setCheckedOpciones(opcInit);
    setCheckedCondiciones(condInit);
  }, [submitSuccess]);

  // Bloquear navegación fuera del formulario cuando estamos en el Paso 3
  useEffect(() => {
    if (currentStep !== 3) return;

    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    const clickHandler = (e) => {
      // No interferir con clicks dentro del propio modal de confirmación
      if (e.target.closest && e.target.closest('.nm-leave-confirm-modal')) return;

      // Si el click ocurrió dentro del aside (sidebar), interceptarlo
      const inSidebar = e.target.closest && e.target.closest('aside');
      if (inSidebar) {
        e.preventDefault();
        // intentar obtener href/route del elemento clickeado
        const anchor = e.target.closest('a, button');
        let href = null;
        if (anchor) href = anchor.getAttribute('href') || anchor.getAttribute('to') || anchor.getAttribute('data-href');
        const path = href ? (new URL(href, window.location.origin).pathname) : null;
        setPendingNav({ href, path });
        setShowLeaveConfirm(true);
      }
    };

    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', clickHandler, true);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', clickHandler, true);
    };
  }, [currentStep, navigate]);

  async function handleCreateMuestreoAndDetalle() {
    setSubmitting(true); setSubmitError(null); setSubmitSuccess(null);
    try {
      // Preparar payload muestreo según ejemplo del usuario
      // FORZAR fecha/hora del muestreo a la fecha/hora del sistema en el momento
      // de creación (usuario lo solicitó). Esto aplica en creación y al
      // actualizar la transacción (el guardado/edición también fuerza fecha en MuestrasLab).
      const now = new Date();
      const fechaNow = now.toISOString().split('T')[0];
      const horaNow = now.toTimeString().slice(0,5);

      const muestreoPayload = {
        id_contrato: selectedContratoId ? Number(selectedContratoId) : (muestreo.id_contrato ?? null),
        fecha_muestreo: fechaNow,
        hora_muestreo: horaNow,
        fundo: muestreo.fundo,
        observaciones: muestreo.observaciones || ''
      };
      // Intentar usar el endpoint transaccional si está disponible en el backend
      // para evitar que el backend cree un detalle "automático" no deseado.
      let body1 = null;
      let detalleResponses = [];
      try {
        // Construir payload con muestreo y detalles (normalizamos campos)
        const detallesPayload = (detalles || []).map((d, idx) => ({
          cod_laboratorio: d.cod_laboratorio && String(d.cod_laboratorio).trim() ? d.cod_laboratorio : String(101 + idx),
          cod_campo: d.cod_campo || null,
          matriz: d.matriz || null,
          observaciones_muestra: d.observaciones_muestra || '',
          fecha_muestra: fechaNow,
          hora_muestra: horaNow,
          id_tipo_ensayo: d.id_tipo_ensayo ? Number(d.id_tipo_ensayo) : null
        }));

        // Llamada al endpoint transaccional: contratoId es selectedContratoId
        if (selectedContratoId) {
          try {
            const txResp = await api.createMuestreoTransactional(selectedContratoId, { muestreo: muestreoPayload, detalles: detallesPayload });
            // txResp puede venir en estructuras diversas dependiendo del backend
            body1 = txResp && (txResp.muestreo ?? txResp.data ?? txResp) || null;
            detalleResponses = txResp && (txResp.detalles ?? txResp.detalle ?? txResp.data?.detalles) || [];
          } catch (txErr) {
            // si el endpoint transaccional no existe o falla, haremos el flujo clásico
            console.warn('createMuestreoTransactional falló, usando flujo clásico:', txErr);
            body1 = null;
            detalleResponses = [];
          }
        }

        // Si no obtuvimos respuesta transaccional, usamos el flujo clásico (POST muestreo + POST detalles)
        if (!body1) {
          // POST a /api/muestreo
          const res1 = await fetchWithTimeout('https://as241s4-pii-t06-be.onrender.com/api/muestreo', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(muestreoPayload)
          }, 20000);
          if (!res1.ok) {
            const txt = await res1.text();
            throw new Error(`Crear muestreo falló: ${res1.status} ${txt}`);
          }
          body1 = await res1.json();
          // intentar extraer id_muestreo
          const id_muestreo = body1.id_muestreo ?? body1.id ?? (body1.data && (body1.data.id_muestreo ?? body1.data.id));
          if (!id_muestreo) throw new Error('No se recibió id_muestreo desde la creación del muestreo');

          for (const d of detalles) {
            // Compute automatic fields: cod_laboratorio (start at 101) and timestamp
            const idx = detalleResponses.length; // 0-based index for this detalle
            const autoCod = d.cod_laboratorio && String(d.cod_laboratorio).trim() ? d.cod_laboratorio : String(101 + idx);
            const detallePayload = {
              id_muestreo: Number(id_muestreo),
              cod_laboratorio: autoCod,
              cod_campo: d.cod_campo,
              matriz: d.matriz,
              observaciones_muestra: d.observaciones_muestra,
              // force fecha/hora to the muestreo creation time (fechaNow/horaNow)
              fecha_muestra: fechaNow,
              hora_muestra: horaNow,
              id_tipo_ensayo: d.id_tipo_ensayo ? Number(d.id_tipo_ensayo) : null
            };
            const res2 = await fetchWithTimeout('https://as241s4-pii-t06-be.onrender.com/api/muestreo/detalle', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(detallePayload)
            }, 20000);
            if (!res2.ok) {
              const txt = await res2.text();
              throw new Error(`Crear detalle falló: ${res2.status} ${txt}`);
            }
            const body2 = await res2.json();
            detalleResponses.push(body2);
          }
        }

        setSubmitSuccess({ muestreo: body1, detalles: detalleResponses });
      } catch (e) {
        throw e;
      }
      // En lugar de redirigir inmediatamente, avanzar al Paso 3 para
      // completar las opciones/condiciones de recepción y permitir
      // enviar la recepción (flujo solicitado por el usuario).
      setCurrentStep(3);
      try { window.scrollTo(0, 0); } catch (_) {}
    } catch (e) {
      console.error(e);
      setSubmitError(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelect(num) {
    if (selectionLocked) return; // no permitir cambios si la selección ya fue confirmada
    const cot = (cotizaciones || []).find(c => String(c.num_cotizacion) === String(num) || String(c.id) === String(num));
    if (!cot) {
      setSelectedCotizacion(null);
      setSelectedEmpresaId(null);
      setSelectedContactoId(null);
      setMuestreo(prev => ({ ...prev, contacto_id: null }));
      return;
    }
    setSelectedCotizacion(cot);
    // Prefill empresa and contacto from the cotizacion fields
    const empresaId = cot.id_empresa ?? cot.idEmpresa ?? cot.id_empresa_cliente ?? null;
    const contactoId = cot.id_contacto_atencion ?? cot.idContactoAtencion ?? cot.id_contacto ?? null;
    setSelectedEmpresaId(empresaId ?? null);
    setSelectedContactoId(contactoId ?? null);
    setMuestreo(prev => ({ ...prev, contacto_id: contactoId ?? prev.contacto_id }));
    // buscar datos de la empresa en el listado ya cargado
    const company = (empresas || []).find(e => String(e.id) === String(empresaId) || String(e.id_empresa) === String(empresaId) || String(e.ruc) === String(empresaId));
    setSelectedEmpresaData(company || null);
    // cargar contactos de la empresa y buscar el contacto seleccionado
    if (empresaId) {
      (async () => {
        try {
          const conts = await api.getCompanyContacts(empresaId);
          const arr = Array.isArray(conts) ? conts : (conts && Array.isArray(conts.data) ? conts.data : (conts && Array.isArray(conts.contactos) ? conts.contactos : []));
          const normalized = arr.map(ct => ({
            id: ct.idContacto ?? ct.id_contacto ?? ct.id ?? ct.contactoId ?? ct.contacto_id ?? null,
            nombre: ct.nombreCompleto ?? (ct.nombre && ct.apellido ? `${ct.nombre} ${ct.apellido}` : (ct.nombre || ct.nombre_contacto || '')),
            cargo: ct.cargoContacto ?? ct.cargo ?? ct.cargo_contacto ?? '',
            telefono: ct.telefono ?? ct.telefonoContacto ?? ct.telefono_contacto ?? '',
            email: ct.email ?? ct.correo ?? ct.email_contacto ?? ''
          }));
          const found = normalized.find(x => String(x.id) === String(contactoId));
          setSelectedContactoData(found || null);
        } catch (e) {
          console.error('Error cargando contactos de empresa', e);
          setSelectedContactoData(null);
        }
      })();
    } else {
      setSelectedContactoData(null);
    }
  }

  // Cuando cambie la empresa seleccionada, cargar contratos no usados
  useEffect(() => {
    let mounted = true;
    if (!selectedEmpresaId) {
      setContratosNoUsados([]);
      setSelectedContratoId(null);
      return;
    }
    (async () => {
      setContratosLoading(true);
      setContratosError(null);
      try {
        const res = await api.getContratosNoUsados(selectedEmpresaId);
        if (!mounted) return;
        // normalizar: puede venir { contratos: [...] } o directamente un array
        const arr = Array.isArray(res) ? res : (res && Array.isArray(res.contratos) ? res.contratos : []);
        setContratosNoUsados(arr || []);
      } catch (e) {
        console.error('Error cargando contratos no usados', e);
        if (mounted) setContratosError(String(e?.message || e));
        if (mounted) setContratosNoUsados([]);
      } finally {
        if (mounted) setContratosLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedEmpresaId]);
  const isStep2Valid = () => {
    // require a selected contrato, fondo filled and each detalle has required fields
    if (!selectedContratoId) return false;
    if (!muestreo || !(muestreo.fundo || '').toString().trim()) return false;
    if (!detalles || detalles.length === 0) return false;
    for (const d of detalles) {
      if (!d) return false;
      if (!((d.cod_campo || '').toString().trim())) return false;
      if (!((d.matriz || '').toString().trim())) return false;
      // id_tipo_ensayo can come as number or string; ensure it's non-empty after trim
      const tipo = (d.id_tipo_ensayo ?? '').toString().trim();
      if (!tipo) return false;
    }
    return true;
  };

  // Mantener `cod_laboratorio` consistente tras añadir/eliminar detalles.
  // Asignamos automáticamente 101 + index cuando el campo está vacío o no válido.
  useEffect(() => {
    // Evitar bucles innecesarios: construir nueva lista y asignar solo si cambió
    const next = detalles.map((d, i) => {
      const expected = String(101 + i);
      const current = (d && d.cod_laboratorio) ? String(d.cod_laboratorio).trim() : '';
      if (!current || current === '') {
        return { ...d, cod_laboratorio: expected };
      }
      // si el valor actual es diferente del esperado, mantenemos el valor actual
      return d;
    });
    // comparar simple: si alguno difiere en cod_laboratorio, actualizar
    let changed = false;
    for (let i = 0; i < next.length; i++) {
      const a = detalles[i] ? String(detalles[i].cod_laboratorio ?? '') : '';
      const b = String(next[i].cod_laboratorio ?? '');
      if (a !== b) { changed = true; break; }
    }
    if (changed) setDetalles(next);
  }, [detalles.length]);

  return (
    <div className="min-h-screen lg:pl-64 bg-slate-900 text-slate-100 p-6">
      <div className="lg:-ml-64">
      {/* Header sticky separado que contiene el stepper */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur">
        <div className="max-w-4xl mx-auto p-4">
          {/* Progreso / Steps */}
          <div className="flex items-center gap-4 justify-center">
            <div className={stepClass(1)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6" /></svg>
              <div>
                <div className="text-sm font-semibold">Datos de la Empresa</div>
                <div className="text-xs opacity-80">Informacion basica de la empresa</div>
              </div>
            </div>

            <div className={stepClass(2)}>
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" /></svg>
              <div>
                <div className="text-sm font-medium">Muestreo y Registro</div>
                <div className="text-xs opacity-60">Datos del muestreo y registro de muestras</div>
              </div>
            </div>

            <div className={stepClass(3)}>
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6" /></svg>
              <div>
                <div className="text-sm font-medium">Condición de Muestras</div>
                <div className="text-xs opacity-60">Estado y condiciones de recepcion</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-6">

        <h1 className="text-2xl font-semibold mb-4 text-center">Nuevo Muestreo — Paso 1: Seleccionar cotización</h1>

      <div className="mb-4">
        <label className="block mb-1">Buscar / filtrar cotizaciones</label>
        <input className={`p-2 border rounded w-full ${selectionLocked ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="Número de cotización o cliente" value={filter} onChange={e=>{ if(selectionLocked) return; setFilter(e.target.value); }} disabled={selectionLocked} />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Cotizaciones disponibles</label>
        {/* La selección se muestra dentro del propio <select> — no mostrar rectángulo extra */}
        {loading ? <div className="p-2 text-sm text-gray-400">Cargando cotizaciones...</div> : null}
        {error ? <div className="p-2 text-sm text-red-400">Error: {error}</div> : null}
        <select className={`p-2 border rounded w-full border-white bg-white text-black ${selectionLocked ? 'opacity-60 cursor-not-allowed' : ''}`} onChange={e=>handleSelect(e.target.value)} value={selectedCotizacion ? (selectedCotizacion.num_cotizacion ?? selectedCotizacion.num ?? selectedCotizacion.id ?? '') : ''} disabled={selectionLocked}>
          <option value="" style={{ fontWeight: 700, color: '#111827' }}>-- Seleccione una cotización --</option>
          {cotizaciones
            .filter(c => {
              if (!filter) return true;
              const f = filter.toString().toLowerCase();
              const num = String(c.num_cotizacion ?? c.num ?? c.id ?? '').toLowerCase();
              const at = (c.atencion||'').toString().toLowerCase();
              const emp = String(c.id_empresa ?? c.idEmpresa ?? '').toLowerCase();
              return num.includes(f) || at.includes(f) || emp.includes(f);
            })
            .map(c => (
              <option key={String(c.num_cotizacion ?? c.num ?? c.id)} value={c.num_cotizacion ?? c.num ?? c.id} style={{ fontWeight: 400, color: '#111827' }}>
                {c.atencion ? String(c.atencion) : `#${c.num_cotizacion ?? c.num ?? c.id} — ${c.fecha_cotizacion || c.fecha || ''}`}
              </option>
            ))}
        </select>
      </div>

      {selectedCotizacion ? (
        <div className="mb-4 p-4 border rounded bg-gray-50 text-gray-900">
          <h2 className="font-medium">Cotización seleccionada</h2>
          <div className="text-sm mt-2">
            <div className="mb-2"><strong>Numero:</strong> {selectedCotizacion.num_cotizacion}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded shadow-sm">
                <h3 className="font-semibold mb-2">Empresa</h3>
                {selectedEmpresaData ? (
                  <div className="text-sm">
                    <div className="mb-1"><strong>Razón Social:</strong> {selectedEmpresaData.razonSocial ?? selectedEmpresaData.razon_social ?? selectedEmpresaData.name ?? selectedEmpresaData.nombre ?? '-'}</div>
                    <div className="mb-1"><strong>RUC:</strong> {selectedEmpresaData.ruc ?? selectedEmpresaData.ruc_empresa ?? '-'}</div>
                    <div className="mb-1"><strong>Dirección:</strong> {selectedEmpresaData.direccion ?? selectedEmpresaData.direccionFiscal ?? selectedEmpresaData.address ?? '-'}</div>
                    <div className="mb-1"><strong>Distrito:</strong> {selectedEmpresaData.distrito ?? selectedEmpresaData.distritoFiscal ?? '-'}</div>
                    <div className="mb-1"><strong>Provincia:</strong> {selectedEmpresaData.provincia ?? selectedEmpresaData.province ?? '-'}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Empresa ID: {String(selectedEmpresaId) || '-'}</div>
                )}
              </div>

              <div className="p-3 bg-white rounded shadow-sm">
                <h3 className="font-semibold mb-2">Contacto</h3>
                {selectedContactoData ? (
                  <div className="text-sm">
                    {(() => {
                      const full = selectedContactoData.nombre || '';
                      const explicitApellido = selectedContactoData.apellido || selectedContactoData.apellidoContacto || '';
                      const parts = full.trim().split(' ').filter(Boolean);
                      const first = parts.shift() || '';
                      const last = explicitApellido || parts.join(' ') || '';
                      return (
                        <>
                          <div className="mb-1"><strong>Nombre:</strong> {first || '-'}</div>
                          <div className="mb-1"><strong>Apellido:</strong> {last || '-'}</div>
                        </>
                      );
                    })()}
                    <div className="mb-1"><strong>Cargo:</strong> {selectedContactoData.cargo || '-'}</div>
                    <div className="mb-1"><strong>Teléfono:</strong> {selectedContactoData.telefono || '-'}</div>
                    <div className="mb-1"><strong>Email:</strong> {selectedContactoData.email || '-'}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Contacto ID: {String(selectedContactoId) || '-'}</div>
                )}
              </div>
            </div>

            {/* Atención y botones movidos para mostrarse debajo de los contratos disponibles */}
            {/* Contratos no usados: mostrar select para elegir contrato y asignarlo al muestreo */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Contratos disponibles (no usados)</h4>
              {contratosLoading ? (
                <div className="text-sm text-gray-600">Cargando contratos...</div>
              ) : contratosError ? (
                <div className="text-sm text-red-400">Error cargando contratos: {contratosError}</div>
              ) : (
                <>
                  {(!contratosNoUsados || contratosNoUsados.length === 0) ? (
                    <div className="text-sm text-gray-600">No se encontraron contratos disponibles para esta empresa.</div>
                  ) : (
                    <select
                      className={`mt-2 p-2 border rounded w-full bg-white text-black ${selectionLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                      value={selectedContratoId ?? ''}
                      onChange={e => {
                        if (selectionLocked) return;
                        const id = e.target.value || null;
                        setSelectedContratoId(id);
                        setMuestreo(prev => ({ ...prev, id_contrato: id }));
                      }}
                      disabled={selectionLocked}
                    >
                      <option value="" style={{ fontWeight: 700, color: '#111827' }}>-- Seleccione un contrato --</option>
                      {contratosNoUsados.map(ct => (
                        <option key={String(ct.id_contrato ?? ct.id)} value={ct.id_contrato ?? ct.id} style={{ color: '#111827' }}>
                          {ct.codigo_cliente ? String(ct.codigo_cliente) : (`Contrato ${ct.id_contrato ?? ct.id}`)}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
              {selectedContratoId ? (
                <div className="mt-2 text-sm text-green-600">Contrato seleccionado: {getSelectedContratoCodigo()}</div>
              ) : null}
            </div>
            {/* Atención y botones: colocados debajo del bloque de contratos */}
            <div className="mt-4">
              <div><strong>Atención:</strong> {selectedCotizacion.atencion}</div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                className={`px-3 py-2 rounded ${selectedContratoId ? 'bg-emerald-500 text-white' : 'bg-emerald-300 text-white/60 cursor-not-allowed'}`}
                onClick={() => {
                  if (!selectedContratoId) {
                    alert('Por favor seleccione primero un contrato antes de continuar.');
                    return;
                  }
                  // Bloquear la sección de selección para evitar cambios posteriores
                  setSelectionLocked(true);
                  setCurrentStep(2);
                }}
                disabled={!selectedContratoId || selectionLocked}
              >Usar esta cotización</button>
            </div>
            {/* Paso 2: placeholder (movido al final para que quede al final de la página) */}
          </div>
        </div>
      
      ) : null}

        {/* Paso 2: sección finalizada al final de la página
            Ahora también la mostramos en modo solo lectura cuando currentStep === 3 */}
            {(currentStep === 2 || currentStep === 3) ? (
          <div className="mt-6 p-4 border rounded bg-white text-gray-900 w-full max-w-4xl mx-auto">
            <h3 className="font-medium">Paso 2 — Completar datos del muestreo</h3>
            {currentStep === 2 ? (
              <p className="text-sm mt-2">Has seleccionado el contrato <strong>{getSelectedContratoCodigo()}</strong>. Aquí puedes completar la información del muestreo y la muestra antes de guardarlo.</p>
            ) : (
              <p className="text-sm mt-2">Has seleccionado el contrato <strong>{getSelectedContratoCodigo()}</strong>. (Vista de solo lectura durante la recepción)</p>
            )}

            <div className="mt-4">
              <div>
                <h4 className="font-semibold">Datos del muestreo</h4>
                <label className="block text-sm mt-2">Fundo</label>
                <input className="p-2 border rounded w-full" type="text" value={muestreo.fundo} onChange={e=>setMuestreo(prev=>({...prev, fundo: e.target.value}))} disabled={currentStep===3} readOnly={currentStep===3} />
              </div>

              <div className="mt-6">
                <h4 className="font-semibold">Detalles de la muestra</h4>
                {detalles.map((d, idx) => (
                  <div key={idx} className="mt-3 p-3 border rounded bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm">Código laboratorio</label>
                        <input className="p-2 border rounded w-full bg-white/80" type="text" value={d.cod_laboratorio || String(101 + idx)} readOnly title="Generado automáticamente" />
                        <label className="block text-sm mt-2">Código campo</label>
                        <input className="p-2 border rounded w-full" type="text" value={d.cod_campo} onChange={e=>{
                          const v = e.target.value; setDetalles(prev=> prev.map((it,i)=> i===idx ? ({...it, cod_campo: v}) : it));
                        }} disabled={currentStep===3} />
                        <label className="block text-sm mt-2">Matriz</label>
                        <input className="p-2 border rounded w-full" type="text" value={d.matriz} onChange={e=>{
                          const v = e.target.value; setDetalles(prev=> prev.map((it,i)=> i===idx ? ({...it, matriz: v}) : it));
                        }} disabled={currentStep===3} />
                      </div>
                      <div>
                        <label className="block text-sm">Tipo de ensayo</label>
                        <select className="p-2 border rounded w-full" value={d.id_tipo_ensayo} onChange={e=>{
                          const v = e.target.value; setDetalles(prev=> prev.map((it,i)=> i===idx ? ({...it, id_tipo_ensayo: v}) : it));
                        }} disabled={currentStep===3}>
                          <option value="">-- Seleccione tipo de ensayo --</option>
                          {tiposEnsayos.map(t => (
                            <option key={t.id_tipo_ensayo ?? t.id ?? t.value ?? t.id_tipo} value={t.id_tipo_ensayo ?? t.id ?? t.value ?? t.id_tipo}>{t.nombre_ensayo ?? t.nombre ?? t.descripcion ?? String(t.id_tipo_ensayo ?? t.id ?? t.value ?? t.id_tipo)}</option>
                          ))}
                        </select>
                        <label className="block text-sm mt-2">Fecha muestra</label>
                        <input className="p-2 border rounded w-full bg-white/80" type="date" value={d.fecha_muestra} readOnly title="Se rellenará al crear el muestreo" />
                        <label className="block text-sm mt-2">Hora muestra</label>
                        <input className="p-2 border rounded w-full bg-white/80" type="time" value={d.hora_muestra} readOnly title="Se rellenará al crear el muestreo" />
                        <label className="block text-sm mt-2">Observaciones muestra</label>
                        <textarea className="p-2 border rounded w-full" rows={2} value={d.observaciones_muestra} onChange={e=>{
                          const v = e.target.value; setDetalles(prev=> prev.map((it,i)=> i===idx ? ({...it, observaciones_muestra: v}) : it));
                        }} disabled={currentStep===3} />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      {detalles.length > 1 && currentStep === 2 ? (
                        <button className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded" onClick={() => setDetalles(prev => prev.filter((_,i)=> i!==idx))}>Quitar detalle</button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {currentStep === 2 ? (
                  <div className="mt-3">
                    <button className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded" onClick={() => setDetalles(prev => ([...prev, createEmptyDetalle()]))}>Agregar detalle de muestreo</button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Observaciones generales del muestreo (al final, antes de los botones) */}
            <div className="mt-4">
              <label className="block text-sm">Observaciones generales</label>
              <textarea className="p-2 border rounded w-full" rows={3} value={muestreo.observaciones} onChange={e=>setMuestreo(prev=>({...prev, observaciones: e.target.value}))} disabled={currentStep===3} readOnly={currentStep===3} />
            </div>

            {currentStep === 2 ? (
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => { setCurrentStep(1); setSelectionLocked(false); }} disabled={submitting}>Volver</button>
                </div>
                <div>
                  <button
                    className={`px-4 py-2 rounded ${ (submitting || !isStep2Valid()) ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-emerald-600 text-white'}`}
                    onClick={() => handleCreateMuestreoAndDetalle()}
                    disabled={submitting || !isStep2Valid()}
                  >{submitting ? 'Creando...' : 'Crear muestreo'}</button>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-600">Vista de solo lectura del muestreo creado.</div>
            )}

            {submitError ? <div className="mt-4 text-sm text-red-500">Error: {submitError}</div> : null}
            {submitSuccess ? (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-sm">
                Muestreo creado correctamente. ID: {String(submitSuccess.muestreo.id_muestreo ?? submitSuccess.muestreo.id ?? (submitSuccess.muestreo.data && (submitSuccess.muestreo.data.id_muestreo ?? submitSuccess.muestreo.data.id)))}
                {/* Botón "Ir al listado" eliminado por solicitud del usuario */}
              </div>
            ) : null}

            {/* Recepción simple: crear registro asociado al id_muestreo recién creado */}
            {/* Nota: la sección de Recepción se muestra en el Paso 3 (Condición de Muestras)
                ahora la renderizamos fuera del bloque del Paso 2 para que al hacer
                setCurrentStep(3) el usuario vea la interfaz correspondiente. */}
          </div>
        ) : null}
        
        {/* Paso 3: Condición de Muestras / Recepción */}
        {currentStep === 3 ? (
          (submitSuccess && submitSuccess.muestreo) ? (
            <div className="mt-6 p-4 border rounded bg-white text-gray-900 w-full max-w-4xl mx-auto">
              <h3 className="font-medium">Paso 3 — Condición de Muestras (Recepción)</h3>
              <p className="text-sm mt-2">Asociado al muestreo ID: <strong>{String(submitSuccess.muestreo.id_muestreo ?? submitSuccess.muestreo.id ?? (submitSuccess.muestreo.data && (submitSuccess.muestreo.data.id_muestreo ?? submitSuccess.muestreo.data.id)))}</strong></p>
              <label className="block text-sm mt-3">Fecha y hora de recepción</label>
              <input className="p-2 border rounded w-full" type="datetime-local" value={fechaHoraRecepcion} onChange={e=>setFechaHoraRecepcion(e.target.value)} />
              <label className="block text-sm mt-3">Comentarios</label>
              <textarea className="p-2 border rounded w-full" rows={2} value={recepcionComentarios} onChange={e=>setRecepcionComentarios(e.target.value)} />

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium">Opciones de recepción</h5>
                  {recepcionOpcionesList.map(op => {
                      const id = op.id ?? op.id_opcion ?? op.id_op ?? op.id_tipo ?? op.value;
                      return (
                        <div key={id} className="mt-2">
                          <div className="text-sm mb-1">{op.nombre ?? op.nombre_opcion ?? op.descripcion ?? `Opción ${id}`}</div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input type="radio" name={`opc-${id}`} value="SI" checked={checkedOpciones[id] === 'SI'} onChange={() => setCheckedOpciones(prev=>({...prev, [id]: 'SI'}))} />
                              <span className="text-sm">SI</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name={`opc-${id}`} value="NO" checked={checkedOpciones[id] === 'NO'} onChange={() => setCheckedOpciones(prev=>({...prev, [id]: 'NO'}))} />
                              <span className="text-sm">NO</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div>
                  <h5 className="font-medium">Condiciones de la muestra</h5>
                  {recepcionCondicionesList.map(c => {
                    const id = c.id ?? c.id_condicion ?? c.id_tipo ?? c.value;
                    return (
                      <label key={id} className="flex items-center gap-2 mt-2">
                        <input type="checkbox" checked={!!checkedCondiciones[id]} onChange={e=>setCheckedCondiciones(prev=>({...prev, [id]: e.target.checked}))} />
                        <span className="text-sm">{c.nombre ?? c.descripcion ?? `Cond ${id}`}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className={`px-3 py-2 rounded bg-blue-600 text-white ${submittingRecepcion ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={async ()=>{
                  if (submittingRecepcion) return;
                  setSubmittingRecepcion(true); setRecepcionError(null); setRecepcionSuccess(null);
                  try {
                    const id_m = submitSuccess.muestreo.id_muestreo ?? submitSuccess.muestreo.id ?? (submitSuccess.muestreo.data && (submitSuccess.muestreo.data.id_muestreo ?? submitSuccess.muestreo.data.id));
                    const payload = {
                      id_muestreo: Number(id_m),
                      fecha_hora_recepcion: (fechaHoraRecepcion ? new Date(fechaHoraRecepcion).toISOString() : new Date().toISOString()),
                      comentarios: recepcionComentarios || '',
                      opciones_recepcion: recepcionOpcionesList.map(op => {
                        const id = op.id ?? op.id_opcion ?? op.id_op ?? op.value;
                        const val = checkedOpciones[id] === 'SI' ? 'SI' : 'NO';
                        return { id: id, valor: val };
                      }),
                      condiciones: recepcionCondicionesList.map(c => {
                        const idc = c.id ?? c.id_condicion ?? c.value;
                        const valc = (checkedCondiciones[idc] || checkedCondiciones[c.id_condicion]) ? 'SI' : 'NO';
                        return { id: idc, valor: valc };
                      })
                    };
                    let jr = null;
                    try {
                      const r = await fetchWithTimeout('https://as241s4-pii-t06-be.onrender.com/api/recepcion/simple', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, 20000);
                      if (!r.ok) { const t = await r.text(); throw new Error(`Recepción falló: ${r.status} ${t}`); }
                      jr = await r.json();
                    } catch (err) {
                      if (String(err?.message || '').toLowerCase().includes('timeout')) {
                        throw new Error('La petición tardó demasiado y fue cancelada (timeout). Verifica la conexión o el backend.');
                      }
                      throw err;
                    }
                    setRecepcionSuccess(jr);
                    setTimeout(() => {
                      try {
                        window.scrollTo(0,0);
                        navigate('/laboratorio/muestreo', { replace: true });
                      } catch (navErr) { console.error('Error navegando al listado de muestreos', navErr); }
                    }, 800);
                  } catch (err) { console.error(err); setRecepcionError(String(err?.message || err)); } finally { setSubmittingRecepcion(false); }
                }} disabled={submittingRecepcion}>{submittingRecepcion ? 'Enviando...' : 'Crear recepción'}</button>

                {/* Botón "Limpiar" eliminado en Paso 3 por requerimiento del usuario */}
              </div>

              {recepcionError ? <div className="mt-3 text-sm text-red-600">Error: {recepcionError}</div> : null}
              {recepcionSuccess ? <div className="mt-3 text-sm text-green-700">Recepción registrada correctamente.</div> : null}
            </div>
          ) : (
            <div className="mt-6 p-4 border rounded bg-white text-gray-900 w-full max-w-4xl mx-auto text-sm">Por favor cree primero el muestreo antes de registrar la recepción.</div>
          )
        ) : null}
      </div>
      </div>
      {/* Modal de confirmación para impedir salir mediante el sidebar durante Paso 3 */}
      {showLeaveConfirm ? (
        <div className="nm-leave-confirm-modal fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white text-black rounded p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Advertencia</h3>
            <p className="text-sm mb-4">Estás en el proceso final (Paso 3). Si sales ahora perderás el uso del contrato y podrías dejar el formulario incompleto. ¿Deseas continuar y salir?</p>
            <div className="flex justify-end gap-3">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => { setShowLeaveConfirm(false); setPendingNav(null); }}>Cancelar</button>
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => {
                try {
                  if (pendingNav && pendingNav.path) {
                    // navegar internamente
                    setShowLeaveConfirm(false);
                    const p = pendingNav.path;
                    setPendingNav(null);
                    navigate(p);
                    return;
                  }
                  if (pendingNav && pendingNav.href) {
                    const h = pendingNav.href;
                    setShowLeaveConfirm(false);
                    setPendingNav(null);
                    window.location.href = h;
                    return;
                  }
                } catch (err) {
                  console.error('Error al navegar tras confirmar salida', err);
                  setShowLeaveConfirm(false);
                  setPendingNav(null);
                }
              }}>Salir y continuar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
