import { useEffect, useState } from "react"
import {Button, Input} from "../../index"

function StudentForm({ isOpen, onClose, onSubmit, student, groups, tutors }) {
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    id_group: null, 
    id_tutor: 0,
  })

  const [errors, setErrors] = useState({
    name: "",
    surname: "",
    email: "",
    id_tutor: "",
  })

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        surname: student.surname || "",
        email: student.email || "",
        id_group: student.idGroup || null, 
        id_tutor: student.idTeacher || 0,
      })
    } else {
      setFormData({
        name: "",
        surname: "",
        email: "",
        id_group: null,
        id_tutor: 0,
      })
    }
    setErrors({ name: "", surname: "", email: "", id_tutor: "" })
  }, [student, isOpen])

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'id_group' || id === 'id_tutor') {
        const numValue = value === "none" || value === "0" ? (id === 'id_group' ? null : 0) : Number.parseInt(value);
        setFormData({ ...formData, [id]: numValue });
    } else {
        setFormData({ ...formData, [id]: value });
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: "", surname: "", email: "", id_tutor: "",
    }

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.surname.trim()) newErrors.surname = "Los apellidos son requeridos"
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }
    if (!formData.id_tutor || formData.id_tutor === 0) newErrors.id_tutor = "Debe seleccionar un tutor"

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const generateRandomPassword = () => {
      const length = 12;
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\:;?><,./-=";
      let password = "";
      for (let i = 0, n = charset.length; i < length; ++i) {
          password += charset.charAt(Math.floor(Math.random() * n));
      }
      return password;
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      let dataToSend = { ...formData };
      
      if (!student) {
          const cleanName = formData.name.toLowerCase().trim().replace(/\s/g, '');
          
          dataToSend.username = cleanName + "VG"; 
          const generatedPassword = generateRandomPassword();
          dataToSend.password = generatedPassword;
          dataToSend.role = "estudiante";
      }

      dataToSend.idGroup = dataToSend.id_group;
      dataToSend.idTeacher = dataToSend.id_tutor;
      delete dataToSend.id_group;
      delete dataToSend.id_tutor;

      if (student) {
        delete dataToSend.username;
        delete dataToSend.password;
        delete dataToSend.role;
      }
      
      onSubmit(dataToSend) 
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
          <h2 className="text-xl font-semibold">{student ? "Editar Estudiante" : "Agregar Nuevo Estudiante"}</h2>
          <p className="text-sm text-gray-400">
            {student
              ? "Modifica los datos del estudiante seleccionado"
              : "Completa el formulario para agregar un nuevo estudiante"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">            
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
              <label htmlFor="id_group" className="text-sm font-medium leading-none text-gray-300">
                Grupo
              </label>
              <select
                id="id_group"
                value={formData.id_group?.toString() || "none"}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white w-full p-2.5 rounded-md focus:border-emerald-500 appearance-none"
              >
                <option value="none">Sin grupo</option>
                {groups && groups.map((group) => (
                  <option key={group.idGroup} value={group.idGroup.toString()}>
                    {group.name}
                    </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="id_tutor" className="text-sm font-medium leading-none text-gray-300">
                Tutor *
              </label>
              <select
                id="id_tutor"
                value={formData.id_tutor.toString()}
                onChange={handleChange}
                className="bg-[#0f1419] border-[#2a3544] text-white w-full p-2.5 rounded-md focus:border-emerald-500 appearance-none"
              >
                <option value="0" disabled>Selecciona un tutor</option>
                {tutors && tutors.map((tutor) => ( 
                  <option key={tutor.idTeacher} value={tutor.idTeacher.toString()}>
                    {tutor.name} {tutor.surname}
                  </option>
                ))}
              </select>
              {errors.id_tutor && <p className="text-xs text-red-400">{errors.id_tutor}</p>}
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
              {student ? "Guardar Cambios" : "Agregar Estudiante"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentForm;