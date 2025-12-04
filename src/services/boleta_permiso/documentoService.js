// src/services/documentoService.js
import API_URL from './config';
import getAuthHeaders from './authHeaders';

export const documentoService = {
  // ==========================================
  // CONSULTAS GENERALES
  // ==========================================

  // Obtener todos los documentos
  getAllDocumentos: async () => {
    try {
      const resp = await fetch(`${API_URL}/documentos/`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener documentos');
      }

      return data.data || [];

    } catch (error) {
      console.error('Error en getAllDocumentos:', error);
      throw error;
    }
  },

  // Obtener documento por ID
  getDocumentoById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/documentos/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener documento');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getDocumentoById:', error);
      throw error;
    }
  },

  // Obtener documentos por boleta
  getDocumentosByBoleta: async (boletaId) => {
    try {
      const response = await fetch(`${API_URL}/documentos/boleta/${boletaId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener documentos de la boleta');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getDocumentosByBoleta:', error);
      throw error;
    }
  },

  // ==========================================
  // SUBIR ARCHIVO
  // ==========================================

  uploadDocumento: async (formData, onProgress) => {
    try {
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        // Progreso de subida
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        });

        // Éxito
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response.message || 'Error al subir documento'));
              }
            } catch (err) {
              console.error('Error al parsear respuesta:', err);
              reject(new Error('Error al procesar la respuesta del servidor'));
            }
          } else {
            // Intentar obtener el mensaje de error del servidor
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              const errorMsg = errorResponse.message || errorResponse.error || `Error ${xhr.status}`;
              console.error('❌ Error del servidor:', errorMsg);
              reject(new Error(errorMsg));
            } catch (err) {
              console.error('❌ Error al parsear respuesta de error:', err);
              reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
            }
          }
        });

        // Error
        xhr.addEventListener('error', () => {
          reject(new Error('Error de red al subir documento'));
        });

        // Configurar y enviar
        xhr.open('POST', `${API_URL}/documentos/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error en uploadDocumento:', error);
      throw error;
    }
  },

  // ==========================================
  // VER Y DESCARGAR ARCHIVOS
  // ==========================================

  // Ver/Visualizar documento (abre en nueva pestaña)
  viewDocumento: (documentoId) => {
    const viewUrl = `${API_URL}/documentos/${documentoId}/view`;
    window.open(viewUrl, '_blank');
  },

  // Descargar documento
  downloadDocumento: async (documentoId, nombreArchivo) => {
    try {
      console.log('📥 Descargando documento:', documentoId, nombreArchivo);
      
      const response = await fetch(`${API_URL}/documentos/${documentoId}/download`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error('Error al descargar el archivo');
      }

      // Obtener el tipo de contenido del header
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      
      // Crear blob del archivo con el tipo correcto
      const blob = await response.blob();
      console.log('📦 Blob creado:', blob.size, 'bytes, tipo:', blob.type);
      
      // Asegurar que el nombre tenga extensión
      let fileName = nombreArchivo;
      if (!fileName.includes('.')) {
        // Si no tiene extensión, intentar obtenerla del content-type
        const extension = contentType?.includes('pdf') ? '.pdf' 
          : contentType?.includes('jpeg') || contentType?.includes('jpg') ? '.jpg'
          : contentType?.includes('png') ? '.png'
          : '';
        fileName = fileName + extension;
      }
      
      console.log('💾 Guardando como:', fileName);
      
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Descarga completada');
    } catch (error) {
      console.error('❌ Error en downloadDocumento:', error);
      throw new Error(error.message || 'Error al descargar el documento');
    }
  },

  // ==========================================
  // CREAR DOCUMENTO (método antiguo - mantener por compatibilidad)
  // ==========================================

  createDocumento: async (documentoData) => {
    try {
      const response = await fetch(`${API_URL}/documentos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentoData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear documento');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en createDocumento:', error);
      throw error;
    }
  },

  // ==========================================
  // GESTIÓN DE ESTADO
  // ==========================================

  // Inactivar documento (eliminación lógica)
  deleteDocumento: async (documentoId) => {
    try {
      const response = await fetch(`${API_URL}/documentos/${documentoId}/delete`, {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al inactivar documento');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en deleteDocumento:', error);
      throw error;
    }
  },

  // Restaurar documento
  restoreDocumento: async (documentoId) => {
    try {
      const response = await fetch(`${API_URL}/documentos/${documentoId}/restore`, {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al restaurar documento');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en restoreDocumento:', error);
      throw error;
    }
  },

  // Eliminar físicamente
  deleteDocumentoPhysical: async (documentoId) => {
    try {
      const response = await fetch(`${API_URL}/documentos/${documentoId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar documento');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en deleteDocumentoPhysical:', error);
      throw error;
    }
  },

  // ==========================================
  // CONSULTAS ESPECIALES
  // ==========================================

  // Obtener estadísticas
  getStatistics: async () => {
    try {
      const resp = await fetch(`${API_URL}/documentos/statistics`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || data.success === false) {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }

      return data.data;
    } catch (error) {
      console.error('Error en getStatistics:', error);
      throw error;
    }
  },

  // Filtrar por tipo
  getDocumentosByTipo: async (tipo) => {
    try {
      const response = await fetch(`${API_URL}/documentos/tipo/${encodeURIComponent(tipo)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al filtrar documentos');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getDocumentosByTipo:', error);
      throw error;
    }
  },

  // Obtener tipos válidos
  getTiposValidos: async () => {
    try {
      const response = await fetch(`${API_URL}/documentos/tipos-validos`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener tipos válidos');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error en getTiposValidos:', error);
      throw error;
    }
  },

  // ==========================================
  // UTILIDADES
  // ==========================================

  // Validar tamaño de archivo
  validateFileSize: (sizeKb) => {
    const MAX_SIZE_KB = 20480; // 20 MB (aumentado para instituto)
    return sizeKb <= MAX_SIZE_KB;
  },

  // Validar extensión
  validateExtension: (extension) => {
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    return validExtensions.includes(extension.toLowerCase());
  },

  // Convertir bytes a KB
  bytesToKb: (bytes) => {
    return (bytes / 1024).toFixed(2);
  },

  // Obtener color del badge según tipo
  getTipoColor: (tipo) => {
    const colores = {
      'Constancia médica': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Certificado': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Receta': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Voucher': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Comprobante': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Foto': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      'Otro': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  },

  // Obtener icono según extensión
  getFileIcon: (extension) => {
    const ext = extension?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📎';
    }
  },

  // Formatear fecha
  formatearFecha: (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Formatear tamaño
  formatearTamanio: (kb) => {
    if (!kb) return '0 KB';
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  },
};