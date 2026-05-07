import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersMock } from "../../mocks/users.mock";
import { PATHS } from "../../routes/paths";

const LoginAdminPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = usersMock.find(
      (candidate) =>
        candidate.username === username &&
        candidate.password === password &&
        candidate.role === "admin" &&
        candidate.status === "active",
    );

    if (!user) {
      setError("Credenciales incorrectas o acceso de administrador inactivo.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    navigate(PATHS.admin);
  };

  return (
    <div className="login-page">
      <section className="login-card">
        <span className="eyebrow">BarberSoft</span>
        <h1>Acceso administrador</h1>
        <p>Gestion de catalogos, ventas, reportes y permisos.</p>

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

export default LoginAdminPage;
