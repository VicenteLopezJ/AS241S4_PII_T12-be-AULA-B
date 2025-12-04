// src/pages/DocumentosPage.jsx
import React from 'react';
import { FileText } from 'lucide-react';

// Página simple informativa: el backend ya no expone /documentos,
// solo documentos asociados a boletas (/boletas/{id}/documentos).

const DocumentosPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-8 py-10 max-w-xl text-center shadow-xl">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
          <FileText className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Gestión de documentos desde boletas
        </h1>
        <p className="text-gray-300 text-sm mb-3">
          Esta sección ya no muestra una lista global de documentos.
        </p>
        <p className="text-gray-400 text-sm">
          Para subir, ver o descargar documentos, abre el detalle de una
          <span className="font-semibold text-blue-300"> solicitud de permiso (boleta)</span>
          en el módulo de Permisos.
        </p>
      </div>
    </div>
  );
};

export default DocumentosPage;