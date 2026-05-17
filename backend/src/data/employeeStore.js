import { userStore } from "./userStore.js";

const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const employeesSeed = [
  {
    id: 1,
    userId: 2,
    firstName: "Juan",
    lastName: "Perez",
    username: "juan",
    phone: "5511122233",
    email: "juan@barbersoft.local",
    password: "123456",
    joinDate: "2026-01-15",
    commissionRate: 20,
    status: "active",
  },
  {
    id: 2,
    userId: null,
    firstName: "Marco",
    lastName: "Diaz",
    username: "marco",
    phone: "5544455566",
    email: "marco@barbersoft.local",
    password: "123456",
    joinDate: "2025-11-03",
    commissionRate: 15,
    status: "active",
  },
];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function validateEmployee(payload, employees, currentId = null) {
  const errors = {};
  const firstName = payload.firstName?.trim() ?? "";
  const lastName = payload.lastName?.trim() ?? "";
  const username = payload.username?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const commissionRate = Number(payload.commissionRate ?? 0);
  const password = payload.password?.trim() ?? "";

  if (!firstName) errors.firstName = "El nombre es obligatorio.";
  if (!lastName) errors.lastName = "El apellido es obligatorio.";
  if (!username) errors.username = "El usuario es obligatorio.";
  if (!password && !currentId) errors.password = "La contrasena es obligatoria.";
  if (!phone) errors.phone = "El telefono es obligatorio.";
  if (email && !email.includes("@")) errors.email = "Ingrese un correo valido.";
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    errors.commissionRate = "Ingrese un porcentaje de comision entre 0 y 100.";
  }

  const duplicatedUsername = employees.some(
    (employee) =>
      employee.id !== currentId && normalize(employee.username) === normalize(username),
  );

  if (duplicatedUsername) {
    errors.username = "Ya existe un empleado con ese usuario.";
  }

  return errors;
}

function buildEmployee(payload, currentEmployee = {}) {
  return {
    ...currentEmployee,
    firstName: payload.firstName?.trim() ?? "",
    lastName: payload.lastName?.trim() ?? "",
    username: payload.username?.trim() ?? "",
    phone: payload.phone?.trim() ?? "",
    email: payload.email?.trim() ?? "",
    password: payload.password?.trim() ?? currentEmployee.password ?? "",
    joinDate: payload.joinDate?.trim() ?? "",
    commissionRate: Number(payload.commissionRate ?? currentEmployee.commissionRate ?? 0),
    status: VALID_STATUSES.has(payload.status) ? payload.status : currentEmployee.status ?? "active",
  };
}

function createEmployeeStore(seed) {
  let employees = seed.map((employee) => ({ ...employee }));

  const findById = (id) => employees.find((employee) => employee.id === id);
  const findByUserId = (userId) => employees.find((employee) => employee.userId === userId);
  const syncEmployeeUser = (employee) => {
    const userResult = userStore.syncEmployeeAccount(employee);

    if (!userResult.ok) {
      return { ok: false, employee, userResult };
    }

    return {
      ok: true,
      employee: {
        ...employee,
        userId: userResult.data.id,
      },
      userResult,
    };
  };

  employees = employees.map((employee) => {
    const syncResult = syncEmployeeUser(employee);

    return syncResult.ok ? syncResult.employee : employee;
  });

  return {
    list(filters = {}) {
      const query = normalize(filters.query ?? "");
      const status = filters.status ?? "all";

      const data = employees.filter((employee) => {
        const fullName = `${employee.firstName} ${employee.lastName}`;
        const matchesQuery =
          !query ||
          normalize(fullName).includes(query) ||
          normalize(employee.username).includes(query) ||
          normalize(employee.email).includes(query);
        const matchesStatus = status === "all" || employee.status === status;

        return matchesQuery && matchesStatus;
      });

      return { ok: true, status: 200, data };
    },

    findById,

    findByUserId,

    create(payload) {
      const errors = validateEmployee(payload, employees);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo crear el empleado.", errors, 422);
      }

      const id =
        employees.length > 0 ? Math.max(...employees.map((employee) => employee.id)) + 1 : 1;
      const employeeDraft = { id, userId: null, ...buildEmployee(payload) };
      const syncResult = syncEmployeeUser(employeeDraft);

      if (!syncResult.ok) {
        return syncResult.userResult;
      }

      const employee = syncResult.employee;
      employees = [...employees, employee];

      return { ok: true, status: 201, data: employee };
    },

    update(id, payload) {
      const currentEmployee = findById(id);

      if (!currentEmployee) {
        return makeError("Empleado no encontrado.", {}, 404);
      }

      const errors = validateEmployee(payload, employees, id);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo actualizar el empleado.", errors, 422);
      }

      const employeeDraft = buildEmployee(payload, currentEmployee);
      const syncResult = syncEmployeeUser(employeeDraft);

      if (!syncResult.ok) {
        return syncResult.userResult;
      }

      const employee = syncResult.employee;
      employees = employees.map((item) => (item.id === id ? employee : item));

      return { ok: true, status: 200, data: employee };
    },

    setStatus(id, status) {
      const currentEmployee = findById(id);

      if (!currentEmployee) {
        return makeError("Empleado no encontrado.", {}, 404);
      }

      if (!VALID_STATUSES.has(status)) {
        return makeError("Estado de empleado invalido.", { status: "Use active o inactive." }, 422);
      }

      const employee = { ...currentEmployee, status };
      const syncResult = syncEmployeeUser(employee);

      if (!syncResult.ok) {
        return syncResult.userResult;
      }

      employees = employees.map((item) => (item.id === id ? syncResult.employee : item));

      return { ok: true, status: 200, data: syncResult.employee };
    },
  };
}

export const employeeStore = createEmployeeStore(employeesSeed);
