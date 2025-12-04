import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

const CentroCostosForm = ({ centro, onSubmit, onCancel, loading }) => {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        codigo_centro: '',
        nombre_centro: '',
        descripcion: '',
        tipo_institucion: 'PROSIP',
        responsable_nombre: '',
        presupuesto_anual: '',
        estado: 'A'
    });

    useEffect(() => {
        if (centro) {
            console.log('📝 Cargando centro para editar:', centro);
            setFormData({
                codigo_centro: centro.codigo_centro || '',
                nombre_centro: centro.nombre_centro || '',
                descripcion: centro.descripcion || '',
                tipo_institucion: centro.tipo_institucion || 'PROSIP',
                responsable_nombre: centro.responsable_nombre || '',
                presupuesto_anual: centro.presupuesto_anual || '',
                estado: centro.estado || 'A'
            });
        }
    }, [centro]);

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'codigo_centro':
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

            case 'nombre_centro':
                if (!value || !value.trim()) {
                    error = 'El nombre es obligatorio';
                } else if (value.length < 3) {
                    error = 'El nombre debe tener al menos 3 caracteres';
                } else if (value.length > 100) {
                    error = 'El nombre no puede exceder 100 caracteres';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    error = 'El nombre solo puede contener LETRAS y espacios (sin números)';
                }
                break;

            case 'descripcion':
                if (value && value.length > 500) {
                    error = 'La descripción no puede exceder 500 caracteres';
                }
                break;

            case 'tipo_institucion':
                if (!value) {
                    error = 'Debes seleccionar un tipo de institución';
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

            case 'presupuesto_anual':
                if (value) {
                    const numero = parseFloat(value);
                    if (isNaN(numero)) {
                        error = 'Debe ser un número válido';
                    } else if (numero < 0) {
                        error = 'El presupuesto no puede ser negativo';
                    } else if (numero > 999999999.99) {
                        error = 'El presupuesto es demasiado alto';
                    }
                }
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        const finalValue = name === 'codigo_centro' ? value.toUpperCase() : value;
        
        setFormData(prevData => ({
            ...prevData,
            [name]: finalValue
        }));

        // Validar INMEDIATAMENTE
        const error = validateField(name, finalValue);
        console.log(`🔍 Validando ${name}:`, finalValue, '→ Error:', error || 'ninguno');
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
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
        const codigoError = validateField('codigo_centro', formData.codigo_centro);
        if (codigoError) newErrors.codigo_centro = codigoError;

        const nombreError = validateField('nombre_centro', formData.nombre_centro);
        if (nombreError) newErrors.nombre_centro = nombreError;

        const tipoError = validateField('tipo_institucion', formData.tipo_institucion);
        if (tipoError) newErrors.tipo_institucion = tipoError;

        // Validar campos opcionales si tienen valor
        if (formData.descripcion) {
            const descError = validateField('descripcion', formData.descripcion);
            if (descError) newErrors.descripcion = descError;
        }

        if (formData.responsable_nombre) {
            const respError = validateField('responsable_nombre', formData.responsable_nombre);
            if (respError) newErrors.responsable_nombre = respError;
        }

        if (formData.presupuesto_anual) {
            const presError = validateField('presupuesto_anual', formData.presupuesto_anual);
            if (presError) newErrors.presupuesto_anual = presError;
        }

        console.log('🔍 Errores encontrados:', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        console.log('🔍 Iniciando validación del formulario...');
        console.log('📋 Datos actuales:', formData);
        
        if (!validateForm()) {
            console.log('❌ Errores de validación encontrados:', errors);
            alert('⚠️ Por favor, corrige los errores en el formulario antes de continuar');
            return;
        }
        
        console.log('✅ Formulario válido, preparando datos para enviar...');
        
        const dataToSend = {
            codigo_centro: formData.codigo_centro.trim(),
            nombre_centro: formData.nombre_centro.trim(),
            descripcion: formData.descripcion.trim(),
            tipo_institucion: formData.tipo_institucion,
            responsable_nombre: formData.responsable_nombre.trim(),
            presupuesto_anual: formData.presupuesto_anual ? parseFloat(formData.presupuesto_anual) : null,
            estado: formData.estado
        };
        
        console.log('📤 Datos finales a enviar:', dataToSend);
        onSubmit(dataToSend);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                <div className="sticky top-0 flex items-center justify-between p-5 text-white bg-teal-600 rounded-t-xl">
                    <h2 className="text-xl font-bold">
                        {centro ? '✏️ Editar Centro de Costos' : '➕ Nuevo Centro de Costos'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 transition-colors rounded-lg hover:bg-white/20"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Información Básica */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <span className="text-xl">🏢</span>
                            Información Básica
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Código del Centro <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="codigo_centro"
                                    value={formData.codigo_centro}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border-2 ${
                                        errors.codigo_centro ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm uppercase`}
                                    placeholder="CC-001"
                                    maxLength={20}
                                />
                                {errors.codigo_centro ? (
                                    <p className="mt-1 text-xs text-red-400 font-semibold">❌ {errors.codigo_centro}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-slate-400">
                                        Ej: CC-001, ADMIN, SIST-01
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Tipo de Institución <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="tipo_institucion"
                                    value={formData.tipo_institucion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.tipo_institucion ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                                >
                                    <option value="PROSIP">PROSIP</option>
                                    <option value="VALLE_GRANDE">Valle Grande</option>
                                </select>
                                {errors.tipo_institucion && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.tipo_institucion}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Nombre del Centro <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre_centro"
                                    value={formData.nombre_centro}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border-2 ${
                                        errors.nombre_centro ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                                    placeholder="Departamento de Sistemas"
                                    maxLength={100}
                                />
                                {errors.nombre_centro && (
                                    <p className="mt-1 text-xs text-red-400 font-semibold">❌ {errors.nombre_centro}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    rows={3}
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.descripcion ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none`}
                                    placeholder="Describe el centro de costos..."
                                    maxLength={500}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs ${formData.descripcion.length > 500 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {formData.descripcion.length}/500 caracteres
                                    </p>
                                </div>
                                {errors.descripcion && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.descripcion}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Responsable y Estado */}
                    <div className="p-5 border rounded-lg bg-slate-700 border-slate-600">
                        <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                            <span className="text-xl">💰</span>
                            Responsable y Estado
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Responsable
                                </label>
                                <input
                                    type="text"
                                    name="responsable_nombre"
                                    value={formData.responsable_nombre}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border-2 ${
                                        errors.responsable_nombre ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                                    placeholder="Nombre del responsable"
                                />
                                {errors.responsable_nombre && (
                                    <p className="mt-1 text-xs text-red-400 font-semibold">❌ {errors.responsable_nombre}</p>
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
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                >
                                    <option value="A">✅ Activo</option>
                                    <option value="I">❌ Inactivo</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-300">
                                    Presupuesto Anual (S/)
                                </label>
                                <input
                                    type="number"
                                    name="presupuesto_anual"
                                    step="0.01"
                                    min="0"
                                    value={formData.presupuesto_anual}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                        errors.presupuesto_anual ? 'border-red-500' : 'border-slate-600'
                                    } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                                    placeholder="0.00"
                                />
                                {errors.presupuesto_anual && (
                                    <p className="mt-1 text-xs text-red-400">❌ {errors.presupuesto_anual}</p>
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
                                            'codigo_centro': 'Código del Centro',
                                            'nombre_centro': 'Nombre del Centro',
                                            'tipo_institucion': 'Tipo de Institución',
                                            'descripcion': 'Descripción',
                                            'responsable_nombre': 'Responsable',
                                            'presupuesto_anual': 'Presupuesto Anual'
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
                            onClick={onCancel}
                            disabled={loading}
                            className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    {centro ? 'Actualizar' : 'Crear Centro'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CentroCostosForm;