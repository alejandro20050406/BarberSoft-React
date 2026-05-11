import { useCallback, useEffect, useState } from "react";
import { clientsService } from "../services/clientsService";

const DEFAULT_FILTERS = { query: "", status: "all" };

export function useClients(initialFilters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState(initialFilters);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");

  const loadClients = useCallback(
    async (currentFilters = filters, options = {}) => {
      if (!options.silent) setIsLoading(true);
      setRequestError("");

      const response = await clientsService.list(currentFilters);

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setClients(response.data);
      }

      if (!options.silent) setIsLoading(false);
      return response;
    },
    [filters],
  );

  useEffect(() => {
    let isActive = true;

    async function fetchClients() {
      setIsLoading(true);
      setRequestError("");

      const response = await clientsService.list(filters);

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setClients(response.data);
      }

      setIsLoading(false);
    }

    fetchClients();

    return () => {
      isActive = false;
    };
  }, [filters]);

  const createClient = async (payload) => {
    setIsSaving(true);
    const response = await clientsService.create(payload);
    setIsSaving(false);

    if (response.ok) {
      await loadClients(filters, { silent: true });
    }

    return response;
  };

  const updateClient = async (id, payload) => {
    setIsSaving(true);
    const response = await clientsService.update(id, payload);
    setIsSaving(false);

    if (response.ok) {
      await loadClients(filters, { silent: true });
    }

    return response;
  };

  const setClientStatus = async (id, status) => {
    setIsSaving(true);
    const response = await clientsService.setStatus(id, status);
    setIsSaving(false);

    if (response.ok) {
      await loadClients(filters, { silent: true });
    }

    return response;
  };

  return {
    clients,
    filters,
    setFilters,
    isLoading,
    isSaving,
    requestError,
    loadClients,
    createClient,
    updateClient,
    setClientStatus,
  };
}
