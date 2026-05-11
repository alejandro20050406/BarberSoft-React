const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const employeesSeed = [
  {
    id: 1,
    firstName: "Juan",
    lastName: "Perez",
    username: "juan",
    phone: "3121111111",
    email: "juan@barbersoft.local",
    password: "1234",
    joinDate: "2026-01-15",
    status: "active",
  },
  {
    id: 2,
    firstName: "Maria",
    lastName: "Lopez",
    username: "maria",
    phone: "3122222222",
    email: "maria@barbersoft.local",
    password: "1234",
    joinDate: "2026-02-01",
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
  const password = payload.password?.trim() ?? "";
  const joinDate = payload.joinDate?.trim() ?? "";
  const status = payload.status?.trim() ?? "";

  if (!firstName) errors.firstName = "El nombre es obligatorio.";
  if (!lastName) errors.lastName = "El apellido es obligatorio.";
  if (!username) errors.username = "El usuario es obligatorio.";
  if (!phone) errors.phone = "El telefono es obligatorio.";
  if (!email || !email.includes("@")) errors.email = "Ingrese un correo valido.";
  if (!password) errors.password = "La contrasena es obligatoria.";
  if (!joinDate) errors.joinDate = "La fecha de ingreso es obligatoria.";
  if (!status) errors.status = "Seleccione un estado.";

  const duplicated = employees.some(
    (employee) =>
      employee.id !== currentId &&
      (normalize(employee.username) === normalize(username) ||
        normalize(employee.email) === normalize(email)),
  );

  if (duplicated) {
    if (username) errors.username = "Ya existe un empleado con ese usuario.";
    if (email) errors.email = "Ya existe un empleado con ese correo.";
  }

  return errors;
}

function buildEmployee(payload, currentEmployee = {}) {
  return {
    ...currentEmployee,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    username: payload.username.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    password: payload.password.trim(),
    joinDate: payload.joinDate,
    status: VALID_STATUSES.has(payload.status) ? payload.status : currentEmployee.status ?? "active",
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
        const fullName = `${employee.firstName} ${employee.lastName}`.trim();
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
