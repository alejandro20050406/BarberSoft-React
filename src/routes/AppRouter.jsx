// src/routes/AppRouter.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PATHS } from "./paths";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

import HomePage from "../pages/public/HomePage";
import LoginAdminPage from "../pages/public/LoginAdminPage";
import LoginEmployeePage from "../pages/public/LoginEmployeePage";

import AdminMenuPage from "../pages/admin/AdminMenuPage";
import EmployeeMenuPage from "../pages/employee/EmployeeMenuPage";

import ProductCategoriesPage from "../pages/admin/ProductCategoriesPage";
import ServiceCategoriesPage from "../pages/admin/ServiceCategoriesPage";
import ProductsPage from "../pages/admin/ProductsPage";
import ServicesPage from "../pages/admin/ServicesPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route path={PATHS.home} element={<HomePage />} />
          <Route path={PATHS.adminLogin} element={<LoginAdminPage />} />
          <Route path={PATHS.employeeLogin} element={<LoginEmployeePage />} />
        </Route>

        {/* Rutas de administrador */}
        <Route element={<AdminLayout />}>
          <Route path={PATHS.admin} element={<AdminMenuPage />} />
          <Route path={PATHS.adminSalesProduct} element={<div>Venta de Producto</div>} />
          <Route path={PATHS.adminSalesService} element={<div>Venta de Servicio</div>} />
          <Route path={PATHS.adminSalesList} element={<div>Lista de Ventas</div>} />
          <Route path={PATHS.adminReports} element={<div>Reportes</div>} />

           <Route path={PATHS.adminProducts} element={<ProductsPage />} />
          <Route path={PATHS.adminServices} element={<ServicesPage />} />
          <Route path={PATHS.adminProductCategories} element={<ProductCategoriesPage />} />
          <Route path={PATHS.adminServiceCategories} element={<ServiceCategoriesPage />} />
        </Route>

        {/* Rutas de empleado */}
        <Route element={<EmployeeLayout />}>
          <Route path={PATHS.employee} element={<EmployeeMenuPage />} />
          <Route path={PATHS.employeeSalesProduct} element={<div>Venta de Producto</div>} />
          <Route path={PATHS.employeeSalesService} element={<div>Venta de Servicio</div>} />
          <Route path={PATHS.employeeMySales} element={<div>Mis Ventas</div>} />
          <Route path={PATHS.employeeCashClosing} element={<div>Corte de Caja</div>} />
        </Route>

        <Route path="*" element={<Navigate to={PATHS.home} replace />} />

      </Routes>
    </BrowserRouter>
  );
}