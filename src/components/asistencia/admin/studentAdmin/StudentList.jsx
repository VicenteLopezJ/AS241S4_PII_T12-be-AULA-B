// src/components/asistencia/admin/studentAdmin/StudentList.jsx
import React from 'react';
import '../../../../styles/asistencia/admin/studentAdmin/studentManagement.css';

const StudentList = ({ students, onEdit, onDelete, onRestore }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'graduated': 'status-graduated',
      'withdrawn': 'status-withdrawn'
    };

    const statusLabels = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'graduated': 'Graduado',
      'withdrawn': 'Retirado'
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="student-list-container">
      <div className="list-header">
        <h3>Lista de Estudiantes</h3>
        <span className="list-count">{students.length} estudiantes encontrados</span>
      </div>

      <div className="table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Estudiante</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Carrera</th>
              <th>Semestre</th>
              <th>Estado</th>
              <th>Fecha Ingreso</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  No se encontraron estudiantes
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.studentId}>
                  <td>
                    <div className="code-cell">
                      <span className="student-avatar">
                        {student.firstName?.charAt(0).toUpperCase()}
                      </span>
                      <strong>{student.studentCode}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <strong>{student.firstName} {student.lastName}</strong>
                      <small>{student.phone || 'Sin teléfono'}</small>
                    </div>
                  </td>

                <td>
  <div className="email-cell" style={{ position: 'relative' }}>
    <span className={`email-text ${!student.email ? 'no-email' : ''}`}>
      {student.email || 'Sin email'}
    </span>
    {student.email && student.email.length > 25 && (
      <span className="email-tooltip">
        {student.email}
      </span>
    )}
  </div>
</td>

                  <td>{student.dni}</td>
                  <td>
                    <div className="career-info">
                      <span className="career-badge">
                        {student.careerId === 1 ? '💻 Sistemas' : 
                         student.careerId === 2 ? '🔧 Tecnología' : 
                         '🎓 Carrera'}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="semester-badge">
                      {student.currentSemester}° Sem
                    </span>
                  </td>
                  <td>{getStatusBadge(student.academicStatus)}</td>
                  <td>{formatDate(student.enrollmentDate)}</td>
                  <td>
                    <small className="last-access">
                      {formatDate(student.createdAt)}
                    </small>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => onEdit(student)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      
                      {student.academicStatus === 'inactive' ? (
                        <button
                          className="btn-icon btn-restore"
                          onClick={() => onRestore(student.studentId)}
                          title="Restaurar"
                        >
                          🔄
                        </button>
                      ) : (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => onDelete(student.studentId)}
                          title="Desactivar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;