import { employeesMock } from "../mocks/employees.mock";

const normalize = (value) => value.trim().toLowerCase();

let employeesStore = employeesMock.map((employee) => ({
  ...employee,
  status: employee.status ?? "active",
}));

const makeError = (message, errors = {}, status = 400) => ({
  ok: false,
  status,
  message,
  errors,
});

const validateEmployee = (payload, currentId = null) => {
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

  const duplicated = employeesStore.some(
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
};

const parseEmployee = (payload) => ({
  firstName: payload.firstName.trim(),
  lastName: payload.lastName.trim(),
  username: payload.username.trim(),
  phone: payload.phone.trim(),
  email: payload.email.trim(),
  password: payload.password.trim(),
  joinDate: payload.joinDate,
  status: payload.status ?? "active",
});

export const employeesService = {
  list(filters = {}) {
    const query = normalize(filters.query ?? "");
    const status = filters.status ?? "all";

    const data = employeesStore.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.trim();
      const matchesQuery =
        !query ||
        normalize(fullName).includes(query) ||
        normalize(employee.firstName).includes(query) ||
        normalize(employee.lastName).includes(query) ||
        normalize(employee.username).includes(query) ||
        normalize(employee.email).includes(query);
      const matchesStatus = status === "all" || employee.status === status;

      return matchesQuery && matchesStatus;
    });

    return { ok: true, status: 200, data };
  },

  create(payload) {
    const errors = validateEmployee(payload);
    if (Object.keys(errors).length > 0) {
      return makeError("No se pudo crear el empleado.", errors, 422);
    }

    const id =
      employeesStore.length > 0
        ? Math.max(...employeesStore.map((employee) => employee.id)) + 1
        : 1;
    const employee = { id, ...parseEmployee(payload) };
    employeesStore = [...employeesStore, employee];

    return { ok: true, status: 201, data: employee };
  },

  update(id, payload) {
    const exists = employeesStore.some((employee) => employee.id === id);
    if (!exists) {
      return makeError("Empleado no encontrado.", {}, 404);
    }

    const errors = validateEmployee(payload, id);
    if (Object.keys(errors).length > 0) {
      return makeError("No se pudo actualizar el empleado.", errors, 422);
    }

    const employee = { id, ...parseEmployee(payload) };
    employeesStore = employeesStore.map((item) => (item.id === id ? employee : item));

    return { ok: true, status: 200, data: employee };
  },

  setStatus(id, status) {
    const employee = employeesStore.find((item) => item.id === id);
    if (!employee) {
      return makeError("Empleado no encontrado.", {}, 404);
    }

    employeesStore = employeesStore.map((item) =>
      item.id === id ? { ...item, status } : item,
    );

    return {
      ok: true,
      status: 200,
      data: employeesStore.find((item) => item.id === id),
    };
  },
};
