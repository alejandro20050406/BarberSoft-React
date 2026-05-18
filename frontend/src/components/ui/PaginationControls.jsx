export default function PaginationControls({
  pagination,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
}) {
  if (!pagination) return null;

  const {
    page = 1,
    pageSize = 10,
    totalItems = 0,
    totalPages = 1,
    hasPreviousPage = false,
    hasNextPage = false,
  } = pagination;

  return (
    <div className="pagination-bar">
      <p className="muted-text">
        {totalItems} resultado{totalItems === 1 ? "" : "s"} - pagina {page} de {totalPages}
      </p>

      <div className="pagination-actions">
        <label className="pagination-size">
          <span>Mostrar</span>
          <select
            className="field"
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          className="button button-secondary"
          type="button"
          onClick={() => onPageChange?.(page - 1)}
          disabled={!hasPreviousPage}
        >
          Anterior
        </button>

        <button
          className="button button-secondary"
          type="button"
          onClick={() => onPageChange?.(page + 1)}
          disabled={!hasNextPage}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
