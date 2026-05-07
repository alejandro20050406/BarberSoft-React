import { useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { productCategoriesMock } from "../../mocks/productCategories.mock";
import { productsMock } from "../../mocks/products.mock";

const EMPTY_FORM = {
  category: "",
  brand: "",
  model: "",
  stock: "",
  minStock: "",
  purchasePrice: "",
  salePrice: "",
};

const normalize = (value) => value.trim().toLowerCase();

export default function ProductsPage() {
  const [products, setProducts] = useState(
    productsMock.map((product) => ({ ...product, status: product.status ?? "active" })),
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ query: "", category: "all", status: "all" });
  const [confirm, setConfirm] = useState(null);

  const activeCategories = productCategoriesMock.filter(
    (category) => category.status !== "inactive",
  );

  const visibleProducts = useMemo(() => {
    const query = normalize(filters.query);

    return products.filter((product) => {
      const matchesQuery =
        !query ||
        normalize(product.brand).includes(query) ||
        normalize(product.model).includes(query);
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      const matchesStatus =
        filters.status === "all" || product.status === filters.status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [filters, products]);

  const nextId = () =>
    products.length > 0 ? Math.max(...products.map((product) => product.id)) + 1 : 1;

  const validate = () => {
    const fieldErrors = {};
    const nameExists = products.some(
      (product) =>
        product.id !== editingId &&
        normalize(`${product.brand} ${product.model}`) ===
          normalize(`${form.brand} ${form.model}`),
    );

    if (!form.category.trim()) fieldErrors.category = "Seleccione una categoria.";
    if (!form.brand.trim()) fieldErrors.brand = "La marca es obligatoria.";
    if (!form.model.trim()) fieldErrors.model = "El modelo es obligatorio.";
    if (nameExists) fieldErrors.model = "Ya existe un producto con esa marca y modelo.";
    if (form.stock === "" || Number(form.stock) < 0) fieldErrors.stock = "Ingrese stock valido.";
    if (form.minStock === "" || Number(form.minStock) < 0) {
      fieldErrors.minStock = "Ingrese stock minimo valido.";
    }
    if (form.purchasePrice === "" || Number(form.purchasePrice) <= 0) {
      fieldErrors.purchasePrice = "Ingrese precio de compra valido.";
    }
    if (form.salePrice === "" || Number(form.salePrice) <= 0) {
      fieldErrors.salePrice = "Ingrese precio de venta valido.";
    }

    return fieldErrors;
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const parsedProduct = {
      category: form.category.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      purchasePrice: Number(form.purchasePrice),
      salePrice: Number(form.salePrice),
      status: "active",
    };

    if (editingId === null) {
      setProducts([...products, { id: nextId(), ...parsedProduct }]);
    } else {
      setProducts(
        products.map((product) =>
          product.id === editingId ? { ...product, ...parsedProduct } : product,
        ),
      );
    }

    handleReset();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      category: product.category,
      brand: product.brand,
      model: product.model,
      stock: String(product.stock),
      minStock: String(product.minStock),
      purchasePrice: String(product.purchasePrice),
      salePrice: String(product.salePrice),
    });
    setErrors({});
    setShowForm(true);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  const applyStatusChange = () => {
    if (!confirm) return;

    setProducts(
      products.map((product) =>
        product.id === confirm.id ? { ...product, status: confirm.nextStatus } : product,
      ),
    );
    if (editingId === confirm.id) handleReset();
    setConfirm(null);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Inventario</span>
          <h1>Productos</h1>
        </div>
        {!showForm && (
          <button className="button button-primary" type="button" onClick={() => setShowForm(true)}>
            Nuevo producto
          </button>
        )}
      </div>

      {showForm && (
        <section className="panel">
          <h2>{editingId !== null ? "Editar producto" : "Nuevo producto"}</h2>
          <div className="form-grid">
            <Field label="Categoria" error={errors.category}>
              <select className="field" value={form.category} onChange={(event) => handleChange("category", event.target.value)}>
                <option value="">Seleccionar</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Marca" error={errors.brand}>
              <input className="field" value={form.brand} onChange={(event) => handleChange("brand", event.target.value)} />
            </Field>
            <Field label="Modelo" error={errors.model}>
              <input className="field" value={form.model} onChange={(event) => handleChange("model", event.target.value)} />
            </Field>
            <Field label="Stock" error={errors.stock}>
              <input className="field" type="number" min="0" value={form.stock} onChange={(event) => handleChange("stock", event.target.value)} />
            </Field>
            <Field label="Stock minimo" error={errors.minStock}>
              <input className="field" type="number" min="0" value={form.minStock} onChange={(event) => handleChange("minStock", event.target.value)} />
            </Field>
            <Field label="Precio compra" error={errors.purchasePrice}>
              <input className="field" type="number" min="0" value={form.purchasePrice} onChange={(event) => handleChange("purchasePrice", event.target.value)} />
            </Field>
            <Field label="Precio venta" error={errors.salePrice}>
              <input className="field" type="number" min="0" value={form.salePrice} onChange={(event) => handleChange("salePrice", event.target.value)} />
            </Field>
          </div>
          <div className="form-actions">
            <button className="button button-primary" type="button" onClick={handleSubmit}>
              {editingId !== null ? "Guardar cambios" : "Agregar producto"}
            </button>
            <button className="button button-secondary" type="button" onClick={handleReset}>
              Cancelar
            </button>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="toolbar">
          <input className="field" type="search" placeholder="Buscar marca o modelo" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} />
          <select className="field select-field" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            <option value="all">Todas las categorias</option>
            {productCategoriesMock.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <select className="field select-field" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="empty-text">No hay productos con esos filtros.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table wide-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Stock</th>
                  <th>Min.</th>
                  <th>P. compra</th>
                  <th>P. venta</th>
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id} className={editingId === product.id ? "editing-row" : ""}>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>{product.model}</td>
                    <td className={product.stock <= product.minStock ? "danger-text" : ""}>{product.stock}</td>
                    <td>{product.minStock}</td>
                    <td>${product.purchasePrice.toFixed(2)}</td>
                    <td>${product.salePrice.toFixed(2)}</td>
                    <td><span className={`status-pill ${product.status}`}>{product.status === "active" ? "Activo" : "Inactivo"}</span></td>
                    <td className="actions-cell">
                      <button className="link-button" type="button" onClick={() => handleEdit(product)}>Editar</button>
                      <button className="link-button danger" type="button" onClick={() => setConfirm({
                        id: product.id,
                        name: `${product.brand} ${product.model}`,
                        nextStatus: product.status === "active" ? "inactive" : "active",
                      })}>
                        {product.status === "active" ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title="Confirmar cambio"
        message={`Se cambiara el estado de "${confirm?.name}".`}
        confirmLabel="Si, continuar"
        onCancel={() => setConfirm(null)}
        onConfirm={applyStatusChange}
      />
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="field-group">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
