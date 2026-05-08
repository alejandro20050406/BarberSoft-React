export default function CatalogForm({
  title,
  children,
  errorMessage = "",
  primaryLabel,
  isSaving = false,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="form-grid">{children}</div>
      {errorMessage && <p className="form-error">{errorMessage}</p>}
      <div className="form-actions">
        <button
          className="button button-primary"
          type="button"
          onClick={onSubmit}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : primaryLabel}
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}
