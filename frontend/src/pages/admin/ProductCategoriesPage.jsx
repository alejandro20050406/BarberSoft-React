import { useState } from "react";
import { productCategoriesMock } from "../../mocks/productCategories.mock";

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState(productCategoriesMock);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const nextId = () =>
    categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;

  const validate = () => {
    const trimmed = form.name.trim();
    if (!trimmed) return "El nombre de la categoría es obligatorio.";
    const duplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editingId
    );
    if (duplicate) return "Ya existe una categoría con ese nombre.";
    return "";
  };

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    if (editingId === null) {
      setCategories([...categories, { id: nextId(), name: form.name.trim() }]);
    } else {
      setCategories(categories.map((c) =>
        c.id === editingId ? { ...c, name: form.name.trim() } : c
      ));
    }
    handleReset();
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name });
    setError("");
  };

  const handleDelete = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
    if (editingId === id) handleReset();
  };

  const handleReset = () => {
    setForm({ name: "" });
    setEditingId(null);
    setError("");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Categorías de Productos</h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {editingId !== null ? "Editar categoría" : "Nueva categoría"}
        </h3>
        <div style={styles.formRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="Nombre de la categoría"
            value={form.name}
            onChange={(e) => { setForm({ name: e.target.value }); setError(""); }}
          />
          <button style={styles.btnPrimary} onClick={handleSubmit}>
            {editingId !== null ? "Guardar cambios" : "Agregar"}
          </button>
          {editingId !== null && (
            <button style={styles.btnSecondary} onClick={handleReset}>Cancelar</button>
          )}
        </div>
        {error && <p style={styles.errorText}>{error}</p>}
      </div>

      <div style={styles.card}>
        {categories.length === 0 ? (
          <p style={styles.emptyText}>No hay categorías registradas.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Nombre</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id} style={editingId === cat.id ? { ...styles.tr, backgroundColor: "#fffbeb" } : styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{cat.name}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button style={styles.btnEdit} onClick={() => handleEdit(cat)}>Editar</button>
                    <button style={styles.btnDelete} onClick={() => handleDelete(cat.id)}>Eliminar</button>
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
  container: { padding: "2rem", maxWidth: "800px" },
  title: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#1a1a2e" },
  card: { backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: "1.5rem", marginBottom: "1.5rem" },
  cardTitle: { fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" },
  formRow: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" },
  input: { flex: 1, minWidth: "220px", padding: "0.6rem 1rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.95rem", outline: "none" },
  btnPrimary: { padding: "0.6rem 1.2rem", backgroundColor: "#1a1a2e", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
  btnSecondary: { padding: "0.6rem 1.2rem", backgroundColor: "#e5e7eb", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
  errorText: { color: "#dc2626", fontSize: "0.85rem", marginTop: "0.5rem" },
  emptyText: { color: "#6b7280", fontSize: "0.9rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.6rem 0.75rem", borderBottom: "2px solid #e5e7eb", fontSize: "0.85rem", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "0.75rem", fontSize: "0.95rem", color: "#111827" },
  btnEdit: { marginRight: "0.5rem", padding: "0.35rem 0.9rem", backgroundColor: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" },
  btnDelete: { padding: "0.35rem 0.9rem", backgroundColor: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" },
};