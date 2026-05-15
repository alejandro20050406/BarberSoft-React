export default function CatalogForm({
  title,
  description = "",
  children,
  errorMessage = "",
  primaryLabel,
  cancelLabel = "Cancelar",
  isSaving = false,
  asDialog = false,
  onSubmit,
  onCancel,
}) {
  const content = (
    <>
      <h2>{title}</h2>
      {description ? <p className="form-description">{description}</p> : null}
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
          {cancelLabel}
        </button>
      </div>
    </>
  );

  if (asDialog) {
    return (
      <div className="modal-backdrop" role="presentation">
        <section className="correction-dialog" role="dialog" aria-modal="true">
          {content}
        </section>
      </div>
    );
  }

  return (
    <section className="panel">
      {content}
    </section>
  );
}
