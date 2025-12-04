import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProyectoForm = ({ proyecto, onSubmit, onCancel, loading }) => {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        codigo_proyecto: '',
        nombre_proyecto: '',
        descripcion: '',
        estado: 'A',
        fecha_inicio: '',
        fecha_fin: '',
        presupuesto_asignado: '',
        responsable_nombre: '',
        observaciones: ''
    });

    useEffect(() => {
        if (proyecto) {
            console.log('📝 Cargando proyecto para editar:', proyecto);
            setFormData({
                codigo_proyecto: proyecto.codigo_proyecto || '',
                nombre_proyecto: proyecto.nombre_proyecto || '',
                descripcion: proyecto.descripcion || '',
                estado: proyecto.estado || 'A',
                fecha_inicio: proyecto.fecha_inicio ? proyecto.fecha_inicio.split('T')[0] : '',
                fecha_fin: proyecto.fecha_fin ? proyecto.fecha_fin.split('T')[0] : '',
                presupuesto_asignado: proyecto.presupuesto_asignado || '',
                responsable_nombre: proyecto.responsable_nombre || '',
                observaciones: proyecto.observaciones || ''
            });
        }
    }, [proyecto]);

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'codigo_proyecto':
                if (!value || !value.trim()) {
                    error = 'El código es obligatorio';
                } else if (value.length < 2) {
                    error = 'El código debe tener al menos 2 caracteres';
                } else if (value.length > 20) {
                    error = 'El código no puede exceder 20 caracteres';
                } else if (!/^[A-Z0-9\-]+$/.test(value)) {
                    error = 'Solo se permiten MAYÚSCULAS, números y guiones (-)';
                }
                break;

            case 'nombre_proyecto':
                if (!value || !value.trim()) {
                    error = 'El nombre es obligatorio';
                } else if (value.length < 5) {
                    error = 'El nombre debe tener al menos 5 caracteres';
                } else if (value.length > 150) {
                    error = 'El nombre no puede exceder 150 caracteres';
                }
                break;

            case 'descripcion':
                if (value && value.length > 1000) {
                    error = 'La descripción no puede exceder 1000 caracteres';
                }
                break;

            case 'fecha_inicio':
                if (value) {
                    const fechaInicio = new Date(value);
                    const hace2Anos = new Date();
                    hace2Anos.setFullYear(hace2Anos.getFullYear() - 2);
                    
                    if (fechaInicio < hace2Anos) {
                        error = 'La fecha de inicio no puede ser hace más de 2 años';
                    }
                }
                break;

            case 'fecha_fin':
                if (value && formData.fecha_inicio) {
                    const fechaInicio = new Date(formData.fecha_inicio);
                    const fechaFin = new Date(value);
                    
                    if (fechaFin <= fechaInicio) {
                        error = 'La fecha fin debe ser posterior a la fecha inicio';
                    }
                    
                    const diffTime = Math.abs(fechaFin - fechaInicio);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays > 3650) {
                        error = 'El proyecto no puede durar más de 10 años';
                    }
                }
                break;

            case 'presupuesto_asignado':
                if (value) {
                    const numero = parseFloat(value);
                    if (isNaN(numero)) {
                        error = 'Debe ser un número válido';
                    } else if (numero < 0) {
                        error = 'El presupuesto no puede ser negativo';
                    } else if (numero > 9999999999.99) {
                        error = 'El presupuesto es demasiado alto';
                    }
                }
                break;

            case 'responsable_nombre':
                if (value) {
                    if (value.length < 3) {
                        error = 'El nombre debe tener al menos 3 caracteres';
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                        error = 'El nombre solo puede contener LETRAS y espacios (sin números)';
                    }
                }
                break;

            case 'observaciones':
                if (value && value.length > 1000) {
                    error = 'Las observaciones no pueden exceder 1000 caracteres';
                }
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let finalValue = value;
        
        // ✅ BLOQUEAR números en campos de solo letras
        if (name === 'nombre_proyecto' || name === 'responsable_nombre') {
            // Solo permite letras, espacios y acentos
            finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        }
        
        // Convertir código a mayúsculas
        if (name === 'codigo_proyecto') {
            finalValue = value.toUpperCase();
        }
        
        setFormData({
            ...formData,
            [name]: finalValue
        });

        // Validar INMEDIATAMENTE
        const error = validateField(name, finalValue);
        console.log(`🔍 Validando ${name}:`, finalValue, '→ Error:', error || 'ninguno');
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // Si cambia fecha_inicio, revalidar fecha_fin
        if (name === 'fecha_inicio' && formData.fecha_fin) {
            const errorFechaFin = validateField('fecha_fin', formData.fecha_fin);
            setErrors(prev => ({
                ...prev,
                fecha_fin: errorFechaFin
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validar campos obligatorios
        const codigoError = validateField('codigo_proyecto', formData.codigo_proyecto);
        if (codigoError) newErrors.codigo_proyecto = codigoError;

        const nombreError = validateField('nombre_proyecto', formData.nombre_proyecto);
        if (nombreError) newErrors.nombre_proyecto = nombreError;

        // Validar campos opcionales si tienen valor
        if (formData.descripcion) {
            const descError = validateField('descripcion', formData.descripcion);
            if (descError) newErrors.descripcion = descError;
        }

        if (formData.fecha_inicio) {
            const fechaInicioError = validateField('fecha_inicio', formData.fecha_inicio);
            if (fechaInicioError) newErrors.fecha_inicio = fechaInicioError;
        }

        if (formData.fecha_fin) {
            const fechaFinError = validateField('fecha_fin', formData.fecha_fin);
            if (fechaFinError) newErrors.fecha_fin = fechaFinError;
        }

        if (formData.presupuesto_asignado) {
            const presError = validateField('presupuesto_asignado', formData.presupuesto_asignado);
            if (presError) newErrors.presupuesto_asignado = presError;
        }

        if (formData.responsable_nombre) {
            const respError = validateField('responsable_nombre', formData.responsable_nombre);
            if (respError) newErrors.responsable_nombre = respError;
        }

        if (formData.observaciones) {
            const obsError = validateField('observaciones', formData.observaciones);
            if (obsError) newErrors.observaciones = obsError;
        }

        console.log('🔍 Errores encontrados:', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('🔍 Iniciando validación del formulario...');
        console.log('📋 Datos actuales:', formData);
        
        if (!validateForm()) {
            console.log('❌ Errores de validación encontrados:', errors);
            alert('⚠️ Por favor, corrige los errores en el formulario');
            return;
        }
        
        console.log('✅ Formulario válido, preparando datos para enviar...');
        
        const dataToSend = {
            codigo_proyecto: formData.codigo_proyecto.trim(),
            nombre_proyecto: formData.nombre_proyecto.trim(),
            descripcion: formData.descripcion.trim(),
            estado: formData.estado,
            fecha_inicio: formData.fecha_inicio || null,
            fecha_fin: formData.fecha_fin || null,
            presupuesto_asignado: formData.presupuesto_asignado ? parseFloat(formData.presupuesto_asignado) : null,
            responsable_nombre: formData.responsable_nombre.trim(),
            observaciones: formData.observaciones.trim()
        };
        
        console.log('📤 Datos finales a enviar:', dataToSend);
        onSubmit(dataToSend);
    };

    // Calcular duración del proyecto
    const calcularDuracion = () => {
        if (formData.fecha_inicio && formData.fecha_fin) {
            const inicio = new Date(formData.fecha_inicio);
            const fin = new Date(formData.fecha_fin);
            const diffTime = Math.abs(fin - inicio);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const meses = Math.floor(diffDays / 30);
            const dias = diffDays % 30;
            return `${meses} meses y ${dias} días`;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                <div className="sticky top-0 flex items-center justify-between p-5 text-white bg-purple-600 rounded-t-xl">
                    <h2 className="text-xl font-bold">
                        {proyecto ? '✏️ Editar Proyecto' : '➕ Nuevo Proyecto'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 transition-colors rounded-lg hover:bg-white/20"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Información Básica */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <span className="text-xl">📋</span>
                            Información Básica
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Código del Proyecto <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="codigo_proyecto"
                                    required
                                    value={formData.codigo_proyecto}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border-2 ${
                                        errors.codigo_proyecto ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm uppercase`}
                                    placeholder="PROY-001"
                                    maxLength="20"
                                />
                                {errors.codigo_proyecto ? (
                                    <p className="mt-1 text-xs text-red-400 font-semibold">❌ {errors.codigo_proyecto}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-slate-400">
                                        Ej: PROY-001, SIS-2024, APP-WEB
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Estado <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                >
                                    <option value="A">✅ Activo</option>
                                    <option value="I">❌ Inactivo</option>
                                    <option value="C">🔒 Cerrado</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Nombre del Proyecto <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre_proyecto"
                                    required
                                    value={formData.nombre_proyecto}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border-2 ${
                                        errors.nombre_proyecto ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm`}
                                    placeholder="Sistema de Gestión Académica"
                                    maxLength="150"
                                />
                                {errors.nombre_proyecto && (
                                    <p className="mt-1 text-xs text-red-400 font-semibold">❌ {errors.nombre_proyecto}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    rows="3"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.descripcion ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none`}
                                    placeholder="Describe el proyecto..."
                                    maxLength="1000"
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs ${formData.descripcion.length > 1000 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {formData.descripcion.length}/1000 caracteres
                                    </p>
                                </div>
                                {errors.descripcion && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.descripcion}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fechas y Presupuesto */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <span className="text-xl">💰</span>
                            Fechas y Presupuesto
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Fecha de Inicio
                                </label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.fecha_inicio ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm`}
                                />
                                {errors.fecha_inicio && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.fecha_inicio}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Fecha de Fin
                                </label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.fecha_fin ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm`}
                                />
                                {errors.fecha_fin && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.fecha_fin}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Presupuesto (S/)
                                </label>
                                <input
                                    type="number"
                                    name="presupuesto_asignado"
                                    step="0.01"
                                    min="0"
                                    value={formData.presupuesto_asignado}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.presupuesto_asignado ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm`}
                                    placeholder="0.00"
                                />
                                {errors.presupuesto_asignado && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.presupuesto_asignado}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Mostrar duración calculada */}
                        {calcularDuracion() && !errors.fecha_inicio && !errors.fecha_fin && (
                            <div className="p-3 mt-4 border rounded-lg bg-purple-900/20 border-purple-500">
                                <p className="text-sm text-purple-300">
                                    ⏱️ Duración estimada: <span className="font-semibold">{calcularDuracion()}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Responsable y Observaciones */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <span className="text-xl">👤</span>
                            Responsable y Observaciones
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Responsable del Proyecto
                                </label>
                                <input
                                    type="text"
                                    name="responsable_nombre"
                                    value={formData.responsable_nombre}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border-2 ${
                                        errors.responsable_nombre ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm`}
                                    placeholder="Nombre del responsable"
                                />
                                {errors.responsable_nombre && (
                                    <p className="mt-1 text-xs text-red-400 font-semibold">❌ {errors.responsable_nombre}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Observaciones
                                </label>
                                <textarea
                                    name="observaciones"
                                    rows="3"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.observaciones ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none`}
                                    placeholder="Observaciones adicionales..."
                                    maxLength="1000"
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs ${formData.observaciones.length > 1000 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {formData.observaciones.length}/1000 caracteres
                                    </p>
                                </div>
                                {errors.observaciones && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.observaciones}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resumen de validación */}
                    {Object.keys(errors).filter(key => errors[key] && errors[key].trim()).length > 0 && (
                        <div className="p-4 border rounded-lg bg-red-900/20 border-red-500">
                            <p className="mb-2 text-sm font-medium text-red-400">
                                ⚠️ Hay {Object.keys(errors).filter(key => errors[key] && errors[key].trim()).length} error(es) en el formulario:
                            </p>
                            <ul className="space-y-1 text-xs text-red-300">
                                {Object.entries(errors)
                                    .filter(([_, error]) => error && error.trim())
                                    .map(([field, error]) => {
                                        const fieldNames = {
                                            'codigo_proyecto': 'Código del Proyecto',
                                            'nombre_proyecto': 'Nombre del Proyecto',
                                            'descripcion': 'Descripción',
                                            'fecha_inicio': 'Fecha de Inicio',
                                            'fecha_fin': 'Fecha de Fin',
                                            'presupuesto_asignado': 'Presupuesto',
                                            'responsable_nombre': 'Responsable',
                                            'observaciones': 'Observaciones'
                                        };
                                        return (
                                            <li key={field} className="flex items-start gap-2">
                                                <span className="text-red-400">•</span>
                                                <span><strong>{fieldNames[field] || field}:</strong> {error}</span>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '⏳ Guardando...' : proyecto ? '✅ Actualizar' : '✅ Crear Proyecto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProyectoForm;