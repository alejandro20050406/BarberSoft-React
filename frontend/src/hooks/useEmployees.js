import { useCallback, useEffect, useState } from "react";
import { employeesService } from "../services/employeesService";

const DEFAULT_FILTERS = { query: "", status: "all" };

export function useEmployees(initialFilters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState(initialFilters);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");

  const loadEmployees = useCallback(
    async (currentFilters = filters, options = {}) => {
      if (!options.silent) setIsLoading(true);
      setRequestError("");

      const response = await employeesService.list(currentFilters);

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setEmployees(response.data);
      }

      if (!options.silent) setIsLoading(false);
      return response;
    },
    [filters],
  );

  useEffect(() => {
    let isActive = true;

    async function fetchEmployees() {
      setIsLoading(true);
      setRequestError("");

      const response = await employeesService.list(filters);

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setEmployees(response.data);
      }

      setIsLoading(false);
    }

    fetchEmployees();

    return () => {
      isActive = false;
    };
  }, [filters]);

  const createEmployee = async (payload) => {
    setIsSaving(true);
    const response = await employeesService.create(payload);
    setIsSaving(false);

    if (response.ok) {
      await loadEmployees(filters, { silent: true });
    }

    return response;
  };

  const updateEmployee = async (id, payload) => {
    setIsSaving(true);
    const response = await employeesService.update(id, payload);
    setIsSaving(false);

    if (response.ok) {
      await loadEmployees(filters, { silent: true });
    }

    return response;
  };

  const setEmployeeStatus = async (id, status) => {
    setIsSaving(true);
    const response = await employeesService.setStatus(id, status);
    setIsSaving(false);

    if (response.ok) {
      await loadEmployees(filters, { silent: true });
    }

    return response;
  };

  return {
    employees,
    filters,
    setFilters,
    isLoading,
    isSaving,
    requestError,
    loadEmployees,
    createEmployee,
    updateEmployee,
    setEmployeeStatus,
  };
}
