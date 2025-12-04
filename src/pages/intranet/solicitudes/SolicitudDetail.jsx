import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import solicitudService from '../../../services/intranet/solicitudes/solicitudService';
import tipoService from '../../../services/intranet/tipos/tipoService';
import '../../../styles/intranet/user/Dashboard.css';

const SolicitudDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipoNombre, setTipoNombre] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    if (id) {
      solicitudService.getById(id).then(data => {
        if (!mounted) return;
        setItem(data);
        setLoading(false);
        (async () => {
          try {
            const tipoId = data?.id_tipos_solicitudes ?? data?.tipo ?? null;
            if (tipoId) {
              const t = await tipoService.getById(tipoId);
              if (!mounted) return;
              setTipoNombre(t?.nombre ?? t?.name ?? '');
            }
          } catch (e) {
            // ignore
          }
        })();
      });
    }
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="dashboard p-6">Cargando...</div>;
  if (!item) return <div className="dashboard p-6">No se encontró la solicitud.</div>;

  return (
    <div className="dashboard p-6">
      <div className="dashboard-header">
        <h1 className="text-2xl m-0">Solicitud #{item.id_solicitudes}</h1>
      </div>

      <div className="users-table-container mt-4 p-4">
        <div className="mb-2"><strong>Usuario:</strong> {item.usuario_id || item.user || '-'}</div>
        <div className="mb-2"><strong>Tipo:</strong> {tipoNombre || item.id_tipos_solicitudes || item.tipo || '-'}</div>
        <div className="mb-2"><strong>Fecha creación:</strong> {(() => {
          try {
            return item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleString() : '-';
          } catch (e) { return item.fecha_creacion || '-'; }
        })()}</div>
        <div className="mb-2"><strong>Fecha fin:</strong> {(() => {
          try {
            const fin = item.fecha_fin || item.fecha_cierre || null;
            return fin ? new Date(fin).toLocaleString() : '-';
          } catch (e) { return item.fecha_fin || item.fecha_cierre || '-'; }
        })()}</div>
        <div className="mb-2"><strong>Detalles:</strong> {item.detalles || '-'}</div>
        <div className="mb-4"><strong>Estado:</strong> <span className={`status-badge ${item.estado === 'a' ? 'active' : item.estado === 'r' ? 'inactive' : ''}`}>{item.estado === 'a' ? 'Aceptada' : item.estado === 'r' ? 'Denegada' : 'En espera'}</span></div>
        <div>
          <button className="btn-edit" onClick={() => navigate('/solicitudes')}>Volver</button>
        </div>
      </div>
    </div>
  );
};

export default SolicitudDetail;
