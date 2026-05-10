import styles from './Table.module.css';

const Table = ({
  columns = [],
  data = [],
  actions,
  loading = false,
  getRowClassName,
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
              {actions ? <th className={styles.th}>Acciones</th> : null}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className={styles.tr}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    <span className={styles.skeleton} />
                  </td>
                ))}
                {actions ? (
                  <td className={styles.td}>
                    <span className={styles.skeleton} />
                  </td>
                ) : null}
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
              {actions ? <th className={styles.th}>Acciones</th> : null}
            </tr>
          </thead>
        </table>
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            ::
          </span>
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
            {actions ? <th className={`${styles.th} ${styles.thActions}`}>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              className={`${styles.tr} ${getRowClassName ? getRowClassName(row, rowIndex) : ''}`.trim()}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={styles.td}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {typeof col.render === 'function' ? col.render(row, rowIndex) : (row[col.key] ?? '-')}
                </td>
              ))}
              {actions ? (
                <td className={`${styles.td} ${styles.tdActions}`}>{actions(row)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
