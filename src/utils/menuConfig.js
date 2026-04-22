// src/utils/menuConfig.js

import { PATHS } from "../routes/paths";

export const adminMenu = [
  { label: "Dashboard", path: PATHS.admin },
  { label: "Venta de producto", path: PATHS.adminSalesProduct },
  { label: "Venta de servicio", path: PATHS.adminSalesService },
  { label: "Lista de ventas", path: PATHS.adminSalesList },
  { label: "Empleados", path: PATHS.adminEmployees },
  { label: "Clientes", path: PATHS.adminClients },
  { label: "Productos", path: PATHS.adminProducts },
  { label: "Servicios", path: PATHS.adminServices },
  { label: "Categorías de productos", path: PATHS.adminProductCategories },
  { label: "Categorías de servicios", path: PATHS.adminServiceCategories },
  { label: "Reportes", path: PATHS.adminReports },
];

export const employeeMenu = [
  { label: "Dashboard", path: PATHS.employee },
  { label: "Venta de producto", path: PATHS.employeeSalesProduct },
  { label: "Venta de servicio", path: PATHS.employeeSalesService },
  { label: "Mis ventas", path: PATHS.employeeMySales },
  { label: "Corte de caja", path: PATHS.employeeCashClosing },
];