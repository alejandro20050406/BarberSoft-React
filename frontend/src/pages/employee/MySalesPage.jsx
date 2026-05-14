import { useEffect, useMemo, useState } from "react";
import { salesService } from "../../features/sales/services/salesService";

const SALE_TYPES = {
  all: "Todas",
  service: "Servicios",
  product: "Productos",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value ?? 0));

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getToday = () => toDateInputValue(new Date());

const getMonthStart = () => {
  const today = new Date();

  return toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1));
};

const buildInitialFilters = () => ({
  from: getMonthStart(),
  to: getToday(),
  type: "all",
});

const getSaleItemsLabel = (sale) =>
  sale.details?.map((detail) => `${detail.quantity} x ${detail.itemName}`).join(", ") ||
  "Sin detalle";

export default function MySalesPage() {
  const [filters, setFilters] = useState(buildInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState(buildInitialFilters);
  const [sales, setSales] = useState([]);
  const [totals, setTotals] = useState({
    count: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    commission: 0,
    services: 0,
    products: 0,
  });
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSales() {
      setIsLoading(true);
      setRequestError("");

      const response = await salesService.getMySales(appliedFilters);

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
        setSales([]);
        setIsLoading(false);
        return;
      }

      setSales(response.data.sales ?? []);
      setTotals(response.data.totals ?? {});
      setEmployee(response.data.employee ?? null);
      setIsLoading(false);
    }

    loadSales();

    return () => {
      isActive = false;
    };
  }, [appliedFilters]);

  const periodLabel = useMemo(() => {
    if (appliedFilters.from && appliedFilters.to) {
      return `${appliedFilters.from} a ${appliedFilters.to}`;
    }

    if (appliedFilters.from) return `Desde ${appliedFilters.from}`;
    if (appliedFilters.to) return `Hasta ${appliedFilters.to}`;

    return "Todo el historial";
  }, [appliedFilters]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const nextFilters = { from: "", to: "", type: "all" };

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Consultas</span>
          <h1>Mis ventas</h1>
          <p>
            {employee ? `${employee.firstName} ${employee.lastName}` : "Empleado autenticado"} -{" "}
            {periodLabel}
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="form-grid">
          <label className="field-group">
            <span>Desde</span>
            <input
              className="field"
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
            />
          </label>

          <label className="field-group">
            <span>Hasta</span>
            <input
              className="field"
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
            />
          </label>

          <label className="field-group">
            <span>Tipo</span>
            <select
              className="field"
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
            >
              {Object.entries(SALE_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-actions sales-filter-actions">
          <button className="button button-primary" type="button" onClick={applyFilters}>
            Filtrar
          </button>
          <button className="button button-secondary" type="button" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      </section>

      <section className="sale-summary employee-sales-summary">
        <div>
          <span>Ventas</span>
          <strong>{totals.count ?? 0}</strong>
        </div>
        <div>
          <span>Total vendido</span>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
        <div>
          <span>Comisiones</span>
          <strong>{formatCurrency(totals.commission)}</strong>
        </div>
        <div>
          <span>Servicios</span>
          <strong>{totals.services ?? 0}</strong>
        </div>
        <div>
          <span>Productos</span>
          <strong>{totals.products ?? 0}</strong>
        </div>
        <div>
          <span>Descuentos</span>
          <strong>{formatCurrency(totals.discount)}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="sale-lines-header">
          <h2>Detalle de ventas y comisiones</h2>
          <span className="status-pill active">{SALE_TYPES[appliedFilters.type]}</span>
        </div>

        {requestError ? (
          <div>
            <p className="form-error">{requestError}</p>
            <button className="button button-secondary" type="button" onClick={applyFilters}>
              Reintentar
            </button>
          </div>
        ) : isLoading ? (
          <p className="empty-text">Cargando ventas...</p>
        ) : sales.length === 0 ? (
          <p className="empty-text">No hay ventas registradas con los filtros seleccionados.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table wide-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Detalle</th>
                  <th>Pago</th>
                  <th>Total</th>
                  <th>Comision</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{formatDateTime(sale.soldAt)}</td>
                    <td>{sale.folio}</td>
                    <td>{SALE_TYPES[sale.type] ?? sale.type}</td>
                    <td>{sale.client?.name ?? "Sin cliente"}</td>
                    <td>{getSaleItemsLabel(sale)}</td>
                    <td>{sale.paymentMethodLabel}</td>
                    <td>{formatCurrency(sale.total)}</td>
                    <td>
                      <strong>{formatCurrency(sale.commission?.amount)}</strong>
                      <small className="commission-rate">
                        {sale.commission?.percentage ?? 0}% - {sale.commission?.status ?? "sin comision"}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
