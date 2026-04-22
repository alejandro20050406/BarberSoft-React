import styles from './Table.module.css';

/**
 * Table — componente reutilizable de BarberSoft
 *
 * Props:
 * - columns: [{ key, label, align? }]  — definición de columnas
 * - data:    [{ ...campos }]            — arreglo de filas
 * - actions: (row) => ReactNode        — columna opcional de acciones
 * - loading: boolean                   — muestra skeleton
 * - emptyMessage: string               — mensaje cuando no hay datos
 */

const Table = ({
  columns = [],
  data = [],
  actions,
  loading = false,
  emptyMessage = 'No hay registros para mostrar',
}) => {
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={styles.th}>
                  {col.label}
                </th>
              ))}
              {actions && <th className={styles.th}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className={styles.tr}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    <span className={styles.skeleton} />
                  </td>
                ))}
                {actions && (
                  <td className={styles.td}>
                    <span className={styles.skeleton} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={styles.th}>
                  {col.label}
                </th>
              ))}
              {actions && <th className={styles.th}>Acciones</th>}
            </tr>
          </thead>
        </table>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p className={styles.emptyText}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={styles.th}
                style={{ textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className={`${styles.th} ${styles.thActions}`}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className={styles.tr}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={styles.td}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {row[col.key] ?? '—'}
                </td>
              ))}
              {actions && (
                <td className={`${styles.td} ${styles.tdActions}`}>
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;