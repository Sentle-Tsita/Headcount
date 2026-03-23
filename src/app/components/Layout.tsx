import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ThemeSettings } from './ThemeSettings';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  FileText,
  LogOut,
  UserCircle,
  GraduationCap,
  GitBranch,
  Building2,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const lecturerNav: NavItem[] = [
    { path: '/lecturer-dashboard', label: 'Dashboard',       icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/my-courses',         label: 'My Courses',      icon: <BookOpen className="w-5 h-5" /> },
    { path: '/take-attendance',    label: 'Take Attendance', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/reports',            label: 'Reports',         icon: <FileText className="w-5 h-5" /> },
    { path: '/flowchart',          label: 'System Flow',     icon: <GitBranch className="w-5 h-5" /> },
  ];

  const adminNav: NavItem[] = [
    { path: '/admin-dashboard', label: 'Dashboard',                  icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/students',        label: 'Students',                   icon: <Users className="w-5 h-5" /> },
    { path: '/courses',         label: 'Courses',                    icon: <BookOpen className="w-5 h-5" /> },
    { path: '/lecturers',       label: 'Lecturers',                  icon: <UserCircle className="w-5 h-5" /> },
    { path: '/departments',     label: 'Departments & Programmes',   icon: <Building2 className="w-5 h-5" /> },
    { path: '/reports',         label: 'Reports',                    icon: <FileText className="w-5 h-5" /> },
    { path: '/flowchart',       label: 'System Flow',                icon: <GitBranch className="w-5 h-5" /> },
  ];

  const studentNav: NavItem[] = [
    { path: '/student-dashboard', label: 'Dashboard',     icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/enroll-courses',    label: 'My Courses',    icon: <BookOpen className="w-5 h-5" /> },
    { path: '/reports',           label: 'My Attendance', icon: <FileText className="w-5 h-5" /> },
    { path: '/flowchart',         label: 'System Flow',   icon: <GitBranch className="w-5 h-5" /> },
  ];

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'student' ? studentNav : lecturerNav;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">NUL</h1>
              <p className="text-xs text-gray-500">Attendance System</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive ? { backgroundColor: 'var(--theme-primary)' } : {}}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <ThemeSettings />
          <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}