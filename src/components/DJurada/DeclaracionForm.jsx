import React, { useState, useEffect } from 'react';
import { centrosCostosAPI, proyectosAPI } from "../../services/declaracionJurada/declaracionJurada.js";

const DeclaracionForm = ({ onSubmit, loading, onCancel }) => {
    const [centrosCostos, setCentrosCostos] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nombre_trabajador: '',
        dni_trabajador: '',
        domicilio_trabajador: '',
        email_trabajador: '',
        telefono_trabajador: '',
        cargo_trabajador: '',
        centro_costos_id: '',
        proyecto_id: '',
        importe_total: '',
        tipo_operacion: 'G',
        moneda: 'PEN',
        concepto_gasto: '',
        justificacion: '',
        razon_sin_comprobante: '',
        fecha_gasto: '',
        lugar_gasto: '',
        beneficiario: ''
    });

    useEffect(() => {
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        try {
            const [centrosRes, proyectosRes] = await Promise.all([
                centrosCostosAPI.getAll(),
                proyectosAPI.getAll()
            ]);

            if (centrosRes.success) setCentrosCostos(centrosRes.data);
            if (proyectosRes.success) setProyectos(proyectosRes.data);
        } catch (error) {
            console.error('Error al cargar catálogos:', error);
        }
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'nombre_trabajador':
                if (!value.trim()) {
                    error = 'El nombre es obligatorio';
                } else if (value.length < 3) {
                    error = 'El nombre debe tener al menos 3 caracteres';
                } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
                    error = 'El nombre solo puede contener letras';
                }
                break;

            case 'dni_trabajador':
                if (!value.trim()) {
                    error = 'El DNI es obligatorio';
                } else if (!/^\d{8}$/.test(value)) {
                    error = 'El DNI debe tener exactamente 8 dígitos';
                }
                break;

            case 'domicilio_trabajador':
                if (!value.trim()) {
                    error = 'El domicilio es obligatorio';
                } else if (value.length < 10) {
                    error = 'El domicilio debe tener al menos 10 caracteres';
                }
                break;

            case 'email_trabajador':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Email inválido';
                }
                break;

            case 'telefono_trabajador':
                if (value && !/^\d{9}$/.test(value)) {
                    error = 'El teléfono debe tener 9 dígitos';
                }
                break;

            case 'centro_costos_id':
                if (!value) {
                    error = 'Debes seleccionar un centro de costos';
                }
                break;

            case 'importe_total':
                if (!value) {
                    error = 'El importe es obligatorio';
                } else if (parseFloat(value) <= 0) {
                    error = 'El importe debe ser mayor a 0';
                } else if (parseFloat(value) > 1000000) {
                    error = 'El importe parece demasiado alto';
                }
                break;

            case 'concepto_gasto':
                if (!value.trim()) {
                    error = 'El concepto del gasto es obligatorio';
                } else if (value.length < 10) {
                    error = 'El concepto debe tener al menos 10 caracteres';
                } else if (value.length > 500) {
                    error = 'El concepto no puede exceder 500 caracteres';
                }
                break;

            case 'justificacion':
                if (!value.trim()) {
                    error = 'La justificación es obligatoria';
                } else if (value.length < 20) {
                    error = 'La justificación debe tener al menos 20 caracteres';
                } else if (value.length > 1000) {
                    error = 'La justificación no puede exceder 1000 caracteres';
                }
                break;

            case 'razon_sin_comprobante':
                if (!value.trim()) {
                    error = 'La razón sin comprobante es obligatoria';
                } else if (value.length < 15) {
                    error = 'La razón debe tener al menos 15 caracteres';
                } else if (value.length > 500) {
                    error = 'La razón no puede exceder 500 caracteres';
                }
                break;

            case 'fecha_gasto':
                if (value) {
                    const fechaGasto = new Date(value);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
                    const hace6Meses = new Date();
                    hace6Meses.setMonth(hace6Meses.getMonth() - 6);
                    hace6Meses.setHours(0, 0, 0, 0);

                    if (fechaGasto > hoy) {
                        error = 'La fecha no puede ser futura (posterior a hoy)';
                    } else if (fechaGasto < hace6Meses) {
                        error = 'La fecha no puede ser mayor a 6 meses atrás';
                    }
                }
                break;

            case 'lugar_gasto':
                if (value && value.length > 200) {
                    error = 'El lugar no puede exceder 200 caracteres';
                }
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData({
            ...formData,
            [name]: value
        });

        // Validar el campo mientras el usuario escribe
        const error = validateField(name, value);
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
        
        // Validar todos los campos obligatorios
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('⚠️ Por favor, corrige los errores en el formulario');
            return;
        }
        
        // 🔍 DEBUG: Ver qué datos se están enviando
        console.log('📤 Datos del formulario antes de enviar:', formData);
        
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Datos del Trabajador */}
            <div className="p-5 border rounded-lg bg-slate-800 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <span className="text-xl">👤</span>
                    Datos del Trabajador
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Nombre Completo <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre_trabajador"
                            required
                            value={formData.nombre_trabajador}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.nombre_trabajador ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                            placeholder="Juan Pérez García"
                        />
                        {errors.nombre_trabajador && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.nombre_trabajador}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            DNI <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="dni_trabajador"
                            required
                            maxLength="8"
                            value={formData.dni_trabajador}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.dni_trabajador ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                            placeholder="12345678"
                        />
                        {errors.dni_trabajador && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.dni_trabajador}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Domicilio <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="domicilio_trabajador"
                            required
                            value={formData.domicilio_trabajador}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.domicilio_trabajador ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                            placeholder="Av. Principal 123, Lima"
                        />
                        {errors.domicilio_trabajador && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.domicilio_trabajador}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">Email</label>
                        <input
                            type="email"
                            name="email_trabajador"
                            value={formData.email_trabajador}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.email_trabajador ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                            placeholder="correo@ejemplo.com"
                        />
                        {errors.email_trabajador && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.email_trabajador}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">Teléfono</label>
                        <input
                            type="tel"
                            name="telefono_trabajador"
                            maxLength="9"
                            value={formData.telefono_trabajador}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.telefono_trabajador ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                            placeholder="987654321"
                        />
                        {errors.telefono_trabajador && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.telefono_trabajador}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-slate-300">Cargo</label>
                        <input
                            type="text"
                            name="cargo_trabajador"
                            value={formData.cargo_trabajador}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            placeholder="Coordinador de Área"
                        />
                    </div>
                </div>
            </div>

            {/* Asignación */}
            <div className="p-5 border rounded-lg bg-slate-800 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <span className="text-xl">🏢</span>
                    Asignación
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Centro de Costos <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="centro_costos_id"
                            required
                            value={formData.centro_costos_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.centro_costos_id ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                        >
                            <option value="">Seleccionar...</option>
                            {centrosCostos.map((cc) => (
                                <option key={cc.id_centro_costos} value={cc.id_centro_costos}>
                                    {cc.codigo_centro} - {cc.nombre_centro}
                                </option>
                            ))}
                        </select>
                        {errors.centro_costos_id && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.centro_costos_id}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Proyecto (Opcional)
                        </label>
                        <select
                            name="proyecto_id"
                            value={formData.proyecto_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                            <option value="">Sin proyecto</option>
                            {proyectos.map((p) => (
                                <option key={p.id_proyecto} value={p.id_proyecto}>
                                    {p.codigo_proyecto} - {p.nombre_proyecto}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Datos Financieros */}
            <div className="p-5 border rounded-lg bg-slate-800 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <span className="text-xl">💰</span>
                    Datos Financieros
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Importe Total <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            name="importe_total"
                            required
                            step="0.01"
                            min="0"
                            value={formData.importe_total}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.importe_total ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                            placeholder="500.00"
                        />
                        {errors.importe_total && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.importe_total}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Moneda <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                            <option value="PEN">Soles (PEN)</option>
                            <option value="USD">Dólares (USD)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Detalles del Gasto */}
            <div className="p-5 border rounded-lg bg-slate-800 border-slate-600">
                <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-white">
                    <span className="text-xl">📝</span>
                    Detalles del Gasto
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Concepto del Gasto <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="concepto_gasto"
                            required
                            rows="3"
                            value={formData.concepto_gasto}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.concepto_gasto ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none`}
                            placeholder="Describe detalladamente el concepto del gasto..."
                        />
                        <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${formData.concepto_gasto.length > 500 ? 'text-red-400' : 'text-slate-400'}`}>
                                {formData.concepto_gasto.length}/500 caracteres
                            </p>
                        </div>
                        {errors.concepto_gasto && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.concepto_gasto}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Justificación <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="justificacion"
                            required
                            rows="3"
                            value={formData.justificacion}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.justificacion ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none`}
                            placeholder="Justifica la necesidad del gasto..."
                        />
                        <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${formData.justificacion.length > 1000 ? 'text-red-400' : 'text-slate-400'}`}>
                                {formData.justificacion.length}/1000 caracteres
                            </p>
                        </div>
                        {errors.justificacion && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.justificacion}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">
                            Razón Sin Comprobante <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="razon_sin_comprobante"
                            required
                            rows="2"
                            value={formData.razon_sin_comprobante}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                errors.razon_sin_comprobante ? 'border-red-500' : 'border-slate-600'
                            } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none`}
                            placeholder="Explica por qué no se cuenta con comprobante..."
                        />
                        <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${formData.razon_sin_comprobante.length > 500 ? 'text-red-400' : 'text-slate-400'}`}>
                                {formData.razon_sin_comprobante.length}/500 caracteres
                            </p>
                        </div>
                        {errors.razon_sin_comprobante && (
                            <p className="mt-1 text-xs text-red-400">❌ {errors.razon_sin_comprobante}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-300">
                                Fecha del Gasto
                            </label>
                            <input
                                type="date"
                                name="fecha_gasto"
                                value={formData.fecha_gasto}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                max={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                    errors.fecha_gasto ? 'border-red-500' : 'border-slate-600'
                                } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                            />
                            {errors.fecha_gasto && (
                                <p className="mt-1 text-xs text-red-400">❌ {errors.fecha_gasto}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-400">
                                ⚠️ No puede ser posterior al día de hoy
                            </p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-300">
                                Lugar del Gasto
                            </label>
                            <input
                                type="text"
                                name="lugar_gasto"
                                value={formData.lugar_gasto}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-2.5 bg-slate-900 border ${
                                    errors.lugar_gasto ? 'border-red-500' : 'border-slate-600'
                                } text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm`}
                                placeholder="Lima, Perú"
                            />
                            {errors.lugar_gasto && (
                                <p className="mt-1 text-xs text-red-400">❌ {errors.lugar_gasto}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                    className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '⏳ Guardando...' : '✅ Crear Declaración'}
                </button>
            </div>
        </form>
    );
};

export default DeclaracionForm;