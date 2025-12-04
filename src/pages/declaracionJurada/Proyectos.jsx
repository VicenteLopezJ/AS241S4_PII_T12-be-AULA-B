import React, { useState, useEffect } from 'react';
import { Plus, Search, FolderKanban } from 'lucide-react';
import MainLayout from '../../components/DJurada/MainLayout.jsx';
import ProyectosList from '../../components/DJurada/ProyectosList.jsx';
import ProyectoForm from '../../components/DJurada/ProyectoForm.jsx';
import ViewModal from '../../components/DJurada/ViewModal.jsx';
import { proyectosAPI } from '../../services/declaracionJurada/declaracionJurada.js';

const Proyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProyecto, setSelectedProyecto] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    useEffect(() => {
        cargarProyectos();
    }, [filterEstado]);

    const cargarProyectos = async () => {
        try {
            setLoading(true);
            const response = await proyectosAPI.getAll(filterEstado || '');
            if (response.success) {
                setProyectos(response.data);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al cargar proyectos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProyecto(null);
        setShowForm(true);
    };

    const handleEdit = (proyecto) => {
        setSelectedProyecto(proyecto);
        setShowForm(true);
    };

    const handleView = (proyecto) => {
        setSelectedProyecto(proyecto);
        setShowViewModal(true);
    };

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            let response;

            if (selectedProyecto) {
                response = await proyectosAPI.update(selectedProyecto.id_proyecto, formData);
            } else {
                response = await proyectosAPI.create(formData);
            }

            if (response.success) {
                setShowForm(false);
                setSelectedProyecto(null);
                await cargarProyectos();
            } else {
                console.log('❌ Error: ' + response.error);
            }
        } catch (error) {
            console.log('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (proyecto) => {
        const accion = proyecto.estado === 'A' ? 'desactivar' : 'activar';

        if (window.confirm(`¿Seguro que deseas ${accion} el proyecto "${proyecto.nombre_proyecto}"?`)) {
            try {
                setLoading(true);
                const response = await proyectosAPI.toggleEstado(proyecto.id_proyecto);

                if (response.success) {
                    console.log(`✅ ${response.message}`);
                    await cargarProyectos();
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

    const proyectosFiltrados = proyectos.filter(p =>
        p.nombre_proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo_proyecto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="px-6 py-6 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="mb-1 text-2xl font-bold text-white">Gestión de Proyectos</h1>
                        <p className="text-sm text-slate-400">
                            Administra todos los proyectos del instituto
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl border border-purple-500/20 shadow-lg">
                        <p className="text-xs text-purple-100 font-medium mb-0.5">Total Proyectos</p>
                        <p className="text-3xl font-bold text-white">{proyectos.length}</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-700 rounded-xl">
                    <div className="flex flex-col items-center justify-between gap-3 mb-6 md:flex-row">
                        <div className="flex w-full gap-3 md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute transform -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar proyecto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                />
                            </div>
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="px-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="A">Activos</option>
                                <option value="I">Inactivos</option>
                                <option value="C">Cerrados</option>
                            </select>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="w-full md:w-auto px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus size={18} />
                            Nuevo Proyecto
                        </button>
                    </div>

                    <ProyectosList
                        proyectos={proyectosFiltrados}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                </div>
            </div>

            {showForm && (
                <ProyectoForm
                    proyecto={selectedProyecto}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setSelectedProyecto(null);
                    }}
                    loading={loading}
                />
            )}

            {showViewModal && selectedProyecto && (
                <ViewModal
                    type="proyecto"
                    data={selectedProyecto}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedProyecto(null);
                    }}
                />
            )}
        </MainLayout>
    );
};

export default Proyectos;