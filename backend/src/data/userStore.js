import { randomUUID } from "node:crypto";

const usersSeed = [
  {
    id: 1,
    username: "admin",
    password: "1234",
    role: "admin",
    name: "Administrador",
    email: "admin@barbersoft.local",
    phone: "3120000000",
    status: "active",
    permissions: [
      "dashboard:read",
      "products:manage",
      "services:manage",
      "categories:manage",
      "employees:manage",
      "clients:manage",
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
    email: "juan@barbersoft.local",
    phone: "3121111111",
    status: "active",
    permissions: ["dashboard:read", "sales:create", "sales:own:read", "cash:close"],
  },
];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function toSessionUser(user) {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function createUserStore(seed) {
  let users = seed.map((user) => ({ ...user }));
  const sessions = new Map();

  const findById = (id) => users.find((user) => user.id === id);
  const findByUsername = (username) =>
    users.find((user) => normalize(user.username) === normalize(username));

  return {
    authenticate(payload) {
      const username = payload.username?.trim() ?? "";
      const password = payload.password?.trim() ?? "";
      const requestedRole = payload.role?.trim();
      const user = findByUsername(username);

      if (!username || !password) {
        return makeError("Usuario y contrasena son obligatorios.", {}, 422);
      }

      if (
        !user ||
        user.password !== password ||
        user.status !== "active" ||
        (requestedRole && user.role !== requestedRole)
      ) {
        return makeError("Credenciales incorrectas o acceso inactivo.", {}, 401);
      }

      const token = randomUUID();
      sessions.set(token, user.id);

      return {
        ok: true,
        status: 200,
        data: {
          token,
          user: toSessionUser(user),
        },
      };
    },

    findByToken(token) {
      const userId = sessions.get(token);
      const user = findById(userId);

      if (!user || user.status !== "active") {
        return null;
      }

      return user;
    },

    getProfile(userId) {
      const user = findById(userId);

      if (!user) {
        return makeError("Usuario no encontrado.", {}, 404);
      }

      return { ok: true, status: 200, data: toSessionUser(user) };
    },

    updateProfile(userId, payload) {
      const currentUser = findById(userId);

      if (!currentUser) {
        return makeError("Usuario no encontrado.", {}, 404);
      }

      const errors = {};
      const name = payload.name?.trim() ?? "";
      const email = payload.email?.trim() ?? "";
      const phone = payload.phone?.trim() ?? "";

      if (!name) errors.name = "El nombre es obligatorio.";
      if (email && !email.includes("@")) errors.email = "Ingrese un correo valido.";

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo actualizar el perfil.", errors, 422);
      }

      const updatedUser = {
        ...currentUser,
        name,
        email,
        phone,
      };

      users = users.map((user) => (user.id === userId ? updatedUser : user));

      return { ok: true, status: 200, data: toSessionUser(updatedUser) };
    },
  };
}

export const userStore = createUserStore(usersSeed);
