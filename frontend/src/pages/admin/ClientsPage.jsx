import { useMemo, useState } from "react";
import CatalogForm from "../../components/forms/CatalogForm";
import FormField from "../../components/forms/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useClients } from "../../hooks/useClients";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  notes: "",
};

export default function ClientsPage() {
  const [filters, setFilters] = useState({ query: "", status: "all" });
  const [clients, setClients] = useState(() => clientsService.list(filters).data);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ query: "", status: "all" });
  const [confirm, setConfirm] = useState(null);

  const visibleClients = useMemo(() => {
    const response = clientsService.list(filters);
    return response.ok ? response.data : clients;
  }, [filters, clients]);

  const refreshClients = () => {
    const response = clientsService.list({ query: "", status: "all" });
    if (response.ok) setClients(response.data);
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = () => {
    const response =
      editingId === null
        ? clientsService.create(form)
        : clientsService.update(editingId, form);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setFormError(response.message);
      return;
    }

    handleReset();
    loadClients(filters, { silent: true });
  };

  const handleEdit = (client) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      notes: client.notes,
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

    const response = clientsService.setStatus(confirm.id, confirm.nextStatus);
    if (!response.ok) {
      setRequestError(response.message);
      setConfirm(null);
      return;
    }

    if (editingId === confirm.id) handleReset();
    setConfirm(null);
    loadClients(filters, { silent: true });
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
          title={editingId !== null ? "Editar cliente" : "Crear Cliente"}
          errorMessage={apiMessage}
          primaryLabel={editingId !== null ? "Guardar cambios" : "Guardar"}
          onSubmit={handleSubmit}
          onCancel={handleReset}
        >
          <FormField label="Nombre" error={errors.name}>
            <input className="field" value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
          </FormField>
          <FormField label="Telefono" error={errors.phone}>
            <input className="field" value={form.phone} onChange={(event) => handleChange("phone", event.target.value)} />
          </FormField>
          <FormField label="Correo" error={errors.email}>
            <input className="field" type="email" value={form.email} onChange={(event) => handleChange("email", event.target.value)} />
          </FormField>
          <FormField label="Notas" error={errors.notes}>
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
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleClients.map((client) => {
                  const fullName = `${client.firstName} ${client.lastName}`.trim();

                  return (
                    <tr key={client.id} className={editingId === client.id ? "editing-row" : ""}>
                      <td>{fullName}</td>
                      <td>{client.phone}</td>
                      <td>{client.email || "Sin correo"}</td>
                      <td><span className={`status-pill ${client.status}`}>{client.status === "active" ? "Activo" : "Inactivo"}</span></td>
                      <td className="actions-cell">
                        <button className="link-button" type="button" onClick={() => handleEdit(client)}>Editar</button>
                        <button className="link-button danger" type="button" onClick={() => setConfirm({
                          id: client.id,
                          name: fullName,
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
    </div>
  );
}
