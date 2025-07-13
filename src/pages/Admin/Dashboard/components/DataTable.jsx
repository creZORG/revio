import React from 'react';
import styles from './DataTable.module.css';

const DataTable = ({
  columns,
  data,
  isLoading,
  noDataMessage = "No data available.",
}) => {
  if (isLoading) {
    return <div className={styles.loading}>Loading data...</div>;
  }

  if (!data || data.length === 0) {
    return <p className={styles.noDataMessage}>{noDataMessage}</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor}>{col.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col.accessor} data-label={col.Header}>
                  {/* --- THIS IS THE FIX --- */}
                  {/* It now correctly passes the full row object to any custom Cell renderer, */}
                  {/* which is exactly what the "Actions" column needs. */}
                  {col.Cell
                    ? col.Cell({
                        row: { original: row }, // The full data object for the row
                        value: row[col.accessor], // The specific value for this cell
                      })
                    : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;