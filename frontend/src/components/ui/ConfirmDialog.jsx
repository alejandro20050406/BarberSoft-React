export default function ConfirmDialog({
  isOpen,
  title,
  message,
  details = [],
  variant = "danger",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`confirm-dialog confirm-dialog-${variant}`} role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{message}</p>
        {details.length > 0 ? (
          <ul className="dialog-detail-list">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
        <div className="confirm-actions">
          <button className="button button-secondary" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`button ${variant === "danger" ? "button-danger" : "button-primary"}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
