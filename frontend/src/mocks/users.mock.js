export const usersMock = [
  {
    id: 1,
    username: "admin",
    password: "1234",
    role: "admin",
    name: "Administrador",
    status: "active",
    permissions: [
      "dashboard:read",
      "products:manage",
      "services:manage",
      "categories:manage",
      "sales:manage",
      "reports:read",
    ],
  },
  {
    id: 2,
    username: "juan",
    password: "1234",
    role: "employee",
    name: "Juan Perez",
    status: "active",
    permissions: [
      "dashboard:read",
      "sales:create",
      "sales:own:read",
      "cash:close",
    ],
  },
];
