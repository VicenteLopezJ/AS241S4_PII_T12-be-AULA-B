import React, { useState, useEffect } from "react";
import { registrarCentroDeCosto, actualizarCentroDeCosto } from "../../../services/viaticos/cost/Cost-services";
import { listarJefesArea } from "../../../services/viaticos/manager/Manager-service";


const colorInputBg = "bg-[#333d54]"; // Fondo de los inputs

const CostForm = ({ onClose, onRefresh, initialData }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    id_manager: "",
  });
  const [errors, setErrors] = useState({});

  const [managers, setManagers] = useState([]);
useEffect(() => {
  const fetchManagers = async () => {
    const data = await listarJefesArea();
    setManagers(data);
  };
  fetchManagers();
}, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        name: initialData.name || "",
        responsible: initialData.id_manager || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
  let newErrors = {};

  Object.keys(validations).forEach((field) => {
    const { regex, message } = validations[field];
    const value = formData[field]?.trim() || "";

    if (!regex.test(value)) {
      newErrors[field] = message;
    }
  });

  setErrors(newErrors);
}, [formData]); // 👈 se dispara cada vez que cambia formData

 const validations = {
  code: {
    regex: /^\d{6}$/, // exactamente 6 dígitos
    message: "El código debe tener exactamente 6 dígitos numéricos."
  },
  name: {
    regex: /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]+$/,
    message: "El nombre solo puede contener letras y números (sin símbolos)."
  }
};

const validate = () => {
  let newErrors = {};

  Object.keys(validations).forEach((field) => {
    const { regex, message } = validations[field];
    const value = formData[field]?.trim() || "";

    if (!regex.test(value)) {
      newErrors[field] = message;
    }
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (initialData) {
        await actualizarCentroDeCosto(initialData.id_center, formData);
      } else {
        await registrarCentroDeCosto(formData);
      }

      onRefresh();
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar centro de costos:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-8 text-white bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700"
      noValidate
    >
      <h2 className="col-span-2 text-3xl font-bold text-center mb-4">
        {initialData ? "Editar centro de costos" : "Nuevo centro de costos"}
      </h2>

      {/* Código */}
      <div className="flex flex-col items-start">
        <label className="text-sm text-gray-300 mb-2">Código</label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          maxLength={6}
          className={`${colorInputBg} border border-gray-600 rounded-lg px-4 py-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-400`}
          placeholder="Ej: 123456"
        />
        {errors.code && (
          <p className="text-red-500 text-xs mt-1">{errors.code}</p>
        )}
      </div>

      {/* Nombre */}
      <div className="flex flex-col items-start">
        <label className="text-sm text-gray-300 mb-2">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${colorInputBg} border border-gray-600 rounded-lg px-4 py-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-400`}
          placeholder="Ej: Transporte Lima"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Responsable */}
      <div className="flex flex-col items-start col-span-2">
  <label className="text-sm text-gray-300 mb-2">Responsable</label>
  <select
    name="id_manager"
    value={formData.id_manager}
    onChange={handleChange}
    className={`${colorInputBg} border border-gray-600 rounded-lg px-4 py-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-400`}
  >
    <option  value="" disabled>Selecciona un responsable</option>
    {managers.map((m) => (
      <option key={m.id_manager} value={m.id_manager}>
        {m.name} {m.last_name}
      </option>
    ))}
  </select>
  {errors.id_manager && (
    <p className="text-red-500 text-xs mt-1">{errors.id_manager}</p>
  )}
</div>

      {/* Botones */}
      <div className="col-span-2 flex flex-col items-center gap-4 mt-6">
        <button
          type="submit"
          className="w-full bg-green-500 text-white text-lg px-6 py-3 rounded-xl hover:bg-green-400 transition"
        >
          Guardar centro de costos
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-600 text-white text-lg px-6 py-3 rounded-xl hover:bg-gray-700 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CostForm;
