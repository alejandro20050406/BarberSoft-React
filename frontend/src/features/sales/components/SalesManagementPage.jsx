import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { salesService } from "../services/salesService";
import SaleForm from "./SaleForm";

const EMPTY_SUMMARY = {
  todaySales: 0,
  todayTotal: 0,
  todayClients: 0,
  averageTicket: 0,
  monthIncome: 0,
};

const TYPE_LABELS = {
  service: "Servicio",
  product: "Producto",
  mixed: "Mixta",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value ?? 0));

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "short",
      }).format(new Date(value))
    : "-";

const getSaleItemsLabel = (sale) =>
  sale.details?.map((detail) => `${detail.quantity} x ${detail.itemName}`).join(", ") ||
  "Sin detalle";

export default function SalesManagementPage() {
  const [mode, setMode] = useState("list");
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [filters, setFilters] = useState({ query: "", from: "", to: "" });
  const [appliedFilters, setAppliedFilters] = useState({ query: "", from: "", to: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [message, setMessage] = useState("");

  const loadSales = async (currentFilters = appliedFilters) => {
    setIsLoading(true);
    setRequestError("");

    const response = await salesService.listSales(currentFilters);

    if (!response.ok) {
      setSales([]);
      setSummary(EMPTY_SUMMARY);
      setRequestError(response.message);
      setIsLoading(false);
      return response;
    }

    setSales(response.data.sales ?? []);
    setSummary(response.data.summary ?? EMPTY_SUMMARY);
    setIsLoading(false);
    return response;
  };

  useEffect(() => {
    loadSales(appliedFilters);
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
    const nextFilters = { query: "", from: "", to: "" };

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };

  const handleNewSale = () => {
    setMode("create");
    setSelectedSale(null);
    setMessage("");
  };

  const handleSaleSaved = async (response) => {
    setMode("list");
    setMessage(response.message ?? "Venta registrada correctamente.");
    await loadSales(appliedFilters);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    const response = await salesService.deleteSale(confirmDelete.id);

    if (!response.ok) {
      setRequestError(response.message);
      setConfirmDelete(null);
      return;
    }

    setMessage(response.message ?? "Venta eliminada correctamente.");
    setConfirmDelete(null);
    await loadSales(appliedFilters);
  };

  if (mode === "create") {
    return (
      <div className="page-shell sales-management-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Ventas</span>
            <h1>Nueva venta</h1>
            <p>Registra productos, servicios o una venta mixta.</p>
          </div>
        </div>

        <SaleForm
          embedded
          onCancel={() => setMode("list")}
          onSaved={handleSaleSaved}
        />
      </div>
    );
  }

  return (
    <div className="page-shell sales-management-page">
      <div className="page-header sales-management-header">
        <div>
          <span className="eyebrow">Ventas</span>
          <h1>Gestion de Ventas</h1>
          <p>Administra y consulta todas las ventas registradas. {periodLabel}</p>
        </div>
        <button className="button button-primary" type="button" onClick={handleNewSale}>
          + Nueva venta
        </button>
      </div>

      <section className="sales-kpi-grid">
        <div className="sales-kpi-card">
          <span>Ventas hoy</span>
          <strong>{formatCurrency(summary.todayTotal)}</strong>
          <small>{summary.todaySales} ventas</small>
        </div>
        <div className="sales-kpi-card">
          <span>Clientes hoy</span>
          <strong>{summary.todayClients}</strong>
          <small>Clientes atendidos</small>
        </div>
        <div className="sales-kpi-card">
          <span>Ticket promedio</span>
          <strong>{formatCurrency(summary.averageTicket)}</strong>
          <small>Promedio por venta filtrada</small>
        </div>
        <div className="sales-kpi-card">
          <span>Ingresos del mes</span>
          <strong>{formatCurrency(summary.monthIncome)}</strong>
          <small>Ventas del mes actual</small>
        </div>
      </section>

      <section className="panel sales-filter-panel">
        <input
          className="field"
          type="search"
          placeholder="Buscar por cliente, empleado, folio o item..."
          value={filters.query}
          onChange={(event) => updateFilter("query", event.target.value)}
        />
        <input
          className="field"
          type="date"
          value={filters.from}
          onChange={(event) => updateFilter("from", event.target.value)}
        />
        <input
          className="field"
          type="date"
          value={filters.to}
          onChange={(event) => updateFilter("to", event.target.value)}
        />
        <button className="button button-primary" type="button" onClick={applyFilters}>
          Filtrar
        </button>
        <button className="button button-secondary" type="button" onClick={clearFilters}>
          Limpiar
        </button>
      </section>

      {requestError ? <p className="form-error">{requestError}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}

      <section className="panel sales-table-panel">
        {isLoading ? (
          <p className="empty-text">Cargando ventas...</p>
        ) : sales.length === 0 ? (
          <p className="empty-text">No hay ventas registradas con los filtros seleccionados.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table sales-management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td>{sale.client?.name ?? "Sin cliente"}</td>
                    <td>{sale.employee?.name ?? "Sin empleado"}</td>
                    <td>{formatDate(sale.soldAt)}</td>
                    <td>{TYPE_LABELS[sale.type] ?? sale.type}</td>
                    <td>{formatCurrency(sale.total)}</td>
                    <td className="actions-cell sales-actions">
                      <button className="icon-action" type="button" title="Ver detalle" onClick={() => setSelectedSale(sale)}>
                        Ver
                      </button>
                      <button className="icon-action" type="button" title="Ticket" onClick={() => setSelectedSale(sale)}>
                        Ticket
                      </button>
                      <button className="icon-action" type="button" title="Editar" onClick={() => setSelectedSale(sale)}>
                        Editar
                      </button>
                      <button className="icon-action danger" type="button" title="Eliminar" onClick={() => setConfirmDelete(sale)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSale ? (
        <div className="modal-backdrop">
          <section className="history-dialog">
            <div className="history-header">
              <div>
                <span className="eyebrow">Detalle de venta</span>
                <h3>{selectedSale.folio}</h3>
                <p>{selectedSale.client?.name} - {formatDate(selectedSale.soldAt)}</p>
              </div>
              <button className="button button-secondary" type="button" onClick={() => setSelectedSale(null)}>
                Cerrar
              </button>
            </div>
            <div className="sale-summary client-visit-summary">
              <div>
                <span>Total</span>
                <strong>{formatCurrency(selectedSale.total)}</strong>
              </div>
              <div>
                <span>Pago</span>
                <strong>{selectedSale.paymentMethodLabel}</strong>
              </div>
            </div>
            <p className="empty-text">{getSaleItemsLabel(selectedSale)}</p>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Eliminar venta"
        message={`Se eliminara la venta "${confirmDelete?.folio}".`}
        details={[
          "La venta dejara de aparecer en el listado.",
          "Tambien se quitaran sus detalles, visita y comision asociada.",
        ]}
        variant="danger"
        confirmLabel="Eliminar"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
