import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div>
          <span className="eyebrow">Monkey's Barber Shop</span>
          <h1>BarberSoft</h1>
          <p>Control de servicios, productos, ventas e inventario por rol.</p>
        </div>

        <div className="access-grid">
          <button className="access-card" type="button" onClick={() => navigate(PATHS.adminLogin)}>
            <strong>Administrador</strong>
            <span>Catalogos, reportes y gestion completa.</span>
          </button>
          <button className="access-card" type="button" onClick={() => navigate(PATHS.employeeLogin)}>
            <strong>Empleado</strong>
            <span>Ventas, comisiones y corte de caja.</span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
