import React, { useState } from "react";
import "../../../styles/viaticos/App.css";
import { registrarTrabajador, actualizarTrabajador } from "../../../services/viaticos/worker/Worker-services";

export default function WorkerForm({ onClose, onRefresh, initialData }) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      last_name: "",
      dni: "",
      city: "",
      email: "",
      status: "A",
    }
  );

  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let newErrors = { ...errors };

    const nameRegex = /^[A-ZÀ-Ý][a-zà-ÿ]*(?:\s[A-ZÀ-Ý][a-zà-ÿ]*)*$/u;
    const dniRegex = /^\d{8}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org|net)$/;

    if (name === "name") {
      if (!value || !nameRegex.test(value)) {
        newErrors.name = "El nombre debe empezar con mayúscula y permitir solo un espacio entre palabras.";
      } else {
        delete newErrors.name;
      }
    }

    if (name === "last_name") {
      if (!value || !nameRegex.test(value)) {
        newErrors.last_name = "El apellido debe empezar con mayúscula y permitir solo un espacio entre palabras.";
      } else {
        delete newErrors.last_name;
      }
    }

    if (name === "dni") {
      if (!dniRegex.test(value)) {
        newErrors.dni = "El DNI debe tener 8 dígitos.";
      } else {
        delete newErrors.dni;
      }
    }

    if (name === "email") {
      if (!value || !emailRegex.test(value)) {
        newErrors.email = "El correo no es válido (ejemplo: johndoe@dominio.com)";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "city") {
      if (!value) {
        newErrors.city = "La ciudad es obligatoria.";
      } else {
        delete newErrors.city;
      }
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.last_name &&
      formData.dni &&
      formData.city &&
      formData.email &&
      Object.keys(errors).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      if (isEdit) {
        await actualizarTrabajador(initialData.id_worker, formData);
      } else {
        await registrarTrabajador(formData);
      }
      setShowConfirmation(true);
    } catch (err) {
      console.error("❌ Error al enviar:", err);
    }
  };

  return (
    <div className="w-full p-1">
      <div className="bg-gray-800 p-10 rounded-xl shadow-xl border border-gray-700 text-white">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Datos del trabajador
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
          {/* Nombre */}
          <div className="flex flex-col items-start">
            <label className="text-sm text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Juan"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Apellido */}
          <div className="flex flex-col items-start">
            <label className="text-sm text-gray-300 mb-2">Apellido</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Ej. Pérez"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
          </div>

          {/* DNI */}
          <div className="flex flex-col items-start">
            <label className="text-sm text-gray-300 mb-2">DNI</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ej. 12345678"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
          </div>

          {/* Ciudad */}
          <div className="flex flex-col items-start">
            <label className="text-sm text-gray-300 mb-2">Ciudad</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ej. Lima"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col items-start md:col-span-2">
            <label className="text-sm text-gray-300 mb-4">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej. johndoe@dominio.com"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Botones */}
          <div className="col-span-2 flex flex-col items-center gap-4 mt-6">
  <button
    type="submit"
    disabled={!isFormValid()}
    className={`w-full text-lg px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 ${
      isFormValid()
        ? "bg-green-500 hover:bg-emerald-400 text-white cursor-pointer"
        : "bg-gray-600 text-gray-300 cursor-not-allowed"
    }`}
  >
    {isFormValid() ? (
      <>
        Puedes {isEdit ? "editar al trabajador" : "crear al trabajador"}
      </>
    ) : (
      <>
        No puedes {isEdit ? "editar al trabajador" : "crear al trabajador"}
      </>
    )}
  </button>

  <button
    type="button"
    onClick={onClose}
    className="w-full bg-gray-500 text-white text-lg px-6 py-3 rounded-xl hover:bg-gray-600 transition"
  >
    Descartar
  </button>
</div>
        </form>
      </div>

      {/* Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl text-center max-w-md w-full border border-gray-600">
            <img
              src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
              alt="Confirmación"
              className="w-20 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              {isEdit ? "¡Trabajador actualizado!" : "¡Trabajador creado!"}
            </h3>
            <p className="text-gray-300 mb-6">
              {isEdit
                ? "Los cambios se han guardado correctamente."
                : "El registro se ha completado correctamente."}
            </p>
            <button
              onClick={() => {
                setShowConfirmation(false);
                onRefresh();
                onClose();
              }}
              className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}