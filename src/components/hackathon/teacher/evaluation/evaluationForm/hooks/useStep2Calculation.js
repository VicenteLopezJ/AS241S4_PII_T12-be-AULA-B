import { useMemo } from 'react';

/**
 * Hook para consolidar todas las variables calculadas (useMemo) necesarias para Step 2.
 */
export default function useStep2Calculations({
    studentEmails,
    dbStudents,
    selectedGroupIds,
    dbGroups,
    manualMaxCapacity,
    studentMappings,
    targetSemester,
}) {

    const activeGroups = useMemo(() => {
        
        const filteredGroups = dbGroups.filter(group => group.status === 1);
        return filteredGroups; 
    }, [dbGroups]);
    
    const existingEmailsSet = useMemo(() => new Set(dbStudents.map(s => s.email.toLowerCase())), [dbStudents]);

    
    const validEmails = useMemo(() => {
        if (!studentEmails) return [];
        
        return studentEmails.split(/[,\n\s]+/)
                            .map(e => e.trim())
                            .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }, [studentEmails]);

    
    const effectiveCapacity = useMemo(() => {
        if (selectedGroupIds.length > 0) {
            const selectedGroupsObj = dbGroups.filter(g => selectedGroupIds.includes(g.idGroup));
            
            const maxFromGroups = Math.max(...selectedGroupsObj.map(g => g.maxStudents || g.max_students || 25));
            return maxFromGroups > 0 ? maxFromGroups : 25;
        }
        
        return parseInt(manualMaxCapacity, 10) || 1;
    }, [selectedGroupIds, dbGroups, manualMaxCapacity]);
    
    
    const totalStudentsToList = validEmails.length; 
    const minGroups = Math.max(1, Math.ceil(totalStudentsToList / effectiveCapacity));

    
    const duplicatedEmails = useMemo(() => {
        
        if (selectedGroupIds.length > 0) return []; 
        return validEmails.filter(email => existingEmailsSet.has(email.toLowerCase()));
    }, [validEmails, existingEmailsSet, selectedGroupIds]);

    const hasDuplicateEmails = duplicatedEmails.length > 0;

    
    const availableGroups = useMemo(() => {
        if (!targetSemester) return [];
        return activeGroups.filter(group => String(group.semester) === targetSemester);
    }, [dbGroups, targetSemester]);

    
    const unassignedEmails = useMemo(() => {
        const assignedEmails = new Set(studentMappings.map(mapping => mapping.email));
        return validEmails.filter(email => !assignedEmails.has(email));
    }, [validEmails, studentMappings]);

    

    
    const totalEmails = validEmails.length;
    const totalAssigned = studentMappings.length;
    const isAssignmentComplete = totalEmails > 0 && totalEmails === totalAssigned;


    return {
        
        validEmails,
        effectiveCapacity,
        minGroups,
        totalStudentsToList,
        duplicatedEmails,
        hasDuplicateEmails,
        availableGroups,
        
        
        unassignedEmails,
        totalEmails,
        totalAssigned,
        isAssignmentComplete,
    };
}