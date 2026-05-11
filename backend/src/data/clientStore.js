const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const clientsSeed = [
  {
    id: 1,
    firstName: "Carlos",
    lastName: "Ramirez",
    phone: "5512345678",
    email: "carlos.ramirez@demo.com",
    notes: "Cliente frecuente",
    status: "active",
  },
  {
    id: 2,
    firstName: "Luis",
    lastName: "Ortega",
    phone: "5587654321",
    email: "luis.ortega@demo.com",
    notes: "",
    status: "active",
  },
];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function validateClient(payload, clients, currentId = null) {
  const errors = {};
  const firstName = payload.firstName?.trim() ?? payload.name?.trim() ?? "";
  const lastName = payload.lastName?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const email = payload.email?.trim() ?? "";

  if (!firstName) errors.firstName = "El nombre del cliente es obligatorio.";
  if (!phone) errors.phone = "El telefono del cliente es obligatorio.";
  if (email && !email.includes("@")) errors.email = "Ingrese un correo valido.";

  const duplicatedPhone = clients.some(
    (client) => client.id !== currentId && normalize(client.phone) === normalize(phone),
  );

  if (phone && duplicatedPhone) {
    errors.phone = "Ya existe un cliente con ese telefono.";
  }

  return errors;
}

function buildClient(payload, currentClient = {}) {
  return {
    ...currentClient,
    firstName: payload.firstName?.trim() ?? payload.name?.trim() ?? "",
    lastName: payload.lastName?.trim() ?? currentClient.lastName ?? "",
    phone: payload.phone?.trim() ?? "",
    email: payload.email?.trim() ?? "",
    notes: payload.notes?.trim() ?? "",
    status: VALID_STATUSES.has(payload.status) ? payload.status : currentClient.status ?? "active",
  };
}

function createClientStore(seed) {
  let clients = seed.map((client) => ({ ...client }));

  const findById = (id) => clients.find((client) => client.id === id);

  return {
    list(filters = {}) {
      const query = normalize(filters.query ?? "");
      const status = filters.status ?? "all";

      const data = clients.filter((client) => {
        const fullName = `${client.firstName} ${client.lastName}`;
        const matchesQuery =
          !query ||
          normalize(fullName).includes(query) ||
          normalize(client.phone).includes(query) ||
          normalize(client.email).includes(query);
        const matchesStatus = status === "all" || client.status === status;

        return matchesQuery && matchesStatus;
      });

      return { ok: true, status: 200, data };
    },

    findById,

    create(payload) {
      const errors = validateClient(payload, clients);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo crear el cliente.", errors, 422);
      }

      const id = clients.length > 0 ? Math.max(...clients.map((client) => client.id)) + 1 : 1;
      const client = { id, ...buildClient(payload) };
      clients = [...clients, client];

      return { ok: true, status: 201, data: client };
    },

    update(id, payload) {
      const currentClient = findById(id);

      if (!currentClient) {
        return makeError("Cliente no encontrado.", {}, 404);
      }

      const errors = validateClient(payload, clients, id);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo actualizar el cliente.", errors, 422);
      }

      const client = buildClient(payload, currentClient);
      clients = clients.map((item) => (item.id === id ? client : item));

      return { ok: true, status: 200, data: client };
    },

    setStatus(id, status) {
      const currentClient = findById(id);

      if (!currentClient) {
        return makeError("Cliente no encontrado.", {}, 404);
      }

      if (!VALID_STATUSES.has(status)) {
        return makeError("Estado de cliente invalido.", { status: "Use active o inactive." }, 422);
      }

      const client = { ...currentClient, status };
      clients = clients.map((item) => (item.id === id ? client : item));

      return { ok: true, status: 200, data: client };
    },
  };
}

export const clientStore = createClientStore(clientsSeed);
