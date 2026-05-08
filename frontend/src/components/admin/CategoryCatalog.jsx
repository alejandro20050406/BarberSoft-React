import { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";

const EMPTY_FORM = { name: "" };

export default function CategoryCatalog({ title, service }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ query: "", status: "all" });
  const [confirm, setConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");

  const loadCategories = useCallback(
    async (currentFilters = filters, options = {}) => {
      if (!options.silent) setIsLoading(true);
      setRequestError("");

      const response = await service.list(currentFilters);

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setCategories(
          response.data.map((category) => ({
            ...category,
            status: category.status ?? "active",
          })),
        );
      }

      if (!options.silent) setIsLoading(false);
    },
    [filters, service],
  );

  useEffect(() => {
    let isActive = true;

    async function fetchCategories() {
      setIsLoading(true);
      setRequestError("");

      const response = await service.list(filters);

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setCategories(
          response.data.map((category) => ({
            ...category,
            status: category.status ?? "active",
          })),
        );
      }

      setIsLoading(false);
    }

    fetchCategories();

    return () => {
      isActive = false;
    };
  }, [filters, service]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("El nombre de la categoria es obligatorio.");
      return;
    }

    setIsSaving(true);
    setRequestError("");

    const response =
      editingId === null
        ? await service.create({ name: form.name })
        : await service.update(editingId, { name: form.name });

    setIsSaving(false);

    if (!response.ok) {
      setError(response.errors?.name ?? response.message);
      return;
    }

    handleReset();
    loadCategories(filters, { silent: true });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name });
    setError("");
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  };

  const applyStatusChange = async () => {
    if (!confirm) return;

    setIsSaving(true);
    setRequestError("");

    const response = await service.setStatus(confirm.id, confirm.nextStatus);

    setIsSaving(false);

    if (!response.ok) {
      setRequestError(response.message);
      setConfirm(null);
      return;
    }

    if (editingId === confirm.id) handleReset();
    setConfirm(null);
    loadCategories(filters, { silent: true });
  };

  return (
    <div className="page-shell narrow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Catalogo</span>
          <h1>{title}</h1>
        </div>
      </div>

      <section className="panel">
        <h2>{editingId !== null ? "Editar categoria" : "Nueva categoria"}</h2>
        <div className="form-row">
          <input
            className="field"
            type="text"
            placeholder="Nombre de la categoria"
            value={form.name}
            onChange={(event) => {
              setForm({ name: event.target.value });
              setError("");
            }}
          />
          <button className="button button-primary" type="button" onClick={handleSubmit}>
            {isSaving
              ? "Guardando..."
              : editingId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {editingId !== null && (
            <button className="button button-secondary" type="button" onClick={handleReset}>
              Cancelar
            </button>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
        {requestError && <p className="form-error">{requestError}</p>}
      </section>

      <section className="panel">
        <div className="toolbar">
          <input
            className="field"
            type="search"
            placeholder="Buscar por nombre"
            value={filters.query}
            onChange={(event) =>
              setFilters((current) => ({ ...current, query: event.target.value }))
            }
          />
          <select
            className="field select-field"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>

        {isLoading ? (
          <p className="empty-text">Cargando categorias...</p>
        ) : requestError ? (
          <div>
            <p className="form-error">{requestError}</p>
            <button className="button button-secondary" type="button" onClick={() => loadCategories()}>
              Reintentar
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className="empty-text">No hay categorias con esos filtros.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id} className={editingId === category.id ? "editing-row" : ""}>
                    <td>{index + 1}</td>
                    <td>{category.name}</td>
                    <td>
                      <span className={`status-pill ${category.status}`}>
                        {category.status === "active" ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="link-button" type="button" onClick={() => handleEdit(category)}>
                        Editar
                      </button>
                      <button
                        className="link-button danger"
                        type="button"
                        onClick={() =>
                          setConfirm({
                            id: category.id,
                            nextStatus: category.status === "active" ? "inactive" : "active",
                            name: category.name,
                          })
                        }
                      >
                        {category.status === "active" ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title="Confirmar cambio"
        message={`Se cambiara el estado de "${confirm?.name}".`}
        confirmLabel="Si, continuar"
        onCancel={() => setConfirm(null)}
        onConfirm={applyStatusChange}
      />
    </div>
  );
}
