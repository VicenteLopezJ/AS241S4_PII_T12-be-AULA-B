import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { getUsersByRole } from "../../../../services/hackathon/userService";
import {
    createGroup,
    updateGroup,
    deleteGroup,
    createGroupWithStudents, 
    updateGroupWithStudents,
    restoreGroup,
    getGroups,
} from "../../../../services/hackathon/groupService"; 

import { GroupList, GroupForm, Sidebar, Input, Button } from "../../../../components/hackathon/index"; 

export default function GroupsPage() {
    const [groups, setGroups] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null); 
    const [searchTerm, setSearchTerm] = useState("");
    const [teachers, setTeachers] = useState([]);
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const groupsData = await getGroups(); 
            setGroups(groupsData);
        } catch (err) {
            console.error("Error al cargar grupos:", err);
            setError(err.message || "No se pudieron cargar los datos de los grupos."); 
        } finally {
            setLoading(false);
        }
    }, []); 

    const fetchTeachers = useCallback(async () => {
        try {
            
            
            const teachersData = await getUsersByRole('profesor'); 
            setTeachers(teachersData);
        } catch (err) {
            console.error("Error al cargar profesores:", err);
            
        }
    }, []);

    useEffect(() => {
        fetchGroups();
        fetchTeachers(); 
    }, [fetchGroups, fetchTeachers]);

    const handleAddGroup = async (dataToSend) => {
        try {
            
            await createGroupWithStudents(dataToSend); 
            await fetchGroups(); 
            
            setIsFormOpen(false);
        } catch (err) {
            console.error("Error al agregar grupo:", err);
            alert("Error al crear grupo: " + err.message);
        }
    };

    const handleEditGroup = async (dataToSend) => {
        if (editingGroup) {
            const groupId = editingGroup.idGroup; 

            try {
                
                await updateGroupWithStudents(groupId, dataToSend); 
                await fetchGroups(); 
            
                setEditingGroup(null);
                setIsFormOpen(false);
            } catch (err) {
                console.error("Error al editar grupo:", err);
                alert("Error al editar grupo: " + err.message);
            }
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            await deleteGroup(groupId); 
            
            setGroups(groups.map((g) => (g.idGroup === groupId ? { ...g, status: 0 } : g)));

            alert("Grupo desactivado con éxito.");
            setEditingGroup(null);
            setIsFormOpen(false);

        } catch (err) {
            console.error("Error al desactivar grupo:", err);
            alert("Error al desactivar grupo: " + err.message);
        }
    };

    const handleRestoreGroup = async (groupId) => {
        try {
            await restoreGroup(groupId); 
            setGroups(groups.map((g) => (g.idGroup === groupId ? { ...g, status: 1 } : g)));

            alert("Grupo activado con éxito.");
            setEditingGroup(null);
            setIsFormOpen(false);
        } catch (err) {
            console.error("Error al restaurar grupo:", err);
            alert("Error al restaurar grupo: " + err.message);
        }
    };

    const handleOpenEdit = (group) => {
        setEditingGroup(group);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingGroup(null);
    };

    const filteredGroups = groups.filter(
        (group) =>
            group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.semester?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (loading) {
    return (
    
      <div className="flex min-h-screen bg-[#232C3A] text-white"> 
        <Sidebar />
        <main className="flex-grow p-8 ml-65 w-[calc(100vw-17rem)] flex items-center justify-center">
          <p className="text-xl">Cargando Grupos...</p>
        </main>
      </div>
    );
  }

    if (error) {
        return (
            <div className="min-h-screen bg-[#232C3A] flex flex-col justify-center items-center">
                <p className="text-red-500 text-xl mb-4">ERROR: {error}</p>
                <button onClick={fetchGroups} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
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
                    <h1 className="text-3xl font-bold text-white mb-2">Gestión de Grupos</h1>
                    <p className="text-gray-400">Administra los grupos académicos del sistema</p>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Buscar por nombre o semestre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#1a2332] border-[#2a3544] text-white placeholder:text-gray-500"
                        />
                    </div>
                    <Button 
                        onClick={() => setIsFormOpen(true)} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Grupo
                    </Button>
                </div>

                <GroupList
                    groups={filteredGroups}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteGroup}
                    onRestore={handleRestoreGroup}
                />
            </main>

            <GroupForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={editingGroup ? handleEditGroup : handleAddGroup}
                group={editingGroup} 
                teachers={teachers}
                groups={groups}
            />
        </div>
    );
}