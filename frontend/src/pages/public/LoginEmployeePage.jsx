// src/pages/public/EmployeeLoginPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { usersMock } from "../../mocks/users.mock";

const EmployeeLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = usersMock.find(
      (u) =>
        u.username === username &&
        u.password === password &&
        u.role === "employee"
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      navigate(PATHS.employee);
    } else {
      setError("Credenciales incorrectas o no tienes acceso de empleado.");
    }
  };

  return (
    <div className="login-page">
      <h2>Acceso Empleado</h2>

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

export default EmployeeLoginPage;