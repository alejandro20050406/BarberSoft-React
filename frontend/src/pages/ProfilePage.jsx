import { useMemo, useState } from "react";

const EMPTY_USER = {
  name: "Usuario",
  username: "",
  role: "admin",
  status: "active",
  permissions: [],
};

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) ?? EMPTY_USER;
  } catch {
    return EMPTY_USER;
  }
}

export default function ProfilePage() {
  const storedUser = useMemo(() => readStoredUser(), []);
  const [user, setUser] = useState(storedUser);
  const [form, setForm] = useState({
    name: storedUser.name ?? "",
    username: storedUser.username ?? "",
    password: storedUser.password ?? "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roleLabel = user.role === "admin" ? "Administrador" : "Empleado";
  const statusLabel = user.status === "active" ? "Activo" : "Inactivo";

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!form.username.trim()) {
      setError("El usuario es obligatorio.");
      return;
    }

    if (!form.password.trim()) {
      setError("La contrasena es obligatoria.");
      return;
    }

    const nextUser = {
      ...user,
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password.trim(),
    };

    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    setSuccess("Perfil actualizado.");
  };

  return (
    <div className="page-shell narrow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Cuenta</span>
          <h1>Perfil de usuario</h1>
        </div>
      </div>

      <section className="panel profile-summary">
        <div className="profile-avatar" aria-hidden="true">
          {user.name?.slice(0, 1).toUpperCase() || "U"}
        </div>
        <div>
          <h2>{user.name}</h2>
          <p>{roleLabel}</p>
        </div>
        <span className={`status-pill ${user.status}`}>{statusLabel}</span>
      </section>

      <section className="panel">
        <h2>Datos de acceso</h2>
        <div className="form-grid">
          <label className="field-group">
            <span>Nombre</span>
            <input className="field" value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
          </label>
          <label className="field-group">
            <span>Usuario</span>
            <input className="field" value={form.username} onChange={(event) => handleChange("username", event.target.value)} />
          </label>
          <label className="field-group">
            <span>Contrasena</span>
            <input className="field" type="password" value={form.password} onChange={(event) => handleChange("password", event.target.value)} />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <div className="form-actions">
          <button className="button button-primary" type="button" onClick={handleSubmit}>
            Guardar perfil
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Permisos</h2>
        <div className="permission-list">
          {(user.permissions ?? []).map((permission) => (
            <span className="permission-pill" key={permission}>
              {permission}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
