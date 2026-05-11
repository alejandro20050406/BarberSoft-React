import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { authService } from "../../services/authService";

const LoginEmployeePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    const response = await authService.login({ username, password, role: "employee" });

    setIsLoading(false);

    if (!response.ok) {
      setError(response.message);
      return;
    }

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
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </section>
    </div>
  );
};

export default LoginEmployeePage;
