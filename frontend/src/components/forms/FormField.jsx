export default function FormField({ label, error, fullWidth = false, children }) {
  return (
    <label className={`field-group${fullWidth ? " full-field" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
