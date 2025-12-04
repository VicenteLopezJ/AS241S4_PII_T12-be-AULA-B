
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import TableLayout from "../../TableLayout";
import { Button } from "../../index";

export default function StudentList({ students, onEdit, onDelete, onRestore }) {

  
  const columns = [
    {
      label: "ID",
      accessor: "idStudent",
      sortable: true,
    },
    {
      label: "Nombre",
      accessor: "name",
      sortable: true,
    },
    {
      label: "Apellidos",
      accessor: "surname",
      sortable: true,
    },
    {
      label: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      label: "Grupo",
      accessor: "groupName",
      sortable: true,
    },
    {
      label: "Tutor",
      accessor: "tutorName",
      sortable: true,
    },
    {
      label: "Estado",
      accessor: "status",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 1
              ? "bg-emerald-500/20 text-emerald-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {row.status === 1 ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      label: <div className="w-full text-center">Acciones</div>,
      accessor: "actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(row)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          {row.status === 1 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(row.idUser)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRestore(row.idUser)}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <TableLayout
      title="Estudiantes"
      columns={columns}
      data={students}
      loading={false}
      searchable={true}
      itemsPerPage={10}
    />
  );
}
