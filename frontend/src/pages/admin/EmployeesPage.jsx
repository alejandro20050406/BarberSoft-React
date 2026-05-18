import { useState } from "react";
import FormField from "../../components/forms/FormField";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useEmployees } from "../../hooks/useEmployees";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  status: "active",
  joinDate: "",
  username: "",
  password: "",
};

const STATUS_LABELS = {
  active: "ACTIVO",
  inactive: "INACTIVO",
};

const buildEmptyForm = () => ({ ...EMPTY_FORM });

export default function EmployeesPage() {
  const {
    employees,
    filters,
    setFilters,
    isLoading,
    isSaving,
    requestError,
    loadEmployees,
    createEmployee,
    updateEmployee,
    setEmployeeStatus,
  } = useEmployees();
  const [form, setForm] = useState(buildEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState("");
  const [confirm, setConfirm] = useState(null);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiMessage("");
  };

  const handleSubmit = async () => {
    const response =
      editingId === null
        ? await createEmployee(form)
        : await updateEmployee(editingId, form);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setApiMessage(response.message);
      return;
    }

    handleReset();
  };

  const handleNewEmployee = () => {
    setForm(buildEmptyForm());
    setEditingId(null);
    setErrors({});
    setApiMessage("");
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone,
      email: employee.email,
      status: employee.status,
      joinDate: employee.joinDate,
      username: employee.username,
      password: employee.password,
    });
    setErrors({});
    setApiMessage("");
    setShowForm(true);
  };

  const handleReset = () => {
    setForm(buildEmptyForm());
    setEditingId(null);
    setErrors({});
    setApiMessage("");
    setShowForm(false);
  };

  const applyStatusChange = async () => {
    if (!confirm) return;

    const response = await setEmployeeStatus(confirm.id, confirm.nextStatus);
    if (!response.ok) {
      setApiMessage(response.message);
      setConfirm(null);
      return;
    }

    if (editingId === confirm.id) handleReset();
    setConfirm(null);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Administracion</span>
          <h1>Empleados</h1>
        </div>
        {!showForm && (
          <button className="button button-primary" type="button" onClick={handleNewEmployee}>
            Nuevo empleado
          </button>
        )}
      </div>

      {showForm && (
        <section className="panel" key={editingId ?? "new-employee"}>
          <h2>{editingId !== null ? "Editar empleado" : "Datos Personales"}</h2>
          <div className="form-grid">
            <FormField label="Nombre" error={errors.firstName}>
              <input className="field" value={form.firstName} onChange={(event) => handleChange("firstName", event.target.value)} />
            </FormField>
            <FormField label="Apellido" error={errors.lastName}>
              <input className="field" value={form.lastName} onChange={(event) => handleChange("lastName", event.target.value)} />
            </FormField>
            <FormField label="Telefono" error={errors.phone}>
              <input className="field" value={form.phone} placeholder="3121234567" onChange={(event) => handleChange("phone", event.target.value)} />
            </FormField>
            <FormField label="Correo electronico" error={errors.email}>
              <input className="field" type="email" value={form.email} onChange={(event) => handleChange("email", event.target.value)} />
            </FormField>
          </div>

          <hr className="divider" />

          <h2>Datos Laborales</h2>
          <div className="form-grid">
            <FormField label="Estado" error={errors.status}>
              <select className="field" value={form.status} onChange={(event) => handleChange("status", event.target.value)}>
                <option value="active">ACTIVO</option>
                <option value="inactive">INACTIVO</option>
              </select>
            </FormField>
            <FormField label="Fecha de ingreso" error={errors.joinDate}>
              <input className="field" type="date" value={form.joinDate} onChange={(event) => handleChange("joinDate", event.target.value)} />
            </FormField>
          </div>

          <hr className="divider" />

          <h2>Cuenta de acceso</h2>
          <div className="form-grid">
            <FormField label="Usuario" error={errors.username}>
              <input
                className="field"
                autoComplete="new-username"
                name="employee-username"
                value={form.username}
                onChange={(event) => handleChange("username", event.target.value)}
              />
            </FormField>
            <FormField label="Contrasena" error={errors.password}>
              <input
                className="field"
                type="password"
                autoComplete="new-password"
                name="employee-password"
                value={form.password}
                onChange={(event) => handleChange("password", event.target.value)}
              />
            </FormField>
          </div>

          {apiMessage ? <p className="form-error">{apiMessage}</p> : null}

          <div className="form-actions">
            <button className="button button-secondary" type="button" onClick={handleReset}>
              Cancelar
            </button>
            <button className="button button-primary" type="button" onClick={handleSubmit}>
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="toolbar">
          <input className="field" type="search" placeholder="Buscar empleado, usuario o correo" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} />
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
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Telefono</th>
                  <th>Correo</th>
                  <th>Fecha de ingreso</th>
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const fullName = `${employee.firstName} ${employee.lastName}`.trim();

                  return (
                    <tr key={employee.id} className={editingId === employee.id ? "editing-row" : ""}>
                      <td>{fullName}</td>
                      <td>{employee.username}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.email}</td>
                      <td>{employee.joinDate}</td>
                      <td><span className={`status-pill ${employee.status}`}>{STATUS_LABELS[employee.status] ?? employee.status}</span></td>
                      <td className="actions-cell">
                        <button className="link-button" type="button" onClick={() => handleEdit(employee)}>Editar</button>
                        <button className="link-button danger" type="button" onClick={() => setConfirm({
                          id: employee.id,
                          name: fullName,
                          nextStatus: employee.status === "active" ? "inactive" : "active",
                        })}>
                          {employee.status === "active" ? "Desactivar" : "Activar"}
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
        title={confirm?.nextStatus === "inactive" ? "Desactivar empleado" : "Activar empleado"}
        message={
          confirm?.nextStatus === "inactive"
            ? `Se dara de baja logica a "${confirm?.name}".`
            : `Se reactivara a "${confirm?.name}".`
        }
        details={
          confirm?.nextStatus === "inactive"
            ? [
                "El empleado no estara disponible para registrar ventas nuevas.",
                "Sus ventas, comisiones e historial se conservaran.",
                "Podras activarlo nuevamente si vuelve a operar.",
              ]
            : ["El empleado volvera a estar disponible para ventas nuevas."]
        }
        variant={confirm?.nextStatus === "inactive" ? "danger" : "info"}
        confirmLabel={confirm?.nextStatus === "inactive" ? "Desactivar" : "Activar"}
        onCancel={() => setConfirm(null)}
        onConfirm={applyStatusChange}
      />
    </div>
  );
}
