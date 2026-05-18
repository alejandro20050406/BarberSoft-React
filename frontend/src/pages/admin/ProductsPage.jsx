import { useCallback, useEffect, useState } from "react";
import CatalogForm from "../../components/forms/CatalogForm";
import FormField from "../../components/forms/FormField";
import PaginationControls from "../../components/ui/PaginationControls";
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

const EMPTY_INVENTORY_STATUS = {
  totals: { products: 0, lowStock: 0, outOfStock: 0 },
  lowStockProducts: [],
  outOfStockProducts: [],
};

const EMPTY_SOLD_SUMMARY = {
  products: [],
  totals: { products: 0, unitsSold: 0, grossRevenue: 0 },
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(EMPTY_INVENTORY_STATUS);
  const [soldSummary, setSoldSummary] = useState(EMPTY_SOLD_SUMMARY);
  const [soldPagination, setSoldPagination] = useState(null);
  const [soldFilters, setSoldFilters] = useState({
    query: "",
    from: "",
    to: "",
    page: 1,
    pageSize: 5,
  });
  const [movements, setMovements] = useState([]);
  const [movementPagination, setMovementPagination] = useState(null);
  const [movementFilters, setMovementFilters] = useState({
    query: "",
    productId: "",
    type: "all",
    page: 1,
    pageSize: 5,
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ query: "", category: "all", status: "all" });
  const [confirm, setConfirm] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [formError, setFormError] = useState("");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value ?? 0));

  const formatDate = (value) =>
    value
      ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
      : "-";

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

  const applyInventoryInsights = useCallback((responses) => {
    const [statusResponse, soldResponse, movementResponse] = responses;

    if (statusResponse.ok) {
      setInventoryStatus(statusResponse.data);
    }

    if (soldResponse.ok) {
      setSoldSummary({
        products: soldResponse.data.products ?? [],
        totals: soldResponse.data.totals ?? EMPTY_SOLD_SUMMARY.totals,
      });
      setSoldPagination(soldResponse.data.pagination ?? null);
    }

    if (movementResponse.ok) {
      setMovements(movementResponse.data.movements ?? []);
      setMovementPagination(movementResponse.data.pagination ?? null);
    }
  }, []);

  const loadInventoryInsights = useCallback(async () => {
    const [statusResponse, soldResponse, movementResponse] = await Promise.all([
      productsService.getInventoryStatus(),
      productsService.getSoldSummary(soldFilters),
      productsService.getMovements(movementFilters),
    ]);

    applyInventoryInsights([statusResponse, soldResponse, movementResponse]);
  }, [applyInventoryInsights, movementFilters, soldFilters]);

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

  useEffect(() => {
    let isActive = true;

    async function fetchInventoryInsights() {
      const responses = await Promise.all([
        productsService.getInventoryStatus(),
        productsService.getSoldSummary(soldFilters),
        productsService.getMovements(movementFilters),
      ]);

      if (!isActive) return;

      applyInventoryInsights(responses);
    }

    fetchInventoryInsights();

    return () => {
      isActive = false;
    };
  }, [applyInventoryInsights, movementFilters, soldFilters]);

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
    loadInventoryInsights();
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

  const requestCancelForm = () => {
    setCancelDialog(true);
  };

  const applyCancelForm = () => {
    setCancelDialog(false);
    handleReset();
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
    loadInventoryInsights();
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
          title={editingId !== null ? "Corregir producto" : "Nuevo producto"}
          description={
            editingId !== null
              ? "Corrige los datos de inventario, costos y precio usados en ventas futuras."
              : "Agrega un producto activo al inventario."
          }
          errorMessage={formError}
          primaryLabel={editingId !== null ? "Guardar cambios" : "Agregar producto"}
          cancelLabel={editingId !== null ? "Cancelar correccion" : "Cancelar"}
          isSaving={isSaving}
          asDialog
          onSubmit={handleSubmit}
          onCancel={requestCancelForm}
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
        <div className="sale-summary">
          <div>
            <span>Productos activos</span>
            <strong>{inventoryStatus.totals.products}</strong>
          </div>
          <div>
            <span>Stock bajo</span>
            <strong className={inventoryStatus.totals.lowStock > 0 ? "warning-text" : ""}>
              {inventoryStatus.totals.lowStock}
            </strong>
          </div>
          <div>
            <span>Sin inventario</span>
            <strong className={inventoryStatus.totals.outOfStock > 0 ? "danger-text" : ""}>
              {inventoryStatus.totals.outOfStock}
            </strong>
          </div>
        </div>

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
                    <td>{formatCurrency(product.cost)}</td>
                    <td>{formatCurrency(product.price)}</td>
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

      <section className="panel">
        <div className="sale-lines-header">
          <div>
            <h2>Alertas de stock bajo</h2>
            <p className="muted-text">Productos activos que ya estan en minimo o por agotarse.</p>
          </div>
        </div>

        {inventoryStatus.lowStockProducts.length === 0 ? (
          <p className="empty-text">No hay productos en stock bajo.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Stock</th>
                  <th>Minimo</th>
                  <th>Faltante</th>
                </tr>
              </thead>
              <tbody>
                {inventoryStatus.lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.brand} {product.model}</td>
                    <td>{product.category}</td>
                    <td className={product.stock <= 0 ? "danger-text" : "warning-text"}>{product.stock}</td>
                    <td>{product.minStock}</td>
                    <td>{product.shortage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="sale-lines-header">
          <div>
            <h2>Productos vendidos</h2>
            <p className="muted-text">
              Productos: {soldSummary.totals.products} - Unidades: {soldSummary.totals.unitsSold} - Ingreso bruto: {formatCurrency(soldSummary.totals.grossRevenue)}
            </p>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="field"
            type="search"
            placeholder="Buscar producto vendido"
            value={soldFilters.query}
            onChange={(event) => setSoldFilters((current) => ({ ...current, query: event.target.value, page: 1 }))}
          />
          <input
            className="field"
            type="date"
            value={soldFilters.from}
            onChange={(event) => setSoldFilters((current) => ({ ...current, from: event.target.value, page: 1 }))}
          />
          <input
            className="field"
            type="date"
            value={soldFilters.to}
            onChange={(event) => setSoldFilters((current) => ({ ...current, to: event.target.value, page: 1 }))}
          />
        </div>

        {soldSummary.products.length === 0 ? (
          <p className="empty-text">No hay productos vendidos con esos filtros.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table wide-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoria</th>
                    <th>Unidades</th>
                    <th>Transacciones</th>
                    <th>Ingreso bruto</th>
                    <th>Stock actual</th>
                    <th>Ultima venta</th>
                  </tr>
                </thead>
                <tbody>
                  {soldSummary.products.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productName}</td>
                      <td>{product.category}</td>
                      <td>{product.unitsSold}</td>
                      <td>{product.transactions}</td>
                      <td>{formatCurrency(product.grossRevenue)}</td>
                      <td className={product.currentStock <= product.minStock ? "warning-text" : ""}>{product.currentStock}</td>
                      <td>{formatDate(product.lastSoldAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              pagination={soldPagination}
              onPageChange={(page) => setSoldFilters((current) => ({ ...current, page }))}
              onPageSizeChange={(pageSize) => setSoldFilters((current) => ({ ...current, page: 1, pageSize }))}
            />
          </>
        )}
      </section>

      <section className="panel">
        <div className="sale-lines-header">
          <div>
            <h2>Auditoria de inventario</h2>
            <p className="muted-text">Movimientos por alta, ajuste manual y ventas.</p>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="field"
            type="search"
            placeholder="Buscar movimiento"
            value={movementFilters.query}
            onChange={(event) => setMovementFilters((current) => ({ ...current, query: event.target.value, page: 1 }))}
          />
          <select
            className="field select-field"
            value={movementFilters.productId}
            onChange={(event) => setMovementFilters((current) => ({ ...current, productId: event.target.value, page: 1 }))}
          >
            <option value="">Todos los productos</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.brand} {product.model}
              </option>
            ))}
          </select>
          <select
            className="field select-field"
            value={movementFilters.type}
            onChange={(event) => setMovementFilters((current) => ({ ...current, type: event.target.value, page: 1 }))}
          >
            <option value="all">Todos los movimientos</option>
            <option value="initial_stock">Stock inicial</option>
            <option value="manual_adjustment">Ajuste manual</option>
            <option value="sale">Venta</option>
          </select>
        </div>

        {movements.length === 0 ? (
          <p className="empty-text">No hay movimientos de inventario con esos filtros.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table wide-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Antes</th>
                    <th>Despues</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td>{formatDate(movement.createdAt)}</td>
                      <td>{movement.productName}</td>
                      <td>{movement.type}</td>
                      <td>{movement.quantity}</td>
                      <td>{movement.previousStock}</td>
                      <td>{movement.nextStock}</td>
                      <td>{movement.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              pagination={movementPagination}
              onPageChange={(page) => setMovementFilters((current) => ({ ...current, page }))}
              onPageSizeChange={(pageSize) => setMovementFilters((current) => ({ ...current, page: 1, pageSize }))}
            />
          </>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title={confirm?.nextStatus === "inactive" ? "Desactivar producto" : "Activar producto"}
        message={
          confirm?.nextStatus === "inactive"
            ? `Se dara de baja logica a "${confirm?.name}".`
            : `Se reactivara "${confirm?.name}".`
        }
        details={
          confirm?.nextStatus === "inactive"
            ? [
                "El producto dejara de aparecer en ventas nuevas.",
                "No se eliminara su informacion de inventario.",
                "El historial de ventas conservara sus datos.",
              ]
            : ["El producto volvera a estar disponible para ventas nuevas."]
        }
        variant={confirm?.nextStatus === "inactive" ? "danger" : "info"}
        confirmLabel={confirm?.nextStatus === "inactive" ? "Desactivar" : "Activar"}
        onCancel={() => setConfirm(null)}
        onConfirm={applyStatusChange}
      />

      <ConfirmDialog
        isOpen={cancelDialog}
        title={editingId !== null ? "Cancelar correccion" : "Cancelar registro"}
        message="Los datos capturados en el formulario se descartaran."
        details={[
          "No se guardara ningun cambio de inventario.",
          "Puedes volver a abrir el formulario si necesitas continuar.",
        ]}
        variant="info"
        confirmLabel="Descartar"
        cancelLabel="Volver al formulario"
        onCancel={() => setCancelDialog(false)}
        onConfirm={applyCancelForm}
      />
    </div>
  );
}
