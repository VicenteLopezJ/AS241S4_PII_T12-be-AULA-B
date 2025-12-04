import { useState, useEffect } from 'react';
import { areasService } from '../../../services/seguimientoVacaciones/areasService';

export const useAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areasService.getAll();

      if (!response || !Array.isArray(response)) {
        throw new Error('La respuesta de áreas no es un array válido');
      }

      // Mantener la estructura original y agregar propiedades adicionales para compatibilidad
      const areasFormatted = response.map(area => ({
        ...area, // Mantener todas las propiedades originales
        id: area.area_id, // Para compatibilidad con selects
        value: area.area_name, 
        label: area.area_name, 
      }));

      setAreas(areasFormatted);
      setError(null);
    } catch (err) {
      console.error('Error loading areas:', err);
      setError(err.message);
      setAreas([]); // En caso de error, array vacío
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  // Filtrar solo areas activas para el formulario
  const activeAreas = areas.filter(area => area.status === 'A');

  return {
    areas,
    activeAreas,
    loading,
    error,
    refetch: loadAreas
  };
};