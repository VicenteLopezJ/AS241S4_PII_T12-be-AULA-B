
import React from 'react';
import StudentDashboardComponent from '../../../../components/asistencia/student/dashboard/StudentDashboardComponent';

import '../../../../styles/asistencia/student/dashboard/dashboardStyles.css';

const StudentDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <StudentDashboardComponent />
    </div>
  );
};

export default StudentDashboardPage;
