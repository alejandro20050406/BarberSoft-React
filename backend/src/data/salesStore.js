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

function normalizeDateFilter(value, boundary) {
  if (!value) return null;

  const date = new Date(`${value}T${boundary}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function fullName(person) {
  return `${person?.firstName ?? ""} ${person?.lastName ?? ""}`.trim();
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

  if (!clientId) errors.clientId = "Seleccione un cliente.";
  if (!employeeId) errors.employeeId = "Seleccione un empleado.";
  if (!PAYMENT_METHODS.has(paymentMethod)) {
    errors.paymentMethod = "Seleccione un metodo de pago valido.";
  }

  const client = clientId ? clientStore.findById(clientId) : null;
  const employee = employeeId ? employeeStore.findById(employeeId) : null;

  if (clientId && (!client || client.status !== "active")) {
    errors.clientId = "El cliente seleccionado no esta activo.";
  }
  if (employeeId && (!employee || employee.status !== "active")) {
    errors.employeeId = "El empleado seleccionado no esta activo.";
  }
  if (currentUser.role === "employee") {
    const currentEmployee = employeeStore.findByUserId(currentUser.id);

    if (currentEmployee && currentEmployee.id !== employeeId) {
      errors.employeeId = "Solo puedes registrar ventas a tu nombre.";
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

  if (serviceId && (!service || service.status !== "active")) {
    errors.serviceId = "El servicio seleccionado no esta activo.";
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
  }));
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

    if (line.productId && (!product || product.status !== "active")) {
      errors[`lineItems.${index}.productId`] = "El producto seleccionado no esta activo.";
    }
    if (product && line.quantity) {
      productLines.push({ ...line, product });
      quantitiesByProduct.set(
        product.id,
        (quantitiesByProduct.get(product.id) ?? 0) + line.quantity,
      );
    }
  });

  const linkedService = linkedServiceId ? serviceStore.findById(linkedServiceId) : null;

  if (linkedServiceId && (!linkedService || linkedService.status !== "active")) {
    errors.linkedServiceId = "El servicio ligado no esta activo.";
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
      services: 0,
      products: 0,
    },
  );

  return totals;
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
    const commission = {
      id: nextId(commissions),
      saleId,
      employeeId: employee.id,
      percentage: employee.commissionRate,
      amount: money((total * employee.commissionRate) / 100),
      status: "pending",
      generatedAt: soldAt,
    };

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
    const commission = {
      id: nextId(commissions),
      saleId,
      employeeId: employee.id,
      percentage: employee.commissionRate,
      amount: money((total * employee.commissionRate) / 100),
      status: "pending",
      generatedAt: soldAt,
    };

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

  listAuthenticatedEmployeeSales(currentUser, filters = {}) {
    const employeeResult = getAuthenticatedEmployee(currentUser);

    if (!employeeResult.ok) {
      return employeeResult;
    }

    const filteredSales = [...filterEmployeeSales(employeeResult.employee.id, filters)].sort(
      (a, b) => new Date(b.soldAt) - new Date(a.soldAt),
    );

    return {
      ok: true,
      status: 200,
      data: {
        employee: employeeResult.employee,
        sales: filteredSales.map(enrichSale),
        totals: buildSalesTotals(filteredSales),
        filters: {
          from: filters.from ?? "",
          to: filters.to ?? "",
          type: filters.type ?? "all",
        },
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

    return {
      ok: true,
      status: 200,
      data: {
        employee: employeeResult.employee,
        commissions: employeeCommissions,
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
        filters: {
          from: filters.from ?? "",
          to: filters.to ?? "",
          type: filters.type ?? "all",
        },
      },
    };
  },
};
