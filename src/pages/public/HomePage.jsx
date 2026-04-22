// src/pages/public/HomePage.jsx

import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>BarberSoft</h1>
      <p>Selecciona tu tipo de acceso</p>

      <div className="home-buttons">
        <button onClick={() => navigate(PATHS.adminLogin)}>
          Administrador
        </button>
        <button onClick={() => navigate(PATHS.employeeLogin)}>
          Empleado
        </button>
      </div>
    </div>
  );
};

export default HomePage;