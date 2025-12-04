// src/components/documentos/DocumentoUploadModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, AlertCircle, FileText, File, Image } from 'lucide-react';
import { documentoService } from '../../services/documentoService';

export const DocumentoUploadModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [tiposValidos, setTiposValidos] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [formData, setFormData] = useState({
    boleta_id: '',
    tipo_documento: ''
  });
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  // Cargar tipos válidos al montar
  useEffect(() => {
    loadTiposValidos();
  }, []);

  // Limpiar preview al desmontar
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const loadTiposValidos = async () => {
    try {
      const data = await documentoService.getTiposValidos();
      setTiposValidos(data);
    } catch (err) {
      console.error('Error al cargar tipos válidos:', err);
    }
  };

  const handleFileSelect = (file) => {
    // Validar tipo de archivo
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError(`Tipo de archivo no válido. Solo se permiten: ${validExtensions.join(', ')}`);
      return;
    }

    // Validar tamaño (20 MB)
    const maxSize = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxSize) {
      setError('El archivo excede el tamaño máximo de 20 MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Crear preview si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.boleta_id || !formData.tipo_documento) {
      setError('Debe completar todos los campos obligatorios');
      return;
    }

    if (!selectedFile) {
      setError('Debe seleccionar un archivo');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Crear FormData para enviar archivo
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('boleta_id', formData.boleta_id);
      uploadData.append('tipo_documento', formData.tipo_documento);

      // Subir archivo
      const result = await documentoService.uploadDocumento(uploadData, (progress) => {
        setUploadProgress(progress);
      });

      console.log('Documento subido:', result);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (!selectedFile) return <File className="w-12 h-12 text-gray-400" />;
    
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension === 'pdf') {
      return <FileText className="w-12 h-12 text-red-400" />;
    }
    if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return <Image className="w-12 h-12 text-blue-400" />;
    }
    return <File className="w-12 h-12 text-gray-400" />;
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-700 p-6 flex justify-between items-start sticky top-0 bg-gray-800 z-10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-400" />
              Subir Documento de Prueba
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Adjunte un documento para respaldar la boleta de permiso
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Alerta Informativa */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-medium">Importante</p>
              <p className="text-sm text-gray-300 mt-1">
                Al subir un documento a una boleta que requiere prueba, el estado cambiará automáticamente 
                a "Pendiente Jefe" para su revisión.
              </p>
            </div>
          </div>

          {/* ID de Boleta */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID de Boleta <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.boleta_id}
              onChange={(e) => setFormData({...formData, boleta_id: e.target.value})}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1"
              disabled={loading}
              required
            />
          </div>

          {/* Tipo de Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Documento <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.tipo_documento}
              onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              <option value="">Seleccione un tipo...</option>
              {tiposValidos?.tipos_documento.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Zona de Drop/Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Archivo <span className="text-red-400">*</span>
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=". ,.jpg,.jpeg,.png"
              className="hidden"
              disabled={loading}
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragging 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-1">
                  Arrastra tu archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-400">
                  PDF, JPG, JPEG o PNG (máx. 20 MB)
                </p>
              </div>
            ) : (
              <div className="border border-gray-600 rounded-lg p-4 bg-gray-700/50">
                <div className="flex items-start gap-4">
                  {/* Preview o Icono */}
                  <div className="flex-shrink-0">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    ) : (
                      getFileIcon()
                    )}
                  </div>

                  {/* Info del archivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                    
                    {/* Barra de progreso */}
                    {loading && uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  {/* Botón eliminar */}
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Formatos permitidos: PDF, JPG, JPEG, PNG • Tamaño máximo: <span className="font-semibold text-yellow-400">20 MB</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Subiendo... {uploadProgress > 0 && `${uploadProgress}%`}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Subir Documento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};