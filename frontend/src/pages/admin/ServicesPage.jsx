import { useState } from "react";
import { servicesMock } from "../../mocks/services.mock";
import { serviceCategoriesMock } from "../../mocks/serviceCategories.mock";

const EMPTY_FORM = { category: "", name: "", price: "", description: "" };

export default function ServicesPage() {
  const [services, setServices] = useState(servicesMock);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});

  const nextId = () =>
    services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;

  const validate = () => {
    const e = {};
    if (!form.category.trim()) e.category = "Seleccione una categoría.";
    if (!form.name.trim()) e.name = "El nombre del servicio es obligatorio.";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Ingrese un precio válido (> 0).";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    const parsed = {
      category: form.category.trim(), name: form.name.trim(),
      price: Number(form.price), description: form.description.trim(),
    };
    if (editingId === null) {
      setServices([...services, { id: nextId(), ...parsed }]);
    } else {
      setServices(services.map((s) => (s.id === editingId ? { id: editingId, ...parsed } : s)));
    }
    handleReset();
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setForm({ category: service.category, name: service.name, price: String(service.price), description: service.description });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setServices(services.filter((s) => s.id !== id));
    if (editingId === id) handleReset();
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Servicios</h2>
        {!showForm && (
          <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>+ Nuevo servicio</button>
        )}
      </div>

      {showForm && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId !== null ? "Editar servicio" : "Nuevo servicio"}</h3>
          <div style={styles.grid}>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Categoría *</label>
              <select style={styles.input} value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
                <option value="">Seleccionar…</option>
                {serviceCategoriesMock.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <span style={styles.fieldError}>{errors.category}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nombre del servicio *</label>
              <input style={styles.input} type="text" placeholder="Ej. Low Fade" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
              {errors.name && <span style={styles.fieldError}>{errors.name}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Precio *</label>
              <input style={styles.input} type="number" min="0" placeholder="0.00" value={form.price} onChange={(e) => handleChange("price", e.target.value)} />
              {errors.price && <span style={styles.fieldError}>{errors.price}</span>}
            </div>

            <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Descripción</label>
              <input style={styles.input} type="text" placeholder="Descripción breve (opcional)" value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
            </div>

          </div>
          <div style={styles.formActions}>
            <button style={styles.btnPrimary} onClick={handleSubmit}>
              {editingId !== null ? "Guardar cambios" : "Agregar servicio"}
            </button>
            <button style={styles.btnSecondary} onClick={handleReset}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {services.length === 0 ? (
          <p style={styles.emptyText}>No hay servicios registrados.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Descripción</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} style={editingId === s.id ? { ...styles.tr, backgroundColor: "#fffbeb" } : styles.tr}>
                  <td style={styles.td}>{s.category}</td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>${s.price.toFixed(2)}</td>
                  <td style={{ ...styles.td, color: "#6b7280" }}>{s.description || "—"}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button style={styles.btnEdit} onClick={() => handleEdit(s)}>Editar</button>
                    <button style={styles.btnDelete} onClick={() => handleDelete(s.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "1000px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.5rem", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  card: { backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: "1.5rem", marginBottom: "1.5rem" },
  cardTitle: { fontSize: "1rem", fontWeight: "600", marginBottom: "1.25rem", color: "#374151" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  label: { fontSize: "0.82rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" },
  input: { padding: "0.6rem 0.85rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.95rem", outline: "none", backgroundColor: "#fff" },
  fieldError: { color: "#dc2626", fontSize: "0.78rem" },
  formActions: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  btnPrimary: { padding: "0.6rem 1.2rem", backgroundColor: "#1a1a2e", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
  btnSecondary: { padding: "0.6rem 1.2rem", backgroundColor: "#e5e7eb", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
  emptyText: { color: "#6b7280", fontSize: "0.9rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.6rem 0.75rem", borderBottom: "2px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "0.75rem", fontSize: "0.92rem", color: "#111827" },
  btnEdit: { marginRight: "0.5rem", padding: "0.35rem 0.9rem", backgroundColor: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "0.82rem" },
  btnDelete: { padding: "0.35rem 0.9rem", backgroundColor: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "0.82rem" },
};