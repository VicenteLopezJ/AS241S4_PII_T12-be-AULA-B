import { useState, useEffect, useMemo } from 'react';

export const COHORT_STATE = {
    IDLE: 'IDLE',
    NEW_COHORT: 'NEW_COHORT',
    MATCH_FULL: 'MATCH_FULL',
    NEEDS_DECISION: 'NEEDS_DECISION',
};

export const useCohortLogic = ({ 
    mode, 
    isLoadingData, 
    targetSemester, 
    validEmails, 
    availableGroups, 
    dbStudents,
    setStudentEmails,
    setStudentMappings,
    setSelectedGroupIds,
    setLockedSemester,
    setExistingEmailErrors
}) => {
    const [comparisonState, setComparisonState] = useState(COHORT_STATE.IDLE);
    const [existingSemesterEmails, setExistingSemesterEmails] = useState([]);

    
    const semesterStudents = useMemo(() => {
        const groupIds = availableGroups.map(g => g.idGroup);
        return dbStudents.filter(s => groupIds.includes(s.idGroup));
    }, [dbStudents, availableGroups]);

    
    useEffect(() => {
        setExistingSemesterEmails(semesterStudents.map(s => s.email.toLowerCase()));
    }, [semesterStudents]);

    
    useEffect(() => {
        if (mode !== "import") {
            setComparisonState(COHORT_STATE.IDLE);
            return;
        }
        if (isLoadingData || !targetSemester || targetSemester === '0') {
            setComparisonState(COHORT_STATE.IDLE);
            return;
        }

        if (validEmails.length === 0) {
            setComparisonState(COHORT_STATE.IDLE);
            if (availableGroups.length > 0) { 
               
            }
            return;
        }

        const incomingSet = new Set(validEmails.map(e => e.toLowerCase()));
        const existingSet = new Set(existingSemesterEmails);
        
        if (existingSemesterEmails.length === 0) {
            setComparisonState(COHORT_STATE.NEW_COHORT);
            return;
        }

        const incomingOnly = validEmails.filter(e => !existingSet.has(e.toLowerCase()));
        const existingOnly = existingSemesterEmails.filter(e => !incomingSet.has(e));

        if (incomingOnly.length === 0 && existingOnly.length === 0) {
            setComparisonState(COHORT_STATE.MATCH_FULL);
            
            const groupIds = availableGroups.map(g => g.idGroup);
            setSelectedGroupIds(groupIds);
            const newMappings = semesterStudents.map(student => ({
                email: student.email,
                idTeacher: student.idTeacher
            }));
            setStudentMappings(newMappings);
            setStudentEmails(semesterStudents.map(s => s.email).join("\n"));
            setExistingEmailErrors([]);
            return;
        }

        setComparisonState(COHORT_STATE.NEEDS_DECISION);
        
        setSelectedGroupIds([]);
        setLockedSemester(null);
        setStudentMappings([]);

    }, [validEmails, existingSemesterEmails, targetSemester, availableGroups, semesterStudents, isLoadingData, mode]);

    return { 
        comparisonState, 
        existingSemesterEmails,
        setComparisonState,
        semesterStudents
    };
};