// Composant Table réutilisable
export default function Table({ columns, data, onRowClick, emptyMessage = 'Aucune donnée' }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={{ width: col.width || 'auto' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-row">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <style>{`
        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 0.8rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }

        .data-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.9rem;
          color: #374151;
        }

        .data-table tbody tr:hover {
          background: #f9fafb;
        }

        .empty-row {
          text-align: center;
          padding: 40px !important;
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
