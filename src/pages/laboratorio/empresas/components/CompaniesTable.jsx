import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, RotateCw } from 'lucide-react';
import api from '../../../../services/laboratorio/api.js';
import CompanyFormModal from './CompanyFormModal.jsx';
import { Edit } from 'lucide-react';

const CompaniesTable = ({ refreshKey }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies();
      if (Array.isArray(data)) {
        const enriched = await Promise.all(data.map(async (c) => {
          const compId = c.id ?? c.idEmpresa ?? c.id_empresa ?? null;
          if (!compId) return c;
          try {
            const res = await api.getCompanyContacts(compId);
            if (res) {
              let contactsArray = [];
              if (Array.isArray(res)) contactsArray = res;
              else if (res.contactos && Array.isArray(res.contactos)) contactsArray = res.contactos;
              const normalized = contactsArray.map(ct => ({
                idContacto: ct.idContacto ?? ct.id_contacto ?? ct.id ?? ct.idContacto,
                nombreCompleto: ct.nombreCompleto ?? (ct.nombre && ct.apellido ? `${ct.nombre} ${ct.apellido}` : (ct.nombreCompleto ?? ct.nombre ?? '')),
                cargoContacto: ct.cargoContacto ?? ct.cargo ?? ct.cargo_contacto ?? ct.cargoContacto ?? '',
                telefono: ct.telefono ?? ct.telefonoContacto ?? ct.telefono_contacto ?? ct.telefono ?? '',
                email: ct.email ?? ct.correo ?? ct.emailContacto ?? ct.email ?? '',
                activo: (typeof ct.activo === 'boolean') ? ct.activo : (ct.estado ? ct.estado.toString().toLowerCase() === 'activo' : false),
                esPrincipal: ct.esPrincipal ?? ct.es_principal ?? ct.esPrincipal ?? false,
                raw: ct
              }));
              return { ...c, contactos: normalized };
            }
            return c;
          } catch {
            return c;
          }
        }));
        setCompanies(enriched);
      }
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCompanies(); }, []);
  useEffect(() => { if (typeof refreshKey !== 'undefined') loadCompanies(); }, [refreshKey]);

  const setCompanyStatus = async (company, compId) => {
    const compStatus = company.status ?? (company.estado === 'A' ? 'Activo' : (company.estado === 'I' ? 'Inactivo' : company.estado)) ?? '';
    try {
      if ((compStatus || '').toString().toLowerCase() === 'activo') {
        await api.deactivateCompany(compId);
      } else {
        await api.restoreCompany(compId);
      }
    } catch (err) {
      console.error('Error cambiando estado de empresa', err);
    } finally {
      await loadCompanies();
    }
  };

  const getInitials = (name) => {
    return (name || '').split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch((status || '').toString().toLowerCase()) {
      case 'activo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactivo':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Empresas con Cotizaciones Completadas</h3>
        <div>
          <button onClick={() => loadCompanies()} className="text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-md">Recargar</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cotizaciones</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Facturación</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ver contactos</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-sm text-gray-500">Cargando empresas...</td></tr>
            ) : companies.length ? (
              companies.slice().sort((a,b) => {
                const statusOf = (comp) => {
                  const st = comp.status ?? (comp.estado === 'A' ? 'Activo' : (comp.estado === 'I' ? 'Inactivo' : comp.estado)) ?? '';
                  return (st || '').toString().toLowerCase() === 'activo';
                };
                const aActive = statusOf(a) ? 1 : 0;
                const bActive = statusOf(b) ? 1 : 0;
                if (bActive !== aActive) return bActive - aActive;
                const nameA = (a.name ?? a.razonSocial ?? a.razon_social ?? '').toString();
                const nameB = (b.name ?? b.razonSocial ?? b.razon_social ?? '').toString();
                return nameA.localeCompare(nameB);
              }).map((company, idx) => (
                (() => {
                  const compId = company.id ?? company.idEmpresa ?? company.id_empresa ?? null;
                  const compName = company.name ?? company.razonSocial ?? company.razon_social ?? '';
                  const compRuc = company.ruc ?? company.RUC ?? '';
                  const compStatus = company.status ?? (company.estado === 'A' ? 'Activo' : (company.estado === 'I' ? 'Inactivo' : company.estado)) ?? '';
                  return (
                    <React.Fragment key={compId ?? compRuc ?? idx}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow">{getInitials(compName || compRuc)}</div>
                            <div className="ml-3">
                              <div className="text-sm lg:text-base font-semibold text-gray-900">{compName || compRuc}</div>
                              <div className="text-sm text-gray-500">{compRuc}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {company.contactos && company.contactos.length ? (
                                          (() => {
                                            const principal = company.contactos.find(c => c.esPrincipal) || null;
                                            return (
                                              <>
                                                {principal ? (
                                                      <>
                                                        <div className="flex items-center gap-2">
                                                          <div className="text-sm lg:text-base text-gray-900">{principal.nombreCompleto}</div>
                                                          {principal.esPrincipal ? (
                                                            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.171L12 18.896l-7.336 3.873 1.402-8.171L.132 9.21l8.2-1.192L12 .587z"/></svg>
                                                          ) : null}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{principal.cargoContacto}</div>
                                                      </>
                                                    ) : (
                                                      <div className="text-sm text-gray-500">Sin contacto principal</div>
                                                    )}
                                                <div className="text-sm text-gray-500">{company.contactos.length} contactos</div>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <>
                                            <div className="text-sm text-gray-500">Sin contacto principal</div>
                                            <div className="text-sm text-gray-500">0 contactos</div>
                                          </>
                                        )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{company.quotations ?? ''}</div>
                          <div className="text-sm text-gray-500">Última: {company.lastQuote ?? ''}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs lg:text-sm font-semibold border ${getStatusColor(compStatus)}`}>{(compStatus || '').toString()}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{company.billing}</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
              <div className="flex items-center justify-center space-x-3">
                              {(() => {
                                const isActive = (compStatus || '').toString().toLowerCase() === 'activo';
                                if (isActive) {
                                  return (
                                    <button onClick={() => { setEditingCompany(company); setEditModalVisible(true); }} title="Editar empresa" aria-label="Editar empresa" className="text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-md bg-transparent"> <Edit className="w-4 h-4"/></button>
                                  );
                                }
                                return null;
                              })()}
                              {
                                (() => {
                                  const isActive = (compStatus || '').toString().toLowerCase() === 'activo';
                                  if (isActive) {
                                    return (
                                      <button onClick={() => setCompanyStatus(company, compId)} className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center" title="Desactivar empresa">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    );
                                  }
                                  return (
                                    <button onClick={() => setCompanyStatus(company, compId)} className="p-2 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center" title="Restaurar empresa">
                                      <RotateCw className="w-4 h-4" />
                                    </button>
                                  );
                                })()
                              }
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-left">
                          <button onClick={() => navigate(`/laboratorio/empresas/contactos/${compId}`)} className="flex items-center gap-2 text-blue-600 hover:text-blue-900"> <Eye className="w-4 h-4"/> <span className="hidden sm:inline">Ver contactos</span></button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })()
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-sm text-gray-500">No hay empresas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        <CompanyFormModal visible={editModalVisible} onClose={() => { setEditModalVisible(false); setEditingCompany(null); }} onSaved={() => { setEditModalVisible(false); setEditingCompany(null); loadCompanies(); }} company={editingCompany} />
    </div>
  );
};

export default CompaniesTable;
