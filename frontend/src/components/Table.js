function defaultGetValue(row, key) {
  const v = row?.[key];
  if (v == null) return '';
  if (typeof v === 'number') return v;
  return String(v);
}

export default function Table({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No data found',
  sortKey,
  sortDir = 'asc',
  onSortChange,
}) {
  if (!data?.length) {
    return (
      <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-primary-50/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium text-dark/80 uppercase tracking-wider ${
                  col.sortable && onSortChange ? 'cursor-pointer select-none hover:bg-primary-50' : ''
                }`}
                onClick={() => {
                  if (!col.sortable || !onSortChange) return;
                  const nextDir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
                  onSortChange(col.key, nextDir);
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {col.label}
                  {col.sortable && (
                    <span className="text-[10px] text-gray-500">
                      {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row[keyField]} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-dark">
                  {col.render ? col.render(row) : defaultGetValue(row, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
