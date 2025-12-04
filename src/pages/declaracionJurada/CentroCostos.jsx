import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import MainLayout from '../../components/DJurada/MainLayout.jsx';
import CentroCostosList from '../../components/DJurada/CentroCostosList.jsx';
import CentroCostosForm from '../../components/DJurada/CentroCostosForm.jsx';
import ViewModal from '../../components/DJurada/ViewModal.jsx';
import { centrosCostosAPI } from '../../services/declaracionJurada/declaracionJurada.js';

const CentroCostos = () => {
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCentro, setSelectedCentro] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const cargarCentros = useCallback(async () => {
        try {
            setLoading(true);
            const response = await centrosCostosAPI.getAll(filterTipo, filterEstado);
            if (response.success) {
                setCentros(response.data);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al cargar centros de costos');
        } finally {
            setLoading(false);
        }
    }, [filterTipo, filterEstado]);

    useEffect(() => {
        cargarCentros();
    }, [cargarCentros]);

    const handleCreate = () => {
        setSelectedCentro(null);
        setShowForm(true);
    };

    const handleEdit = (centro) => {
        setSelectedCentro(centro);
        setShowForm(true);
    };

    const handleView = (centro) => {
        setSelectedCentro(centro);
        setShowViewModal(true);
    };

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            let response;

            if (selectedCentro) {
                response = await centrosCostosAPI.update(selectedCentro.id_centro_costos, formData);
            } else {
                response = await centrosCostosAPI.create(formData);
            }

            if (response.success) {
                setShowForm(false);
                setSelectedCentro(null);
                await cargarCentros();
            } else {
                console.log('❌ Error: ' + response.error);
            }
        } catch (error) {
            console.log('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (centro) => {
        const accion = (centro.estado || '').trim().toLowerCase() === 'a' ? 'desactivar' : 'activar';

        if (window.confirm(`¿Seguro que deseas ${accion} el centro "${centro.nombre_centro}"?`)) {
            try {
                setLoading(true);
                const response = await centrosCostosAPI.toggleEstado(centro.id_centro_costos);

                if (response.success) {
                    await cargarCentros();
                } else {
                    console.log('❌ Error: ' + response.error);
                }
            } catch (error) {
                console.log('❌ Error: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const centrosFiltrados = centros.filter(c => {
        const matchSearch = c.nombre_centro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.codigo_centro.toLowerCase().includes(searchTerm.toLowerCase());
        const matchEstado = filterEstado === '' || (c.estado || '').trim().toLowerCase() === filterEstado;
        return matchSearch && matchEstado;
    });

    return (
        <MainLayout>
            <div className="px-6 py-6 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="mb-1 text-2xl font-bold text-white">Centros de Costos</h1>
                        <p className="text-sm text-slate-400">
                            Administra los centros de costos de PROSIP y Valle Grande
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl border border-teal-500/20 shadow-lg">
                        <p className="text-xs text-teal-100 font-medium mb-0.5">Total Centros</p>
                        <p className="text-3xl font-bold text-white">{centros.length}</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-700 rounded-xl">
                    <div className="flex flex-col items-center justify-between gap-3 mb-6 md:flex-row">
                        <div className="flex w-full gap-3 md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute transform -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar centro de costos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                />
                            </div>
                            <select
                                value={filterTipo}
                                onChange={(e) => setFilterTipo(e.target.value)}
                                className="px-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="PROSIP">PROSIP</option>
                                <option value="VALLE_GRANDE">Valle Grande</option>
                            </select>
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="px-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="a">Activo</option>
                                <option value="i">Inactivo</option>
                            </select>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="w-full md:w-auto px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus size={18} />
                            Nuevo Centro
                        </button>
                    </div>

                    <CentroCostosList
                        centros={centrosFiltrados}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                </div>
            </div>

            {showForm && (
                <CentroCostosForm
                    centro={selectedCentro}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setSelectedCentro(null);
                    }}
                    loading={loading}
                />
            )}

            {showViewModal && selectedCentro && (
                <ViewModal
                    type="centro"
                    data={selectedCentro}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedCentro(null);
                    }}
                />
            )}
        </MainLayout>
    );
};

export default CentroCostos;