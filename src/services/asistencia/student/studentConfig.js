// src/config/studentConfig.js


export const getCurrentStudentId = () => {
  try {

    const userStr = localStorage.getItem('assistanceUser');
    
    if (!userStr) {
      console.warn('⚠️ No se encontró assistanceUser en localStorage');
      return null;
    }

    const user = JSON.parse(userStr);
    const studentId = user?.studentId || user?.userId || null;
    
    console.log('📌 getCurrentStudentId() =>', studentId);
    
    return studentId;
  } catch (error) {
    console.error('❌ Error getting current student ID:', error);
    return null;
  }
};


export const getCurrentTeacherId = () => {
  try {
    const userStr = localStorage.getItem('assistanceUser');
    
    if (!userStr) {
      console.warn('⚠️ No se encontró assistanceUser en localStorage');
      return null;
    }

    const user = JSON.parse(userStr);
    const teacherId = user?.teacherId || user?.userId || null;
    
    console.log('📌 getCurrentTeacherId() =>', teacherId);
    
    return teacherId;
  } catch (error) {
    console.error('❌ Error getting current teacher ID:', error);
    return null;
  }
};


export const getCurrentUser = () => {
  try {
   
    const userStr = localStorage.getItem('assistanceUser');
    
    if (!userStr) {
      console.warn('⚠️ No se encontró assistanceUser en localStorage');
      return null;
    }

    const user = JSON.parse(userStr);
    console.log('📌 getCurrentUser() =>', user);
    
    return user;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};


export const isAuthenticated = () => {
 
  const token = localStorage.getItem('assistanceToken');
  const user = localStorage.getItem('assistanceUser');
  const isAuth = !!(token && user);
  
  console.log('🔍 isAuthenticated() =>', isAuth);
  
  return isAuth;
};


export const getCurrentUserRole = () => {
  try {
    const user = getCurrentUser();
    return user?.role?.toLowerCase() || null;
  } catch (error) {
    console.error('❌ Error getting current user role:', error);
    return null;
  }
};

export const API_CONFIG = {
  BASE_URL: "/api/v1/students",
  get STUDENT_ID() {
    return getCurrentStudentId();
  },
  get TEACHER_ID() {
    return getCurrentTeacherId();
  },
};

export default {
  getCurrentStudentId,
  getCurrentTeacherId,
  getCurrentUser,
  getCurrentUserRole,
  isAuthenticated,
  API_CONFIG,
};