import { useState } from "react";
import { productsMock } from "../../mocks/products.mock";
import { productCategoriesMock } from "../../mocks/productCategories.mock";

const EMPTY_FORM = {
  category: "", brand: "", model: "",
  stock: "", minStock: "", purchasePrice: "", salePrice: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState(productsMock);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});

  const nextId = () =>
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const validate = () => {
    const e = {};
    if (!form.category.trim()) e.category = "Seleccione una categoría.";
    if (!form.brand.trim()) e.brand = "La marca es obligatoria.";
    if (!form.model.trim()) e.model = "El modelo es obligatorio.";
    if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Ingrese un stock válido (≥ 0).";
    if (form.minStock === "" || isNaN(Number(form.minStock)) || Number(form.minStock) < 0)
      e.minStock = "Ingrese un stock mínimo válido (≥ 0).";
    if (form.purchasePrice === "" || isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) <= 0)
      e.purchasePrice = "Ingrese un precio de compra válido (> 0).";
    if (form.salePrice === "" || isNaN(Number(form.salePrice)) || Number(form.salePrice) <= 0)
      e.salePrice = "Ingrese un precio de venta válido (> 0).";
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
      category: form.category.trim(), brand: form.brand.trim(), model: form.model.trim(),
      stock: Number(form.stock), minStock: Number(form.minStock),
      purchasePrice: Number(form.purchasePrice), salePrice: Number(form.salePrice),
    };
    if (editingId === null) {
      setProducts([...products, { id: nextId(), ...parsed }]);
    } else {
      setProducts(products.map((p) => (p.id === editingId ? { id: editingId, ...parsed } : p)));
    }
    handleReset();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      category: product.category, brand: product.brand, model: product.model,
      stock: String(product.stock), minStock: String(product.minStock),
      purchasePrice: String(product.purchasePrice), salePrice: String(product.salePrice),
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
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
        <h2 style={styles.title}>Productos</h2>
        {!showForm && (
          <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>+ Nuevo producto</button>
        )}
      </div>

      {showForm && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId !== null ? "Editar producto" : "Nuevo producto"}</h3>
          <div style={styles.grid}>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Categoría *</label>
              <select style={styles.input} value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
                <option value="">Seleccionar…</option>
                {productCategoriesMock.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <span style={styles.fieldError}>{errors.category}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Marca *</label>
              <input style={styles.input} type="text" placeholder="Ej. Natura" value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} />
              {errors.brand && <span style={styles.fieldError}>{errors.brand}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Modelo *</label>
              <input style={styles.input} type="text" placeholder="Ej. Moco de Gorila" value={form.model} onChange={(e) => handleChange("model", e.target.value)} />
              {errors.model && <span style={styles.fieldError}>{errors.model}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stock *</label>
              <input style={styles.input} type="number" min="0" placeholder="0" value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} />
              {errors.stock && <span style={styles.fieldError}>{errors.stock}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stock mínimo *</label>
              <input style={styles.input} type="number" min="0" placeholder="0" value={form.minStock} onChange={(e) => handleChange("minStock", e.target.value)} />
              {errors.minStock && <span style={styles.fieldError}>{errors.minStock}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Precio de compra *</label>
              <input style={styles.input} type="number" min="0" placeholder="0.00" value={form.purchasePrice} onChange={(e) => handleChange("purchasePrice", e.target.value)} />
              {errors.purchasePrice && <span style={styles.fieldError}>{errors.purchasePrice}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Precio de venta *</label>
              <input style={styles.input} type="number" min="0" placeholder="0.00" value={form.salePrice} onChange={(e) => handleChange("salePrice", e.target.value)} />
              {errors.salePrice && <span style={styles.fieldError}>{errors.salePrice}</span>}
            </div>

          </div>
          <div style={styles.formActions}>
            <button style={styles.btnPrimary} onClick={handleSubmit}>
              {editingId !== null ? "Guardar cambios" : "Agregar producto"}
            </button>
            <button style={styles.btnSecondary} onClick={handleReset}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {products.length === 0 ? (
          <p style={styles.emptyText}>No hay productos registrados.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Categoría</th>
                  <th style={styles.th}>Marca</th>
                  <th style={styles.th}>Modelo</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Mín.</th>
                  <th style={styles.th}>P. Compra</th>
                  <th style={styles.th}>P. Venta</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={editingId === p.id ? { ...styles.tr, backgroundColor: "#fffbeb" } : styles.tr}>
                    <td style={styles.td}>{p.category}</td>
                    <td style={styles.td}>{p.brand}</td>
                    <td style={styles.td}>{p.model}</td>
                    <td style={{ ...styles.td, color: p.stock <= p.minStock ? "#dc2626" : "#111827", fontWeight: p.stock <= p.minStock ? "700" : "400" }}>
                      {p.stock}
                    </td>
                    <td style={styles.td}>{p.minStock}</td>
                    <td style={styles.td}>${p.purchasePrice.toFixed(2)}</td>
                    <td style={styles.td}>${p.salePrice.toFixed(2)}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button style={styles.btnEdit} onClick={() => handleEdit(p)}>Editar</button>
                      <button style={styles.btnDelete} onClick={() => handleDelete(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "1100px" },
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
  table: { width: "100%", borderCollapse: "collapse", minWidth: "720px" },
  th: { textAlign: "left", padding: "0.6rem 0.75rem", borderBottom: "2px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "0.75rem", fontSize: "0.92rem", color: "#111827" },
  btnEdit: { marginRight: "0.5rem", padding: "0.35rem 0.9rem", backgroundColor: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "0.82rem" },
  btnDelete: { padding: "0.35rem 0.9rem", backgroundColor: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "0.82rem" },
};