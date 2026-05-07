import { useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { serviceCategoriesMock } from "../../mocks/serviceCategories.mock";
import { servicesApi } from "../../services/mockServicesApi";

const EMPTY_FORM = { category: "", name: "", price: "", description: "" };

export default function ServicesPage() {
  const [filters, setFilters] = useState({ query: "", category: "all", status: "all" });
  const [services, setServices] = useState(() => servicesApi.list(filters).data);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState("");
  const [confirm, setConfirm] = useState(null);

  const activeCategories = serviceCategoriesMock.filter(
    (category) => category.status !== "inactive",
  );

  const visibleServices = useMemo(() => {
    const response = servicesApi.list(filters);
    return response.ok ? response.data : services;
  }, [filters, services]);

  const refreshServices = () => {
    const response = servicesApi.list({ query: "", category: "all", status: "all" });
    if (response.ok) setServices(response.data);
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiMessage("");
  };

  const handleSubmit = () => {
    const response =
      editingId === null
        ? servicesApi.create(form)
        : servicesApi.update(editingId, form);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setApiMessage(response.message);
      return;
    }

    refreshServices();
    handleReset();
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setForm({
      category: service.category,
      name: service.name,
      price: String(service.price),
      description: service.description ?? "",
    });
    setErrors({});
    setApiMessage("");
    setShowForm(true);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setApiMessage("");
    setShowForm(false);
  };

  const applyStatusChange = () => {
    if (!confirm) return;

    const response = servicesApi.setStatus(confirm.id, confirm.nextStatus);
    if (!response.ok) {
      setApiMessage(response.message);
      setConfirm(null);
      return;
    }

    refreshServices();
    if (editingId === confirm.id) handleReset();
    setConfirm(null);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Catalogo</span>
          <h1>Servicios</h1>
        </div>
        {!showForm && (
          <button className="button button-primary" type="button" onClick={() => setShowForm(true)}>
            Nuevo servicio
          </button>
        )}
      </div>

      {showForm && (
        <section className="panel">
          <h2>{editingId !== null ? "Editar servicio" : "Nuevo servicio"}</h2>
          <div className="form-grid">
            <Field label="Categoria" error={errors.category}>
              <select className="field" value={form.category} onChange={(event) => handleChange("category", event.target.value)}>
                <option value="">Seleccionar</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Nombre" error={errors.name}>
              <input className="field" value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
            </Field>
            <Field label="Precio" error={errors.price}>
              <input className="field" type="number" min="0" value={form.price} onChange={(event) => handleChange("price", event.target.value)} />
            </Field>
            <label className="field-group full-field">
              <span>Descripcion</span>
              <input className="field" value={form.description} onChange={(event) => handleChange("description", event.target.value)} />
            </label>
          </div>
          {apiMessage && <p className="form-error">{apiMessage}</p>}
          <div className="form-actions">
            <button className="button button-primary" type="button" onClick={handleSubmit}>
              {editingId !== null ? "Guardar cambios" : "Agregar servicio"}
            </button>
            <button className="button button-secondary" type="button" onClick={handleReset}>
              Cancelar
            </button>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="toolbar">
          <input className="field" type="search" placeholder="Buscar servicio" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} />
          <select className="field select-field" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            <option value="all">Todas las categorias</option>
            {serviceCategoriesMock.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <select className="field select-field" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {visibleServices.length === 0 ? (
          <p className="empty-text">No hay servicios con esos filtros.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Descripcion</th>
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleServices.map((service) => (
                  <tr key={service.id} className={editingId === service.id ? "editing-row" : ""}>
                    <td>{service.category}</td>
                    <td>{service.name}</td>
                    <td>${service.price.toFixed(2)}</td>
                    <td className="muted-text">{service.description || "Sin descripcion"}</td>
                    <td><span className={`status-pill ${service.status}`}>{service.status === "active" ? "Activo" : "Inactivo"}</span></td>
                    <td className="actions-cell">
                      <button className="link-button" type="button" onClick={() => handleEdit(service)}>Editar</button>
                      <button className="link-button danger" type="button" onClick={() => setConfirm({
                        id: service.id,
                        name: service.name,
                        nextStatus: service.status === "active" ? "inactive" : "active",
                      })}>
                        {service.status === "active" ? "Desactivar" : "Activar"}
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
