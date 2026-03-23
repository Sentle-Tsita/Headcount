import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Users, UserCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Building2 } from 'lucide-react';

export function AdminDashboard() {
  const { users, courses, attendance } = useData();

  const students  = useMemo(() => users.filter(u => u.role === 'student'),  [users]);
  const lecturers = useMemo(() => users.filter(u => u.role === 'lecturer'), [users]);

  const stats = [
    { title: 'Total Students',      value: students.length,   icon: <Users className="w-6 h-6 text-indigo-600" />, bgColor: 'bg-indigo-50', link: '/students' },
    { title: 'Total Courses',       value: courses.length,    icon: <BookOpen className="w-6 h-6 text-green-600" />, bgColor: 'bg-green-50', link: '/courses' },
    { title: 'Total Lecturers',     value: lecturers.length,  icon: <UserCircle className="w-6 h-6 text-blue-600" />, bgColor: 'bg-blue-50', link: '/lecturers' },
    { title: 'Attendance Records',  value: attendance.length, icon: <TrendingUp className="w-6 h-6 text-purple-600" />, bgColor: 'bg-purple-50', link: '/reports' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage the NUL Attendance Management System.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Courses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.slice(0, 5).map(course => {
                const lecturer = lecturers.find(l => l.id === course.lecturerId);
                const enrolledCount = students.filter(s => (s.enrolledCourses ?? []).includes(course.id)).length;
                return (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.code}</p>
                      <p className="text-sm text-gray-500">{lecturer?.name ?? 'Unassigned'} · {enrolledCount} student{enrolledCount !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">Year {course.year ?? '—'}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/students"><Button variant="outline" className="w-full justify-start gap-3"><Users className="w-5 h-5" /> Manage Students</Button></Link>
              <Link to="/courses"><Button variant="outline" className="w-full justify-start gap-3"><BookOpen className="w-5 h-5" /> Manage Courses</Button></Link>
              <Link to="/lecturers"><Button variant="outline" className="w-full justify-start gap-3"><UserCircle className="w-5 h-5" /> Manage Lecturers</Button></Link>
              <Link to="/reports"><Button variant="outline" className="w-full justify-start gap-3"><TrendingUp className="w-5 h-5" /> View Reports</Button></Link>
              <Link to="/departments"><Button variant="outline" className="w-full justify-start gap-3"><Building2 className="w-5 h-5" /> Manage Departments & Programmes</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}