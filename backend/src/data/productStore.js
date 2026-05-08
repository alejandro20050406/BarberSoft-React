const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);

const productsSeed = [
  {
    id: 1,
    category: "Geles y ceras",
    brand: "Natura",
    model: "Moco de Gorila",
    stock: 10,
    minStock: 2,
    cost: 80,
    price: 160,
    status: "active",
  },
];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return Number.NaN;
  }

  return Number(value);
}

function validateProduct(payload, products, currentId = null) {
  const errors = {};
  const category = payload.category?.trim() ?? "";
  const brand = payload.brand?.trim() ?? "";
  const model = payload.model?.trim() ?? "";
  const stock = parseNumber(payload.stock);
  const minStock = parseNumber(payload.minStock);
  const cost = parseNumber(payload.cost);
  const price = parseNumber(payload.price);

  if (!category) errors.category = "Seleccione una categoria.";
  if (!brand) errors.brand = "La marca es obligatoria.";
  if (!model) errors.model = "El modelo es obligatorio.";
  if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = "Ingrese stock actual valido.";
  }
  if (!Number.isInteger(minStock) || minStock < 0) {
    errors.minStock = "Ingrese stock minimo valido.";
  }
  if (!Number.isFinite(cost) || cost < 0) {
    errors.cost = "Ingrese costo valido.";
  }
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Ingrese precio valido.";
  }

  const duplicatedName = products.some(
    (product) =>
      product.id !== currentId &&
      normalize(`${product.brand} ${product.model}`) === normalize(`${brand} ${model}`),
  );

  if (duplicatedName) {
    errors.model = "Ya existe un producto con esa marca y modelo.";
  }

  return errors;
}

function buildProduct(payload, currentProduct = {}) {
  return {
    ...currentProduct,
    category: payload.category.trim(),
    brand: payload.brand.trim(),
    model: payload.model.trim(),
    stock: Number(payload.stock),
    minStock: Number(payload.minStock),
    cost: Number(payload.cost),
    price: Number(payload.price),
    status: VALID_STATUSES.has(payload.status) ? payload.status : currentProduct.status ?? "active",
  };
}

function createProductStore(seed) {
  let products = seed.map((product) => ({ ...product }));

  const findById = (id) => products.find((product) => product.id === id);

  return {
    list(filters = {}) {
      const query = normalize(filters.query ?? "");
      const category = filters.category ?? "all";
      const status = filters.status ?? "all";

      const data = products.filter((product) => {
        const matchesQuery =
          !query ||
          normalize(product.brand).includes(query) ||
          normalize(product.model).includes(query);
        const matchesCategory = category === "all" || product.category === category;
        const matchesStatus = status === "all" || product.status === status;

        return matchesQuery && matchesCategory && matchesStatus;
      });

      return { ok: true, status: 200, data };
    },

    create(payload) {
      const errors = validateProduct(payload, products);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo crear el producto.", errors, 422);
      }

      const id =
        products.length > 0 ? Math.max(...products.map((product) => product.id)) + 1 : 1;
      const product = { id, ...buildProduct(payload) };

      products = [...products, product];

      return { ok: true, status: 201, data: product };
    },

    update(id, payload) {
      const currentProduct = findById(id);

      if (!currentProduct) {
        return makeError("Producto no encontrado.", {}, 404);
      }

      const errors = validateProduct(payload, products, id);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo actualizar el producto.", errors, 422);
      }

      const product = buildProduct(payload, currentProduct);
      products = products.map((item) => (item.id === id ? product : item));

      return { ok: true, status: 200, data: product };
    },

    setStatus(id, status) {
      const currentProduct = findById(id);

      if (!currentProduct) {
        return makeError("Producto no encontrado.", {}, 404);
      }

      if (!VALID_STATUSES.has(status)) {
        return makeError("Estado de producto invalido.", { status: "Use active o inactive." }, 422);
      }

      const product = { ...currentProduct, status };
      products = products.map((item) => (item.id === id ? product : item));

      return { ok: true, status: 200, data: product };
    },
  };
}

export const productStore = createProductStore(productsSeed);
