import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export default function TableLayout({
  title,
  actionButton,
  columns,
  data,
  loading,
  itemsPerPage = 10,
  searchable = false,
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const filtered = searchable
    ? data.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  
  const sorted = sortField
    ? [...filtered].sort((a, b) => {
        const x = a[sortField];
        const y = b[sortField];
        if (x < y) return sortDir === "asc" ? -1 : 1;
        if (x > y) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : filtered;

  
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="rounded-xl border-0 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden">

      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {actionButton}
      </div>

      {searchable && (
        <div className="p-4 border-b border-slate-200 bg-white">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

    
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-sm font-semibold text-slate-700 cursor-pointer select-none"
                  onClick={() => col.sortable && toggleSort(col.accessor)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-slate-500"
                >
                  Cargando...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-slate-500"
                >
                  No hay resultados.
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-6 py-4 text-sm text-slate-700"
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-200">
        <span className="text-sm text-slate-600">
          Página {page} de {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg bg-white border border-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg bg-white border border-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
