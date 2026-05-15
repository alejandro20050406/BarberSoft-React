import { useState } from "react";
import CatalogForm from "../../components/forms/CatalogForm";
import FormField from "../../components/forms/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useClients } from "../../hooks/useClients";
import { clientsService } from "../../services/clientsService";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  notes: "",
};

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Sin visitas";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value ?? 0);

export default function ClientsPage() {
  const {
    clients,
    filters,
    setFilters,
    isLoading,
    isSaving,
    requestError,
    loadClients,
    createClient,
    updateClient,
    setClientStatus,
  } = useClients();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [visitHistory, setVisitHistory] = useState(null);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [visitsError, setVisitsError] = useState("");

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async () => {
    const response =
      editingId === null
        ? await createClient(form)
        : await updateClient(editingId, form);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setFormError(response.message);
      return;
    }

    handleReset();
  };

  const handleEdit = (client) => {
    setEditingId(client.id);
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      notes: client.notes ?? "",
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

    const response = await setClientStatus(confirm.id, confirm.nextStatus);
    if (!response.ok) {
      setFormError(response.message);
      setConfirm(null);
      return;
    }

    if (editingId === confirm.id) handleReset();
    setConfirm(null);
  };

  const openVisitHistory = async (client) => {
    setVisitHistory({
      client,
      visitCount: client.visitCount ?? 0,
      visits: [],
    });
    setVisitsError("");
    setIsLoadingVisits(true);

    const response = await clientsService.getVisits(client.id);

    setIsLoadingVisits(false);

    if (!response.ok) {
      setVisitsError(response.message);
      return;
    }

    setVisitHistory(response.data);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Administracion</span>
          <h1>Clientes</h1>
        </div>
        {!showForm && (
          <button className="button button-primary" type="button" onClick={() => setShowForm(true)}>
            Nuevo cliente
          </button>
        )}
      </div>

      {showForm && (
        <CatalogForm
          title={editingId !== null ? "Editar cliente" : "Crear cliente"}
          errorMessage={formError}
          primaryLabel={editingId !== null ? "Guardar cambios" : "Guardar"}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={handleReset}
        >
          <FormField label="Nombre" error={errors.firstName}>
            <input className="field" value={form.firstName} onChange={(event) => handleChange("firstName", event.target.value)} />
          </FormField>
          <FormField label="Apellido" error={errors.lastName}>
            <input className="field" value={form.lastName} onChange={(event) => handleChange("lastName", event.target.value)} />
          </FormField>
          <FormField label="Telefono" error={errors.phone}>
            <input className="field" value={form.phone} onChange={(event) => handleChange("phone", event.target.value)} />
          </FormField>
          <FormField label="Correo" error={errors.email}>
            <input className="field" type="email" value={form.email} onChange={(event) => handleChange("email", event.target.value)} />
          </FormField>
          <FormField label="Notas" error={errors.notes} fullWidth>
            <textarea className="field field-textarea" value={form.notes} onChange={(event) => handleChange("notes", event.target.value)} />
          </FormField>
        </CatalogForm>
      )}

      <section className="panel">
        <div className="toolbar">
          <input
            className="field"
            type="search"
            placeholder="Buscar nombre, telefono o correo"
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          />
          <select className="field select-field" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {isLoading ? (
          <p className="empty-text">Cargando clientes...</p>
        ) : requestError ? (
          <div>
            <p className="form-error">{requestError}</p>
            <button className="button button-secondary" type="button" onClick={() => loadClients()}>
              Reintentar
            </button>
          </div>
        ) : clients.length === 0 ? (
          <p className="empty-text">No hay clientes con esos filtros.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table wide-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Telefono</th>
                  <th>Correo</th>
                  <th>Notas</th>
                  <th>Visitas</th>
                  <th>Ultima visita</th>
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const name = `${client.firstName} ${client.lastName}`.trim();

                  return (
                    <tr key={client.id} className={editingId === client.id ? "editing-row" : ""}>
                      <td>{name}</td>
                      <td>{client.phone}</td>
                      <td>{client.email || "Sin correo"}</td>
                      <td className="muted-text">{client.notes || "Sin notas"}</td>
                      <td><strong>{client.visitCount ?? 0}</strong></td>
                      <td className="muted-text">{formatDateTime(client.lastVisitAt)}</td>
                      <td><span className={`status-pill ${client.status}`}>{client.status === "active" ? "Activo" : "Inactivo"}</span></td>
                      <td className="actions-cell">
                        <button className="link-button" type="button" onClick={() => openVisitHistory(client)}>Historial</button>
                        <button className="link-button" type="button" onClick={() => handleEdit(client)}>Editar</button>
                        <button className="link-button danger" type="button" onClick={() => setConfirm({
                          id: client.id,
                          name,
                          nextStatus: client.status === "active" ? "inactive" : "active",
                        })}>
                          {client.status === "active" ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {visitHistory ? (
        <div className="modal-backdrop" role="presentation">
          <section className="history-dialog" role="dialog" aria-modal="true">
            <div className="history-header">
              <div>
                <span className="eyebrow">Historial de visitas</span>
                <h3>{`${visitHistory.client.firstName} ${visitHistory.client.lastName}`.trim()}</h3>
              </div>
              <button className="button button-secondary" type="button" onClick={() => setVisitHistory(null)}>
                Cerrar
              </button>
            </div>

            <div className="sale-summary client-visit-summary">
              <div>
                <span>Total visitas</span>
                <strong>{visitHistory.visitCount}</strong>
              </div>
              <div>
                <span>Ultima visita</span>
                <strong>{formatDateTime(visitHistory.visits[0]?.visitedAt)}</strong>
              </div>
            </div>

            {isLoadingVisits ? (
              <p className="empty-text">Cargando historial...</p>
            ) : visitsError ? (
              <p className="form-error">{visitsError}</p>
            ) : visitHistory.visits.length === 0 ? (
              <p className="empty-text">Este cliente aun no tiene visitas registradas.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Servicio</th>
                      <th>Empleado</th>
                      <th>Folio</th>
                      <th>Total</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitHistory.visits.map((visit) => (
                      <tr key={visit.id}>
                        <td>{formatDateTime(visit.visitedAt)}</td>
                        <td>{visit.service?.name ?? "Servicio no disponible"}</td>
                        <td>{visit.employee?.name ?? "Empleado no disponible"}</td>
                        <td>{visit.sale?.folio ?? "-"}</td>
                        <td>{formatCurrency(visit.sale?.total)}</td>
                        <td className="muted-text">{visit.notes || "Sin notas"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
