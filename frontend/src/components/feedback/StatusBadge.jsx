import styles from './StatusBadge.module.css';

const toneByStatus = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  blocked: 'danger',
  error: 'danger',
  success: 'success',
  info: 'info',
};

export default function StatusBadge({ label, status = 'neutral', tone }) {
  const resolvedTone = tone ?? toneByStatus[status] ?? 'neutral';

  return (
    <span className={`${styles.badge} ${styles[resolvedTone]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {label ?? status}
    </span>
  );
}
