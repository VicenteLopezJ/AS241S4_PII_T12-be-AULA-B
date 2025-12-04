import React, { useState, useEffect } from "react";
import "../../styles/kardex/inventario/InventarioForm.css";
import { medicamentoService } from "../../services/kardex/medicamentoService";

export default function InventarioForm({ onClose, onSave, initialData, readOnly = false }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    idInventory: null,
    idMedication: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    status: "A",
    updateDate: "",
  });

  // Cargar medicamentos
  useEffect(() => {
    const loadMedicamentos = async () => {
      try {
        const data = await medicamentoService.getAll();
        setMedicamentos(data || []);
      } catch (error) {
        console.error("Error cargando medicamentos", error);
      }
    };
    loadMedicamentos();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      setForm({
        idInventory: initialData.idInventory ?? null,
        idMedication: initialData.idMedication ?? "",
        currentStock: initialData.currentStock ?? "",
        minStock: initialData.minStock ?? "",
        maxStock: initialData.maxStock ?? "",
        status: initialData.status ?? "A",
        updateDate: initialData.updateDate ?? "",
      });
    } else {
      setForm({
        idInventory: null,
        idMedication: "",
        currentStock: "",
        minStock: "",
        maxStock: "",
        status: "A",
        updateDate: "",
      });
    }
  }, [initialData]);

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
  };

  // Validaciones
  const validate = () => {
    const newErrors = {};

    if (!form.idMedication) newErrors.idMedication = "Debe seleccionar un medicamento";
    if (form.currentStock === "" || form.currentStock < 0) newErrors.currentStock = "Stock actual inválido";
    if (form.minStock === "" || form.minStock < 0) newErrors.minStock = "Stock mínimo inválido";
    if (form.maxStock === "" || form.maxStock < 0) newErrors.maxStock = "Stock máximo inválido";
    if (Number(form.minStock) > Number(form.maxStock)) newErrors.maxStock = "Stock máximo debe ser mayor al mínimo";
    if (Number(form.currentStock) < Number(form.minStock) || Number(form.currentStock) > Number(form.maxStock))
      newErrors.currentStock = "Stock actual debe estar entre mínimo y máximo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...form,
      updateDate: new Date().toISOString().split("T")[0]
    });
  };

  return (
    <div className="inv-modal-overlay">
      <div className="inv-modal">
        <button className="inv-close-btn" onClick={onClose}>✖</button>

        <h2>{readOnly ? "Ver inventario" : form.idInventory ? "Editar inventario" : "Agregar inventario"}</h2>

        <form className="inv-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Medicamento</label>
            <select
              value={form.idMedication}
              onChange={handleChange("idMedication")}
              disabled={readOnly}
            >
              <option value="">Seleccione medicamento</option>
              {medicamentos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.presentacion})
                </option>
              ))}
            </select>
            {errors.idMedication && <small className="error">{errors.idMedication}</small>}
          </div>

          <div className="form-group">
            <label>Stock actual</label>
            <input
              type="number"
              value={form.currentStock}
              onChange={handleChange("currentStock")}
              disabled={readOnly}
            />
            {errors.currentStock && <small className="error">{errors.currentStock}</small>}
          </div>

          <div className="form-group">
            <label>Stock mínimo</label>
            <input
              type="number"
              value={form.minStock}
              onChange={handleChange("minStock")}
              disabled={readOnly}
            />
            {errors.minStock && <small className="error">{errors.minStock}</small>}
          </div>

          <div className="form-group">
            <label>Stock máximo</label>
            <input
              type="number"
              value={form.maxStock}
              onChange={handleChange("maxStock")}
              disabled={readOnly}
            />
            {errors.maxStock && <small className="error">{errors.maxStock}</small>}
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select value={form.status} onChange={handleChange("status")} disabled={readOnly}>
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>

          {!readOnly && (
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
              <button type="submit" className="save-btn">Guardar</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
