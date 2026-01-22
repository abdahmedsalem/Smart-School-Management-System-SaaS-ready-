import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'

export default function DataTable({
  data,
  columns,
  pageSize = 10,
  onRowClick,
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <>
      <div className="table-responsive">
        <table className="table-react">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <div className="pagination-info">
          Page {table.getState().pagination.pageIndex + 1} sur{' '}
          {table.getPageCount()}
        </div>
        <div className="pagination-buttons">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <button
              key={i}
              className={
                table.getState().pagination.pageIndex === i ? 'active' : ''
              }
              onClick={() => table.setPageIndex(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <style>{`
        .table-responsive {
          overflow-x: auto;
        }

        .table-react {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .table-react thead th {
          background: #2D3E6f;
          color: white;
          font-weight: 600;
          padding: 14px 12px;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          text-align: left;
        }

        .table-react thead th:first-child {
          border-radius: 8px 0 0 0;
        }

        .table-react thead th:last-child {
          border-radius: 0 8px 0 0;
        }

        .table-react tbody tr {
          transition: background 0.15s;
        }

        .table-react tbody tr:nth-child(even) {
          background: rgba(45, 62, 111, 0.03);
        }

        .table-react tbody tr:hover {
          background: rgba(45, 62, 111, 0.08);
        }

        .table-react td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
        }

        .table-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          margin-top: 16px;
        }

        .pagination-info {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .pagination-buttons {
          display: flex;
          gap: 4px;
        }

        .pagination-buttons button {
          padding: 8px 14px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 8px;
          color: #2D3E6f;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-buttons button:hover:not(:disabled) {
          background: rgba(45, 62, 111, 0.1);
        }

        .pagination-buttons button.active {
          background: #2D3E6f;
          color: white;
          border-color: #2D3E6f;
        }

        .pagination-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}
