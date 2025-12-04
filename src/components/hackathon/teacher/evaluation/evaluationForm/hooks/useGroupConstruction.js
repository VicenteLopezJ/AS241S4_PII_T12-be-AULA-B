import { useMemo } from 'react';

/**
 * Hook para construir la lista final de grupos (cohortes) a crear/modificar.
 * Combina la capacidad calculada con los grupos preexistentes seleccionados.
 *
 * @param {number} minGroups - El número mínimo de grupos necesarios basado en la capacidad.
 * @param {number} effectiveCapacity - La capacidad máxima efectiva por grupo.
 * @param {Array<number>} selectedGroupIds - IDs de los grupos existentes seleccionados.
 * @param {Array<Object>} dbGroups - Lista completa de grupos de la base de datos.
 * @param {Array<Object>} dbStudents - Lista completa de estudiantes de la base de datos (para calcular la inscripción actual).
 * @returns {Array<Object>} Lista de objetos de grupo listos para el registro/envío.
 */
export default function useGroupConstruction(
    minGroups, 
    effectiveCapacity, 
    selectedGroupIds, 
    dbGroups, 
    dbStudents
) {
    const groups = useMemo(() => {
        
        if (selectedGroupIds.length > 0) {
            
            
            const selectedGroupsObj = dbGroups
                .filter(g => selectedGroupIds.includes(g.idGroup))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            
            return Array.from({ length: minGroups }).map((_, i) => {
                const existingGroup = selectedGroupsObj[i]; 
                
                let currentEnrollment = 0;
                if (existingGroup) {
                    
                    currentEnrollment = dbStudents.filter(s => s.idGroup === existingGroup.idGroup).length;
                }

                
                const thisGroupCapacity = existingGroup 
                    ? (existingGroup.maxStudents || existingGroup.max_students) 
                    : effectiveCapacity;

                return {
                    existingGroupId: existingGroup ? existingGroup.idGroup : null,
                    groupName: existingGroup ? existingGroup.name : `Sección ${String.fromCharCode(65 + i)}`,
                    maxStudents: thisGroupCapacity,
                    minRequired: existingGroup ? currentEnrollment : 1, 
                    caseDescription: existingGroup ? (existingGroup.caseDescription || "") : "",
                    sessionDate: existingGroup ? (existingGroup.sessionDate || "") : "",
                    startTime: existingGroup ? (existingGroup.startTime || "") : "",
                    endTime: existingGroup ? (existingGroup.endTime || "") : ""
                };
            });
        }

        
        return Array.from({ length: minGroups }).map((_, i) => ({
            existingGroupId: null, 
            groupName: `Sección ${String.fromCharCode(65 + i)}`, 
            maxStudents: effectiveCapacity,
            minRequired: 1, 
            caseDescription: "",
            sessionDate: "",
            startTime: "",
            endTime: ""
        }));
        
    }, [minGroups, effectiveCapacity, selectedGroupIds, dbGroups, dbStudents]); 

    return groups;
}