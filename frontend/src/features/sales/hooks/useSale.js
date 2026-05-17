import { useCallback, useEffect, useMemo, useState } from "react";
import { salesService } from "../services/salesService";

const SERVICE_EMPLOYEE_PERCENTAGE = 80;
const SERVICE_ADMIN_PERCENTAGE = 20;
const EMPTY_LINE = { itemType: "", category: "", itemId: "", quantity: "1" };

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const money = (value) => Math.round(Number(value) * 100) / 100;

const buildEmptyForm = (options = {}) => ({
  clientId: "",
  employeeId: String(options.currentEmployee?.id ?? options.employees?.[0]?.id ?? ""),
  soldAt: toDateInputValue(new Date()),
  paymentMethod: "cash",
  notes: "",
  discount: "0",
  lineItems: [{ ...EMPTY_LINE }],
});

const productName = (product) => `${product.brand} ${product.model}`.trim();

export function useSale() {
  const [form, setForm] = useState(buildEmptyForm());
  const [options, setOptions] = useState({
    clients: [],
    employees: [],
    products: [],
    services: [],
    paymentMethods: [],
    currentEmployee: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [lastSale, setLastSale] = useState(null);

  const hydrateOptions = (data) => {
    setOptions(data);
    setForm((current) => ({
      ...current,
      employeeId: current.employeeId || String(data.currentEmployee?.id ?? data.employees[0]?.id ?? ""),
    }));
  };

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    setRequestError("");

    const response = await salesService.getOptions();

    if (!response.ok) {
      setRequestError(response.message);
      setIsLoading(false);
      return response;
    }

    hydrateOptions(response.data);
    setIsLoading(false);
    return response;
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchOptions() {
      setIsLoading(true);
      setRequestError("");

      const response = await salesService.getOptions();

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
        setIsLoading(false);
        return;
      }

      hydrateOptions(response.data);
      setIsLoading(false);
    }

    fetchOptions();

    return () => {
      isActive = false;
    };
  }, []);

  const requestedByProduct = useMemo(() => {
    const totals = new Map();

    form.lineItems.forEach((line) => {
      if (line.itemType !== "product") return;

      const productId = Number(line.itemId);
      const quantity = Number(line.quantity || 0);

      if (!Number.isInteger(productId) || productId <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
        return;
      }

      totals.set(productId, (totals.get(productId) ?? 0) + quantity);
    });

    return totals;
  }, [form.lineItems]);

  const lineItems = useMemo(
    () =>
      form.lineItems.map((line) => {
        const product =
          line.itemType === "product"
            ? options.products.find((item) => item.id === Number(line.itemId)) ?? null
            : null;
        const service =
          line.itemType === "service"
            ? options.services.find((item) => item.id === Number(line.itemId)) ?? null
            : null;
        const item = product ?? service;
        const quantity = Number(line.quantity || 0);
        const validQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
        const unitPrice = item ? item.price : 0;
        const requestedTotal = product ? requestedByProduct.get(product.id) ?? validQuantity : validQuantity;
        const exceedsStock = Boolean(product && requestedTotal > product.stock);
        const isOutOfStock = Boolean(product && product.stock <= 0);

        return {
          ...line,
          product,
          service,
          item,
          itemName: product ? productName(product) : service?.name ?? "",
          quantity: validQuantity,
          requestedTotal,
          unitPrice,
          lineTotal: money(unitPrice * validQuantity),
          exceedsStock,
          isOutOfStock,
        };
      }),
    [form.lineItems, options.products, options.services, requestedByProduct],
  );

  const categoriesByType = useMemo(
    () => ({
      product: [...new Set(options.products.map((product) => product.category))],
      service: [...new Set(options.services.map((service) => service.category))],
    }),
    [options.products, options.services],
  );

  const subtotal = money(lineItems.reduce((total, line) => total + line.lineTotal, 0));
  const discount = Number(form.discount || 0);
  const total = money(Math.max(subtotal - (Number.isFinite(discount) ? discount : 0), 0));
  const serviceTotal = money(
    lineItems.reduce((sum, line) => sum + (line.itemType === "service" ? line.lineTotal : 0), 0),
  );
  const employeeServiceEarning = money((serviceTotal * SERVICE_EMPLOYEE_PERCENTAGE) / 100);
  const adminServiceProfit = money((serviceTotal * SERVICE_ADMIN_PERCENTAGE) / 100);
  const inventoryBlockingMessages = [
    ...new Set(
      lineItems
        .filter((line) => line.product && (line.isOutOfStock || line.exceedsStock))
        .map((line) =>
          line.isOutOfStock
            ? `${line.itemName} no tiene inventario disponible.`
            : `${line.itemName} solo tiene ${line.product.stock} unidad(es) disponible(s).`,
        ),
    ),
  ];
  const hasInventoryBlock = inventoryBlockingMessages.length > 0;

  const clearMessages = () => {
    setRequestError("");
    setSuccessMessage("");
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    clearMessages();
  };

  const updateLine = (index, field, value) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((line, currentIndex) => {
        if (currentIndex !== index) return line;

        if (field === "itemType") {
          return { ...EMPTY_LINE, itemType: value };
        }

        if (field === "category") {
          return { ...line, category: value, itemId: "" };
        }

        return { ...line, [field]: value };
      }),
    }));
    setErrors((current) => ({
      ...current,
      lineItems: undefined,
      [`lineItems.${index}.${field}`]: undefined,
    }));
    clearMessages();
  };

  const addLine = () => {
    setForm((current) => ({
      ...current,
      lineItems: [...current.lineItems, { ...EMPTY_LINE }],
    }));
    clearMessages();
  };

  const removeLine = (index) => {
    setForm((current) => ({
      ...current,
      lineItems:
        current.lineItems.length === 1
          ? [{ ...EMPTY_LINE }]
          : current.lineItems.filter((_, currentIndex) => currentIndex !== index),
    }));
    setErrors({});
    clearMessages();
  };

  const resetForm = () => {
    setForm(buildEmptyForm(options));
    setErrors({});
    setRequestError("");
    setSuccessMessage("");
    setLastSale(null);
  };

  const validateLines = () => {
    const nextErrors = {};

    lineItems.forEach((line, index) => {
      if (!line.itemType) nextErrors[`lineItems.${index}.itemType`] = "Seleccione un tipo.";
      if (!line.category) nextErrors[`lineItems.${index}.category`] = "Seleccione una categoria.";
      if (!line.itemId || !line.item) nextErrors[`lineItems.${index}.itemId`] = "Seleccione un item.";
      if (!line.quantity) nextErrors[`lineItems.${index}.quantity`] = "Ingrese una cantidad mayor a 0.";
      if (line.exceedsStock) nextErrors[`lineItems.${index}.quantity`] = "La cantidad supera el stock.";
    });

    return nextErrors;
  };

  const submit = async () => {
    const lineValidationErrors = validateLines();

    if (Object.keys(lineValidationErrors).length > 0 || hasInventoryBlock) {
      setErrors((current) => ({
        ...current,
        ...lineValidationErrors,
        ...(hasInventoryBlock ? { lineItems: "Corrige el inventario antes de registrar la venta." } : {}),
      }));
      setRequestError("No se pudo registrar la venta.");
      setSuccessMessage("");
      return { ok: false, status: 422, errors: lineValidationErrors };
    }

    setIsSaving(true);
    setRequestError("");
    setSuccessMessage("");

    const response = await salesService.createSale({
      clientId: Number(form.clientId),
      employeeId: Number(form.employeeId),
      soldAt: form.soldAt,
      paymentMethod: form.paymentMethod,
      discount: Number(form.discount || 0),
      notes: form.notes,
      lineItems: lineItems.map((line) => ({
        itemType: line.itemType,
        itemId: Number(line.itemId),
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
      })),
    });

    setIsSaving(false);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setRequestError(response.message);
      return response;
    }

    setErrors({});
    setLastSale(response.data);
    setSuccessMessage(response.message ?? "Venta registrada correctamente.");
    setForm((current) => ({
      ...buildEmptyForm(options),
      employeeId: current.employeeId,
      paymentMethod: current.paymentMethod,
    }));
    await loadOptions();
    return response;
  };

  return {
    form,
    options,
    errors,
    isLoading,
    isSaving,
    requestError,
    successMessage,
    lastSale,
    lineItems,
    categoriesByType,
    subtotal,
    total,
    serviceTotal,
    employeeServiceEarning,
    adminServiceProfit,
    inventoryBlockingMessages,
    hasInventoryBlock,
    updateField,
    updateLine,
    addLine,
    removeLine,
    resetForm,
    submit,
    loadOptions,
  };
}
