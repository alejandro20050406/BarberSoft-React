import { useCallback, useEffect, useMemo, useState } from "react";
import { salesService } from "../services/salesService";

const EMPTY_LINE = { productId: "", quantity: "1" };

const buildEmptyForm = (options = {}) => ({
  clientId: "",
  employeeId: String(options.currentEmployee?.id ?? options.employees?.[0]?.id ?? ""),
  linkedServiceId: "",
  paymentMethod: options.paymentMethods?.[0]?.value ?? "cash",
  discount: "0",
  notes: "",
  lineItems: [{ ...EMPTY_LINE }],
});

export function useProductSale() {
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
      paymentMethod: current.paymentMethod || data.paymentMethods[0]?.value || "cash",
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
      const productId = Number(line.productId);
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
        const product = options.products.find((item) => item.id === Number(line.productId)) ?? null;
        const quantity = Number(line.quantity || 0);
        const validQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
        const requestedTotal = product ? requestedByProduct.get(product.id) ?? validQuantity : validQuantity;
        const isOutOfStock = Boolean(product && product.stock <= 0);
        const exceedsStock = Boolean(product && requestedTotal > product.stock);
        const reachesMinimum = Boolean(
          product && product.stock - requestedTotal <= product.minStock && !exceedsStock,
        );

        return {
          ...line,
          product,
          quantity: validQuantity,
          requestedTotal,
          availableAfterSale: product ? product.stock - requestedTotal : null,
          isOutOfStock,
          exceedsStock,
          reachesMinimum,
          lineTotal: product ? product.price * validQuantity : 0,
        };
      }),
    [form.lineItems, options.products, requestedByProduct],
  );

  const linkedService = useMemo(
    () => options.services.find((service) => service.id === Number(form.linkedServiceId)) ?? null,
    [form.linkedServiceId, options.services],
  );
  const subtotal = lineItems.reduce((total, line) => total + line.lineTotal, 0);
  const discount = Number(form.discount || 0);
  const total = Math.max(subtotal - (Number.isFinite(discount) ? discount : 0), 0);
  const activeProductsCount = options.products.length;
  const lowStockProductsCount = options.products.filter(
    (product) => product.stock > 0 && product.stock <= product.minStock,
  ).length;
  const outOfStockProductsCount = options.products.filter((product) => product.stock <= 0).length;
  const inventoryBlockingMessages = [
    ...new Set(
      lineItems
        .filter((line) => line.product && (line.isOutOfStock || line.exceedsStock))
        .map((line) =>
          line.isOutOfStock
            ? `${line.product.brand} ${line.product.model} no tiene inventario disponible.`
            : `${line.product.brand} ${line.product.model} solo tiene ${line.product.stock} unidad(es) disponible(s).`,
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
      lineItems: current.lineItems.map((line, currentIndex) =>
        currentIndex === index ? { ...line, [field]: value } : line,
      ),
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

  const submit = async () => {
    setIsSaving(true);
    setRequestError("");
    setSuccessMessage("");

    const response = await salesService.createProductSale({
      clientId: Number(form.clientId),
      employeeId: Number(form.employeeId),
      linkedServiceId: form.linkedServiceId ? Number(form.linkedServiceId) : null,
      lineItems: form.lineItems.map((line) => ({
        productId: Number(line.productId),
        quantity: Number(line.quantity),
      })),
      paymentMethod: form.paymentMethod,
      discount: Number(form.discount || 0),
      notes: form.notes,
    });

    setIsSaving(false);

    if (!response.ok) {
      setErrors(response.errors ?? {});
      setRequestError(response.message);
      return response;
    }

    setErrors({});
    setLastSale(response.data);
    setSuccessMessage(response.message ?? "Venta de producto registrada correctamente.");
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
    linkedService,
    lineItems,
    activeProductsCount,
    lowStockProductsCount,
    outOfStockProductsCount,
    inventoryBlockingMessages,
    hasInventoryBlock,
    subtotal,
    total,
    updateField,
    updateLine,
    addLine,
    removeLine,
    resetForm,
    submit,
    loadOptions,
  };
}
