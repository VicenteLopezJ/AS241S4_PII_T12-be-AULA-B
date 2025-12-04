import React from 'react';

export default function EmpresaSelector({ companies = [], selectedId, onSelect, searchValue }) {
  return (
    <div className="mt-3 max-h-96 overflow-auto space-y-3" role="list">
      {companies.length === 0 ? (
        <div className="text-sm text-slate-400 p-2">No hay empresas disponibles</div>
      ) : (
        companies.map(c => {
          const id = c.id ?? c.idEmpresa ?? c.id_empresa ?? c.ruc ?? '';
          const name = c.name ?? c.razonSocial ?? c.razon_social ?? c.razon ?? c.nombre ?? c.ruc ?? 'Empresa';
          const selected = String(selectedId) === String(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect && onSelect(String(id))}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelect && onSelect(String(id)); }}
              className={`w-full flex-none h-20 px-4 rounded flex items-center justify-between cursor-pointer transition duration-150 box-border overflow-hidden text-left ${selected ? 'bg-slate-800/60 ring-1 ring-emerald-500' : 'bg-slate-900/40 hover:ring-1 hover:ring-emerald-400/40'}`}>
              <div className="min-w-0 overflow-hidden">
                <div className="font-medium text-lg text-white truncate whitespace-nowrap">{name}</div>
                <div className="text-sm text-slate-400 truncate whitespace-nowrap">{c.ruc || ''}</div>
              </div>
              <div className="flex-shrink-0 text-sm text-slate-300 ml-4 truncate">{c.ciudad || ''}</div>
            </button>
          );
        })
      )}
    </div>
  );
}
