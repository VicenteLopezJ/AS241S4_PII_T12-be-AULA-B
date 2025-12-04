import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import solicitudService from '../../../services/intranet/solicitudes/solicitudService';
import { userService } from '../../../services/intranet/user/userService';
import tipoService from '../../../services/intranet/tipos/tipoService';
import '../../../styles/intranet/user/Dashboard.css';
import Modal from '../../../components/intranet/user/Modal';
import SolicitudFormModal from './SolicitudFormModal';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const SolicitudList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState({});
  const [tiposMap, setTiposMap] = useState({});
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' = all, 'e' = espera, 'a' = aceptada, 'r' = rechazada
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const data = await solicitudService.getAll();
        if (!mounted) return;
        setItems(data || []);

        // build tipos map
        try {
          const tipos = await tipoService.getAll();
          if (mounted) {
            const tmap = {};
            (tipos || []).forEach(t => { tmap[t.id_tipos_solicitudes ?? t.id ?? t.value] = t; });
            setTiposMap(tmap);
          }
        } catch {
          // ignore tipos fetch errors
        }

        // fetch user details for unique usuario ids
        const ids = Array.from(new Set((data || []).map(d => d.usuario_id).filter(Boolean)));
        if (ids.length) {
          const toFetch = ids.filter(id => !usersMap[id]);
          const fetched = {};
          await Promise.all(toFetch.map(async (id) => {
            try {
              const u = await userService.getUserById(id);
              fetched[id] = u;
            } catch {
              // ignore
            }
          }));
          if (mounted && Object.keys(fetched).length) {
            setUsersMap(prev => ({ ...prev, ...fetched }));
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading solicitudes', err);
        if (!mounted) return;
        setItems([]);
        setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  // usersMap is intentionally omitted from deps to avoid infinite loop
  }, []);

  const loadItems = async (estado = '') => {
    setLoading(true);
    const data = await solicitudService.getAll(estado || null);
    setItems(data || []);

    // update tipos map
    try {
      const tipos = await tipoService.getAll();
      const tmap = {};
      (tipos || []).forEach(t => { tmap[t.id_tipos_solicitudes ?? t.id ?? t.value] = t; });
      setTiposMap(tmap);
    } catch {
      // ignore
    }

    // update users map for any new usuario ids
    const ids = Array.from(new Set((data || []).map(d => d.usuario_id).filter(Boolean)));
    if (ids.length) {
      const toFetch = ids.filter(id => !usersMap[id]);
      const fetched = {};
      await Promise.all(toFetch.map(async (id) => {
        try {
          const u = await userService.getUserById(id);
          fetched[id] = u;
        } catch {
          // ignore
        }
      }));
      if (Object.keys(fetched).length) setUsersMap(prev => ({ ...prev, ...fetched }));
    }

    setLoading(false);
  };

  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const handleSubmit = async (payload) => {
    try {
      if (selectedItem) {
        const id = selectedItem.id_solicitudes || selectedItem.id;
        await solicitudService.update(id, payload);
      } else {
        await solicitudService.create(payload);
      }
    } finally {
      setShowForm(false);
      setSelectedItem(null);
      await loadItems(statusFilter);
    }
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleChangeState = async (item, nuevoEstado) => {
    const id = item.id_solicitudes || item.id;
    setProcessingId(id);
    try {
      await solicitudService.changeState(id, nuevoEstado);
      await loadItems(statusFilter);
    } catch (e) {
      const serverMsg = e?.response?.data?.error || e?.response?.data?.mensaje || e?.message;
      alert(serverMsg || 'No se pudo cambiar el estado');
    } finally {
      setProcessingId(null);
    }
  };

  const generarReporteActivos = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Solicitudes Activas", 14, 16);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 24);
    autoTable(doc, {
      head: [["ID", "Usuario", "Tipo", "Descripción"]],
      body: items.filter(s => s.estado === 'a').map(s => {
        const usuario = usersMap[s.usuario_id];
        const usuarioName = usuario ? (usuario.user_name || usuario.name || usuario.username) : s.usuario_id;
        const tipoObj = tiposMap[s.id_tipos_solicitudes];
        const tipoName = tipoObj ? (tipoObj.nombre || tipoObj.name) : s.id_tipos_solicitudes;
        return [
          s.id_solicitudes,
          usuarioName,
          tipoName,
          s.detalles || '-'
        ];
      }),
      startY: 30,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [22, 42, 58] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    doc.save("solicitudes_activas.pdf");
  };

  const generarReporteActivosExcel = () => {
    const encabezado = [["ID", "Usuario", "Tipo", "Descripción", "Estado", "Fecha inicio", "Fecha fin", "Prioridad"]];

    const cuerpo = items
      .filter(s => s.estado === 'a')
      .map(s => {
        const usuario = usersMap[s.usuario_id];
        const usuarioName = usuario ? (usuario.user_name || usuario.name || usuario.username) : s.usuario_id;
        const tipoObj = tiposMap[s.id_tipos_solicitudes];
        const tipoName = tipoObj ? (tipoObj.nombre || tipoObj.name) : s.id_tipos_solicitudes;
        return [
          s.id_solicitudes,
          usuarioName,
          tipoName,
          s.detalles || "-",
          s.estado === 'a' ? 'Aceptada' : s.estado === 'r' ? 'Rechazada' : 'En espera',
          s.fecha_inicio ? String(s.fecha_inicio).slice(0,10) : '',
          s.fecha_fin ? String(s.fecha_fin).slice(0,10) : '',
          typeof s.prioridad !== 'undefined' ? s.prioridad : ''
        ];
      });

    const datos = [...encabezado, ...cuerpo];
    const hoja = XLSX.utils.aoa_to_sheet(datos);

    const colWidths = encabezado[0].map((col, i) => ({
      wch: Math.max(
        col.length,
        ...cuerpo.map(row => (row[i] ? row[i].toString().length : 0))
      ) + 2
    }));
    hoja["!cols"] = colWidths;

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Solicitudes Activas");
    XLSX.writeFile(libro, "solicitudes_activas.xlsx");
  };

  return (
    <div className="dashboard p-6">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <h1 className="text-3xl font-semibold m-0">Solicitudes</h1>
        <div style={{display:'flex', gap:'16px'}}>
          <button onClick={() => { setSelectedItem(null); setShowForm(true); }} className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded hover:bg-white/30 transition-all duration-300 text-sm font-medium">Nueva</button>
          <button onClick={generarReporteActivos} style={{background:'#0ea5e9', color:'#fff', border:'none', borderRadius:8, padding:'12px 32px', fontWeight:'bold', cursor:'pointer', fontSize:'1.1rem', boxShadow:'0 2px 8px #0002'}}>Descargar pdf</button>
          <button onClick={generarReporteActivosExcel} style={{background:'#22c55e', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', fontWeight:'bold', cursor:'pointer', marginLeft:12}}>Descargar Excel</button>
        </div>
      </div>

        <div className="dashboard-filters">
          <div className="search-box">
            <input placeholder="Buscar por descripción o usuario..." value={filter} onChange={(e)=>setFilter(e.target.value)} />
            <button onClick={() => { setLoading(true); solicitudService.getAll(statusFilter || null).then(data => { setItems((data||[]).filter(s => (s.detalles||'').toLowerCase().includes(filter.toLowerCase()) || String(s.usuario_id||'').includes(filter))); setLoading(false); }); }} style={{marginLeft:8}}>Buscar</button>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <button className={`px-3 py-2 rounded ${statusFilter === '' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`} onClick={() => { setStatusFilter(''); loadItems(''); }}>Todas</button>
            <button className={`px-3 py-2 rounded ${statusFilter === 'e' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`} onClick={() => { setStatusFilter('e'); loadItems('e'); }}>En espera</button>
            <button className={`px-3 py-2 rounded ${statusFilter === 'a' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`} onClick={() => { setStatusFilter('a'); loadItems('a'); }}>Aprobadas</button>
            <button className={`px-3 py-2 rounded ${statusFilter === 'r' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`} onClick={() => { setStatusFilter('r'); loadItems('r'); }}>Rechazadas</button>
          </div>
        </div>

      <div className="users-table-container" style={{marginTop:16}}>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-12 py-12 text-center text-slate-400 text-lg bg-slate-800">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-12 py-12 text-center text-slate-400 italic bg-slate-800">No hay solicitudes</td></tr>
            ) : (
              items
                .filter(s => {
                  const q = (filter || '').toLowerCase();
                  if (!q) return true;
                  const detalles = (s.detalles || '').toLowerCase();
                  const usuarioId = String(s.usuario_id || '').toLowerCase();
                  const usuario = usersMap[s.usuario_id];
                  const usuarioName = usuario ? ((usuario.user_name || usuario.name || usuario.username || '')).toLowerCase() : '';
                  const tipoObj = tiposMap[s.id_tipos_solicitudes];
                  const tipoName = tipoObj ? (tipoObj.nombre || tipoObj.name || '').toLowerCase() : String(s.id_tipos_solicitudes || '').toLowerCase();
                  return detalles.includes(q) || usuarioId.includes(q) || usuarioName.includes(q) || tipoName.includes(q);
                })
                .map(s => {
                  const usuario = usersMap[s.usuario_id];
                  const usuarioName = usuario ? (usuario.user_name || usuario.name || usuario.username) : s.usuario_id;
                  const tipoObj = tiposMap[s.id_tipos_solicitudes];
                  const tipoName = tipoObj ? (tipoObj.nombre || tipoObj.name) : s.id_tipos_solicitudes;
                  return (
                    <tr key={s.id_solicitudes}>
                      <td>{s.id_solicitudes}</td>
                      <td>{usuarioName}</td>
                      <td>{s.estado === 'a' ? 'Aceptada' : s.estado === 'r' ? 'Denegada' : 'En espera'}</td>
                      <td>{tipoName}</td>
                      <td>{s.detalles || '-'}</td>
                      <td>
                        <div className="actions">
                          <button className="btn-edit" onClick={() => navigate(`/solicitudes/${s.id_solicitudes}`)}>Ver</button>
                          <button className="btn-edit" onClick={() => handleOpenEdit(s)}>Editar</button>
                          {s.estado !== 'a' && <button className="btn-edit" disabled={processingId === s.id_solicitudes} onClick={() => handleChangeState(s, 'a')}>Aceptar</button>}
                          {s.estado !== 'r' && <button className="btn-delete" disabled={processingId === s.id_solicitudes} onClick={() => handleChangeState(s, 'r')}>Rechazar</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
      
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelectedItem(null); }} title={selectedItem ? 'Editar Solicitud' : 'Nueva Solicitud'}>
        <SolicitudFormModal initialData={selectedItem} onCancel={() => { setShowForm(false); setSelectedItem(null); }} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
};

export default SolicitudList;
