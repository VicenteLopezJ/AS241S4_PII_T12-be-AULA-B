import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContactFormModal from './components/ContactFormModal';
import { Edit, RotateCw, Trash2 } from 'lucide-react';
import api from '../../../../services/laboratorio/api.js';
import PageShell from '../../PageShell.jsx';

export default function CompanyContacts() {
  const { id } = useParams();
  const companyId = Number(id);
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // global loading provider removed — local inline messages are used when needed

  const getInitials = (ct) => {
    const name = (ct && (ct.nombreCompleto || `${ct.nombre || ''} ${ct.apellido || ''}`)).trim();
    if (!name) return '';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const first = parts[0][0] || '';
    const last = parts[parts.length - 1][0] || '';
    return (first + last).toUpperCase();
  };

  useEffect(() => {
    let mounted = true;
    if (!id || Number.isNaN(companyId)) {
      setCompanies([]);
      setCompany(null);
      return () => { mounted = false; };
    }

        (async () => {
      try {
        const [all, contacts] = await Promise.all([
          api.getCompanies().catch(() => []),
          api.getCompanyContacts(companyId).catch(() => null)
        ]);
        if (!mounted) return;
        const list = Array.isArray(all) ? all : [];
        setCompanies(list);

        if (contacts) {
          const normalize = (contactsArray) => contactsArray.map(ct => ({
            idContacto: ct.idContacto ?? ct.id_contacto ?? ct.id ?? ct.idContacto,
            nombreCompleto: ct.nombreCompleto ?? (ct.nombre && ct.apellido ? `${ct.nombre} ${ct.apellido}` : (ct.nombreCompleto ?? ct.nombre ?? '')),
            cargoContacto: ct.cargoContacto ?? ct.cargo ?? ct.cargo_contacto ?? '',
            telefono: ct.telefono ?? ct.telefonoContacto ?? ct.telefono_contacto ?? '',
            email: ct.email ?? ct.correo ?? ct.emailContacto ?? '',
            activo: (typeof ct.activo === 'boolean') ? ct.activo : (ct.estado ? ct.estado.toString().toLowerCase() === 'activo' : false),
            esPrincipal: ct.esPrincipal ?? ct.es_principal ?? (ct.esPrincipal === undefined ? false : ct.esPrincipal),
            raw: ct
          }));

          let contactsArray = [];
          if (Array.isArray(contacts)) contactsArray = contacts;
          else if (contacts.contactos && Array.isArray(contacts.contactos)) contactsArray = contacts.contactos;
          else if (contacts.contacto && Array.isArray(contacts.contacto)) contactsArray = contacts.contacto;

          const normalized = normalize(contactsArray);

          const found = list.find(c => Number(c.id) === companyId || Number(c.idEmpresa) === companyId || Number(c.id_empresa) === companyId);
          if (found) setCompany({ ...found, contactos: normalized });
          else setCompany({ id: companyId, contactos: normalized });
        } else {
          setCompany(null);
        }
      } catch (e) {
        setCompanies([]);
        setCompany(null);
      } finally {
      }
    })();

    return () => { mounted = false; };
  }, [companyId]);

  const reloadContacts = async () => {
    try {
      const contactsResp = await api.getCompanyContacts(companyId);
      if (!contactsResp) return;

      const contactsArray = Array.isArray(contactsResp)
        ? contactsResp
        : (contactsResp.contactos ?? contactsResp.contacto ?? []);

      const normalized = contactsArray.map(ct => ({
        idContacto: ct.idContacto ?? ct.id_contacto ?? ct.idContacto ?? ct.id ?? ct.idContacto,
        nombreCompleto: ct.nombreCompleto ?? (ct.nombre && ct.apellido ? `${ct.nombre} ${ct.apellido}` : (ct.nombreCompleto ?? ct.nombre ?? '')),
        cargoContacto: ct.cargoContacto ?? ct.cargo ?? ct.cargo_contacto ?? '',
        telefono: ct.telefono ?? ct.telefonoContacto ?? ct.telefono_contacto ?? '',
        email: ct.email ?? ct.correo ?? ct.emailContacto ?? '',
        activo: (typeof ct.activo === 'boolean') ? ct.activo : (ct.estado ? ct.estado.toString().toLowerCase() === 'activo' : false),
        esPrincipal: ct.esPrincipal ?? ct.es_principal ?? false,
        raw: ct
      }));

      setCompany(prev => ({ ...(prev || {}), contactos: normalized }));
    } catch (e) {
      console.error('Error reloading contacts', e);
    } finally {
    }
  };

  const openNew = () => { setEditingContact(null); setModalVisible(true); };
  const openEdit = (ct) => {
    const parts = (ct.nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
    const nombre = parts.length ? parts[0] : '';
    const apellido = parts.length > 1 ? parts.slice(1).join(' ') : '';
    const initialForm = {
      idContacto: ct.idContacto,
      nombre,
      apellido,
      cargo: ct.cargoContacto || ct.cargo || '',
      telefono: ct.telefono || '',
      email: ct.email || '',
      activo: !!ct.activo,
      es_principal: !!ct.esPrincipal
    };
    setEditingContact(initialForm);
    setModalVisible(true);
  };
  const closeModal = () => { setModalVisible(false); setEditingContact(null); };

  const saveContact = async (form) => {
    try {
      if (form.idContacto) {
        const payload = {
          idEmpresa: companyId,
          nombre: form.nombre,
          apellido: form.apellido,
          cargoContacto: form.cargo,
          telefono: form.telefono,
          email: form.email,
          activo: form.activo,
          esPrincipal: form.es_principal ?? form.esPrincipal ?? false
        };
        await api.updateContact(form.idContacto, payload);
      } else {
        const payload = {
          idEmpresa: companyId,
          nombre: form.nombre,
          apellido: form.apellido,
          cargoContacto: form.cargo,
          telefono: form.telefono,
          email: form.email,
          activo: form.activo,
          esPrincipal: form.es_principal ?? form.esPrincipal ?? false
        };
        await api.createContact(companyId, payload);
      }
      await reloadContacts();
    } catch (e) {
      console.error('Error saving contact', e);
    } finally {
      closeModal();
    }
  };

  const toggleActiveContact = async (idContacto) => {
    try {
      const ct = company.contactos.find(x => x.idContacto === idContacto);
      if (!ct) return;
      if (ct.activo) {
        await api.deleteContact(idContacto);
      } else {
        await api.restoreContact(idContacto);
      }
      await reloadContacts();
    } catch (e) {
      console.error('Error toggling contact active', e);
    } finally {
    }
  };

  const deleteContact = async (idContacto) => {
    if (!confirm('¿Eliminar contacto? Esta acción es permanente.')) return;
    try {
      await api.deleteContact(idContacto);
      await reloadContacts();
    } catch (e) {
      console.error('Error deleting contact', e);
    } finally {
    }
  };

  const companyName = company ? (company.name || company.razonSocial || company.razon_social || company.razon || company.razon_social || '') : '';
  const companyRuc = company ? (company.ruc || company.RUC || company.rucNumber || '') : '';
  const isActive = company ? (typeof company.activo === 'boolean' ? company.activo : (company.estado ? company.estado.toString().toLowerCase() === 'activo' : false)) : false;
  const direccion = company ? (company.direccion || company.address || company.direccionFiscal || '') : '';
  const distrito = company ? (company.distrito || company.district || '') : '';
  const provincia = company ? (company.provincia || company.province || '') : '';
  const logoUrl = company ? (company.logoUrl || company.logo || company.imagen || company.logo_url || '') : '';

  return (
    <PageShell title={companyName || 'Empresa'} showSearch={false}>
      {!company ? (
        <div className="p-6 text-gray-900">
          <h2 className="text-xl font-semibold">Empresa no encontrada</h2>
          <button onClick={() => navigate('/laboratorio/empresas')} className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded">Volver</button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-3">
            <button onClick={() => navigate('/laboratorio/empresas')} className="px-4 py-2 bg-gray-100 text-gray-900 rounded opacity-95">Volver</button>
          </div>

          <div className="mb-6">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-6 text-white shadow-md">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-16 h-16 object-cover rounded-full" />
                  ) : (
                    <svg className="w-10 h-10 text-white opacity-95" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 13h4v7H3zM10 6h11v14H10z" fill="white" opacity="0.9" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold leading-tight text-white">{companyName}</h1>
                  <div className="mt-3 flex items-center gap-8 text-sm opacity-95">
                    <div>
                      <div className="text-xs">RUC</div>
                      <div className="text-lg font-semibold">{companyRuc}</div>
                    </div>
                    <div>
                      <div className="text-xs">Estado</div>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                      </div>
                    </div>
                  </div>
                  {(direccion || distrito || provincia) ? (
                    <div className="mt-4 text-sm opacity-90 text-white">
                      {direccion ? <div>{direccion}</div> : null}
                      <div>{[distrito, provincia].filter(Boolean).join(' — ')}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden text-gray-900">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contactos registrados</h3>
              <div>
                <button onClick={openNew} className="px-4 py-2 bg-green-600 text-white rounded">Nuevo Contacto</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {company.contactos && company.contactos.length ? [...company.contactos].slice().sort((a,b) => {
                    const aActive = a.activo ? 1 : 0;
                    const bActive = b.activo ? 1 : 0;
                    if (bActive !== aActive) return bActive - aActive;
                    const aPrincipal = a.esPrincipal ? 1 : 0;
                    const bPrincipal = b.esPrincipal ? 1 : 0;
                    if (bPrincipal !== aPrincipal) return bPrincipal - aPrincipal;
                    return (a.nombreCompleto || '').toString().localeCompare(b.nombreCompleto || '');
                  }).map(ct => (
                    <tr key={ct.idContacto} className={`hover:bg-gray-50 ${ct.esPrincipal ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-blue-400">
                              {getInitials(ct)}
                            </div>
                            <div className="text-sm font-medium">{ct.nombreCompleto}</div>
                            {ct.esPrincipal ? (
                              <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24" aria-hidden="true" title="Contacto principal"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.171L12 18.896l-7.336 3.873 1.402-8.171L.132 9.21l8.2-1.192L12 .587z"/></svg>
                            ) : null}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ct.cargoContacto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ct.telefono}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><a href={`mailto:${ct.email}`} className="text-blue-600 hover:underline">{ct.email}</a></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${ct.activo ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>{ct.activo ? 'Activo' : 'Inactivo'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                            <div className="flex items-center gap-2">
                                              {ct.activo ? (
                                                <>
                                                  <button onClick={() => openEdit(ct)} title="Editar" className="p-2 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                                                    <Edit className="w-4 h-4" />
                                                  </button>
                                                  <button onClick={() => toggleActiveContact(ct.idContacto)} title="Desactivar" className="p-2 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-200">
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                </>
                                              ) : (
                                                <button onClick={() => toggleActiveContact(ct.idContacto)} title="Restaurar" className="p-2 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-200">
                                                  <RotateCw className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-sm text-gray-500">No hay contactos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ContactFormModal visible={modalVisible} onClose={closeModal} onSave={saveContact} initial={editingContact} />
        </>
      )}
    </PageShell>
  );
}
