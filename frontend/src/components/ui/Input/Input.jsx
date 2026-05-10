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
  as = 'input',
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  required = false,
  fullWidth = true,
  ...props
}) => {
  const Component = as;
  const isTextarea = as === 'textarea';
  const isSelect = as === 'select';

  const controlClassName = [
    styles.control,
    isTextarea ? styles.textarea : '',
    isSelect ? styles.select : '',
    error ? styles.invalid : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={name} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
          {hint && !error ? <span className={styles.hintTag}>{hint}</span> : null}
        </div>
      )}

      <Component
        id={name}
        name={name}
        type={isTextarea || isSelect ? undefined : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={controlClassName}
        {...props}
      />

      {error ? (
        <span id={`${name}-error`} className={`${styles.message} ${styles.error}`}>
          {error}
        </span>
      ) : null}
    </div>
  );
};

export default Input;
