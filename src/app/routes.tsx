import { Navigate, type RouteObject } from 'react-router';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';

import { LoginPage } from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LecturerDashboard } from './pages/LecturerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import CoursesPage  from './pages/CoursesPage';
import LecturersPage from './pages/LecturersPage';
import { TakeAttendancePage } from './pages/TakeAttendancePage';
import { ReportsPage } from './pages/ReportsPage';
import MyCoursesPage from './pages/MyCoursesPage';
import { FlowchartPage } from './pages/FlowchartPage';
import EnrollCoursesPage from './pages/EnrollCoursesPage';
import DepartmentsPage from './pages/DepartmentsPage';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'lecturer') return <Navigate to="/lecturer-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }
  return <Layout>{children}</Layout>;
}

export const routes: RouteObject[] = [
  { path: '/',                element: <LoginPage /> },
  { path: '/register',        element: <RegistrationPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // Admin
  { path: '/admin-dashboard', element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> },
  { path: '/students',        element: <ProtectedRoute allowedRoles={['admin']}><StudentsPage /></ProtectedRoute> },
  { path: '/courses',         element: <ProtectedRoute allowedRoles={['admin']}><CoursesPage /></ProtectedRoute> },
  { path: '/lecturers',       element: <ProtectedRoute allowedRoles={['admin']}><LecturersPage /></ProtectedRoute> },
  { path: '/departments', element: <ProtectedRoute allowedRoles={['admin']}><DepartmentsPage /></ProtectedRoute> },


  // Lecturer
  { path: '/lecturer-dashboard', element: <ProtectedRoute allowedRoles={['lecturer']}><LecturerDashboard /></ProtectedRoute> },
  { path: '/my-courses',         element: <ProtectedRoute allowedRoles={['lecturer']}><MyCoursesPage /></ProtectedRoute> },
  { path: '/take-attendance',    element: <ProtectedRoute allowedRoles={['lecturer']}><TakeAttendancePage /></ProtectedRoute> },

  // Student
  { path: '/student-dashboard', element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute> },
  { path: '/enroll-courses',    element: <ProtectedRoute allowedRoles={['student']}><EnrollCoursesPage /></ProtectedRoute> },

  // Shared
  { path: '/reports',   element: <ProtectedRoute><ReportsPage /></ProtectedRoute> },
  { path: '/flowchart', element: <ProtectedRoute><FlowchartPage /></ProtectedRoute> },

  { path: '*', element: <Navigate to="/" replace /> },
];