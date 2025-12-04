import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import {
    createUserWithRole,
    updateUserWithRole,
    deleteUser,
    restoreUser,
    getUsersByRole,
} from "../../../../services/hackathon/userService"; 

import { Sidebar, Input, Button } from "../../../../components/hackathon/index";
import TeacherList from "../../../../components/hackathon/teacher/teachers/TeacherList";
import TeacherForm from "../../../../components/hackathon/teacher/teachers/TeacherForm";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    
    const TEACHER_ROLE = "profesor"; 

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            
            const teachersData = await getUsersByRole(TEACHER_ROLE); 
            setTeachers(teachersData);
        } catch (err) {
            console.error("Error al cargar profesores:", err);
            setError("No se pudieron cargar los datos de los profesores.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    

    const handleAddTeacher = async (teacherData) => {
        try {
            
            await createUserWithRole(TEACHER_ROLE, teacherData);
            await fetchTeachers(); 
            setIsFormOpen(false);
            alert("Profesor agregado con éxito.");
        } catch (err) {
            console.error("Error al agregar profesor:", err.response?.data || err);
            alert("Error al crear profesor: " + (err.response?.data?.message || err.message || "Desconocido"));
        }
    };

    const handleEditTeacher = async (teacherData) => {
        if (editingTeacher) {
            
            const userId = editingTeacher.idTeacher; 
            const userRole = TEACHER_ROLE;

            try {
                await updateUserWithRole(userId, userRole, teacherData); 
                await fetchTeachers(); 
                setEditingTeacher(null);
                setIsFormOpen(false);
            } catch (err) {
                console.error("Error al editar profesor:", err.response?.data || err);
                alert("Error al editar profesor: " + (err.response?.data?.message || err.message || "Desconocido"));
            }
        }
    };

    const handleDeleteTeacher = async (userId) => {
        try {
            await deleteUser(userId);
            
            setTeachers(teachers.map((t) => (t.idUser === userId ? { ...t, status: 0 } : t)));
            alert("Profesor desactivado con éxito.");
        } catch (err) {
            console.error("Error al desactivar profesor:", err.response?.data || err);
            alert("Error al desactivar profesor.");
        }
    };

    const handleRestoreTeacher = async (userId) => {
        try {
            await restoreUser(userId); 
            setTeachers(teachers.map((t) => (t.idUser === userId ? { ...t, status: 1 } : t)));
            alert("Profesor activado con éxito.");
        } catch (err) {
            console.error("Error al restaurar profesor:", err.response?.data || err);
            alert("Error al restaurar profesor.");
        }
    };

    const handleOpenEdit = (teacher) => {
        setEditingTeacher(teacher);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTeacher(null);
    };

    
    const filteredTeachers = teachers.filter(
        (teacher) =>
            teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#232C3A] text-white"> 
                <Sidebar />
                <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)] flex items-center justify-center">
                    <p className="text-xl">Cargando profesores...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#232C3A] flex justify-center items-center">
                <p className="text-red-500 text-xl">{error}</p>
                <button onClick={fetchTeachers} className="ml-4 p-2 bg-blue-500 text-white rounded">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#232C3A]">
            <Sidebar />

            <main className="ml-65 w-[calc(100vw-17rem)] p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Gestión de Profesores</h1>
                    <p className="text-gray-400">Administra los profesores del sistema académico</p>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Buscar profesores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#1a2332] border-[#2a3544] text-white placeholder:text-gray-500"
                        />
                    </div>
                    <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Profesor
                    </Button>
                </div>

                <TeacherList
                    teachers={filteredTeachers}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteTeacher}
                    onRestore={handleRestoreTeacher}
                />
            </main>

            <TeacherForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={editingTeacher ? handleEditTeacher : handleAddTeacher}
                teacher={editingTeacher}
            />
        </div>
    );
}