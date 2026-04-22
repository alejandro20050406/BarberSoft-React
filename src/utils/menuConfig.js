// src/utils/menuConfig.js

import { PATHS } from "../routes/paths";

export const adminMenu = [
  { label: "Inicio", path: PATHS.admin },
  { label: "Productos", path: PATHS.adminProducts },
  { label: "Servicios", path: PATHS.adminServices },
  { label: "Cat. Productos", path: PATHS.adminProductCategories },
  { label: "Cat. Servicios", path: PATHS.adminServiceCategories },
  { label: "Empleados", path: PATHS.adminEmployees },
  { label: "Clientes", path: PATHS.adminClients },
  { label: "Reportes", path: PATHS.adminReports },
];

export const employeeMenu = [
  { label: "Inicio", path: PATHS.employee },
  { label: "Venta Producto", path: PATHS.employeeSalesProduct },
  { label: "Venta Servicio", path: PATHS.employeeSalesService },
  { label: "Mis Ventas", path: PATHS.employeeMySales },
  { label: "Corte de Caja", path: PATHS.employeeCashClosing },
];