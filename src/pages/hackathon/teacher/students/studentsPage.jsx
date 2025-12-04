import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import {
  createUserWithRole,
  updateUserWithRole,
  deleteUser,
  restoreUser,
  getUsersByRole,
} from "../../../../services/hackathon/userService"; 

import { getGroups as getGroupsAPI } from "../../../../services/hackathon/groupService";

import { StudentList, StudentForm, Sidebar, Input, Button } from "../../../../components/hackathon/index";


export default function StudentsPage() {
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [groups, setGroups] = useState([]); 
  
  const [tutors, setTutors] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const [studentsData, groupsData, tutorsData] = await Promise.all([
            getUsersByRole("estudiante"),
            getGroupsAPI(),
            getUsersByRole("profesor"),
        ]);

        setGroups(groupsData);
        setTutors(tutorsData);

        const studentsWithDetails = studentsData.map(student => {
            const group = groupsData.find(g => g.idGroup === student.idGroup);
            const groupName = group ? group.name : 'N/A';
            const tutor = tutorsData.find(t => t.idTeacher === student.idTeacher);
            const tutorName = tutor ? `${tutor.name} ${tutor.surname}` : 'N/A';

            return {
                ...student,
                groupName,
                tutorName,
            };
        });
    
        setStudents(studentsWithDetails);

    } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        setError("No se pudieron cargar todos los datos (Estudiantes, Grupos o Profesores).");
    } finally {
        setLoading(false);
    }
  }, []); 


  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);


  const handleAddStudent = async (studentData) => {
    try {
      const newUser = await createUserWithRole("estudiante", studentData);
      await fetchStudents(); 
      
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error al agregar estudiante:", err.response?.data || err);
      alert("Error al crear estudiante: " + (err.response?.data?.message || err.message || "Desconocido"));
    }
  };

  const handleEditStudent = async (studentData) => {
    if (editingStudent) {
      const userId = editingStudent.idStudent; 
      const userRole = "estudiante"; 

      try {
        const updatedUser = await updateUserWithRole(userId, userRole, studentData); 
        await fetchStudents(); 
        setEditingStudent(null);
        setIsFormOpen(false);
      } catch (err) {
        console.error("Error al editar estudiante:", err.response?.data || err);
        alert("Error al editar estudiante: " + (err.response?.data?.message || err.message || "Desconocido"));
      }
    }
  };

  const handleDeleteStudent = async (userId) => {
    try {
      await deleteUser(userId);
      setStudents(students.map((s) => (s.idUser === userId ? { ...s, status: 0 } : s)));

      alert("Estudiante desactivado con éxito.");
    } catch (err) {
      console.error("Error al desactivar estudiante:", err.response?.data || err);
      alert("Error al desactivar estudiante.");
    }
  };

  const handleRestoreStudent = async (userId) => {
    try {
      await restoreUser(userId); 
      setStudents(students.map((s) => (s.idUser === userId ? { ...s, status: 1 } : s)));
      
      alert("Estudiante activado con éxito.");
    } catch (err) {
      console.error("Error al restaurar estudiante:", err.response?.data || err);
      alert("Error al restaurar estudiante.");
    }
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );


  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#232C3A] text-white"> 
        <Sidebar />

        <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)] flex items-center justify-center">
          <p className="text-xl">Cargando estudiantes...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#232C3A] flex justify-center items-center">
        <p className="text-red-500 text-xl">{error}</p>
        <button onClick={fetchStudents} className="ml-4 p-2 bg-blue-500 text-white rounded">
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
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Estudiantes</h1>
          <p className="text-gray-400">Administra los estudiantes del sistema académico</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar estudiantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a2332] border-[#2a3544] text-white placeholder:text-gray-500"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Estudiante
          </Button>
        </div>

        <StudentList
          students={filteredStudents}
          groups={groups}
          tutors={tutors}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteStudent}
          onRestore={handleRestoreStudent}
        />
      </main>

      <StudentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
        student={editingStudent}
        groups={groups}
        tutors={tutors}
      />
    </div>
  );
}