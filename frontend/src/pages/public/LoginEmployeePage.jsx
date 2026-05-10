import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { employeesService } from "../../services/employeesService";

const EMPLOYEE_PERMISSIONS = [
  "dashboard:read",
  "sales:create",
  "sales:own:read",
  "cash:close",
];

const LoginEmployeePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    const response = await employeesService.list({ query: username.trim(), status: "active" });

    setIsLoading(false);

    if (!response.ok) {
      setError(response.message);
      return;
    }

    const employee = response.data.find(
      (candidate) =>
        candidate.username === username.trim() &&
        candidate.password === password.trim() &&
        candidate.status === "active",
    );

    if (!employee) {
      setError("Credenciales incorrectas o acceso de empleado inactivo.");
      return;
    }

    const user = {
      id: employee.id,
      username: employee.username,
      password: employee.password,
      role: "employee",
      name: employee.name,
      status: employee.status,
      permissions: EMPLOYEE_PERMISSIONS,
    };

    localStorage.setItem("user", JSON.stringify(user));
    navigate(PATHS.employee);
  };

  return (
    <div className="login-page">
      <section className="login-card">
        <span className="eyebrow">BarberSoft</span>
        <h1>Acceso empleado</h1>
        <p>Registro de ventas, mis ventas y corte de caja.</p>

        <input className="field" type="text" placeholder="Usuario" value={username} onChange={(event) => setUsername(event.target.value)} />
        <input className="field" type="password" placeholder="Contrasena" value={password} onChange={(event) => setPassword(event.target.value)} />

        {error && <p className="form-error">{error}</p>}

        <button className="button button-primary" type="button" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </section>
    </div>
  );
};

export default LoginEmployeePage;
