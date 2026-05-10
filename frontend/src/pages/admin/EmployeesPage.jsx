import { useCallback, useEffect, useState } from "react";
import CatalogForm from "../../components/forms/CatalogForm";
import FormField from "../../components/forms/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { employeesService } from "../../services/employeesService";

const EMPTY_FORM = {
  name: "",
  username: "",
  phone: "",
  role: "",
  commissionRate: "",
  hireDate: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ query: "", status: "all" });
  const [confirm, setConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [formError, setFormError] = useState("");

  const loadEmployees = useCallback(
    async (currentFilters = filters, options = {}) => {
      if (!options.silent) setIsLoading(true);
      setRequestError("");

      const response = await employeesService.list(currentFilters);

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setEmployees(response.data);
      }

      if (!options.silent) setIsLoading(false);
    },
    [filters],
  );

  useEffect(() => {
    let isActive = true;

    async function fetchEmployees() {
      setIsLoading(true);
      setRequestError("");

      const response = await employeesService.list(filters);

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setEmployees(response.data);
      }

      setIsLoading(false);
    }

    fetchEmployees();

    return () => {
      isActive = false;
    };
  }, [filters]);

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
        ? await employeesService.create(form)
        : await employeesService.update(editingId, form);

    setIsSaving(false);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setFormError(response.message);
      return;
    }

    handleReset();
    loadEmployees(filters, { silent: true });
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      username: employee.username,
      phone: employee.phone,
      role: employee.role,
      commissionRate: String(employee.commissionRate),
      hireDate: employee.hireDate,
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

    const response = await employeesService.setStatus(confirm.id, confirm.nextStatus);

    setIsSaving(false);

    if (!response.ok) {
      setRequestError(response.message);
      setConfirm(null);
      return;
    }

    if (editingId === confirm.id) handleReset();
    setConfirm(null);
    loadEmployees(filters, { silent: true });
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Administracion</span>
          <h1>Empleados</h1>
        </div>
        {!showForm && (
          <button className="button button-primary" type="button" onClick={() => setShowForm(true)}>
            Nuevo empleado
          </button>
        )}
      </div>

      {showForm && (
        <CatalogForm
          title={editingId !== null ? "Editar empleado" : "Nuevo empleado"}
          errorMessage={formError}
          primaryLabel={editingId !== null ? "Guardar cambios" : "Agregar empleado"}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={handleReset}
        >
          <FormField label="Nombre" error={errors.name}>
            <input className="field" value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
          </FormField>
          <FormField label="Usuario" error={errors.username}>
            <input className="field" value={form.username} onChange={(event) => handleChange("username", event.target.value)} />
          </FormField>
          <FormField label="Telefono" error={errors.phone}>
            <input className="field" value={form.phone} onChange={(event) => handleChange("phone", event.target.value)} />
          </FormField>
          <FormField label="Puesto" error={errors.role}>
            <input className="field" value={form.role} onChange={(event) => handleChange("role", event.target.value)} />
          </FormField>
          <FormField label="Comision (%)" error={errors.commissionRate}>
            <input className="field" type="number" min="0" max="100" step="1" value={form.commissionRate} onChange={(event) => handleChange("commissionRate", event.target.value)} />
          </FormField>
          <FormField label="Fecha de ingreso" error={errors.hireDate}>
            <input className="field" type="date" value={form.hireDate} onChange={(event) => handleChange("hireDate", event.target.value)} />
          </FormField>
        </CatalogForm>
      )}

      <section className="panel">
        <div className="toolbar">
          <input
            className="field"
            type="search"
            placeholder="Buscar nombre, usuario o puesto"
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
          <p className="empty-text">Cargando empleados...</p>
        ) : requestError ? (
          <div>
            <p className="form-error">{requestError}</p>
            <button className="button button-secondary" type="button" onClick={() => loadEmployees()}>
              Reintentar
            </button>
          </div>
        ) : employees.length === 0 ? (
          <p className="empty-text">No hay empleados con esos filtros.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table wide-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Telefono</th>
                  <th>Puesto</th>
                  <th>Comision</th>
                  <th>Ingreso</th>
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className={editingId === employee.id ? "editing-row" : ""}>
                    <td>{employee.name}</td>
                    <td>{employee.username}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.role}</td>
                    <td>{employee.commissionRate}%</td>
                    <td>{employee.hireDate}</td>
                    <td><span className={`status-pill ${employee.status}`}>{employee.status === "active" ? "Activo" : "Inactivo"}</span></td>
                    <td className="actions-cell">
                      <button className="link-button" type="button" onClick={() => handleEdit(employee)}>Editar</button>
                      <button className="link-button danger" type="button" onClick={() => setConfirm({
                        id: employee.id,
                        name: employee.name,
                        nextStatus: employee.status === "active" ? "inactive" : "active",
                      })}>
                        {employee.status === "active" ? "Desactivar" : "Activar"}
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
