import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";

const ItemActionsMenu = ({
  item,
  onEdit,
  onView,
  onDelete,
  onSendEmail,
  onDownloadPdf,
  onExportExcel,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [shiftLeft, setShiftLeft] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detecta si debe abrir hacia arriba y desplazarse a la izquierda
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const espacioAbajo = window.innerHeight - rect.bottom;
      const espacioDerecha = window.innerWidth - rect.right;

      setOpenUpwards(espacioAbajo < 200);
      setShiftLeft(espacioDerecha < 100);
    }
  }, [isOpen]);

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === "edit") onEdit(item);
    if (action === "view") onView(item.id);
    if (action === "delete") onDelete(item.id);
    if (action === "sendEmail" && onSendEmail) onSendEmail(item.id);
    if (action === "downloadPdf" && onDownloadPdf) onDownloadPdf(item.id);
    if (action === "exportExcel" && onExportExcel) onExportExcel(item.id);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`p-1.5 rounded-full transition-colors ${
          disabled
            ? "text-slate-600"
            : "text-slate-400 hover:text-white hover:bg-slate-700"
        }`}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute w-44 bg-slate-700 rounded-lg shadow-xl border border-slate-600 overflow-hidden z-20
            ${openUpwards ? "bottom-full mb-2" : "mt-2"}
            ${shiftLeft ? "right-0 translate-x-[-40px]" : "right-0"}`}
        >
          <button
            onClick={() => handleAction("view")}
            className="flex items-center w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
          >
            <Eye size={16} className="mr-2 text-sky-400" /> Ver Detalle
          </button>
          <button
            onClick={() => handleAction("edit")}
            className="flex items-center w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
          >
            <Pencil size={16} className="mr-2 text-emerald-400" /> Editar
          </button>


          {item.estado === "P" && (
            <button
              onClick={() => handleAction("sendEmail")}
              className="flex items-center w-full px-3 py-2 text-sm text-indigo-400 hover:bg-slate-600 transition-colors border-t border-slate-600/50"
            >
              <Mail size={16} className="mr-2" /> Enviar correo
            </button>
          )}

          {item.estado === "A" && (
            <>
              <button
                onClick={() => handleAction("downloadPdf")}
                className="flex items-center w-full px-3 py-2 text-sm text-purple-400 hover:bg-slate-600 transition-colors border-t border-slate-600/50"
              >
                <FileDown size={16} className="mr-2" /> Descargar PDF
              </button>
              <button
                onClick={() => handleAction("exportExcel")}
                className="flex items-center w-full px-3 py-2 text-sm text-green-400 hover:bg-slate-600 transition-colors border-t border-slate-600/50"
              >
                <FileSpreadsheet size={16} className="mr-2" /> Exportar Excel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemActionsMenu;