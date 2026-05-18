const normalize = (value) => String(value ?? "").trim().toLowerCase();
const VALID_STATUSES = new Set(["active", "inactive"]);
const MOVEMENT_TYPES = new Set(["initial_stock", "manual_adjustment", "sale"]);

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

function nextId(collection) {
  return collection.length > 0 ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function parsePaginationValue(value, fallback, { min = 1, max = 100 } = {}) {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function paginateCollection(collection, filters = {}) {
  const page = parsePaginationValue(filters.page, 1);
  const pageSize = parsePaginationValue(filters.pageSize, 10, { min: 1, max: 100 });
  const totalItems = collection.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: collection.slice(start, start + pageSize),
    pagination: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
}

function createProductStore(seed) {
  let products = seed.map((product) => ({ ...product }));
  let inventoryMovements = [];

  const findById = (id) => products.find((product) => product.id === id);
  const buildMovement = ({
    product,
    type,
    quantity,
    previousStock,
    nextStock,
    reason = "",
    saleId = null,
    notes = "",
  }) => ({
    id: nextId(inventoryMovements),
    productId: product.id,
    productName: `${product.brand} ${product.model}`.trim(),
    category: product.category,
    type,
    quantity,
    previousStock,
    nextStock,
    reason,
    saleId,
    notes,
    createdAt: new Date().toISOString(),
  });
  const pushMovement = (movement) => {
    inventoryMovements = [...inventoryMovements, movement];
    return movement;
  };

  inventoryMovements = products
    .filter((product) => product.stock > 0)
    .map((product, index) => ({
      id: index + 1,
      productId: product.id,
      productName: `${product.brand} ${product.model}`.trim(),
      category: product.category,
      type: "initial_stock",
      quantity: product.stock,
      previousStock: 0,
      nextStock: product.stock,
      reason: "Carga inicial de inventario.",
      saleId: null,
      notes: "",
      createdAt: new Date().toISOString(),
    }));

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

    listInventoryMovements(filters = {}) {
      const query = normalize(filters.query ?? "");
      const productId = Number(filters.productId ?? 0);
      const type = filters.type ?? "all";
      const filteredMovements = inventoryMovements
        .filter((movement) => {
          const product = findById(movement.productId);
          const matchesQuery =
            !query ||
            normalize(movement.productName).includes(query) ||
            normalize(product?.brand).includes(query) ||
            normalize(product?.model).includes(query);
          const matchesProduct = !productId || movement.productId === productId;
          const matchesType = type === "all" || movement.type === type;

          return matchesQuery && matchesProduct && matchesType;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = paginateCollection(filteredMovements, filters);

      return {
        ok: true,
        status: 200,
        data: {
          movements: paginated.items,
          pagination: paginated.pagination,
          filters: {
            query: filters.query ?? "",
            productId: filters.productId ?? "",
            type: type === "all" || MOVEMENT_TYPES.has(type) ? type : "all",
            page: parsePaginationValue(filters.page, 1),
            pageSize: parsePaginationValue(filters.pageSize, 10, { min: 1, max: 100 }),
          },
        },
      };
    },

    getInventoryStatus() {
      const activeProducts = products.filter((product) => product.status === "active");
      const lowStockProducts = activeProducts.filter(
        (product) => product.stock > 0 && product.stock <= product.minStock,
      );
      const outOfStockProducts = activeProducts.filter((product) => product.stock <= 0);

      return {
        ok: true,
        status: 200,
        data: {
          totals: {
            products: activeProducts.length,
            lowStock: lowStockProducts.length,
            outOfStock: outOfStockProducts.length,
          },
          lowStockProducts: lowStockProducts
            .sort((left, right) => left.stock - right.stock)
            .map((product) => ({
              ...product,
              shortage: Math.max(product.minStock - product.stock, 0),
            })),
          outOfStockProducts,
        },
      };
    },

    findById,

    create(payload) {
      const errors = validateProduct(payload, products);

      if (Object.keys(errors).length > 0) {
        return makeError("No se pudo crear el producto.", errors, 422);
      }

      const id = nextId(products);
      const product = { id, ...buildProduct(payload) };

      products = [...products, product];
      if (product.stock > 0) {
        pushMovement(
          buildMovement({
            product,
            type: "initial_stock",
            quantity: product.stock,
            previousStock: 0,
            nextStock: product.stock,
            reason: "Alta de producto con stock inicial.",
          }),
        );
      }

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
      const stockDelta = product.stock - currentProduct.stock;

      if (stockDelta !== 0) {
        const type = "manual_adjustment";
        const reason =
          stockDelta > 0
            ? "Ajuste manual de inventario al alza."
            : "Ajuste manual de inventario a la baja.";

        pushMovement(
          buildMovement({
            product,
            type,
            quantity: Math.abs(stockDelta),
            previousStock: currentProduct.stock,
            nextStock: product.stock,
            reason,
          }),
        );
      }

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

    decreaseStock(id, quantity, options = {}) {
      const currentProduct = findById(id);

      if (!currentProduct) {
        return makeError("Producto no encontrado.", {}, 404);
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return makeError("Cantidad invalida.", { quantity: "Ingrese una cantidad mayor a 0." }, 422);
      }

      if (currentProduct.stock < quantity) {
        return makeError(
          "Stock insuficiente.",
          { stock: `Solo hay ${currentProduct.stock} unidades disponibles.` },
          409,
        );
      }

      const product = { ...currentProduct, stock: currentProduct.stock - quantity };
      products = products.map((item) => (item.id === id ? product : item));
      const movement = pushMovement(
        buildMovement({
          product,
          type: "sale",
          quantity,
          previousStock: currentProduct.stock,
          nextStock: product.stock,
          reason: options.reason ?? "Descuento por venta registrada.",
          saleId: options.saleId ?? null,
          notes: options.notes ?? "",
        }),
      );

      return { ok: true, status: 200, data: { product, movement } };
    },

    __resetForTests() {
      products = seed.map((product) => ({ ...product }));
      inventoryMovements = products
        .filter((product) => product.stock > 0)
        .map((product, index) => ({
          id: index + 1,
          productId: product.id,
          productName: `${product.brand} ${product.model}`.trim(),
          category: product.category,
          type: "initial_stock",
          quantity: product.stock,
          previousStock: 0,
          nextStock: product.stock,
          reason: "Carga inicial de inventario.",
          saleId: null,
          notes: "",
          createdAt: new Date().toISOString(),
        }));
    },
  };
}

export const productStore = createProductStore(productsSeed);
