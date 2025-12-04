import { useEffect, useState } from "react"
import { Button, Input } from "../../index" 

function TeacherForm({ isOpen, onClose, onSubmit, teacher }) {
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    is_tutor: "S",
  })

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
  })

  useEffect(() => {
    if (teacher) {
      setFormData({
        
        
        username: teacher.username || "", 
        password: "", 
        name: teacher.name || "",
        surname: teacher.surname || "",
        email: teacher.email || "",
        is_tutor: teacher.isTutor || "S",
      })
    } else {
      setFormData({
        username: "",
        password: "",
        name: "",
        surname: "",
        email: "",
        is_tutor: "S",
      })
    }
    setErrors({ username: "", password: "", name: "", surname: "", email: "" })
  }, [teacher, isOpen])

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  }

  const validateForm = () => {
        const newErrors = {
            username: "", password: "", name: "", surname: "", email: "",
        }

        
        const usernameValue = formData.username.trim();
        if (!usernameValue) {
            newErrors.username = "El usuario es requerido";
        } else if (usernameValue.length < 6) {
            newErrors.username = "El usuario debe tener al menos 6 caracteres";
        }

        
        const passwordValue = formData.password;
        const isCreating = !teacher;
        
        if (isCreating && !passwordValue) {
            newErrors.password = "La contraseña es requerida";
        } else if (passwordValue) { 
            if (passwordValue.length < 6) {
                newErrors.password = "La contraseña debe tener al menos 6 caracteres";
            } else {
                
                const lettersCount = (passwordValue.match(/[a-zA-Z]/g) || []).length;
                const numbersCount = (passwordValue.match(/[0-9]/g) || []).length;
                if (lettersCount < 3 || numbersCount < 3) {
                    newErrors.password = "Debe contener mín. 3 letras y 3 números.";
                }
            }
        }

        
        const nameValue = formData.name.trim();
        if (!nameValue) {
            newErrors.name = "El nombre es requerido";
        } else if (nameValue.length < 3 || !/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(nameValue)) {
            newErrors.name = "El nombre debe tener al menos 3 letras y solo contener letras.";
        }

        
        const surnameValue = formData.surname.trim();
        const onlyLettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
        if (!surnameValue) {
            newErrors.surname = "Los apellidos son requeridos";
        } else if (surnameValue.length < 3) {
            newErrors.surname = "Los apellidos deben tener al menos 3 caracteres.";
        } else if (!surnameValue.includes(" ")) {
            newErrors.surname = "Debe ingresar al menos dos apellidos (separados por espacio).";
        } else if (!onlyLettersRegex.test(surnameValue)) {
            newErrors.surname = "Solo se permiten letras y espacios, no números ni símbolos.";
        }

        
        const emailValue = formData.email.trim();
        if (!emailValue) {
            newErrors.email = "El email es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            newErrors.email = "El email no es válido";
        }

        setErrors(newErrors)
        return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e) => { 
        e.preventDefault()
        if (validateForm()) {
            let dataToSend = { ...formData };
            
            if (teacher && !dataToSend.password) {
                delete dataToSend.password;
            }
            try {
                await onSubmit(dataToSend);
            } catch (apiError) {
                const errorMessage = apiError.response?.data?.message || apiError.message;
                
                if (errorMessage && errorMessage.includes("Username ya existe")) {
                    setErrors(prev => ({ ...prev, username: "Este nombre de usuario ya está registrado." }));
                } else if (errorMessage && errorMessage.includes("Email ya existe")) {
                     setErrors(prev => ({ ...prev, email: "Este email ya está registrado." }));
                }
                console.error("Error al enviar formulario:", apiError);
            }
        }
    }

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose} 
    >
      <div 
        className="bg-[#1a2332] border-[#2a3544] text-white rounded-lg shadow-2xl w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-col space-y-2 p-6 border-b border-[#2a3544]">
          <h2 className="text-xl font-semibold">{teacher ? "Editar Profesor" : "Agregar Nuevo Profesor"}</h2>
          <p className="text-sm text-gray-400">
            {teacher
              ? "Modifica los datos del profesor seleccionado"
              : "Completa el formulario para agregar un nuevo profesor"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">            
            
            {/* --- Nuevo Campo: Username --- */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium leading-none text-gray-300">
                Usuario *
              </label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white placeholder:text-gray-500"
                placeholder="Ej: jesusTE"
                
                
              />
              {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
            </div>

             {/* --- Nuevo Campo: Password --- */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none text-gray-300">
                Contraseña {teacher ? "(Opcional)" : "*"}
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white placeholder:text-gray-500"
                placeholder={teacher ? "Dejar vacía para mantener la actual" : "Ingresa una contraseña segura"}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none text-gray-300">
                Nombre *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white placeholder:text-gray-500"
                placeholder="Ingresa el nombre"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="surname" className="text-sm font-medium leading-none text-gray-300">
                Apellidos *
              </label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white placeholder:text-gray-500"
                placeholder="Ingresa los apellidos"
              />
              {errors.surname && <p className="text-xs text-red-400">{errors.surname}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none text-gray-300">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white placeholder:text-gray-500"
                placeholder="ejemplo@correo.com"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="is_tutor" className="text-sm font-medium leading-none text-gray-300">
                ¿Es Tutor?
              </label>
              <select
                id="is_tutor"
                value={formData.is_tutor}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white w-full p-2.5 rounded-md focus:border-emerald-500 appearance-none"
              >
                <option value="S">Sí</option>
                <option value="N">No</option>
              </select>
            </div>
            
          </div>
        
          <div className="flex justify-end space-x-2 pt-6 border-t border-[#2a3544] mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-[#2a3544] text-gray-300 hover:bg-[#2a3544]"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {teacher ? "Guardar Cambios" : "Agregar Profesor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherForm;