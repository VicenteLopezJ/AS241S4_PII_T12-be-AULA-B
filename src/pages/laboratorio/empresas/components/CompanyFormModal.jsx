import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../../services/laboratorio/api';
// Spinner component removed; inline SVG is used for minimal loading indicator.

export default function CompanyFormModal({ visible, onClose, onSaved, company = null }) {
  const [form, setForm] = useState({ razonSocial: '', ruc: '', direccion: '', distrito: '', provincia: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation regexes
  const onlyLettersRe = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/u;
  const rucRe = /^\d{11}$/; // RUC peruano: 11 dígitos

  const collapseSpaces = (s) => (s || '') .toString().replace(/\s+/g, ' ').trim();

  const validateField = (name, value) => {
    let msg = '';
    const v = (value || '').toString();
    if (name === 'razonSocial') {
      if (!v.trim()) msg = 'Razón social es requerida.';
      else if (!onlyLettersRe.test(v)) msg = 'Solo letras y espacios permitidos.';
    }
    if (name === 'ruc') {
      if (!v.trim()) msg = 'RUC es requerido.';
      else if (/\s/.test(v)) msg = 'RUC no debe contener espacios.';
      else if (!/^\d+$/.test(v)) msg = 'RUC solo debe contener números.';
      else if (!rucRe.test(v)) msg = 'RUC debe tener 11 dígitos.';
    }
    if (name === 'direccion') {
      if (!v.trim()) msg = 'Dirección es requerida.';
      else if (v.trim().length < 3) msg = 'Dirección demasiado corta.';
    }
    if (name === 'distrito') {
      if (!v.trim()) msg = 'Distrito es requerido.';
      else if (!onlyLettersRe.test(v)) msg = 'Distrito: solo letras y espacios.';
    }
    if (name === 'provincia') {
      if (!v.trim()) msg = 'Provincia es requerida.';
      else if (!onlyLettersRe.test(v)) msg = 'Provincia: solo letras y espacios.';
    }
    setErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  // Overall form validity
  const isFormValid = () => {
    const fields = ['razonSocial','ruc','direccion','distrito','provincia'];
    for (const f of fields) {
      const val = form[f] || '';
      if (!val.toString().trim()) return false;
      // if there is an error message, invalid
      if (errors[f]) return false;
    }
    return true;
  };
  useEffect(() => {
    if (!visible) {
      setForm({ razonSocial: '', ruc: '', direccion: '', distrito: '', provincia: '' });
    }
  }, [visible]);

  useEffect(() => {
    if (visible && company) {
      setForm({
        razonSocial: company.razonSocial ?? company.razon_social ?? company.name ?? company.razonSocial ?? '',
        ruc: company.ruc ?? company.RUC ?? company.Ruc ?? '',
        direccion: company.direccion ?? company.direccionFiscal ?? company.address ?? '',
        distrito: company.distrito ?? company.distrito ?? '',
        provincia: company.provincia ?? company.provincia ?? ''
      });
      // do not validate immediately on open; show errors only after user interaction (blur) or on save
    }
  }, [company, visible]);

  if (!visible) return null;

  const handleSave = async () => {
    // mark all fields as touched so errors become visible
    const fields = ['razonSocial','ruc','direccion','distrito','provincia'];
    const newTouched = {};
    fields.forEach(f => { newTouched[f] = true; });
    setTouched(prev => ({ ...prev, ...newTouched }));
    // validate all fields
    const allValid = fields.map(f => validateField(f, form[f] || '')).every(Boolean);
    if (!allValid) return; // do not proceed to save
    setSaving(true);
    try {
      // sanitize and normalize before sending
      const payload = {
        razonSocial: (form.razonSocial || '').toString().trim(),
        ruc: (form.ruc || '').toString().trim(),
        direccion: collapseSpaces(form.direccion),
        distrito: (form.distrito || '').toString().trim(),
        provincia: (form.provincia || '').toString().trim()
      };
      console.debug('[company form] creating/updating payload ->', payload);
      const compId = company && (company.id ?? company.idEmpresa ?? company.id_empresa ?? company._id);
      let res;
      if (compId) {
        res = await api.updateCompany(compId, payload);
      } else {
        res = await api.createCompany(payload);
      }
      onSaved && onSaved(res);
      onClose && onClose();
    } catch (e) {
      // Mostrar información detallada del error para debugging
      try {
        console.error('Error creando/actualizando empresa', { message: e.message, status: e.status, body: e.body, url: e.url });
        // si el backend devuelve un body con mensaje, mostrarlo al usuario
        const serverMsg = e && e.body && (e.body.mensaje || e.body.message || e.body.error || JSON.stringify(e.body));
        if (serverMsg) {
          // mostrar alerta mínima para desarrollo; en producción considera un UI toast
          alert(`Error del servidor: ${serverMsg}`);
        } else {
          alert(`Error creando empresa: ${e.message || e}`);
        }
      } catch (err) {
        console.error('Error manejando el error', err);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
  <h3 className="text-lg font-semibold mb-4 text-gray-900">{company ? 'Editar Registro' : 'Nuevo Registro'}</h3>
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Razón Social</label>
          <input value={form.razonSocial} onChange={e=>{ const v=e.target.value; setForm({...form, razonSocial:v}); validateField('razonSocial', v); }} onBlur={e => { setTouched(prev=>({...prev, razonSocial:true})); validateField('razonSocial', e.target.value); }} placeholder="Nombre de la empresa" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.razonSocial && touched.razonSocial ? <div className="text-xs text-red-600 mt-1">{errors.razonSocial}</div> : null}

          <label className="text-sm font-medium text-gray-700">RUC</label>
          <input value={form.ruc} onChange={e=>{ const v=e.target.value; setForm({...form, ruc:v}); validateField('ruc', v); }} onBlur={e => { setTouched(prev=>({...prev, ruc:true})); validateField('ruc', e.target.value); }} placeholder="20123456789" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.ruc && touched.ruc ? <div className="text-xs text-red-600 mt-1">{errors.ruc}</div> : null}

          <label className="text-sm font-medium text-gray-700">Dirección</label>
          <input value={form.direccion} onChange={e=>{ const v=e.target.value; setForm({...form, direccion:v}); validateField('direccion', v); }} onBlur={e=>{ const cleaned = collapseSpaces(e.target.value); setForm(prev=>({...prev, direccion: cleaned})); setTouched(prev=>({...prev, direccion:true})); validateField('direccion', cleaned); }} placeholder="Calle Falsa 123" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.direccion && touched.direccion ? <div className="text-xs text-red-600 mt-1">{errors.direccion}</div> : null}

          <label className="text-sm font-medium text-gray-700">Distrito</label>
          <input value={form.distrito} onChange={e=>{ const v=e.target.value; setForm({...form, distrito:v}); validateField('distrito', v); }} onBlur={e=>{ const cleaned = collapseSpaces(e.target.value); setForm(prev=>({...prev, distrito: cleaned})); setTouched(prev=>({...prev, distrito:true})); validateField('distrito', cleaned); }} placeholder="Miraflores" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.distrito && touched.distrito ? <div className="text-xs text-red-600 mt-1">{errors.distrito}</div> : null}

          <label className="text-sm font-medium text-gray-700">Provincia</label>
          <input value={form.provincia} onChange={e=>{ const v=e.target.value; setForm({...form, provincia:v}); validateField('provincia', v); }} onBlur={e=>{ const cleaned = collapseSpaces(e.target.value); setForm(prev=>({...prev, provincia: cleaned})); setTouched(prev=>({...prev, provincia:true})); validateField('provincia', cleaned); }} placeholder="Lima" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.provincia && touched.provincia ? <div className="text-xs text-red-600 mt-1">{errors.provincia}</div> : null}

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700">Cancelar</button>
            {/* When form is not valid, show a transparent/inactive placeholder button; when valid, show the green actionable button */}
            {!isFormValid() ? (
              <button aria-hidden className="px-4 py-2 rounded-md bg-transparent text-gray-400 border border-transparent opacity-30 pointer-events-none">Guardar</button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white shadow flex items-center">
                {saving ? (
                  <>
                    <svg className="w-4 h-4 text-white mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" opacity="0.9" />
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>{company ? 'Guardar cambios' : 'Guardar'}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
