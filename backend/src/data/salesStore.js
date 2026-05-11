import { clientStore } from "./clientStore.js";
import { employeeStore } from "./employeeStore.js";
import { serviceStore } from "./serviceStore.js";

const PAYMENT_METHODS = new Set(["cash", "card", "transfer", "mixed"]);

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

function money(value) {
  return Math.round(Number(value) * 100) / 100;
}

function nextId(collection) {
  return collection.length > 0 ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function nextFolio(soldAt) {
  const date = soldAt.slice(0, 10).replaceAll("-", "");
  return `SERV-${date}-${String(sales.length + 1).padStart(4, "0")}`;
}

function buildValidation(payload, currentUser) {
  const errors = {};
  const clientId = parsePositiveInteger(payload.clientId);
  const employeeId = parsePositiveInteger(payload.employeeId);
  const serviceId = parsePositiveInteger(payload.serviceId);
  const paymentMethod = payload.paymentMethod?.trim() ?? "";
  const discount = Number(payload.discount ?? 0);

  if (!clientId) errors.clientId = "Seleccione un cliente.";
  if (!employeeId) errors.employeeId = "Seleccione un empleado.";
  if (!serviceId) errors.serviceId = "Seleccione un servicio.";
  if (!PAYMENT_METHODS.has(paymentMethod)) {
    errors.paymentMethod = "Seleccione un metodo de pago valido.";
  }
  if (!Number.isFinite(discount) || discount < 0) {
    errors.discount = "Ingrese un descuento valido.";
  }

  const client = clientId ? clientStore.findById(clientId) : null;
  const employee = employeeId ? employeeStore.findById(employeeId) : null;
  const service = serviceId ? serviceStore.findById(serviceId) : null;

  if (clientId && (!client || client.status !== "active")) {
    errors.clientId = "El cliente seleccionado no esta activo.";
  }
  if (employeeId && (!employee || employee.status !== "active")) {
    errors.employeeId = "El empleado seleccionado no esta activo.";
  }
  if (serviceId && (!service || service.status !== "active")) {
    errors.serviceId = "El servicio seleccionado no esta activo.";
  }
  if (currentUser.role === "employee") {
    const currentEmployee = employeeStore.findByUserId(currentUser.id);

    if (currentEmployee && currentEmployee.id !== employeeId) {
      errors.employeeId = "Solo puedes registrar ventas a tu nombre.";
    }
  }
  if (service && Number.isFinite(discount) && discount > service.price) {
    errors.discount = "El descuento no puede superar el precio del servicio.";
  }

  return {
    errors,
    data: {
      client,
      employee,
      service,
      paymentMethod,
      discount: money(discount),
    },
  };
}

export const salesStore = {
  getOptions(currentUser) {
    const clients = clientStore.list({ status: "active" }).data;
    const employees = employeeStore.list({ status: "active" }).data;
    const services = serviceStore.list({ status: "active" }).data;
    const currentEmployee =
      currentUser.role === "employee" ? employeeStore.findByUserId(currentUser.id) : null;

    return {
      ok: true,
      status: 200,
      data: {
        clients,
        employees: currentEmployee ? [currentEmployee] : employees,
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
    const validation = buildValidation(payload, currentUser);

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
};
