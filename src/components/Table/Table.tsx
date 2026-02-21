import React, { useState, useMemo } from 'react';

type TableData = Record<string, any>;
interface Column<T extends TableData> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T extends TableData> {
  data: T[];
  columns: Column<T>[];
  initialSortColumn?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
}

function Table<T extends TableData>({
  data,
  columns,
  initialSortColumn,
  initialSortDirection = 'desc',
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | undefined>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (columnKey: keyof T) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={String(col.key)}
              onClick={() => col.sortable && handleSort(col.key)}
              style={{
                padding: '8px',
                textAlign: 'left',
                borderBottom: '2px solid #ddd',
                cursor: col.sortable ? 'pointer' : 'default',
                userSelect: 'none',
              }}
            >
              {col.header}
              {sortColumn === col.key && (
                <span style={{ marginLeft: '4px' }}>
                  {sortDirection === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map(col => (
              <td
                key={String(col.key)}
                style={{ padding: '8px', borderBottom: '1px solid #ddd' }}
              >
                {col.render
                  ? col.render(row[col.key], row)
                  : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
