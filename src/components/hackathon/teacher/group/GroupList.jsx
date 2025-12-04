import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '../../index'
import TableLayout from "../../TableLayout"

function GroupList({ groups, onEdit, onDelete, onRestore, loading }) {

  const columns = [
    { label: "ID", accessor: "idGroup", sortable: true },

    { label: "Nombre del Grupo", accessor: "name", sortable: true },

    { label: "Semestre", accessor: "semester", sortable: true },

    {
      label: "Total Estudiantes",
      accessor: "totalStudents",
      sortable: true,
      render: (row) => row.totalStudents ?? 0
    },

    {
      label: "Estado",
      accessor: "status",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 1
              ? "bg-emerald-500/20 text-emerald-600"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {row.status === 1 ? "Activo" : "Inactivo"}
        </span>
      )
    },

    {
      label: <div className="w-full text-center">Acciones</div>,
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(row)}
            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          {row.status === 1 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(row.idGroup)}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRestore(row.idGroup)}
              className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <TableLayout
      title="Lista de Grupos"
      columns={columns}
      data={groups || []}
      loading={loading}
      searchable={true}
    />
  );
}

export default GroupList;
