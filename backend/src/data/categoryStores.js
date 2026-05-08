const normalize = (value) => value.trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const productCategoriesSeed = [
  { id: 1, name: "Geles y ceras", status: "active" },
  { id: 2, name: "Shampoos y acondicionadores", status: "active" },
  { id: 3, name: "Tintes y decolorantes", status: "active" },
  { id: 4, name: "Navajas y cuchillas", status: "active" },
  { id: 5, name: "Accesorios de corte", status: "active" },
];

const serviceCategoriesSeed = [
  { id: 1, name: "Corte de cabello", status: "active" },
  { id: 2, name: "Afeitado", status: "active" },
  { id: 3, name: "Coloracion", status: "active" },
  { id: 4, name: "Tratamientos capilares", status: "active" },
  { id: 5, name: "Cejas y bigote", status: "active" },
];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function createCategoryStore(seed) {
  let categories = seed.map((category) => ({ ...category }));

  const findById = (id) => categories.find((category) => category.id === id);

  const validateName = (payload, currentId = null) => {
    const errors = {};
    const name = payload.name?.trim() ?? "";

    if (!name) {
      errors.name = "El nombre de la categoria es obligatorio.";
      return errors;
    }

    const duplicatedName = categories.some(
      (category) =>
        category.id !== currentId && normalize(category.name) === normalize(name),
    );

    if (duplicatedName) {
      errors.name = "Ya existe una categoria con ese nombre.";
    }

    return errors;
  };

  return {
    list(filters = {}) {
      const query = normalize(filters.query ?? "");
      const status = filters.status ?? "all";

      const data = categories.filter((category) => {
        const matchesQuery = !query || normalize(category.name).includes(query);
        const matchesStatus = status === "all" || category.status === status;

        return matchesQuery && matchesStatus;
      });

      return { ok: true, status: 200, data };
    },

    create(payload) {
      const errors = validateName(payload);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo crear la categoria.", errors, 422);
      }

      const id =
        categories.length > 0
          ? Math.max(...categories.map((category) => category.id)) + 1
          : 1;
      const category = {
        id,
        name: payload.name.trim(),
        status: VALID_STATUSES.has(payload.status) ? payload.status : "active",
      };

      categories = [...categories, category];

      return { ok: true, status: 201, data: category };
    },

    update(id, payload) {
      const currentCategory = findById(id);

      if (!currentCategory) {
        return makeError("Categoria no encontrada.", {}, 404);
      }

      const errors = validateName(payload, id);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo actualizar la categoria.", errors, 422);
      }

      const category = {
        ...currentCategory,
        name: payload.name.trim(),
      };

      categories = categories.map((item) => (item.id === id ? category : item));

      return { ok: true, status: 200, data: category };
    },

    setStatus(id, status) {
      const currentCategory = findById(id);

      if (!currentCategory) {
        return makeError("Categoria no encontrada.", {}, 404);
      }

      if (!VALID_STATUSES.has(status)) {
        return makeError(
          "Estado de categoria invalido.",
          { status: "Use active o inactive." },
          422,
        );
      }

      const category = { ...currentCategory, status };
      categories = categories.map((item) => (item.id === id ? category : item));

      return { ok: true, status: 200, data: category };
    },
  };
}

export const productCategoryStore = createCategoryStore(productCategoriesSeed);
export const serviceCategoryStore = createCategoryStore(serviceCategoriesSeed);
