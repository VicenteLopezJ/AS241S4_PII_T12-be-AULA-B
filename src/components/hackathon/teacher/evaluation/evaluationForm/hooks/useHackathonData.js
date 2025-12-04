import { useState, useEffect } from 'react';
import { getUsersByRole } from '../../../../../../services/hackathon/userService'; 
import { getGroups } from '../../../../../../services/hackathon/groupService';

export const useHackathonData = (setFormData) => {
  const [dbGroups, setDbGroups] = useState([]);
  const [dbStudents, setDbStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setFormData(prev => ({ ...prev, isStep2Loading: true }));
      try {
        const [groupsData, studentsData, teachersData] = await Promise.all([
          getGroups(),
          getUsersByRole('estudiante'),
          getUsersByRole('profesor')
        ]);
        
        setDbGroups(Array.isArray(groupsData) ? groupsData : []);
        setDbStudents(Array.isArray(studentsData) ? studentsData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoadingData(false);
        setFormData(prev => ({ ...prev, isStep2Loading: false }));
      }
    };
    fetchData();
  }, [setFormData]);

  return { dbGroups, dbStudents, teachers, isLoadingData };
};