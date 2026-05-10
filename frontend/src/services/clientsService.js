import { clientsMock } from "../mocks/clients.mock";

const normalize = (value) => value.trim().toLowerCase();

let clientsStore = clientsMock.map((client) => ({
  ...client,
  status: client.status ?? "active",
}));

const makeError = (message, errors = {}, status = 400) => ({
  ok: false,
  status,
  message,
  errors,
});

const validateClient = (payload, currentId = null) => {
  const errors = {};
  const firstName = payload.firstName?.trim() ?? "";
  const lastName = payload.lastName?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const email = payload.email?.trim() ?? "";

  if (!firstName) errors.firstName = "El nombre del cliente es obligatorio.";
  if (!lastName) errors.lastName = "El apellido del cliente es obligatorio.";
  if (!phone) errors.phone = "El telefono es obligatorio.";
  if (email && !email.includes("@")) errors.email = "Ingrese un correo valido.";

  const duplicated = clientsStore.some(
    (client) =>
      client.id !== currentId &&
      (normalize(client.phone) === normalize(phone) ||
        (email && normalize(client.email ?? "") === normalize(email))),
  );

  if (duplicated) {
    if (phone) errors.phone = "Ya existe un cliente con ese telefono.";
    if (email) errors.email = "Ya existe un cliente con ese correo.";
  }

  return errors;
};

const parseClient = (payload) => ({
  firstName: payload.firstName.trim(),
  lastName: payload.lastName.trim(),
  phone: payload.phone.trim(),
  email: payload.email?.trim() ?? "",
  status: payload.status ?? "active",
});

export const clientsService = {
  list(filters = {}) {
    const query = normalize(filters.query ?? "");
    const status = filters.status ?? "all";

    const data = clientsStore.filter((client) => {
      const fullName = `${client.firstName} ${client.lastName}`.trim();
      const matchesQuery =
        !query ||
        normalize(fullName).includes(query) ||
        normalize(client.firstName).includes(query) ||
        normalize(client.lastName).includes(query) ||
        normalize(client.phone).includes(query) ||
        normalize(client.email ?? "").includes(query);
      const matchesStatus = status === "all" || client.status === status;

      return matchesQuery && matchesStatus;
    });

    return { ok: true, status: 200, data };
  },

  create(payload) {
    const errors = validateClient(payload);
    if (Object.keys(errors).length > 0) {
      return makeError("No se pudo crear el cliente.", errors, 422);
    }

    const id =
      clientsStore.length > 0
        ? Math.max(...clientsStore.map((client) => client.id)) + 1
        : 1;
    const client = { id, ...parseClient(payload) };
    clientsStore = [...clientsStore, client];

    return { ok: true, status: 201, data: client };
  },

  update(id, payload) {
    const exists = clientsStore.some((client) => client.id === id);
    if (!exists) {
      return makeError("Cliente no encontrado.", {}, 404);
    }

    const errors = validateClient(payload, id);
    if (Object.keys(errors).length > 0) {
      return makeError("No se pudo actualizar el cliente.", errors, 422);
    }

    const client = { id, ...parseClient(payload) };
    clientsStore = clientsStore.map((item) => (item.id === id ? client : item));

    return { ok: true, status: 200, data: client };
  },

  setStatus(id, status) {
    const client = clientsStore.find((item) => item.id === id);
    if (!client) {
      return makeError("Cliente no encontrado.", {}, 404);
    }

    clientsStore = clientsStore.map((item) =>
      item.id === id ? { ...item, status } : item,
    );

    return {
      ok: true,
      status: 200,
      data: clientsStore.find((item) => item.id === id),
    };
  },
};
