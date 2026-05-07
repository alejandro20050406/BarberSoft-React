export const ROLES = {
  admin: {
    id: "admin",
    label: "Administrador",
    homePath: "/admin",
    permissions: [
      "dashboard:read",
      "products:manage",
      "services:manage",
      "categories:manage",
      "sales:manage",
      "reports:read",
    ],
  },
  employee: {
    id: "employee",
    label: "Empleado",
    homePath: "/empleado",
    permissions: [
      "dashboard:read",
      "sales:create",
      "sales:own:read",
      "cash:close",
    ],
  },
};

export const hasPermission = (user, permission) => {
  if (!user || user.status !== "active") return false;
  return user.permissions?.includes(permission) ?? false;
};
