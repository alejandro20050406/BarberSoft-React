import FormField from "../../../components/forms/FormField";
import { useSale } from "../hooks/useSale";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value ?? 0));

const fullName = (person) => `${person.firstName} ${person.lastName}`.trim();
const productName = (product) => `${product.brand} ${product.model}`.trim();

const TYPE_LABELS = {
  product: "Producto",
  service: "Servicio",
};

export default function SaleForm({ embedded = false, onCancel, onSaved } = {}) {
  const {
    form,
    options,
    errors,
    isLoading,
    isSaving,
    requestError,
    successMessage,
    lastSale,
    lineItems,
    categoriesByType,
    total,
    employeeServiceEarning,
    employeeProductCommission,
    estimatedEmployeeCommission,
    adminServiceProfit,
    inventoryBlockingMessages,
    hasInventoryBlock,
    updateField,
    updateLine,
    addLine,
    removeLine,
    resetForm,
    submit,
    loadOptions,
  } = useSale();

  const getItemOptions = (line) => {
    if (line.itemType === "product") {
      return options.products.filter((product) => !line.category || product.category === line.category);
    }

    if (line.itemType === "service") {
      return options.services.filter((service) => !line.category || service.category === line.category);
    }

    return [];
  };

  const getItemLabel = (line, item) => {
    if (line.itemType === "product") {
      return `${productName(item)} - ${formatCurrency(item.price)} - Stock ${item.stock}`;
    }

    return `${item.name} - ${formatCurrency(item.price)}`;
  };

  const handleSubmit = async () => {
    const response = await submit();

    if (response?.ok) {
      onSaved?.(response);
    }
  };

  const content = (
    <section className="panel sale-form-panel">
      {isLoading ? (
        <p className="empty-text">Cargando catalogos de venta...</p>
      ) : requestError && options.clients.length === 0 ? (
        <div>
          <p className="form-error">{requestError}</p>
          <button className="button button-secondary" type="button" onClick={loadOptions}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="sale-top-grid">
            <FormField label="Cliente" error={errors.clientId}>
              <select
                className="field"
                value={form.clientId}
                onChange={(event) => updateField("clientId", event.target.value)}
              >
                <option value="">Buscar cliente</option>
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

            <FormField label="Fecha de venta" error={errors.soldAt} fullWidth>
              <input
                className="field"
                type="date"
                value={form.soldAt}
                onChange={(event) => updateField("soldAt", event.target.value)}
              />
            </FormField>
          </div>

          <div className="sale-items-box">
            <h2>Items de la venta</h2>

            {errors.lineItems ? <p className="form-error">{errors.lineItems}</p> : null}
            {inventoryBlockingMessages.map((message) => (
              <p className="form-error" key={message}>{message}</p>
            ))}

            {lineItems.map((line, index) => {
              const itemOptions = getItemOptions(line);

              return (
                <div className="sale-item-grid" key={`${index}-${line.itemType}-${line.itemId}`}>
                  <FormField label="Tipo" error={errors[`lineItems.${index}.itemType`]}>
                    <select
                      className="field"
                      value={form.lineItems[index].itemType}
                      onChange={(event) => updateLine(index, "itemType", event.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      <option value="product">Producto</option>
                      <option value="service">Servicio</option>
                    </select>
                  </FormField>

                  <FormField label="Categoria / Tipo" error={errors[`lineItems.${index}.category`]}>
                    <select
                      className="field"
                      value={form.lineItems[index].category}
                      onChange={(event) => updateLine(index, "category", event.target.value)}
                      disabled={!line.itemType}
                    >
                      <option value="">
                        {line.itemType ? "Seleccionar categoria" : "Seleccionar primero tipo"}
                      </option>
                      {(categoriesByType[line.itemType] ?? []).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Item" error={errors[`lineItems.${index}.itemId`]}>
                    <select
                      className="field"
                      value={form.lineItems[index].itemId}
                      onChange={(event) => updateLine(index, "itemId", event.target.value)}
                      disabled={!line.category}
                    >
                      <option value="">Buscar producto o servicio</option>
                      {itemOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {getItemLabel(line, item)}
                        </option>
                      ))}
                    </select>
                    {line.itemType ? (
                      <small>{TYPE_LABELS[line.itemType]} seleccionado</small>
                    ) : null}
                  </FormField>

                  <FormField label="Cantidad" error={errors[`lineItems.${index}.quantity`]}>
                    <input
                      className="field"
                      type="number"
                      min="1"
                      value={form.lineItems[index].quantity}
                      onChange={(event) => updateLine(index, "quantity", event.target.value)}
                    />
                  </FormField>

                  <FormField label="Precio unitario" error={errors[`lineItems.${index}.unitPrice`]}>
                    <input className="field" value={formatCurrency(line.unitPrice)} readOnly />
                  </FormField>

                  <FormField label="Subtotal" error={errors[`lineItems.${index}.lineTotal`]}>
                    <input className="field" value={formatCurrency(line.lineTotal)} readOnly />
                  </FormField>

                  <button
                    className="button button-danger sale-remove-button"
                    type="button"
                    onClick={() => removeLine(index)}
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}

            <button className="sale-add-button" type="button" onClick={addLine} aria-label="Agregar item">
              +
            </button>

            <div className="sale-totals-grid">
              <FormField label="Total">
                <input className="field" value={formatCurrency(total)} readOnly />
              </FormField>
              <FormField label="Comision servicios">
                <input className="field" value={formatCurrency(employeeServiceEarning)} readOnly />
              </FormField>
              <FormField label="Comision productos">
                <input className="field" value={formatCurrency(employeeProductCommission)} readOnly />
              </FormField>
              <FormField label="Comision total estimada">
                <input className="field" value={formatCurrency(estimatedEmployeeCommission)} readOnly />
              </FormField>
              <FormField label="Ganancia administrador (20%)">
                <input className="field" value={formatCurrency(adminServiceProfit)} readOnly />
              </FormField>
            </div>
          </div>

          <div className="payment-methods">
            <span>Metodo de Pago:</span>
            <label className="payment-radio">
              <input
                type="radio"
                name="paymentMethod"
                checked={form.paymentMethod === "cash"}
                onChange={() => updateField("paymentMethod", "cash")}
              />
              Efectivo
            </label>
            <label className="payment-radio">
              <input
                type="radio"
                name="paymentMethod"
                checked={form.paymentMethod === "transfer"}
                onChange={() => updateField("paymentMethod", "transfer")}
              />
              Transferencia
            </label>
          </div>

          {requestError ? <p className="form-error">{requestError}</p> : null}
          {successMessage ? <p className="success-text">{successMessage}</p> : null}
          {lastSale ? (
            <p className="empty-text">
              Folio generado: <strong>{lastSale.sale.folio}</strong>. Total:{" "}
              <strong>{formatCurrency(lastSale.sale.total)}</strong>
            </p>
          ) : null}

          <div className="form-actions sale-submit-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={onCancel ?? resetForm}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || hasInventoryBlock}
            >
              {isSaving ? "Registrando..." : "Registrar venta"}
            </button>
          </div>
        </>
      )}
    </section>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="page-shell sale-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Ventas</span>
          <h1>Venta</h1>
        </div>
      </div>
      {content}
    </div>
  );
}
