// src/components/autorizaciones/AutorizacionCard.jsx
import React from 'react';

import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  FileCheck,
  Calendar,
  Clock,
  User,
  Building2,
  FileText
} from 'lucide-react';
import { autorizacionService } from "../../../services/boleta_permiso/autorizacionService";

const getUserAccess = () => {
  let rolId = null;
  let permisos = [];

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const info = JSON.parse(raw);
        rolId = info.rol_id ?? info.rolId ?? null;
        permisos = info.permisos || [];
      }
    } catch (e) {
      console.warn('No se pudo leer userInfo desde localStorage', e);
    }
  }

  return { rolId, permisos };
};

export const AutorizacionCard = ({ autorizacion, onViewDetails, onAprobar, onRegistrar }) => {
  const { boleta, estado, jefe, admin } = autorizacion;
  const { rolId, permisos } = getUserAccess();

  const canGestionar = (() => {
    if (rolId === 1 || rolId === 2) return true;
    return (
      permisos.includes('aprobar_solicitud') ||
      permisos.includes('aprobar_area') ||
      permisos.includes('aprobar_todas')
    );
  })();

  // Se considera "pendiente para jefe" si la autorización no está en un estado final
  // (ni "Registrado" ni "Rechazado"). Esto permite que el jefe gestione todos los casos
  // donde aún falta su decisión, incluso si el backend no usa exactamente el texto
  // "Pendiente Jefe".
  const isPendienteJefe = (() => {
    if (!estado) return true;
    const v = String(estado).toLowerCase();
    if (v.includes('registrado') || v.includes('rechazado')) return false;
    return true;
  })();

  const canRegistrar = (() => {
    if (rolId === 1) return true;
    return permisos.includes('registrar_asistencia');
  })();

  return (
    <div className="bg-gray-700 rounded-lg p-5 hover:bg-gray-700/80 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Información Principal */}
        <div className="flex-1 space-y-3">
          {/* Header con Estado */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  {boleta?.empleado_nombre || 'Sin nombre'}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  autorizacionService.getEstadoColor(estado)
                }`}>
                  {estado}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Building2 className="w-4 h-4" />
                <span>{boleta?.area_nombre || 'Sin área'}</span>
              </div>
            </div>
          </div>

          {/* Información de la Boleta */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {/* Fecha de Permiso */}
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-xs text-gray-400">Fecha Permiso</p>
                <p className="font-medium">
                  {autorizacionService.formatearFecha(boleta?.fecha_permiso)}
                </p>
              </div>
            </div>

            {/* Hora y Duración */}
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400">Hora / Duración</p>
                <p className="font-medium">
                  {autorizacionService.formatearHora(boleta?.hora_salida)} 
                  <span className="text-gray-400"> / </span>
                  {boleta?.horas_duracion}h
                </p>
              </div>
            </div>

            {/* Tipo de Motivo */}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Tipo</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  autorizacionService.getTipoMotivoColor(boleta?.tipo_motivo)
                }`}>
                  {boleta?.tipo_motivo || 'N/A'}
                </span>
              </div>
            </div>

            {/* Boleta ID */}
            <div className="flex items-center gap-2 text-gray-300">
              <FileCheck className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">ID Boleta</p>
                <p className="font-mono font-medium">#{autorizacion.boleta_id}</p>
              </div>
            </div>
          </div>

          {/* Información de Aprobación/Registro */}
          {(jefe || admin) && (
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-600">
              {jefe && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>Aprobado por: <span className="text-white">{jefe.nombre_completo}</span></span>
                </div>
              )}
              {admin && (
                <div className="flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-blue-400" />
                  <span>Registrado por: <span className="text-white">{admin.nombre_completo}</span></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex lg:flex-col gap-2">
          {/* Ver Detalles */}
          <button
            onClick={() => onViewDetails(autorizacion)}
            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalles</span>
          </button>

          {/* Gestionar (para jefe/admin cuando la autorización sigue pendiente) */}
          {isPendienteJefe && canGestionar && (
            <button
              onClick={() => onAprobar(autorizacion)}
              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Gestionar</span>
            </button>
          )}

          {/* Registrar (solo si está pendiente de registro y tiene permisos) */}
          {estado === 'Pendiente Registro' && canRegistrar && (
            <button
              onClick={() => onRegistrar(autorizacion)}
              className="flex-1 lg:flex-none bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Registrar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};