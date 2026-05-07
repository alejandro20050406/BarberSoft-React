import styles from './Input.module.css';

/**
 * Input — componente reutilizable de BarberSoft
 *
 * Props:
 * - label:       string
 * - name:        string (requerido)
 * - type:        'text' | 'email' | 'password' | 'number' | 'tel' (default: 'text')
 * - value:       string | number
 * - onChange:    function
 * - placeholder: string
 * - error:       string — mensaje de error
 * - hint:        string — texto de ayuda
 * - disabled:    boolean
 * - required:    boolean
 * - fullWidth:   boolean (default: true)
 */

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  required = false,
  fullWidth = true,
}) => {
  return (
    <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};

export default Input;