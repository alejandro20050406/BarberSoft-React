import FormField from "../../../components/forms/FormField";
import PaymentMethodSelect from "./PaymentMethodSelect";
import { useProductSale } from "../hooks/useProductSale";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);

const fullName = (person) => `${person.firstName} ${person.lastName}`.trim();
const productName = (product) => `${product.brand} ${product.model}`.trim();

const getAvailabilityClass = (line) => {
  if (!line.product) return "";
  if (line.isOutOfStock || line.exceedsStock) return "danger-text";
  if (line.reachesMinimum) return "warning-text";
  return "success-text";
};

const getAvailabilityLabel = (line) => {
  if (!line.product) return "Sin seleccionar";
  if (line.isOutOfStock) return "Sin inventario";
  if (line.exceedsStock) return `Disponible: ${line.product.stock}`;
  if (line.reachesMinimum) return `Bajo minimo: quedarian ${line.availableAfterSale}`;
  return `Disponible: ${line.product.stock}`;
};

export default function ProductSaleForm() {
  const {
    form,
    options,
    errors,
    isLoading,
    isSaving,
    requestError,
    successMessage,
    lastSale,
    linkedService,
    lineItems,
    activeProductsCount,
    lowStockProductsCount,
    outOfStockProductsCount,
    inventoryBlockingMessages,
    hasInventoryBlock,
    subtotal,
    total,
    updateField,
    updateLine,
    addLine,
    removeLine,
    resetForm,
    submit,
    loadOptions,
  } = useProductSale();

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Ventas</span>
          <h1>Venta de producto</h1>
        </div>
      </div>

      <section className="panel">
        {isLoading ? (
          <p className="empty-text">Cargando catalogos de venta...</p>
        ) : requestError && options.products.length === 0 ? (
          <div>
            <p className="form-error">{requestError}</p>
            <button className="button button-secondary" type="button" onClick={loadOptions}>
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="form-grid">
              <FormField label="Cliente" error={errors.clientId}>
                <select
                  className="field"
                  value={form.clientId}
                  onChange={(event) => updateField("clientId", event.target.value)}
                >
                  <option value="">Seleccionar cliente</option>
                  {options.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {fullName(client)} - {client.phone}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Empleado" error={errors.employeeId}>
                <select
                  className="field"
                  value={form.employeeId}
                  onChange={(event) => updateField("employeeId", event.target.value)}
                  disabled={Boolean(options.currentEmployee)}
                >
                  <option value="">Seleccionar empleado</option>
                  {options.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {fullName(employee)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Servicio ligado" error={errors.linkedServiceId}>
                <select
                  className="field"
                  value={form.linkedServiceId}
                  onChange={(event) => updateField("linkedServiceId", event.target.value)}
                >
                  <option value="">Venta directa sin servicio</option>
                  {options.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)}
                    </option>
                  ))}
                </select>
              </FormField>

              <PaymentMethodSelect
                value={form.paymentMethod}
                options={options.paymentMethods}
                error={errors.paymentMethod}
                onChange={(value) => updateField("paymentMethod", value)}
              />

              <FormField label="Descuento" error={errors.discount}>
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={(event) => updateField("discount", event.target.value)}
                />
              </FormField>

              <FormField label="Notas" error={errors.notes} fullWidth>
                <textarea
                  className="field field-textarea"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </FormField>
            </div>

            <div className="sale-lines-header">
              <div>
                <h2>Productos</h2>
                <p className="inventory-caption">
                  Activos: <strong>{activeProductsCount}</strong> - Stock minimo:{" "}
                  <strong>{lowStockProductsCount}</strong> - Sin inventario:{" "}
                  <strong>{outOfStockProductsCount}</strong>
                </p>
              </div>
              <button className="button button-secondary" type="button" onClick={addLine}>
                Agregar producto
              </button>
            </div>
            {errors.lineItems ? <p className="form-error">{errors.lineItems}</p> : null}
            {inventoryBlockingMessages.map((message) => (
              <p className="form-error" key={message}>{message}</p>
            ))}

            <div className="table-wrap">
              <table className="data-table product-sale-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Disponibilidad</th>
                    <th>Stock min.</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                    <th className="actions-cell">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((line, index) => (
                    <tr key={`${index}-${line.productId}`}>
                      <td>
                        <select
                          className="field"
                          value={form.lineItems[index].productId}
                          onChange={(event) => updateLine(index, "productId", event.target.value)}
                        >
                          <option value="">Seleccionar producto</option>
                          {options.products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {productName(product)} - {formatCurrency(product.price)} - Stock {product.stock}
                            </option>
                          ))}
                        </select>
                        {errors[`lineItems.${index}.productId`] ? (
                          <small className="inline-error">{errors[`lineItems.${index}.productId`]}</small>
                        ) : null}
                      </td>
                      <td>
                        <span className={getAvailabilityClass(line)}>
                          {getAvailabilityLabel(line)}
                        </span>
                        {line.product && line.requestedTotal !== line.quantity ? (
                          <small className="inventory-note">
                            Solicitado total: {line.requestedTotal}
                          </small>
                        ) : null}
                      </td>
                      <td className={line.product && line.product.stock <= line.product.minStock ? "danger-text" : ""}>
                        {line.product ? line.product.minStock : "-"}
                      </td>
                      <td>
                        <input
                          className="field quantity-field"
                          type="number"
                          min="1"
                          value={form.lineItems[index].quantity}
                          onChange={(event) => updateLine(index, "quantity", event.target.value)}
                        />
                        {errors[`lineItems.${index}.quantity`] ? (
                          <small className="inline-error">{errors[`lineItems.${index}.quantity`]}</small>
                        ) : null}
                      </td>
                      <td>{formatCurrency(line.product?.price ?? 0)}</td>
                      <td>{formatCurrency(line.lineTotal)}</td>
                      <td className="actions-cell">
                        <button className="link-button danger" type="button" onClick={() => removeLine(index)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sale-summary">
              <div>
                <span>Servicio ligado</span>
                <strong>{linkedService?.name ?? "Sin servicio"}</strong>
              </div>
              <div>
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            {requestError ? <p className="form-error">{requestError}</p> : null}
            {successMessage ? <p className="success-text">{successMessage}</p> : null}
            {lastSale ? (
              <p className="empty-text">
                Folio generado: <strong>{lastSale.sale.folio}</strong>. Inventario actualizado:{" "}
                <strong>{lastSale.stockMovements.length}</strong> producto(s).
              </p>
            ) : null}

            <div className="form-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={submit}
                disabled={isSaving || hasInventoryBlock}
              >
                {isSaving ? "Registrando..." : "Registrar venta"}
              </button>
              <button className="button button-secondary" type="button" onClick={resetForm} disabled={isSaving}>
                Limpiar
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
