import styles from './Button.module.css';

/**
 * Button — componente reutilizable de BarberSoft
 *
 * Props:
 * - variant: 'primary' | 'secondary' | 'danger' | 'ghost'  (default: 'primary')
 * - size:    'sm' | 'md' | 'lg'                             (default: 'md')
 * - fullWidth: boolean                                       (default: false)
 * - loading:   boolean                                       (default: false)
 * - disabled:  boolean                                       (default: false)
 * - onClick:   function
 * - type:      'button' | 'submit' | 'reset'                (default: 'button')
 * - children:  contenido del botón
 */

const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
}) => {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : null}
      <span className={loading ? styles.hiddenText : ''}>{children}</span>
    </button>
  );
};

export default Button;