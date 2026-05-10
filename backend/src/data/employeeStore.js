const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const employeesSeed = [
  {
    id: 1,
    name: "Juan Perez",
    username: "juan",
    phone: "555-443-2211",
    role: "Barbero",
    commissionRate: 40,
    hireDate: "2026-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Luis Medina",
    username: "luis",
    phone: "555-901-2020",
    role: "Barbero senior",
    commissionRate: 45,
    hireDate: "2025-10-02",
    status: "active",
  },
];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function validateDate(value) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function validateEmployee(payload, employees, currentId = null) {
  const errors = {};
  const name = payload.name?.trim() ?? "";
  const username = payload.username?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const role = payload.role?.trim() ?? "";
  const commissionRate = Number(payload.commissionRate);
  const hireDate = payload.hireDate?.trim() ?? "";

  if (!name) errors.name = "El nombre del empleado es obligatorio.";
  if (!username) errors.username = "El usuario es obligatorio.";
  if (!phone) errors.phone = "El telefono es obligatorio.";
  if (!role) errors.role = "El puesto es obligatorio.";
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    errors.commissionRate = "Ingrese una comision entre 0 y 100.";
  }
  if (!validateDate(hireDate)) {
    errors.hireDate = "Ingrese una fecha de ingreso valida.";
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
    name: payload.name.trim(),
    username: payload.username.trim(),
    phone: payload.phone.trim(),
    role: payload.role.trim(),
    commissionRate: Number(payload.commissionRate),
    hireDate: payload.hireDate.trim(),
    status: VALID_STATUSES.has(payload.status)
      ? payload.status
      : currentEmployee.status ?? "active",
  };
}

function createEmployeeStore(seed) {
  let employees = seed.map((employee) => ({ ...employee }));

  const findById = (id) => employees.find((employee) => employee.id === id);

  return {
    list(filters = {}) {
      const query = normalize(filters.query ?? "");
      const status = filters.status ?? "all";

      const data = employees.filter((employee) => {
        const matchesQuery =
          !query ||
          normalize(employee.name).includes(query) ||
          normalize(employee.username).includes(query) ||
          normalize(employee.role).includes(query);
        const matchesStatus = status === "all" || employee.status === status;

        return matchesQuery && matchesStatus;
      });

      return { ok: true, status: 200, data };
    },

    create(payload) {
      const errors = validateEmployee(payload, employees);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo crear el empleado.", errors, 422);
      }

      const id =
        employees.length > 0 ? Math.max(...employees.map((employee) => employee.id)) + 1 : 1;
      const employee = { id, ...buildEmployee(payload) };

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

      const employee = buildEmployee(payload, currentEmployee);
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
      employees = employees.map((item) => (item.id === id ? employee : item));

      return { ok: true, status: 200, data: employee };
    },
  };
}

export const employeeStore = createEmployeeStore(employeesSeed);
