import styles from './FeedbackMessage.module.css';

export default function ErrorMessage({ title = 'Ocurrio un error', message }) {
  return (
    <div className={`${styles.message} ${styles.error}`} role="alert">
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <div className={styles.content}>
        <strong className={styles.title}>{title}</strong>
        {message ? <p className={styles.text}>{message}</p> : null}
      </div>
    </div>
  );
}
