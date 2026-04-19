import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PATHS } from "./paths";

function PlaceholderPage({ title, description }) {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={PATHS.home}
          element={
            <PlaceholderPage
              title="BarberSoft"
              description="Menu principal del sistema."
            />
          }
        />

        <Route
          path={PATHS.adminLogin}
          element={
            <PlaceholderPage
              title="Login Administrador"
              description="Pantalla de acceso para administradores."
            />
          }
        />
        <Route
          path={PATHS.employeeLogin}
          element={
            <PlaceholderPage
              title="Login Empleado"
              description="Pantalla de acceso para empleados."
            />
          }
        />

        <Route
          path={PATHS.admin}
          element={
            <PlaceholderPage
              title="Dashboard Admin"
              description="Panel principal del administrador."
            />
          }
        />
        <Route
          path={PATHS.adminSalesProduct}
          element={
            <PlaceholderPage
              title="Venta de Producto"
              description="Flujo de venta de productos (admin)."
            />
          }
        />
        <Route
          path={PATHS.adminSalesService}
          element={
            <PlaceholderPage
              title="Venta de Servicio"
              description="Flujo de venta de servicios (admin)."
            />
          }
        />
        <Route
          path={PATHS.adminSalesList}
          element={
            <PlaceholderPage
              title="Lista de Ventas"
              description="Listado y consulta de ventas del admin."
            />
          }
        />
        <Route
          path={PATHS.adminReports}
          element={
            <PlaceholderPage
              title="Reportes"
              description="Vista de reportes del administrador."
            />
          }
        />

        <Route
          path={PATHS.employee}
          element={
            <PlaceholderPage
              title="Dashboard Empleado"
              description="Panel principal del empleado."
            />
          }
        />
        <Route
          path={PATHS.employeeSalesProduct}
          element={
            <PlaceholderPage
              title="Venta de Producto (Empleado)"
              description="Flujo de venta de productos para empleado."
            />
          }
        />
        <Route
          path={PATHS.employeeSalesService}
          element={
            <PlaceholderPage
              title="Venta de Servicio (Empleado)"
              description="Flujo de venta de servicios para empleado."
            />
          }
        />
        <Route
          path={PATHS.employeeMySales}
          element={
            <PlaceholderPage
              title="Mis Ventas"
              description="Historial de ventas del empleado."
            />
          }
        />
        <Route
          path={PATHS.employeeCashClosing}
          element={
            <PlaceholderPage
              title="Corte de Caja"
              description="Pantalla de corte de caja del empleado."
            />
          }
        />

        <Route path="*" element={<Navigate to={PATHS.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
