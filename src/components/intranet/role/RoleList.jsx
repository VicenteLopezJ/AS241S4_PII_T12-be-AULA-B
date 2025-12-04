import React, { useEffect, useState, useCallback } from 'react';
import roleService from '../../../services/intranet/role/roleService';
import RoleForm from './RoleForm';
import Modal from '../user/Modal';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import '../../../styles/intranet/user/Dashboard.css';
import * as XLSX from "xlsx"

export default function RoleList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active'|'all'|'inactive'

  const loadRoles = useCallback(async (forcedStatus) => {
    const effectiveStatus = forcedStatus || statusFilter;
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (effectiveStatus) {
        case 'all':
          data = await roleService.getAllRoles(filter);
          break;
        case 'inactive':
          data = await roleService.getInactiveRoles(filter);
          break;
        default:
          data = await roleService.getRoles(filter);
      }
      setRoles(data);
    } catch (e) {
      setError(e.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, [filter, statusFilter]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const onCreate = () => {
    setEditingRole(null);
    setShowForm(true);
  };

  const onEdit = (r) => {
    setEditingRole(r);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar rol? (se marcará como inactivo)')) return;
    try {
      await roleService.deleteRole(id);
      await loadRoles();
    } catch (e) {
      alert(e.message || 'Error al eliminar');
    }
  };

  const onRestore = async (id) => {
    if (!confirm('¿Restaurar rol?')) return;
    try {
      await roleService.restoreRole(id);
      await loadRoles();
    } catch (e) {
      alert(e.message || 'Error al restaurar');
    }
  };

  const onSubmitForm = async (payload) => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.role_id, payload);
      } else {
        await roleService.createRole(payload);
      }
      setShowForm(false);
      setEditingRole(null);
      await loadRoles();
    } catch (e) {
      console.error('onSubmitForm error:', e);
      alert(e.message || JSON.stringify(e) || 'Error al guardar rol');
    }
  };

  const generarReporte = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Roles", 14, 16);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 24);
    autoTable(doc, {
      head: [["ID", "Nombre", "Descripción", "Estado"]],
      body: roles.map(r => [
        r.role_id,
        r.name,
        r.description || '-',
        r.estado_descripcion || (r.status === 1 ? 'Activo' : 'Inactivo')
      ]),
      startY: 30,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [22, 42, 58] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    doc.save("reporte_roles.pdf");
  };

  const generarReporteExcel = () => {
    // Cabecera
    const encabezado = [["ID", "Nombre", "Descripción", "Estado"]];

    // Cuerpo
    const cuerpo = roles.map(r => [
      r.role_id,
      r.name,
      r.description || "-",
      r.estado_descripcion || (r.status === 1 ? "Activo" : "Inactivo")
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
    XLSX.utils.book_append_sheet(libro, hoja, "Roles");

    // Guardar archivo
    XLSX.writeFile(libro, "reporte_roles.xlsx");
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="text-3xl font-semibold m-0">Administración de Roles</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onCreate} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px #0002' }}>Crear Rol</button>
          <button onClick={generarReporte} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px #0002' }}>Descargar PDF</button>
          <button
            onClick={generarReporteExcel}
            style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px #0002' }}
          >
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="dashboard-actions">

      </div>

      <div className="dashboard-filters">
        <div className="filter-tabs">
          <button className={statusFilter === 'active' ? 'active' : ''} onClick={() => { setStatusFilter('active'); loadRoles('active'); }}>Activos</button>
          <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => { setStatusFilter('all'); loadRoles('all'); }}>Todos</button>
          <button className={statusFilter === 'inactive' ? 'active' : ''} onClick={() => { setStatusFilter('inactive'); loadRoles('inactive'); }}>Inactivos</button>
        </div>

        <div className="search-box">
          <input placeholder="Buscar rol..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          <button onClick={() => loadRoles()} style={{ marginLeft: 8 }}>Buscar</button>
        </div>
      </div>

      {loading && <p>Cargando usuarios...</p>}
      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container" style={{ marginTop: 16 }}>
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
            {roles.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 15 }}>No hay roles</td></tr>
            )}
            {roles.map(r => (
              <tr key={r.role_id}>
                <td>{r.role_id}</td>
                <td>{r.name}</td>
                <td>{r.description || '-'}</td>
                <td>
                  <span className={`status-badge ${r.status === 1 ? 'active' : 'inactive'}`}>{r.estado_descripcion || (r.status === 1 ? 'Activo' : 'Inactivo')}</span>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn-edit" onClick={() => onEdit(r)}>Editar</button>
                    {r.status === 1 ? (
                      <button className="btn-delete" onClick={() => onDelete(r.role_id)}>Eliminar</button>
                    ) : (
                      <button className="btn-reactivate" onClick={() => onRestore(r.role_id)}>Restaurar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingRole(null); }} title={editingRole ? 'Editar Rol' : 'Crear Rol'} noBackdrop={true}>
          <RoleForm initialData={editingRole} onCancel={() => { setShowForm(false); setEditingRole(null); }} onSubmit={onSubmitForm} />
        </Modal>
      )}
    </>
  );
}
