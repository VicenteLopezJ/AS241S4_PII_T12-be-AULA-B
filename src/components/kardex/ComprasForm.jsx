import React, { useState, useEffect } from "react";
import "../../styles/kardex/compras/ComprasForm.css";

export default function ComprasForm({ onClose, onSave, initialData, readOnly = false, proveedores = [] }) {
  const [form, setForm] = useState({
    idPurchase: null,
    idSupplier: "",
    supplierName: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    total: "",
    status: "A",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("📋 Proveedores disponibles en formulario:", proveedores);
    
    if (initialData) {
      setForm({
        idPurchase: initialData.idPurchase || initialData.id || null,
        idSupplier: initialData.idSupplier || "",
        supplierName: initialData.supplierName || "",
        purchaseDate: initialData.purchaseDate 
          ? initialData.purchaseDate.split('T')[0] 
          : new Date().toISOString().split('T')[0],
        total: initialData.total || "",
        status: initialData.status || "A"
      });
    }
  }, [initialData, proveedores]);

  const validate = () => {
    const newErrors = {};

    if (!form.idSupplier || form.idSupplier.toString().trim() === "") {
      newErrors.idSupplier = "Debe seleccionar un proveedor.";
    }

    if (!form.purchaseDate) {
      newErrors.purchaseDate = "La fecha de compra es obligatoria.";
    } else {
      const selectedDate = new Date(form.purchaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.purchaseDate = "La fecha no puede ser futura.";
      }
    }

    if (!form.total || form.total.toString().trim() === "") {
      newErrors.total = "El total es obligatorio.";
    } else {
      const totalNum = parseFloat(form.total);
      if (isNaN(totalNum)) {
        newErrors.total = "El total debe ser un número válido.";
      } else if (totalNum <= 0) {
        newErrors.total = "El total debe ser mayor a 0.";
      } else if (totalNum > 99999999.99) {
        newErrors.total = "El total no puede exceder los 99,999,999.99";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Buscar el proveedor seleccionado
    const selectedSupplier = proveedores.find(p => {
      const posiblesIds = [
        p.id, 
        p.idSupplier, 
        p.idProveedor,
        p.id_supplier
      ].filter(id => id != null);
      
      return posiblesIds.some(id => id.toString() === form.idSupplier.toString());
    });
    
    console.log("✅ Proveedor seleccionado:", selectedSupplier);
    
    const dataToSave = {
      ...form,
      supplierName: selectedSupplier 
        ? (selectedSupplier.nombre || selectedSupplier.razonSocial || selectedSupplier.name || "Sin nombre")
        : form.supplierName || "Proveedor no disponible",
      total: parseFloat(form.total) || 0
    };
    
    console.log("📤 Datos a guardar:", dataToSave);
    onSave(dataToSave);
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    console.log("🆔 Proveedor seleccionado ID:", supplierId);
    
    // Buscar el proveedor en la lista
    const selectedSupplier = proveedores.find(p => {
      // Probar diferentes campos de ID
      const posiblesIds = [
        p.id,
        p.idProveedor,
        p.idSupplier,
        p.id_supplier
      ].filter(id => id != null);
      
      return posiblesIds.some(id => id.toString() === supplierId.toString());
    });
    
    console.log("✅ Proveedor encontrado:", selectedSupplier);
    
    setForm(prev => ({ 
      ...prev, 
      idSupplier: supplierId,
      supplierName: selectedSupplier 
        ? (selectedSupplier.nombre || selectedSupplier.razonSocial || selectedSupplier.name || "Sin nombre")
        : ""
    }));
    
    if (errors.idSupplier) {
      setErrors(prev => ({ ...prev, idSupplier: undefined }));
    }
  };

  // Filtrar proveedores activos
  const proveedoresActivos = proveedores.filter(p => {
    const estado = p.estado || p.status;
    return estado === 'A' || estado === 'Activo' || estado === 'active' || estado === true;
  });

  console.log("🔍 Proveedores activos:", proveedoresActivos.length);

  return (
    <div className="inv-modal-overlay">
      <div className="inv-modal">
        <button className="inv-close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>{readOnly ? "Ver Compra" : form.idPurchase ? "Editar Compra" : "Nueva Compra"}</h2>
        
        {/* Info de proveedores disponible */}
        {!readOnly && proveedoresActivos.length === 0 && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            borderRadius: '5px',
            padding: '10px',
            marginBottom: '15px',
            color: '#fbbf24',
            fontSize: '14px'
          }}>
            ⚠️ No hay proveedores activos disponibles. Crea proveedores primero.
          </div>
        )}

        <form className="inv-form" onSubmit={handleSubmit} noValidate>
          {/* PROVEEDOR */}
          <div className="form-group">
            <label>Proveedor *</label>
            <select
              value={form.idSupplier}
              onChange={handleSupplierChange}
              disabled={readOnly || proveedoresActivos.length === 0}
              className={errors.idSupplier ? "input-error" : ""}
            >
              <option value="">
                {proveedoresActivos.length === 0 
                  ? "No hay proveedores activos" 
                  : "Seleccionar proveedor"}
              </option>
              
              {proveedoresActivos.map(proveedor => {
                // Obtener ID del proveedor
                const proveedorId = proveedor.idProveedor || proveedor.idSupplier || proveedor.id || proveedor.id_supplier;
                
                // Obtener nombre del proveedor
                const proveedorNombre = proveedor.nombre || proveedor.razonSocial || proveedor.name || "Sin nombre";
                
                // Obtener RUC o identificador
                const proveedorRUC = proveedor.ruc || "Sin RUC";
                
                // Obtener información adicional
                const telefono = proveedor.telefono ? ` - ${proveedor.telefono}` : "";
                
                return (
                  <option key={proveedorId} value={proveedorId}>
                    {proveedorNombre} ({proveedorRUC}){telefono}
                  </option>
                );
              })}
            </select>
            
            {errors.idSupplier && (
              <small className="error">{errors.idSupplier}</small>
            )}
            
            {!readOnly && proveedoresActivos.length > 0 && (
              <small style={{ color: '#94a3b8', marginTop: '5px', display: 'block' }}>
                {proveedoresActivos.length} proveedor(es) disponible(s)
              </small>
            )}
          </div>

          {/* FECHA DE COMPRA */}
          <div className="form-group">
            <label>Fecha de Compra *</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={handleChange("purchaseDate")}
              disabled={readOnly}
              className={errors.purchaseDate ? "input-error" : ""}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.purchaseDate && (
              <small className="error">{errors.purchaseDate}</small>
            )}
          </div>

          {/* TOTAL */}
          <div className="form-group">
            <label>Total (S/) *</label>
            <input
              type="number"
              value={form.total}
              onChange={handleChange("total")}
              disabled={readOnly}
              className={errors.total ? "input-error" : ""}
              placeholder="0.00"
              min="0.01"
              max="99999999.99"
              step="0.01"
            />
            {errors.total && (
              <small className="error">{errors.total}</small>
            )}
          </div>

          {/* ESTADO */}
          <div className="form-group">
            <label>Estado</label>
            <select 
              value={form.status} 
              onChange={handleChange("status")} 
              disabled={readOnly}
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>

          {!readOnly && (
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={proveedoresActivos.length === 0}
              >
                {form.idPurchase ? "Guardar Cambios" : "Registrar Compra"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}