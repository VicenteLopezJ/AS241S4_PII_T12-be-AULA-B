const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { 'Content-Type': 'application/json' };
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
};

export default getAuthHeaders;
