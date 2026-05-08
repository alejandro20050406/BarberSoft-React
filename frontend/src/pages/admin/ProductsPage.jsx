import { useCallback, useEffect, useState } from "react";
import CatalogForm from "../../components/forms/CatalogForm";
import FormField from "../../components/forms/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { productCategoriesService } from "../../services/categoryServices";
import { productsService } from "../../services/productsService";

const EMPTY_FORM = {
  category: "",
  brand: "",
  model: "",
  stock: "",
  minStock: "",
  cost: "",
  price: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ query: "", category: "all", status: "all" });
  const [confirm, setConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [formError, setFormError] = useState("");

  const loadProducts = useCallback(
    async (currentFilters = filters, options = {}) => {
      if (!options.silent) setIsLoading(true);
      setRequestError("");

      const response = await productsService.list(currentFilters);

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setProducts(response.data);
      }

      if (!options.silent) setIsLoading(false);
    },
    [filters],
  );

  useEffect(() => {
    let isActive = true;

    async function fetchProducts() {
      setIsLoading(true);
      setRequestError("");

      const response = await productsService.list(filters);

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setProducts(response.data);
      }

      setIsLoading(false);
    }

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [filters]);

  useEffect(() => {
    let isActive = true;

    async function fetchCategories() {
      const response = await productCategoriesService.list({ status: "all" });

      if (!isActive || !response.ok) return;

      setCategories(response.data);
    }

    fetchCategories();

    return () => {
      isActive = false;
    };
  }, []);

  const activeCategories = categories.filter((category) => category.status !== "inactive");

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setFormError("");

    const response =
      editingId === null
        ? await productsService.create(form)
        : await productsService.update(editingId, form);

    setIsSaving(false);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setFormError(response.message);
      return;
    }

    handleReset();
    loadProducts(filters, { silent: true });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      category: product.category,
      brand: product.brand,
      model: product.model,
      stock: String(product.stock),
      minStock: String(product.minStock),
      cost: String(product.cost),
      price: String(product.price),
    });
    setErrors({});
    setFormError("");
    setShowForm(true);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setFormError("");
    setShowForm(false);
  };

  const applyStatusChange = async () => {
    if (!confirm) return;

    setIsSaving(true);
    setRequestError("");

    const response = await productsService.setStatus(confirm.id, confirm.nextStatus);

    setIsSaving(false);

    if (!response.ok) {
      setRequestError(response.message);
      setConfirm(null);
      return;
    }

    if (editingId === confirm.id) handleReset();
    setConfirm(null);
    loadProducts(filters, { silent: true });
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
        <CatalogForm
          title={editingId !== null ? "Editar producto" : "Nuevo producto"}
          errorMessage={formError}
          primaryLabel={editingId !== null ? "Guardar cambios" : "Agregar producto"}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={handleReset}
        >
          <FormField label="Categoria" error={errors.category}>
            <select
              className="field"
              value={form.category}
              onChange={(event) => handleChange("category", event.target.value)}
            >
              <option value="">Seleccionar</option>
              {activeCategories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Marca" error={errors.brand}>
            <input className="field" value={form.brand} onChange={(event) => handleChange("brand", event.target.value)} />
          </FormField>
          <FormField label="Modelo" error={errors.model}>
            <input className="field" value={form.model} onChange={(event) => handleChange("model", event.target.value)} />
          </FormField>
          <FormField label="Stock actual" error={errors.stock}>
            <input className="field" type="number" min="0" value={form.stock} onChange={(event) => handleChange("stock", event.target.value)} />
          </FormField>
          <FormField label="Stock minimo" error={errors.minStock}>
            <input className="field" type="number" min="0" value={form.minStock} onChange={(event) => handleChange("minStock", event.target.value)} />
          </FormField>
          <FormField label="Costo" error={errors.cost}>
            <input className="field" type="number" min="0" step="0.01" value={form.cost} onChange={(event) => handleChange("cost", event.target.value)} />
          </FormField>
          <FormField label="Precio" error={errors.price}>
            <input className="field" type="number" min="0" step="0.01" value={form.price} onChange={(event) => handleChange("price", event.target.value)} />
          </FormField>
        </CatalogForm>
      )}

      <section className="panel">
        <div className="toolbar">
          <input className="field" type="search" placeholder="Buscar marca o modelo" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} />
          <select className="field select-field" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            <option value="all">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <select className="field select-field" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {isLoading ? (
          <p className="empty-text">Cargando productos...</p>
        ) : requestError ? (
          <div>
            <p className="form-error">{requestError}</p>
            <button className="button button-secondary" type="button" onClick={() => loadProducts()}>
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
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
                  <th>Costo</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={editingId === product.id ? "editing-row" : ""}>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>{product.model}</td>
                    <td className={product.stock <= product.minStock ? "danger-text" : ""}>{product.stock}</td>
                    <td>{product.minStock}</td>
                    <td>${product.cost.toFixed(2)}</td>
                    <td>${product.price.toFixed(2)}</td>
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
