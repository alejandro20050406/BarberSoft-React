import FormField from "../../../components/forms/FormField";
import PaymentMethodSelect from "./PaymentMethodSelect";
import { useServiceSale } from "../hooks/useServiceSale";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);

const fullName = (person) => `${person.firstName} ${person.lastName}`.trim();

export default function ServiceSaleForm() {
  const {
    form,
    options,
    errors,
    isLoading,
    isSaving,
    requestError,
    successMessage,
    lastSale,
    selectedService,
    subtotal,
    total,
    updateField,
    resetForm,
    submit,
    loadOptions,
  } = useServiceSale();

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Ventas</span>
          <h1>Venta de servicio</h1>
        </div>
      </div>

      <section className="panel">
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

              <FormField label="Servicio" error={errors.serviceId}>
                <select
                  className="field"
                  value={form.serviceId}
                  onChange={(event) => updateField("serviceId", event.target.value)}
                >
                  <option value="">Seleccionar servicio</option>
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

            <div className="sale-summary">
              <div>
                <span>Servicio</span>
                <strong>{selectedService?.name ?? "Sin seleccionar"}</strong>
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
                Folio generado: <strong>{lastSale.sale.folio}</strong>. Comision:{" "}
                <strong>{formatCurrency(lastSale.commission.amount)}</strong>
              </p>
            ) : null}

            <div className="form-actions">
              <button className="button button-primary" type="button" onClick={submit} disabled={isSaving}>
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
