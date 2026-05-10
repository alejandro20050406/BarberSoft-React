import styles from './FeedbackMessage.module.css';

export default function SuccessMessage({ title = 'Operacion completada', message }) {
  return (
    <div className={`${styles.message} ${styles.success}`} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">OK</span>
      <div className={styles.content}>
        <strong className={styles.title}>{title}</strong>
        {message ? <p className={styles.text}>{message}</p> : null}
      </div>
    </div>
  );
}
