import FormField from "../../../components/forms/FormField";

export default function PaymentMethodSelect({
  value,
  options,
  error,
  onChange,
}) {
  return (
    <FormField label="Metodo de pago" error={error}>
      <select
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((method) => (
          <option key={method.value} value={method.value}>
            {method.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
