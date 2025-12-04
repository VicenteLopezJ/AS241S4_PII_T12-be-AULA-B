import React, { useState, useEffect } from "react";
import { userService } from "../../asistencia/admin/AsistentAdmin/userService";

const UserForm = ({ user, onClose, onUserSaved }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "student",
        status: "active",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || "",
                password: "",
                role: user.role || "student",
                status: user.status || "active",
            });
        } else {
            setFormData({
                email: "",
                password: "",
                role: "student",
                status: "active",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (user) {
                // 🔹 EDITAR USUARIO (sí puede enviar role/status)
                const dataToSend = {
                    email: formData.email,
                    role: formData.role,
                    status: formData.status,
                    ...(formData.password ? { password: formData.password } : {}),
                };

                await userService.updateUser(user.userId, dataToSend);
            } else {
                // 🔹 CREAR USUARIO (solo envía los campos válidos)
                const dataToSend = {
                    email: formData.email,
                    role: formData.role,
                    password: formData.password, // requerido por backend
                };

                await userService.createUser(dataToSend);
            }

            onUserSaved();
            onClose();
        } catch (error) {
            console.error("Error al guardar usuario:", error);
            alert(error?.detail || error?.message || "Error desconocido al guardar el usuario");
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {user ? "Editar Usuario" : "Crear Usuario"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full mt-1 p-2 border rounded-md"
                        />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!user}
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rol
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-md appearance-none"
                        >
                            <option value="student">Estudiante</option>
                            <option value="teacher">Docente</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Estado
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-md appearance-none"
                        >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                            <option value="suspended">Suspendido</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
