import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function ContactFormModal({ visible, onClose, onSave, initial }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', cargo: '', telefono: '', email: '', activo: true, es_principal: false });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const onlyLettersRe = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/u;
  const phoneRe = /^9\d{8}$/; // starts with 9, total 9 digits
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // simple email check

  const collapseSpaces = (s) => (s || '').toString().replace(/\s+/g, ' ').trim();

  useEffect(() => {
    if (initial) {
      // ensure we copy fields and keep existing flags
      setForm({ nombre: initial.nombre || '', apellido: initial.apellido || '', cargo: initial.cargo || '', telefono: initial.telefono || '', email: initial.email || '', activo: initial.activo ?? true, es_principal: initial.es_principal ?? false });
      setErrors({});
      setTouched({});
    } else {
      setForm({ nombre: '', apellido: '', cargo: '', telefono: '', email: '', activo: true, es_principal: false });
      setErrors({});
      setTouched({});
    }
  }, [initial, visible]);

  if (!visible) return null;

  const validateField = (name, value) => {
    let msg = '';
    const v = (value || '').toString();
    if (name === 'nombre' || name === 'apellido' || name === 'cargo') {
      if (!v.trim()) msg = 'Campo requerido.';
      else if (!onlyLettersRe.test(collapseSpaces(v))) msg = 'Solo letras y espacios permitidos.';
    }
    if (name === 'telefono') {
      if (!v.trim()) msg = 'Teléfono es requerido.';
      else if (/\s/.test(v)) msg = 'Teléfono no debe contener espacios.';
      else if (!/^\d+$/.test(v)) msg = 'Teléfono solo debe contener números.';
      else if (!phoneRe.test(v)) msg = 'Teléfono debe empezar con 9 y tener 9 dígitos.';
    }
    if (name === 'email') {
      if (!v.trim()) msg = 'Email es requerido.';
      else if (/\s/.test(v)) msg = 'Email no debe contener espacios.';
      else if (!v.includes('@')) msg = 'Email debe contener @.';
      else if (!emailRe.test(v)) msg = 'Email inválido.';
    }
    setErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const isFormValid = () => {
    const fields = ['nombre','apellido','cargo','telefono','email'];
    for (const f of fields) {
      const val = form[f] || '';
      if (!val.toString().trim()) return false;
      if (errors[f]) return false;
    }
    return true;
  };

  const handleSave = async () => {
    // mark all as touched and validate
    const fields = ['nombre','apellido','cargo','telefono','email'];
    const newTouched = {};
    fields.forEach(f => newTouched[f] = true);
    setTouched(prev => ({ ...prev, ...newTouched }));
    const allValid = fields.map(f => validateField(f, form[f] || '')).every(Boolean);
    if (!allValid) return;
    setSaving(true);
    try {
      const payload = {
        nombre: collapseSpaces(form.nombre),
        apellido: collapseSpaces(form.apellido),
        cargo: collapseSpaces(form.cargo),
        telefono: (form.telefono || '').toString().trim(),
        email: (form.email || '').toString().trim(),
        es_principal: !!form.es_principal,
        activo: !!form.activo
      };
      await onSave(payload);
      onClose && onClose();
    } catch (e) {
      console.error('Error saving contact', e);
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
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{initial ? 'Editar Contacto' : 'Nuevo Contacto'}</h3>
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <input value={form.nombre} onChange={e=>{ const v=e.target.value; setForm(prev=>({...prev, nombre:v})); validateField('nombre', v); }} onBlur={e=>{ setTouched(prev=>({...prev, nombre:true})); validateField('nombre', e.target.value); }} placeholder="Nombre" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.nombre && touched.nombre ? <div className="text-xs text-red-600 mt-1">{errors.nombre}</div> : null}

          <label className="text-sm font-medium text-gray-700">Apellido</label>
          <input value={form.apellido} onChange={e=>{ const v=e.target.value; setForm(prev=>({...prev, apellido:v})); validateField('apellido', v); }} onBlur={e=>{ setTouched(prev=>({...prev, apellido:true})); validateField('apellido', e.target.value); }} placeholder="Apellido" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.apellido && touched.apellido ? <div className="text-xs text-red-600 mt-1">{errors.apellido}</div> : null}

          <label className="text-sm font-medium text-gray-700">Cargo</label>
          <input value={form.cargo} onChange={e=>{ const v=e.target.value; setForm(prev=>({...prev, cargo:v})); validateField('cargo', v); }} onBlur={e=>{ setTouched(prev=>({...prev, cargo:true})); validateField('cargo', e.target.value); }} placeholder="Cargo" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.cargo && touched.cargo ? <div className="text-xs text-red-600 mt-1">{errors.cargo}</div> : null}

          <label className="text-sm font-medium text-gray-700">Teléfono</label>
          <input value={form.telefono} onChange={e=>{ const v=e.target.value; setForm(prev=>({...prev, telefono:v})); validateField('telefono', v); }} onBlur={e=>{ setTouched(prev=>({...prev, telefono:true})); validateField('telefono', e.target.value); }} placeholder="Teléfono" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.telefono && touched.telefono ? <div className="text-xs text-red-600 mt-1">{errors.telefono}</div> : null}

          <label className="text-sm font-medium text-gray-700">Email</label>
          <input value={form.email} onChange={e=>{ const v=e.target.value; setForm(prev=>({...prev, email:v})); validateField('email', v); }} onBlur={e=>{ setTouched(prev=>({...prev, email:true})); validateField('email', e.target.value); }} placeholder="Email" className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400" />
          {errors.email && touched.email ? <div className="text-xs text-red-600 mt-1">{errors.email}</div> : null}

          <div className="flex items-center gap-4 pt-1">
            <label className="text-sm flex items-center gap-2 text-black">
              <input type="checkbox" checked={!!form.es_principal} onChange={e=>setForm(prev=>({...prev, es_principal: e.target.checked}))} className="rounded" style={{accentColor: '#000'}} />
              <span className="text-black">Marcar como contacto principal</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700">Cancelar</button>
            {!isFormValid() ? (
              <button aria-hidden className="px-4 py-2 rounded-md bg-transparent text-gray-400 border border-transparent opacity-30 pointer-events-none">Guardar</button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white shadow">{saving ? 'Guardando...' : 'Guardar'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
