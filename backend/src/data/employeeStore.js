const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const employeesSeed = [
  {
    id: 1,
    name: "Juan Perez",
    username: "juan01",
    password: "perez123",
    phone: "555-443-2211",
    hireDate: "2026-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Luis Medina",
    username: "luis02",
    password: "medina123",
    phone: "555-901-2020",
    hireDate: "2025-10-02",
    status: "active",
  },
];

const ACCESS_VALUE_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;

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
  const password = payload.password?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const hireDate = payload.hireDate?.trim() ?? "";

  if (!name) errors.name = "El nombre del empleado es obligatorio.";
  if (!username) errors.username = "El usuario es obligatorio.";
  if (username && (username.length < 4 || username.length > 20 || !ACCESS_VALUE_PATTERN.test(username))) {
    errors.username = "El usuario debe tener de 4 a 20 caracteres, solo letras y numeros, e incluir ambos.";
  }
  if (!password) errors.password = "La contrasena es obligatoria.";
  if (password && (password.length < 6 || !ACCESS_VALUE_PATTERN.test(password))) {
    errors.password = "La contrasena debe tener minimo 6 caracteres, solo letras y numeros, e incluir ambos.";
  }
  if (!phone) errors.phone = "El telefono es obligatorio.";
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
    password: payload.password.trim(),
    phone: payload.phone.trim(),
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
          normalize(employee.phone).includes(query);
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
