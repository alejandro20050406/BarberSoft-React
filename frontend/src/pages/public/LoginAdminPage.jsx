// src/pages/public/AdminLoginPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { usersMock } from "../../mocks/users.mock";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = usersMock.find(
      (u) =>
        u.username === username &&
        u.password === password &&
        u.role === "admin"
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      navigate(PATHS.admin);
    } else {
      setError("Credenciales incorrectas o no tienes acceso de administrador.");
    }
  };

  return (
    <div className="login-page">
      <h2>Acceso Administrador</h2>

      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="login-error">{error}</p>}

      <button onClick={handleLogin}>Ingresar</button>
    </div>
  );
};

export default AdminLoginPage;