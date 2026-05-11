const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const servicesSeed = [
  {
    id: 1,
    category: "Corte de cabello",
    name: "Low Fade",
    price: 180,
    description: "Degradado bajo",
    durationMinutes: 45,
    status: "active",
  },
  {
    id: 2,
    category: "Afeitado",
    name: "Afeitado clasico",
    price: 120,
    description: "Toalla caliente y perfilado",
    durationMinutes: 30,
    status: "active",
  },
];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function validateService(payload, services, currentId = null) {
  const errors = {};
  const category = payload.category?.trim() ?? "";
  const name = payload.name?.trim() ?? "";
  const price = Number(payload.price);
  const durationMinutes = Number(payload.durationMinutes ?? 30);

  if (!category) errors.category = "Seleccione una categoria.";
  if (!name) errors.name = "El nombre del servicio es obligatorio.";
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Ingrese un precio valido mayor a 0.";
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    errors.durationMinutes = "Ingrese una duracion valida en minutos.";
  }

  const duplicatedName = services.some(
    (service) => service.id !== currentId && normalize(service.name) === normalize(name),
  );

  if (duplicatedName) {
    errors.name = "Ya existe un servicio con ese nombre.";
  }

  return errors;
}

function buildService(payload, currentService = {}) {
  return {
    ...currentService,
    category: payload.category?.trim() ?? "",
    name: payload.name?.trim() ?? "",
    price: Number(payload.price),
    description: payload.description?.trim() ?? "",
    durationMinutes: Number(payload.durationMinutes ?? currentService.durationMinutes ?? 30),
    status: VALID_STATUSES.has(payload.status) ? payload.status : currentService.status ?? "active",
  };
}

function createServiceStore(seed) {
  let services = seed.map((service) => ({ ...service }));

  const findById = (id) => services.find((service) => service.id === id);

  return {
    list(filters = {}) {
      const query = normalize(filters.query ?? "");
      const category = filters.category ?? "all";
      const status = filters.status ?? "all";

      const data = services.filter((service) => {
        const matchesQuery =
          !query ||
          normalize(service.name).includes(query) ||
          normalize(service.description).includes(query);
        const matchesCategory = category === "all" || service.category === category;
        const matchesStatus = status === "all" || service.status === status;

        return matchesQuery && matchesCategory && matchesStatus;
      });

      return { ok: true, status: 200, data };
    },

    findById,

    create(payload) {
      const errors = validateService(payload, services);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo crear el servicio.", errors, 422);
      }

      const id =
        services.length > 0 ? Math.max(...services.map((service) => service.id)) + 1 : 1;
      const service = { id, ...buildService(payload) };
      services = [...services, service];

      return { ok: true, status: 201, data: service };
    },

    update(id, payload) {
      const currentService = findById(id);

      if (!currentService) {
        return makeError("Servicio no encontrado.", {}, 404);
      }

      const errors = validateService(payload, services, id);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo actualizar el servicio.", errors, 422);
      }

      const service = buildService(payload, currentService);
      services = services.map((item) => (item.id === id ? service : item));

      return { ok: true, status: 200, data: service };
    },

    setStatus(id, status) {
      const currentService = findById(id);

      if (!currentService) {
        return makeError("Servicio no encontrado.", {}, 404);
      }

      if (!VALID_STATUSES.has(status)) {
        return makeError("Estado de servicio invalido.", { status: "Use active o inactive." }, 422);
      }

      const service = { ...currentService, status };
      services = services.map((item) => (item.id === id ? service : item));

      return { ok: true, status: 200, data: service };
    },
  };
}

export const serviceStore = createServiceStore(servicesSeed);
