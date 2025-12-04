import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, checkUserProvisioning } from '../../../../services/hackathon/userService'; 

const TeacherAuthGuard = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    
    const getDashboardUserData = () => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                
                if (userData.role === 'Admin global' || userData.role === 'profesor') {
                    return userData;
                }
            } catch (e) {
                console.error("Error al parsear el usuario del Dashboard:", e);
            }
        }
        return null;
    };

    useEffect(() => {
        let isMounted = true; 

        const verifyAccess = async () => {
            if (!isMounted) return; 
            
            
            //console.group("AuthGuard - Verificación de Acceso");
            
            const localStorageData = localStorage.getItem('user');
            //console.log("LocalStorage 'user':", localStorageData ? JSON.parse(localStorageData) : "VACÍO");
            
            const internalUser = getCurrentUser(); 
            console.log("Internal User (getCurrentUser):", internalUser);
            
            
            if (internalUser && internalUser.idUser) {
                if (isMounted) {
                    setIsAuthenticated(true);
                    setLoading(false);
                }
                return;
            }

            const dashboardUser = getDashboardUserData();
            
            if (dashboardUser) {
                try {
                    
                    const data = await checkUserProvisioning({ user_name: dashboardUser.user_name });
                    
                    
                    if (data.is_provisioned && isMounted) {
                        
                        localStorage.setItem("user", JSON.stringify({
                            idUser: data.idUser,
                            username: data.username,
                            role: data.role,
                            status: data.status
                        }));

                        setIsAuthenticated(true); 
                    }

                } catch (error) {
                    
                    const status = error.response?.status; 

                    
                    if ((status === 404 || status === 409) && isMounted) {
                        
                        console.warn(`Redirigiendo a Setup. Status: ${status}`);
                        
                        
                        setTimeout(() => {
                            
                            navigate('/hackathon/teacherSetup', { 
                                state: { 
                                    externalUsername: dashboardUser.user_name, 
                                    externalRole: dashboardUser.role 
                                } 
                            });
                        }, 0);
                        return; 
                    } 
                    
                    
                    console.error("Fallo la verificación de provisionamiento (Error inesperado):", error);
                }
            }

            
            
            if (!isAuthenticated && isMounted) {
                setTimeout(() => {
                    navigate('/hackathon/login'); 
                }, 0); 
            }
            
            if (isMounted) {
                setLoading(false);
            }
        };

        verifyAccess();
        
        return () => {
            isMounted = false;
        };

    }, [navigate]); 

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">Verificando credenciales...</div>
            </div>
        ); 
    }

    return isAuthenticated ? children : null;
};

export default TeacherAuthGuard;