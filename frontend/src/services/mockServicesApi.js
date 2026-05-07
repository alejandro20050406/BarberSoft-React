import { servicesMock } from "../mocks/services.mock";

const normalize = (value) => value.trim().toLowerCase();

let servicesStore = servicesMock.map((service) => ({
  ...service,
  status: service.status ?? "active",
}));

const makeError = (message, errors = {}, status = 400) => ({
  ok: false,
  status,
  message,
  errors,
});

const validateService = (payload, currentId = null) => {
  const errors = {};
  const name = payload.name?.trim() ?? "";
  const category = payload.category?.trim() ?? "";
  const price = Number(payload.price);

  if (!name) errors.name = "El nombre del servicio es obligatorio.";
  if (!category) errors.category = "Seleccione una categoria.";
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Ingrese un precio valido mayor a 0.";
  }

  const duplicatedName = servicesStore.some(
    (service) =>
      service.id !== currentId &&
      normalize(service.name) === normalize(name),
  );

  if (duplicatedName) {
    errors.name = "Ya existe un servicio con ese nombre.";
  }

  return errors;
};

const parseService = (payload) => ({
  category: payload.category.trim(),
  name: payload.name.trim(),
  price: Number(payload.price),
  description: payload.description?.trim() ?? "",
  status: payload.status ?? "active",
});

export const servicesApi = {
  list(filters = {}) {
    const query = normalize(filters.query ?? "");
    const category = filters.category ?? "all";
    const status = filters.status ?? "all";

    const data = servicesStore.filter((service) => {
      const matchesQuery =
        !query ||
        normalize(service.name).includes(query) ||
        normalize(service.description ?? "").includes(query);
      const matchesCategory = category === "all" || service.category === category;
      const matchesStatus = status === "all" || service.status === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });

    return { ok: true, status: 200, data };
  },

  create(payload) {
    const errors = validateService(payload);
    if (Object.keys(errors).length > 0) {
      return makeError("No se pudo crear el servicio.", errors, 422);
    }

    const id =
      servicesStore.length > 0
        ? Math.max(...servicesStore.map((service) => service.id)) + 1
        : 1;
    const service = { id, ...parseService(payload) };
    servicesStore = [...servicesStore, service];

    return { ok: true, status: 201, data: service };
  },

  update(id, payload) {
    const exists = servicesStore.some((service) => service.id === id);
    if (!exists) {
      return makeError("Servicio no encontrado.", {}, 404);
    }

    const errors = validateService(payload, id);
    if (Object.keys(errors).length > 0) {
      return makeError("No se pudo actualizar el servicio.", errors, 422);
    }

    const service = { id, ...parseService(payload) };
    servicesStore = servicesStore.map((item) => (item.id === id ? service : item));

    return { ok: true, status: 200, data: service };
  },

  setStatus(id, status) {
    const service = servicesStore.find((item) => item.id === id);
    if (!service) {
      return makeError("Servicio no encontrado.", {}, 404);
    }

    servicesStore = servicesStore.map((item) =>
      item.id === id ? { ...item, status } : item,
    );

    return {
      ok: true,
      status: 200,
      data: servicesStore.find((item) => item.id === id),
    };
  },
};
