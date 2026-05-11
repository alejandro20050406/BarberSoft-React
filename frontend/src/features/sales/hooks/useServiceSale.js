import { useCallback, useEffect, useMemo, useState } from "react";
import { salesService } from "../services/salesService";

const EMPTY_FORM = {
  clientId: "",
  employeeId: "",
  serviceId: "",
  paymentMethod: "cash",
  discount: "0",
  notes: "",
};

export function useServiceSale() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [options, setOptions] = useState({
    clients: [],
    employees: [],
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

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    setRequestError("");

    const response = await salesService.getOptions();

    if (!response.ok) {
      setRequestError(response.message);
      setIsLoading(false);
      return response;
    }

    const data = response.data;
    setOptions(data);
    setForm((current) => ({
      ...current,
      employeeId: current.employeeId || String(data.currentEmployee?.id ?? data.employees[0]?.id ?? ""),
      paymentMethod: current.paymentMethod || data.paymentMethods[0]?.value || "cash",
    }));
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

      const data = response.data;
      setOptions(data);
      setForm((current) => ({
        ...current,
        employeeId: current.employeeId || String(data.currentEmployee?.id ?? data.employees[0]?.id ?? ""),
        paymentMethod: current.paymentMethod || data.paymentMethods[0]?.value || "cash",
      }));
      setIsLoading(false);
    }

    fetchOptions();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedService = useMemo(
    () => options.services.find((service) => service.id === Number(form.serviceId)) ?? null,
    [form.serviceId, options.services],
  );

  const subtotal = selectedService?.price ?? 0;
  const discount = Number(form.discount || 0);
  const total = Math.max(subtotal - (Number.isFinite(discount) ? discount : 0), 0);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      employeeId: String(options.currentEmployee?.id ?? options.employees[0]?.id ?? ""),
      paymentMethod: options.paymentMethods[0]?.value ?? "cash",
    });
    setErrors({});
    setRequestError("");
    setSuccessMessage("");
    setLastSale(null);
  };

  const submit = async () => {
    setIsSaving(true);
    setRequestError("");
    setSuccessMessage("");

    const response = await salesService.createServiceSale({
      clientId: Number(form.clientId),
      employeeId: Number(form.employeeId),
      serviceId: Number(form.serviceId),
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
    setSuccessMessage(response.message ?? "Venta de servicio registrada correctamente.");
    setForm((current) => ({
      ...EMPTY_FORM,
      employeeId: current.employeeId,
      paymentMethod: current.paymentMethod,
    }));
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
    selectedService,
    subtotal,
    total,
    updateField,
    resetForm,
    submit,
    loadOptions,
  };
}
