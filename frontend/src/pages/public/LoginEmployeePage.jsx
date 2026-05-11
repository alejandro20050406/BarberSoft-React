import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

const LoginEmployeePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = usersMock.find(
      (candidate) =>
        candidate.username === username &&
        candidate.password === password &&
        candidate.role === "employee" &&
        candidate.status === "active",
    );

    if (!user) {
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

        <button className="button button-primary" type="button" onClick={handleLogin}>
          Ingresar
        </button>
      </section>
    </div>
  );
};

export default LoginEmployeePage;
