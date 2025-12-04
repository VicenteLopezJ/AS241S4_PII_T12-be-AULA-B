import React, { useState, useEffect } from 'react';
import { listDriveDocuments } from '../../../../../services/hackathon/googleDocumentService';
import { FileText, Folder, Check, Loader2, X, AlertTriangle } from 'lucide-react';

/**
 * Modal para listar documentos de Google Drive y seleccionar uno para importar.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Si la modal está abierta.
 * @param {function} props.onClose - Función para cerrar la modal.
 * @param {function} props.onFileSelected - Función llamada al seleccionar un archivo (devuelve fileId al componente padre).
 */
const ImportDriveModal = ({ isOpen, onClose, onFileSelected }) => {
    if (!isOpen) return null;

    const [folderId, setFolderId] = useState('');
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFileId, setSelectedFileId] = useState(null);

    const defaultFolderId = '180BiJimHoqioBnUiuYmYZsi1pahYWuvF'; 

    useEffect(() => {
        
        if (isOpen && !folderId) {
            setFolderId(defaultFolderId);
        }
    }, [isOpen]);


    
    const handleListDocuments = async () => {
        if (!folderId.trim()) {
            setError("Por favor, introduce un ID de carpeta válido.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setDocuments([]);
        setSelectedFileId(null);

        try {
            
            const result = await listDriveDocuments(folderId.trim());
            
            setDocuments(result.documents || []);

            if (!result.documents || result.documents.length === 0) {
                setError("No se encontraron documentos de Google Docs en esta carpeta. Verifica el ID.");
            }

        } catch (err) {
            console.error("Error listing documents:", err);
            setError(err.message || "Error desconocido al intentar listar documentos.");
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleImport = () => {
        if (selectedFileId) {
            
            onFileSelected(selectedFileId);
        }
    };
    
    const formatModifiedDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }


    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="bg-[#1e293b] flex flex-col rounded-xl border border-[#334155] w-full max-w-4xl h-[80vh] shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]">
                    <div>
                        <h3 className="text-white font-bold text-xl flex items-center gap-2">
                            <FileText className="text-[#3b82f6]" size={20} />
                            Importar Configuración desde Google Drive
                        </h3>
                        <p className="text-xs text-gray-400">
                            Selecciona el Google Doc (.docx / .doc) que contiene la plantilla de configuración del reto.
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 rounded-full hover:bg-[#334155] transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex flex-1 overflow-hidden p-4">
                    
                    {/* Panel de Ingreso de Carpeta */}
                    <div className="w-1/3 border-r border-[#334155] pr-4 flex flex-col gap-4">
                        <div className="p-3 bg-[#1a2332] rounded-lg border border-[#334155]">
                            <label htmlFor="folderId" className="text-sm font-medium text-gray-200 block mb-2">
                                ID de la Carpeta de Drive
                            </label>
                            <input
                                id="folderId"
                                type="text"
                                placeholder="Ej: 1A2b3C4d5E6f7G8h9I0jK"
                                value={folderId}
                                onChange={(e) => setFolderId(e.target.value)}
                                className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg p-2 text-sm focus:border-[#3b82f6] outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                El ID se encuentra en la URL de la carpeta: <code>/folders/ID_CARPETA</code>
                            </p>
                        </div>

                        <button
                            onClick={handleListDocuments}
                            disabled={isLoading || !folderId.trim()}
                            className={`w-full py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                                ${isLoading 
                                    ? 'bg-gray-600 text-gray-400 cursor-wait'
                                    : 'bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5'
                                }
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    <Folder size={18} />
                                    Listar Documentos
                                </>
                            )}
                        </button>
                        
                        {/* Indicador de Error */}
                        {error && (
                            <div className="bg-red-800/20 text-red-300 p-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}
                    </div>
                    
                    {/* Panel de Documentos Listados */}
                    <div className="w-2/3 pl-4 flex flex-col">
                        <h4 className="text-lg font-bold text-white mb-3">
                            Documentos de la Carpeta ({documents.length})
                        </h4>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <div
                                        key={doc.fileId}
                                        onClick={() => setSelectedFileId(doc.fileId)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border
                                            ${selectedFileId === doc.fileId
                                                ? 'bg-[#10b981]/10 border-[#10b981] shadow-md'
                                                : 'bg-[#1a2332] border-[#334155] hover:bg-[#2d3748]'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} className={selectedFileId === doc.fileId ? 'text-[#10b981]' : 'text-gray-400'} />
                                            <div>
                                                <p className={`text-sm font-medium ${selectedFileId === doc.fileId ? 'text-white' : 'text-gray-200'}`}>
                                                    {doc.fileName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Última modificación: {formatModifiedDate(doc.modifiedTime)}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedFileId === doc.fileId && <Check className="text-[#10b981]" size={20} />}
                                    </div>
                                ))
                            ) : isLoading ? (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <Loader2 className="animate-spin mr-2" size={24} />
                                    Esperando la lista de Google Drive...
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-70 p-10 bg-[#1a2332] rounded-lg">
                                    <Folder size={40} className="mb-3"/>
                                    <p className="text-center">Ingresa un ID de carpeta válido y haz clic en "Listar Documentos" para ver los archivos disponibles.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Botón de Acción */}
                <div className="p-4 border-t border-[#334155] bg-[#0f172a] flex justify-end">
                    <button
                        onClick={handleImport}
                        disabled={!selectedFileId}
                        className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2
                            ${selectedFileId
                                ? 'bg-[#10b981] text-black hover:bg-[#059669] shadow-lg shadow-green-900/20 transform hover:-translate-y-0.5'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }
                        `}
                    >
                        <Check size={18} />
                        Importar Documento Seleccionado
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default ImportDriveModal;