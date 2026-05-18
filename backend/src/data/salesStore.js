import { clientStore } from "./clientStore.js";
import { employeeStore } from "./employeeStore.js";
import { productStore } from "./productStore.js";
import { serviceStore } from "./serviceStore.js";

const PAYMENT_METHODS = new Set(["cash", "card", "transfer", "mixed"]);
const PAYMENT_METHOD_LABELS = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  mixed: "Mixto",
};
const SERVICE_EMPLOYEE_PERCENTAGE = 80;
const SERVICE_ADMIN_PERCENTAGE = 20;

let sales = [];
let saleDetails = [];
let visits = [];
let commissions = [];

function makeError(message, errors = {}, status = 400) {
  return { ok: false, status, message, errors };
}

function parsePositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function parseOptionalPositiveInteger(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return parsePositiveInteger(value);
}

function money(value) {
  return Math.round(Number(value) * 100) / 100;
}

function sameMoney(left, right) {
  return money(left) === money(right);
}

function toCents(value) {
  return Math.round(Number(value ?? 0) * 100);
}

function centsToMoney(value) {
  return money(value / 100);
}

function percentageAmountCents(baseCents, percentage) {
  return Math.round((baseCents * Number(percentage ?? 0)) / 100);
}

function allocateDiscountCents(subtotalsCents, discountCents) {
  const normalizedSubtotals = subtotalsCents.map((value) => Math.max(0, Number(value ?? 0)));
  const totalCents = normalizedSubtotals.reduce((sum, value) => sum + value, 0);
  const normalizedDiscount = Math.max(0, Math.min(Number(discountCents ?? 0), totalCents));

  if (totalCents === 0 || normalizedDiscount === 0) {
    return normalizedSubtotals.map(() => 0);
  }

  const allocations = normalizedSubtotals.map((subtotal, index) => {
    if (subtotal === 0) {
      return { index, subtotal, cents: 0, remainder: 0 };
    }

    const rawShare = (normalizedDiscount * subtotal) / totalCents;

    return {
      index,
      subtotal,
      cents: Math.floor(rawShare),
      remainder: rawShare % 1,
    };
  });

  let remaining = normalizedDiscount - allocations.reduce((sum, item) => sum + item.cents, 0);

  allocations
    .filter((item) => item.subtotal > 0)
    .sort((left, right) => {
      if (right.remainder !== left.remainder) {
        return right.remainder - left.remainder;
      }

      if (right.subtotal !== left.subtotal) {
        return right.subtotal - left.subtotal;
      }

      return left.index - right.index;
    });

  const rankedAllocations = allocations
    .filter((item) => item.subtotal > 0)
    .sort((left, right) => {
      if (right.remainder !== left.remainder) {
        return right.remainder - left.remainder;
      }

      if (right.subtotal !== left.subtotal) {
        return right.subtotal - left.subtotal;
      }

      return left.index - right.index;
    });

  for (let index = 0; index < rankedAllocations.length && remaining > 0; index += 1) {
    rankedAllocations[index].cents += 1;
    remaining -= 1;

    if (index === rankedAllocations.length - 1 && remaining > 0) {
      index = -1;
    }
  }

  return allocations
    .sort((left, right) => left.index - right.index)
    .map((item) => item.cents);
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
  const items = collection.slice(start, start + pageSize);

  return {
    items,
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

function buildCommissionRecord({
  saleId,
  employeeId,
  employeeCommissionRate,
  serviceSubtotal = 0,
  productSubtotal = 0,
  discount = 0,
  generatedAt,
}) {
  const serviceSubtotalCents = toCents(serviceSubtotal);
  const productSubtotalCents = toCents(productSubtotal);
  const [serviceDiscountCents, productDiscountCents] = allocateDiscountCents(
    [serviceSubtotalCents, productSubtotalCents],
    toCents(discount),
  );
  const netServiceCents = serviceSubtotalCents - serviceDiscountCents;
  const netProductCents = productSubtotalCents - productDiscountCents;
  const serviceEmployeeAmountCents = percentageAmountCents(netServiceCents, SERVICE_EMPLOYEE_PERCENTAGE);
  const serviceAdminAmountCents = percentageAmountCents(netServiceCents, SERVICE_ADMIN_PERCENTAGE);
  const productEmployeeAmountCents = percentageAmountCents(netProductCents, employeeCommissionRate);
  const amountCents = serviceEmployeeAmountCents + productEmployeeAmountCents;
  const percentageLabel =
    netServiceCents > 0 && netProductCents > 0
      ? `${SERVICE_EMPLOYEE_PERCENTAGE}% servicios + ${employeeCommissionRate}% productos`
      : netServiceCents > 0
        ? `${SERVICE_EMPLOYEE_PERCENTAGE}% servicios`
        : `${employeeCommissionRate}% productos`;

  return {
    id: nextId(commissions),
    saleId,
    employeeId,
    percentage: netServiceCents > 0 ? SERVICE_EMPLOYEE_PERCENTAGE : employeeCommissionRate,
    percentageLabel,
    employeeRate: employeeCommissionRate,
    amount: centsToMoney(amountCents),
    serviceAmount: centsToMoney(serviceEmployeeAmountCents),
    productAmount: centsToMoney(productEmployeeAmountCents),
    serviceNetSales: centsToMoney(netServiceCents),
    productNetSales: centsToMoney(netProductCents),
    serviceDiscount: centsToMoney(serviceDiscountCents),
    productDiscount: centsToMoney(productDiscountCents),
    adminPercentage: netServiceCents > 0 ? SERVICE_ADMIN_PERCENTAGE : 0,
    adminAmount: centsToMoney(serviceAdminAmountCents),
    status: "pending",
    generatedAt,
  };
}

function normalizeDateFilter(value, boundary) {
  if (!value) return null;

  const date = new Date(`${value}T${boundary}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function fullName(person) {
  return `${person?.firstName ?? ""} ${person?.lastName ?? ""}`.trim();
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function canCreateSales(currentUser) {
  const permissions = new Set(currentUser.permissions ?? []);

  return permissions.has("sales:create") || permissions.has("sales:manage");
}

function nextId(collection) {
  return collection.length > 0 ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function nextFolio(soldAt, prefix = "SERV") {
  const date = soldAt.slice(0, 10).replaceAll("-", "");
  return `${prefix}-${date}-${String(sales.length + 1).padStart(4, "0")}`;
}

function validateClientEmployeePayment(payload, currentUser) {
  const errors = {};
  const clientId = parsePositiveInteger(payload.clientId);
  const employeeId = parsePositiveInteger(payload.employeeId);
  const paymentMethod = payload.paymentMethod?.trim() ?? "";

  if (!canCreateSales(currentUser)) {
    errors.employeeId = "El usuario no esta autorizado para registrar ventas.";
  }
  if (!clientId) errors.clientId = "Seleccione un cliente.";
  if (!employeeId) errors.employeeId = "Seleccione un empleado.";
  if (!PAYMENT_METHODS.has(paymentMethod)) {
    errors.paymentMethod = "Seleccione un metodo de pago valido.";
  }

  const client = clientId ? clientStore.findById(clientId) : null;
  const employee = employeeId ? employeeStore.findById(employeeId) : null;

  if (clientId && !client) {
    errors.clientId = "El cliente seleccionado no esta asociado al sistema.";
  }
  if (client && client.status !== "active") {
    errors.clientId = "El cliente asociado debe estar activo.";
  }
  if (employeeId && !employee) {
    errors.employeeId = "El empleado seleccionado no existe.";
  }
  if (employee && employee.status !== "active") {
    errors.employeeId = "El empleado seleccionado no esta activo.";
  }
  if (currentUser.role === "employee") {
    const currentEmployee = employeeStore.findByUserId(currentUser.id);

    if (!currentEmployee || currentEmployee.status !== "active") {
      errors.employeeId = "El empleado de la sesion no esta autorizado.";
    } else if (currentEmployee.id !== employeeId) {
      errors.employeeId = "El empleado no esta autorizado para registrar ventas a nombre de otro empleado.";
    }
  }

  return { errors, client, employee, paymentMethod };
}

function buildServiceSaleValidation(payload, currentUser) {
  const baseValidation = validateClientEmployeePayment(payload, currentUser);
  const errors = { ...baseValidation.errors };
  const serviceId = parsePositiveInteger(payload.serviceId);
  const discount = Number(payload.discount ?? 0);

  if (!serviceId) errors.serviceId = "Seleccione un servicio.";
  if (!Number.isFinite(discount) || discount < 0) {
    errors.discount = "Ingrese un descuento valido.";
  }

  const service = serviceId ? serviceStore.findById(serviceId) : null;

  if (serviceId && !service) {
    errors.serviceId = "El servicio seleccionado no existe.";
  }
  if (service && service.status !== "active") {
    errors.serviceId = "El servicio seleccionado debe estar activo.";
  }
  if (service && Number.isFinite(discount) && discount > service.price) {
    errors.discount = "El descuento no puede superar el precio del servicio.";
  }

  return {
    errors,
    data: {
      client: baseValidation.client,
      employee: baseValidation.employee,
      service,
      paymentMethod: baseValidation.paymentMethod,
      discount: money(discount),
    },
  };
}

function normalizeProductLines(payload) {
  const lines = Array.isArray(payload.lineItems)
    ? payload.lineItems
    : Array.isArray(payload.items)
      ? payload.items
      : [{ productId: payload.productId, quantity: payload.quantity }];

  return lines.map((line) => ({
    productId: parsePositiveInteger(line.productId),
    quantity: parsePositiveInteger(line.quantity),
    unitPrice: line.unitPrice === undefined ? null : Number(line.unitPrice),
    lineTotal: line.lineTotal === undefined ? null : Number(line.lineTotal),
  }));
}

function normalizeSaleLines(payload) {
  const lines = Array.isArray(payload.lineItems) ? payload.lineItems : [];

  return lines.map((line) => ({
    itemType: line.itemType === "service" ? "service" : line.itemType === "product" ? "product" : "",
    itemId: parsePositiveInteger(line.itemId),
    quantity: parsePositiveInteger(line.quantity),
    unitPrice: line.unitPrice === undefined ? null : Number(line.unitPrice),
    lineTotal: line.lineTotal === undefined ? null : Number(line.lineTotal),
  }));
}

function parseSaleDate(value) {
  if (!value) return new Date();

  const date = new Date(`${value}T12:00:00.000`);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function buildProductSaleValidation(payload, currentUser) {
  const baseValidation = validateClientEmployeePayment(payload, currentUser);
  const errors = { ...baseValidation.errors };
  const linkedServiceId = parseOptionalPositiveInteger(payload.linkedServiceId ?? payload.serviceId);
  const discount = Number(payload.discount ?? 0);
  const normalizedLines = normalizeProductLines(payload);
  const productLines = [];
  const quantitiesByProduct = new Map();

  if (!Number.isFinite(discount) || discount < 0) {
    errors.discount = "Ingrese un descuento valido.";
  }
  if (normalizedLines.length === 0) {
    errors.lineItems = "Agregue al menos un producto.";
  }

  normalizedLines.forEach((line, index) => {
    if (!line.productId) {
      errors[`lineItems.${index}.productId`] = "Seleccione un producto.";
    }
    if (!line.quantity) {
      errors[`lineItems.${index}.quantity`] = "Ingrese una cantidad mayor a 0.";
    }

    const product = line.productId ? productStore.findById(line.productId) : null;

    if (line.productId && !product) {
      errors[`lineItems.${index}.productId`] = "El producto seleccionado no existe.";
    }
    if (product && product.status !== "active") {
      errors[`lineItems.${index}.productId`] = "El producto seleccionado no esta activo.";
    }
    if (product && line.quantity) {
      const expectedUnitPrice = money(product.price);
      const expectedLineTotal = money(product.price * line.quantity);

      if (!Number.isFinite(line.unitPrice) || !sameMoney(line.unitPrice, expectedUnitPrice)) {
        errors[`lineItems.${index}.unitPrice`] = "El precio unitario no coincide con el producto.";
      }
      if (!Number.isFinite(line.lineTotal) || !sameMoney(line.lineTotal, expectedLineTotal)) {
        errors[`lineItems.${index}.lineTotal`] = "El subtotal de la linea no coincide con cantidad y precio.";
      }

      productLines.push({ ...line, product });
      quantitiesByProduct.set(
        product.id,
        (quantitiesByProduct.get(product.id) ?? 0) + line.quantity,
      );
    }
  });

  const linkedService = linkedServiceId ? serviceStore.findById(linkedServiceId) : null;

  if (linkedServiceId && !linkedService) {
    errors.linkedServiceId = "El servicio ligado no existe.";
  }
  if (linkedService && linkedService.status !== "active") {
    errors.linkedServiceId = "El servicio ligado debe estar activo.";
  }

  quantitiesByProduct.forEach((quantity, productId) => {
    const product = productStore.findById(productId);

    if (product && product.stock < quantity) {
      errors.lineItems = `Stock insuficiente para ${product.brand} ${product.model}. Disponible: ${product.stock}.`;
    }
  });

  const subtotal = money(
    productLines.reduce((total, line) => total + line.product.price * line.quantity, 0),
  );

  if (Number.isFinite(discount) && discount > subtotal) {
    errors.discount = "El descuento no puede superar el subtotal de productos.";
  }

  return {
    errors,
    data: {
      client: baseValidation.client,
      employee: baseValidation.employee,
      linkedService,
      productLines,
      stockMovements: [...quantitiesByProduct.entries()].map(([productId, quantity]) => ({
        productId,
        quantity,
      })),
      paymentMethod: baseValidation.paymentMethod,
      discount: money(discount),
      subtotal,
    },
  };
}

function getAuthenticatedEmployee(currentUser) {
  const employee = employeeStore.findByUserId(currentUser.id);

  if (!employee) {
    return makeError("No hay un empleado activo ligado a esta sesion.", {}, 404);
  }

  if (employee.status !== "active") {
    return makeError("El empleado autenticado no esta activo.", {}, 403);
  }

  return { ok: true, employee };
}

function getSaleDetails(saleId) {
  return saleDetails
    .filter((detail) => detail.saleId === saleId)
    .map((detail) => {
      const service = detail.serviceId ? serviceStore.findById(detail.serviceId) : null;
      const product = detail.productId ? productStore.findById(detail.productId) : null;

      return {
        ...detail,
        itemName:
          detail.itemType === "service"
            ? service?.name ?? "Servicio no disponible"
            : `${product?.brand ?? ""} ${product?.model ?? ""}`.trim() || "Producto no disponible",
        category: service?.category ?? product?.category ?? "",
      };
    });
}

function enrichSale(sale) {
  const client = clientStore.findById(sale.clientId);
  const employee = employeeStore.findById(sale.employeeId);
  const commission = commissions.find((item) => item.saleId === sale.id) ?? null;

  return {
    ...sale,
    type: sale.type ?? "service",
    paymentMethodLabel: PAYMENT_METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod,
    client: client
      ? {
          id: client.id,
          name: fullName(client),
          phone: client.phone,
        }
      : null,
    employee: employee
      ? {
          id: employee.id,
          name: fullName(employee),
          commissionRate: employee.commissionRate,
        }
      : null,
    details: getSaleDetails(sale.id),
    commission,
  };
}

function buildUnifiedSaleValidation(payload, currentUser) {
  const baseValidation = validateClientEmployeePayment(payload, currentUser);
  const errors = { ...baseValidation.errors };
  const discount = Number(payload.discount ?? 0);
  const normalizedLines = normalizeSaleLines(payload);
  const saleLines = [];
  const stockMovements = new Map();

  if (!Number.isFinite(discount) || discount < 0) {
    errors.discount = "Ingrese un descuento valido.";
  }
  if (normalizedLines.length === 0) {
    errors.lineItems = "Agregue al menos un item a la venta.";
  }

  normalizedLines.forEach((line, index) => {
    if (!line.itemType) {
      errors[`lineItems.${index}.itemType`] = "Seleccione producto o servicio.";
    }
    if (!line.itemId) {
      errors[`lineItems.${index}.itemId`] = "Seleccione un item.";
    }
    if (!line.quantity) {
      errors[`lineItems.${index}.quantity`] = "Ingrese una cantidad mayor a 0.";
    }

    const product = line.itemType === "product" && line.itemId ? productStore.findById(line.itemId) : null;
    const service = line.itemType === "service" && line.itemId ? serviceStore.findById(line.itemId) : null;
    const item = product ?? service;

    if (line.itemId && !item) {
      errors[`lineItems.${index}.itemId`] = "El item seleccionado no existe.";
    }
    if (item && item.status !== "active") {
      errors[`lineItems.${index}.itemId`] = "El item seleccionado no esta activo.";
    }

    if (item && line.quantity) {
      const price = product ? product.price : service.price;
      const expectedUnitPrice = money(price);
      const expectedLineTotal = money(price * line.quantity);

      if (!Number.isFinite(line.unitPrice) || !sameMoney(line.unitPrice, expectedUnitPrice)) {
        errors[`lineItems.${index}.unitPrice`] = "El precio unitario no coincide con el item.";
      }
      if (!Number.isFinite(line.lineTotal) || !sameMoney(line.lineTotal, expectedLineTotal)) {
        errors[`lineItems.${index}.lineTotal`] = "El subtotal no coincide con cantidad y precio.";
      }

      if (product) {
        stockMovements.set(product.id, (stockMovements.get(product.id) ?? 0) + line.quantity);
      }

      saleLines.push({ ...line, product, service, unitPrice: expectedUnitPrice, lineTotal: expectedLineTotal });
    }
  });

  stockMovements.forEach((quantity, productId) => {
    const product = productStore.findById(productId);

    if (product && product.stock < quantity) {
      errors.lineItems = `Stock insuficiente para ${product.brand} ${product.model}. Disponible: ${product.stock}.`;
    }
  });

  const subtotal = money(saleLines.reduce((total, line) => total + line.lineTotal, 0));

  if (Number.isFinite(discount) && discount > subtotal) {
    errors.discount = "El descuento no puede superar el total de la venta.";
  }

  return {
    errors,
    data: {
      client: baseValidation.client,
      employee: baseValidation.employee,
      saleLines,
      stockMovements: [...stockMovements.entries()].map(([productId, quantity]) => ({
        productId,
        quantity,
      })),
      paymentMethod: baseValidation.paymentMethod,
      discount: money(discount),
      subtotal,
      soldAt: parseSaleDate(payload.soldAt).toISOString(),
    },
  };
}

function enrichVisit(visit) {
  const sale = sales.find((item) => item.id === visit.saleId) ?? null;
  const employee = employeeStore.findById(visit.employeeId);
  const service = serviceStore.findById(visit.serviceId);

  return {
    ...visit,
    service: service
      ? {
          id: service.id,
          name: service.name,
          category: service.category,
          price: service.price,
        }
      : null,
    employee: employee
      ? {
          id: employee.id,
          name: fullName(employee),
        }
      : null,
    sale: sale
      ? {
          id: sale.id,
          folio: sale.folio,
          total: sale.total,
          paymentMethod: sale.paymentMethod,
          paymentMethodLabel: PAYMENT_METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod,
        }
      : null,
  };
}

function getClientVisitSummary(clientId) {
  const clientVisits = visits
    .filter((visit) => visit.clientId === clientId)
    .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt));

  return {
    visitCount: clientVisits.length,
    lastVisitAt: clientVisits[0]?.visitedAt ?? null,
  };
}

function filterEmployeeSales(employeeId, filters = {}) {
  const type = filters.type ?? "all";
  const fromDate = normalizeDateFilter(filters.from, "00:00:00.000");
  const toDate = normalizeDateFilter(filters.to, "23:59:59.999");

  return sales.filter((sale) => {
    const soldAt = new Date(sale.soldAt);
    const saleType = sale.type ?? "service";
    const matchesEmployee = sale.employeeId === employeeId;
    const matchesType = type === "all" || saleType === type;
    const matchesFrom = !fromDate || soldAt >= fromDate;
    const matchesTo = !toDate || soldAt <= toDate;

    return matchesEmployee && matchesType && matchesFrom && matchesTo;
  });
}

function canAccessSale(sale, currentUser) {
  if (currentUser.role === "admin") return true;

  const employee = employeeStore.findByUserId(currentUser.id);

  return Boolean(employee && sale.employeeId === employee.id);
}

function filterSalesForUser(currentUser, filters = {}) {
  const query = normalize(filters.query ?? "");
  const fromDate = normalizeDateFilter(filters.from, "00:00:00.000");
  const toDate = normalizeDateFilter(filters.to, "23:59:59.999");

  return sales.filter((sale) => {
    if (!canAccessSale(sale, currentUser)) return false;

    const soldAt = new Date(sale.soldAt);
    const enriched = enrichSale(sale);
    const detailText = getSaleDetails(sale.id).map((detail) => detail.itemName).join(" ");
    const matchesQuery =
      !query ||
      normalize(sale.folio).includes(query) ||
      normalize(enriched.client?.name).includes(query) ||
      normalize(enriched.employee?.name).includes(query) ||
      normalize(detailText).includes(query);
    const matchesFrom = !fromDate || soldAt >= fromDate;
    const matchesTo = !toDate || soldAt <= toDate;

    return matchesQuery && matchesFrom && matchesTo;
  });
}

function buildSalesTotals(filteredSales) {
  const totals = filteredSales.reduce(
    (summary, sale) => {
      const saleType = sale.type ?? "service";
      const commission = commissions.find((item) => item.saleId === sale.id);

      return {
        count: summary.count + 1,
        subtotal: money(summary.subtotal + sale.subtotal),
        discount: money(summary.discount + sale.discount),
        total: money(summary.total + sale.total),
        commission: money(summary.commission + (commission?.amount ?? 0)),
        adminProfit: money(summary.adminProfit + (commission?.adminAmount ?? 0)),
        services: summary.services + (saleType === "service" ? 1 : 0),
        products: summary.products + (saleType === "product" ? 1 : 0),
      };
    },
    {
      count: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
      commission: 0,
      adminProfit: 0,
      services: 0,
      products: 0,
    },
  );

  return totals;
}

function buildSalesSummary(filteredSales) {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const todaySales = filteredSales.filter((sale) => sale.soldAt.slice(0, 10) === today);
  const monthSales = filteredSales.filter((sale) => sale.soldAt.slice(0, 7) === month);
  const uniqueTodayClients = new Set(todaySales.map((sale) => sale.clientId));
  const total = money(filteredSales.reduce((sum, sale) => sum + sale.total, 0));

  return {
    todaySales: todaySales.length,
    todayTotal: money(todaySales.reduce((sum, sale) => sum + sale.total, 0)),
    todayClients: uniqueTodayClients.size,
    averageTicket: filteredSales.length > 0 ? money(total / filteredSales.length) : 0,
    monthIncome: money(monthSales.reduce((sum, sale) => sum + sale.total, 0)),
  };
}

function buildSalesFilters(filters = {}) {
  return {
    query: filters.query ?? "",
    from: filters.from ?? "",
    to: filters.to ?? "",
    type: filters.type ?? "all",
    page: parsePaginationValue(filters.page, 1),
    pageSize: parsePaginationValue(filters.pageSize, 10, { min: 1, max: 100 }),
  };
}

export const salesStore = {
  getOptions(currentUser) {
    const clients = clientStore.list({ status: "active" }).data;
    const employees = employeeStore.list({ status: "active" }).data;
    const products = productStore.list({ status: "active" }).data;
    const services = serviceStore.list({ status: "active" }).data;
    const currentEmployee =
      currentUser.role === "employee" ? employeeStore.findByUserId(currentUser.id) : null;

    return {
      ok: true,
      status: 200,
      data: {
        clients,
        employees: currentEmployee ? [currentEmployee] : employees,
        products,
        services,
        currentEmployee,
        paymentMethods: [
          { value: "cash", label: "Efectivo" },
          { value: "card", label: "Tarjeta" },
          { value: "transfer", label: "Transferencia" },
          { value: "mixed", label: "Mixto" },
        ],
      },
    };
  },

  getClientVisitSummary,

  listSales(currentUser, filters = {}) {
    const filteredSales = [...filterSalesForUser(currentUser, filters)].sort(
      (a, b) => new Date(b.soldAt) - new Date(a.soldAt),
    );
    const paginatedSales = paginateCollection(filteredSales, filters);

    return {
      ok: true,
      status: 200,
      data: {
        sales: paginatedSales.items.map(enrichSale),
        totals: buildSalesTotals(filteredSales),
        summary: buildSalesSummary(filteredSales),
        filters: buildSalesFilters(filters),
        pagination: paginatedSales.pagination,
      },
    };
  },

  getSale(id, currentUser) {
    const sale = sales.find((item) => item.id === id);

    if (!sale || !canAccessSale(sale, currentUser)) {
      return makeError("Venta no encontrada.", {}, 404);
    }

    return { ok: true, status: 200, data: enrichSale(sale) };
  },

  deleteSale(id, currentUser) {
    const sale = sales.find((item) => item.id === id);

    if (!sale || !canAccessSale(sale, currentUser)) {
      return makeError("Venta no encontrada.", {}, 404);
    }

    sales = sales.filter((item) => item.id !== id);
    saleDetails = saleDetails.filter((detail) => detail.saleId !== id);
    visits = visits.filter((visit) => visit.saleId !== id);
    commissions = commissions.filter((commission) => commission.saleId !== id);

    return {
      ok: true,
      status: 200,
      data: { id },
      message: "Venta eliminada correctamente.",
    };
  },

  listClientVisits(clientId) {
    const client = clientStore.findById(clientId);

    if (!client) {
      return makeError("Cliente no encontrado.", {}, 404);
    }

    const clientVisits = visits
      .filter((visit) => visit.clientId === clientId)
      .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt))
      .map(enrichVisit);

    return {
      ok: true,
      status: 200,
      data: {
        client,
        visitCount: clientVisits.length,
        visits: clientVisits,
      },
    };
  },

  createServiceSale(payload, currentUser) {
    const validation = buildServiceSaleValidation(payload, currentUser);

    if (Object.keys(validation.errors).length > 0) {
      return makeError("No se pudo registrar la venta de servicio.", validation.errors, 422);
    }

    const { client, employee, service, paymentMethod, discount } = validation.data;
    const soldAt = new Date().toISOString();
    const subtotal = money(service.price);
    const total = money(subtotal - discount);
    const saleId = nextId(sales);
    const sale = {
      id: saleId,
      folio: nextFolio(soldAt),
      type: "service",
      clientId: client.id,
      employeeId: employee.id,
      userId: currentUser.id,
      subtotal,
      discount,
      total,
      paymentMethod,
      status: "completed",
      soldAt,
    };
    const detail = {
      id: nextId(saleDetails),
      saleId,
      itemType: "service",
      serviceId: service.id,
      quantity: 1,
      unitPrice: subtotal,
      lineTotal: subtotal,
    };
    const visit = {
      id: nextId(visits),
      saleId,
      clientId: client.id,
      employeeId: employee.id,
      serviceId: service.id,
      visitedAt: soldAt,
      notes: payload.notes?.trim() ?? "",
    };
    const commission = buildCommissionRecord({
      saleId,
      employeeId: employee.id,
      employeeCommissionRate: employee.commissionRate,
      serviceSubtotal: subtotal,
      productSubtotal: 0,
      discount,
      generatedAt: soldAt,
    });

    sales = [...sales, sale];
    saleDetails = [...saleDetails, detail];
    visits = [...visits, visit];
    commissions = [...commissions, commission];

    return {
      ok: true,
      status: 201,
      data: {
        sale,
        detail,
        visit,
        commission,
        client,
        employee,
        service,
      },
      message: "Venta de servicio registrada correctamente.",
    };
  },

  createProductSale(payload, currentUser) {
    const validation = buildProductSaleValidation(payload, currentUser);

    if (Object.keys(validation.errors).length > 0) {
      return makeError("No se pudo registrar la venta de producto.", validation.errors, 422);
    }

    const {
      client,
      employee,
      linkedService,
      productLines,
      stockMovements,
      paymentMethod,
      discount,
      subtotal,
    } = validation.data;
    const soldAt = new Date().toISOString();
    const total = money(subtotal - discount);
    const saleId = nextId(sales);
    const firstDetailId = nextId(saleDetails);
    const stockResults = stockMovements.map((movement) =>
      productStore.decreaseStock(movement.productId, movement.quantity),
    );
    const failedStockUpdate = stockResults.find((result) => !result.ok);

    if (failedStockUpdate) {
      return failedStockUpdate;
    }

    const sale = {
      id: saleId,
      folio: nextFolio(soldAt, "PROD"),
      type: "product",
      clientId: client.id,
      employeeId: employee.id,
      userId: currentUser.id,
      linkedServiceId: linkedService?.id ?? null,
      subtotal,
      discount,
      total,
      paymentMethod,
      status: "completed",
      soldAt,
      notes: payload.notes?.trim() ?? "",
    };
    const details = productLines.map((line, index) => ({
      id: firstDetailId + index,
      saleId,
      itemType: "product",
      productId: line.product.id,
      quantity: line.quantity,
      unitPrice: money(line.product.price),
      lineTotal: money(line.product.price * line.quantity),
    }));
    const commission = buildCommissionRecord({
      saleId,
      employeeId: employee.id,
      employeeCommissionRate: employee.commissionRate,
      serviceSubtotal: 0,
      productSubtotal: subtotal,
      discount,
      generatedAt: soldAt,
    });

    sales = [...sales, sale];
    saleDetails = [...saleDetails, ...details];
    commissions = [...commissions, commission];

    return {
      ok: true,
      status: 201,
      data: {
        sale,
        details,
        commission,
        client,
        employee,
        linkedService,
        products: productLines.map((line) => line.product),
        stockMovements: stockResults.map((result) => result.data),
      },
      message: "Venta de producto registrada y stock actualizado correctamente.",
    };
  },

  createSale(payload, currentUser) {
    const validation = buildUnifiedSaleValidation(payload, currentUser);

    if (Object.keys(validation.errors).length > 0) {
      return makeError("No se pudo registrar la venta.", validation.errors, 422);
    }

    const {
      client,
      employee,
      saleLines,
      stockMovements,
      paymentMethod,
      discount,
      subtotal,
      soldAt,
    } = validation.data;
    const total = money(subtotal - discount);
    const serviceSubtotal = money(
      saleLines.reduce((sum, line) => sum + (line.itemType === "service" ? line.lineTotal : 0), 0),
    );
    const productSubtotal = money(
      saleLines.reduce((sum, line) => sum + (line.itemType === "product" ? line.lineTotal : 0), 0),
    );
    const saleId = nextId(sales);
    const firstDetailId = nextId(saleDetails);
    const firstVisitId = nextId(visits);
    const stockResults = stockMovements.map((movement) =>
      productStore.decreaseStock(movement.productId, movement.quantity),
    );
    const failedStockUpdate = stockResults.find((result) => !result.ok);

    if (failedStockUpdate) {
      return failedStockUpdate;
    }

    const type = saleLines.every((line) => line.itemType === "service")
      ? "service"
      : saleLines.every((line) => line.itemType === "product")
        ? "product"
        : "mixed";
    const sale = {
      id: saleId,
      folio: nextFolio(soldAt, type === "product" ? "PROD" : type === "service" ? "SERV" : "VENT"),
      type,
      clientId: client.id,
      employeeId: employee.id,
      userId: currentUser.id,
      subtotal,
      discount,
      total,
      paymentMethod,
      status: "completed",
      soldAt,
      notes: payload.notes?.trim() ?? "",
    };
    const details = saleLines.map((line, index) => ({
      id: firstDetailId + index,
      saleId,
      itemType: line.itemType,
      serviceId: line.service?.id ?? null,
      productId: line.product?.id ?? null,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
    }));
    const serviceVisits = saleLines
      .filter((line) => line.itemType === "service")
      .map((line, index) => ({
        id: firstVisitId + index,
        saleId,
        clientId: client.id,
        employeeId: employee.id,
        serviceId: line.service.id,
        visitedAt: soldAt,
        notes: payload.notes?.trim() ?? "",
      }));
    const commission = buildCommissionRecord({
      saleId,
      employeeId: employee.id,
      employeeCommissionRate: employee.commissionRate,
      serviceSubtotal,
      productSubtotal,
      discount,
      generatedAt: soldAt,
    });

    sales = [...sales, sale];
    saleDetails = [...saleDetails, ...details];
    visits = [...visits, ...serviceVisits];
    commissions = [...commissions, commission];

    return {
      ok: true,
      status: 201,
      data: {
        sale,
        details,
        visits: serviceVisits,
        commission,
        client,
        employee,
        stockMovements: stockResults.map((result) => result.data),
      },
      message: "Venta registrada correctamente.",
    };
  },

  listAuthenticatedEmployeeSales(currentUser, filters = {}) {
    const employeeResult = getAuthenticatedEmployee(currentUser);

    if (!employeeResult.ok) {
      return employeeResult;
    }

    const filteredSales = [...filterEmployeeSales(employeeResult.employee.id, filters)].sort(
      (a, b) => new Date(b.soldAt) - new Date(a.soldAt),
    );
    const paginatedSales = paginateCollection(filteredSales, filters);

    return {
      ok: true,
      status: 200,
      data: {
        employee: employeeResult.employee,
        sales: paginatedSales.items.map(enrichSale),
        totals: buildSalesTotals(filteredSales),
        filters: buildSalesFilters(filters),
        pagination: paginatedSales.pagination,
      },
    };
  },

  listAuthenticatedEmployeeCommissions(currentUser, filters = {}) {
    const employeeResult = getAuthenticatedEmployee(currentUser);

    if (!employeeResult.ok) {
      return employeeResult;
    }

    const filteredSales = filterEmployeeSales(employeeResult.employee.id, filters);
    const saleIds = new Set(filteredSales.map((sale) => sale.id));
    const employeeCommissions = commissions
      .filter(
        (commission) =>
          commission.employeeId === employeeResult.employee.id && saleIds.has(commission.saleId),
      )
      .map((commission) => {
        const sale = sales.find((item) => item.id === commission.saleId);

        return {
          ...commission,
          sale: sale ? enrichSale(sale) : null,
        };
      })
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    const paginatedCommissions = paginateCollection(employeeCommissions, filters);

    return {
      ok: true,
      status: 200,
      data: {
        employee: employeeResult.employee,
        commissions: paginatedCommissions.items,
        totals: {
          count: employeeCommissions.length,
          amount: money(
            employeeCommissions.reduce((total, commission) => total + commission.amount, 0),
          ),
          pending: money(
            employeeCommissions
              .filter((commission) => commission.status === "pending")
              .reduce((total, commission) => total + commission.amount, 0),
          ),
        },
        filters: buildSalesFilters(filters),
        pagination: paginatedCommissions.pagination,
      },
    };
  },
};

export const __salesFinancialInternals = {
  allocateDiscountCents,
  buildCommissionRecord,
  centsToMoney,
  money,
  percentageAmountCents,
  toCents,
};
