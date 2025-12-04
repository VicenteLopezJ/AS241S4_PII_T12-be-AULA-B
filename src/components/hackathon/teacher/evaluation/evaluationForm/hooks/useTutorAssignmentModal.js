import { useState,useMemo } from 'react';

/**
 * Hook para gestionar la lógica y estados de la Modal de Asignación de Tutores.
 *
 * @param {Array<string>} unassignedEmails - Lista de emails sin tutor asignado (calculada previamente).
 * @param {function} setStudentMappings - Setter del estado principal de mapeos de estudiantes.
 * @param {function} handleCloseModal - Función para cerrar la modal desde el componente padre.
 * @returns {object} Estados y Handlers para el componente principal y la Modal.
 */
export default function useTutorAssignmentModal(unassignedEmails, setStudentMappings) {
    
    const [showTutorModal, setShowTutorModal] = useState(false);
    const [selectedEmailsInModal, setSelectedEmailsInModal] = useState([]); 
    const [selectedTutorInModal, setSelectedTutorInModal] = useState(null); 
    const [studentSearch, setStudentSearch] = useState("");

    const filteredUnassigned = useMemo(() => {
        const searchLower = studentSearch.toLowerCase().trim();
        if (!searchLower) {
            return unassignedEmails;
        }
        return unassignedEmails.filter(email => email.toLowerCase().includes(searchLower));
    }, [unassignedEmails, studentSearch]);

    
    const handleOpenTutorModal = () => {
        
        setSelectedEmailsInModal([]); 
        setSelectedTutorInModal(null);
        setStudentSearch('');
        setShowTutorModal(true);
    };

    
    const handleToggleEmailSelection = (email) => {
        setSelectedEmailsInModal(prev => {
            if (prev.includes(email)) {
                
                return prev.filter(e => e !== email);
            } else {
                
                return [...prev, email];
            }
        });
    };

    
    const handleAssignTutorBatch = () => {
        if (selectedEmailsInModal.length === 0 || !selectedTutorInModal) {
            return;
        }

        
        const tutorId = selectedTutorInModal;
        const newMappings = selectedEmailsInModal.map(email => ({
            email: email,
            idTeacher: tutorId 
        }));

        
        setStudentMappings(prevMappings => [...prevMappings, ...newMappings]);

        
        setSelectedEmailsInModal([]);
        setSelectedTutorInModal(null);
        setStudentSearch('');

        
        
        
        
        const remainingUnassignedCount = unassignedEmails.length - selectedEmailsInModal.length;
        if (remainingUnassignedCount === 0) {
             
            setShowTutorModal(false);
        }
    };
    
    
    const handleCloseModal = () => {
        setShowTutorModal(false);
    };


    return {
        showTutorModal,
        studentSearch,
        setStudentSearch,
        selectedEmailsInModal,
        setSelectedEmailsInModal,
        selectedTutorInModal,
        setSelectedTutorInModal,
        
        
        handleOpenTutorModal,
        handleCloseModal, 
        handleToggleEmailSelection,
        handleAssignTutorBatch,
        filteredUnassigned,
    };
}