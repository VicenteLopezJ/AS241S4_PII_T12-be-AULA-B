import React, { useState, useEffect } from 'react';
import { Calendar, X, Save, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const VacationPeriodModal = ({ isOpen, onClose, onSave, editData = null }) => {
    const [formData, setFormData] = useState({
        year_period: '',
        period_name: '',
        start_date: '',
        end_date: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setFormData({
                year_period: editData.year_period,
                period_name: editData.period_name,
                start_date: editData.start_date,
                end_date: editData.end_date
            });
        } else {
            setFormData({
                year_period: new Date().getFullYear(),
                period_name: '',
                start_date: '',
                end_date: ''
            });
        }
        setErrors({});
    }, [editData, isOpen]);

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.year_period || formData.year_period < 2000 || formData.year_period > 2100) {
            newErrors.year_period = 'Año inválido';
        }

        if (!formData.period_name.trim()) {
            newErrors.period_name = 'El nombre del período es requerido';
        }

        if (!formData.start_date) {
            newErrors.start_date = 'La fecha de inicio es requerida';
        }

        if (!formData.end_date) {
            newErrors.end_date = 'La fecha de fin es requerida';
        }

        if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
            newErrors.end_date = 'La fecha de fin debe ser posterior a la de inicio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Error de validación',
                text: 'Por favor corrige los errores en el formulario',
                confirmButtonColor: '#14b8a6',
                background: '#243447',
                color: '#fff'
            });
            return;
        }

        setLoading(true);

        const dataToSave = {
            year_period: parseInt(formData.year_period, 10),
            period_name: formData.period_name.trim(),
            start_date: formData.start_date,
            end_date: formData.end_date,
            total_days: 30,
            status: editData ? editData.status : 'I'
        };

        const result = await onSave(dataToSave);

        setLoading(false);

        if (result) {
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (!isOpen) return null;

    const totalDays = calculateDays(formData.start_date, formData.end_date);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{
                backgroundColor: 'rgba(26, 35, 50, 0.7)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)'
            }}
        >
            <div className="bg-[#243447] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <Calendar className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {editData ? 'Editar Período Vacacional' : 'Nuevo Período Vacacional'}
                            </h2>
                            <p className="text-teal-50 text-sm">
                                {editData ? 'Modifica los datos del período' : 'Completa la información del nuevo período'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Año */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Año del Período <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                name="year_period"
                                value={formData.year_period}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1a2332] border ${errors.year_period ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder-slate-500`}
                                placeholder="2024"
                            />
                            {errors.year_period && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.year_period}
                                </p>
                            )}
                        </div>

                        {/* Nombre del Período */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Nombre del Período <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="period_name"
                                value={formData.period_name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1a2332] border ${errors.period_name ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder-slate-500`}
                                placeholder="Ej: Período Vacacional 2024"
                            />
                            {errors.period_name && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.period_name}
                                </p>
                            )}
                        </div>

                        {/* Fecha Inicio */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Fecha de Inicio <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1a2332] border ${errors.start_date ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                            />
                            {errors.start_date && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.start_date}
                                </p>
                            )}
                        </div>

                        {/* Fecha Fin */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Fecha de Fin <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1a2332] border ${errors.end_date ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                            />
                            {errors.end_date && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.end_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Total Days Preview */}
                    {totalDays > 0 && (
                        <div className="mt-6 bg-gradient-to-r from-teal-500 from-opacity-20 to-emerald-500 to-opacity-20 bg-opacity-10 border border-teal-500 border-opacity-30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-slate-100">Duración del período:</span>
                                    <span className="text-xs text-slate-200">{totalDays} días calendario</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-200">30 días</span>
                                    <p className="text-xs text-slate-100">de vacaciones</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-[#1a2332] text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium border border-slate-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {editData ? 'Actualizar Período' : 'Crear Período'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VacationPeriodModal;