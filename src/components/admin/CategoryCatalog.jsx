import { useMemo, useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";

const EMPTY_FORM = { name: "" };

export default function CategoryCatalog({ title, initialCategories }) {
  const [categories, setCategories] = useState(
    initialCategories.map((category) => ({
      ...category,
      status: category.status ?? "active",
    })),
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ query: "", status: "all" });
  const [confirm, setConfirm] = useState(null);

  const visibleCategories = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesQuery = !query || category.name.toLowerCase().includes(query);
      const matchesStatus =
        filters.status === "all" || category.status === filters.status;

      return matchesQuery && matchesStatus;
    });
  }, [categories, filters]);

  const nextId = () =>
    categories.length > 0 ? Math.max(...categories.map((category) => category.id)) + 1 : 1;

  const validate = () => {
    const trimmed = form.name.trim();
    if (!trimmed) return "El nombre de la categoria es obligatorio.";

    const duplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === trimmed.toLowerCase() &&
        category.id !== editingId,
    );
    if (duplicate) return "Ya existe una categoria con ese nombre.";

    return "";
  };

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (editingId === null) {
      setCategories([
        ...categories,
        { id: nextId(), name: form.name.trim(), status: "active" },
      ]);
    } else {
      setCategories(
        categories.map((category) =>
          category.id === editingId
            ? { ...category, name: form.name.trim() }
            : category,
        ),
      );
    }

    handleReset();
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

  const applyStatusChange = () => {
    if (!confirm) return;

    setCategories(
      categories.map((category) =>
        category.id === confirm.id
          ? { ...category, status: confirm.nextStatus }
          : category,
      ),
    );

    if (editingId === confirm.id) handleReset();
    setConfirm(null);
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
            {editingId !== null ? "Guardar cambios" : "Agregar"}
          </button>
          {editingId !== null && (
            <button className="button button-secondary" type="button" onClick={handleReset}>
              Cancelar
            </button>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
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

        {visibleCategories.length === 0 ? (
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
                {visibleCategories.map((category, index) => (
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
                            nextStatus:
                              category.status === "active" ? "inactive" : "active",
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
