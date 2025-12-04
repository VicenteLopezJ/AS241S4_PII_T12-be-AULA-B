import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed unused import
import tipoService from '../../../services/intranet/tipos/tipoService';
import '../../../styles/intranet/user/Dashboard.css';
import Modal from '../../../components/intranet/user/Modal';
import TipoFormModal from '../tipos/TipoFormModal';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const TipoList = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState('activos'); // activos | inactivos | todos
  const [showForm, setShowForm] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  // const navigate = useNavigate(); // Removed unused variable

  const load = async () => {
    setLoading(true);
    try {
      let data;
      if (view === 'activos') data = await tipoService.getAll();
      else if (view === 'inactivos') data = await tipoService.getInactive();
      else data = await tipoService.getAllWithStatus();
      setTipos(data || []);
    } catch (e) {
      console.error('Error loading tipos', e);
      setTipos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    load();
    return () => (mounted = false);
  }, [view]);

  const openCreate = () => {
    setEditingTipo(null);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingTipo(t);
    setShowForm(true);
  };

  const handleSubmit = async (payload) => {
    if (editingTipo) {
      await tipoService.update(editingTipo.id_tipos_solicitudes ?? editingTipo.id ?? editingTipo.value, payload);
    } else {
      await tipoService.create(payload);
    }
    setShowForm(false);
    setEditingTipo(null);
    await load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar (inactivar) tipo?')) return;
    await tipoService.remove(id);
    await load();
  };

  const handleRestore = async (id) => {
    if (!confirm('Restaurar tipo inactivo?')) return;
    await tipoService.restore(id);
    await load();
  };

  const generarReporteTipos = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Tipos de Solicitud", 14, 16);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 24);
    autoTable(doc, {
      head: [["ID", "Nombre", "Descripción"]],
      body: tipos.map(t => [
        t.id_tipos_solicitudes ?? t.id ?? t.value,
        t.nombre,
        t.descripcion || '-'
      ]),
      startY: 30,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [22, 42, 58] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    doc.save("tipos_solicitud.pdf");
  };

  const generarReporteTiposExcel = () => {
  // Cabecera
  const encabezado = [["ID", "Nombre", "Descripción"]];

  // Cuerpo
  const cuerpo = tipos.map(t => [
    t.id_tipos_solicitudes ?? t.id ?? t.value,
    t.nombre,
    t.descripcion || "-"
  ]);

  // Combinar cabecera + cuerpo
  const datos = [...encabezado, ...cuerpo];

  // Crear hoja
  const hoja = XLSX.utils.aoa_to_sheet(datos);

  // Ajustar ancho de columnas automáticamente
  const colWidths = encabezado[0].map((col, i) => ({
    wch: Math.max(
      col.length,
      ...cuerpo.map(row => (row[i] ? row[i].toString().length : 0))
    ) + 2
  }));
  hoja["!cols"] = colWidths;

  // Crear libro y añadir hoja
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Tipos");

  // Guardar archivo
  XLSX.writeFile(libro, "tipos_solicitud.xlsx");
};

  return (
    <div className="dashboard p-6">
      <div className="dashboard-header">
        <h1 className="text-3xl m-0">Tipos de Solicitud</h1>
        <div className="dashboard-actions">
          <button className="btn-primary" onClick={openCreate}>Crear Tipo</button>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="search-box">
          <input placeholder="Buscar por nombre..." value={filter} onChange={(e)=>setFilter(e.target.value)} />
          <button onClick={() => {
            // simple client-side filter
            setLoading(true);
            tipoService.getAll().then(data => { setTipos((data||[]).filter(t => String(t.nombre||'').toLowerCase().includes(filter.toLowerCase()))); setLoading(false); });
          }} style={{marginLeft:8}}>Buscar</button>
        </div>
        <div className="ml-4 flex items-center gap-2">
          <button className={`px-3 py-2 rounded ${view === 'activos' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`} onClick={() => setView('activos')}>Activos</button>
          <button className={`px-3 py-2 rounded ${view === 'inactivos' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`} onClick={() => setView('inactivos')}>Inactivos</button>
          <button className={`px-3 py-2 rounded ${view === 'todos' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`} onClick={() => setView('todos')}>Todos</button>
        </div>
      </div>

      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:16}}>
        <button onClick={generarReporteTipos} style={{background:'#0ea5e9', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>Descargar PDF</button>
        <button 
  onClick={generarReporteTiposExcel} 
  style={{background:'#22c55e', color:'#fff', border:'none', marginLeft: 12 ,borderRadius:8, padding:'px 20px', fontWeight:'bold', cursor:'pointer'}}
>
  Descargar Excel
</button>
      </div>

      <div className="users-table-container" style={{marginTop:16}}>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-12 py-12 text-center text-slate-400 text-lg bg-slate-800">Cargando...</td></tr>
            ) : tipos.length === 0 ? (
              <tr><td colSpan={4} className="px-12 py-12 text-center text-slate-400 italic bg-slate-800">No hay tipos</td></tr>
            ) : (
              tipos.map(t => (
                <tr key={t.id_tipos_solicitudes ?? t.id ?? t.value}>
                  <td>{t.id_tipos_solicitudes ?? t.id ?? t.value}</td>
                  <td>{t.nombre}</td>
                  <td>{t.descripcion || '-'}</td>
                  <td>{t.status === 0 ? 'Inactivo' : 'Activo'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn-edit" onClick={() => openEdit(t)}>Editar</button>
                      {t.status === 0 ? (
                        <button className="btn-edit" onClick={() => handleRestore(t.id_tipos_solicitudes ?? t.id ?? t.value)}>Restaurar</button>
                      ) : (
                        <button className="btn-delete" onClick={() => handleDelete(t.id_tipos_solicitudes ?? t.id ?? t.value)}>Eliminar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTipo(null); }} title={editingTipo ? 'Editar Tipo' : 'Crear Tipo'}>
        <TipoFormModal initialData={editingTipo ? ({
          nombre: editingTipo.nombre,
          descripcion: editingTipo.descripcion,
          // keep original id fields if needed
          id: editingTipo.id_tipos_solicitudes ?? editingTipo.id ?? editingTipo.value
        }) : null} onCancel={() => { setShowForm(false); setEditingTipo(null); }} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
};

export default TipoList;
