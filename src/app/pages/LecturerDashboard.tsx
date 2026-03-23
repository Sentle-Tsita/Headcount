import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Users, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';

export function LecturerDashboard() {
  const { user: authUser } = useAuth();
  const { users, courses, attendance } = useData();

  // Live record — keeps assignedCourses in sync with DataContext
  const user = users.find(u => u.id === authUser?.id) ?? authUser;

  const myCourses = useMemo(
    () => courses.filter(c => (user?.assignedCourses ?? []).includes(c.id)),
    [courses, user]
  );

  const myStudents = useMemo(() => {
    const ids = new Set(myCourses.map(c => c.id));
    return users.filter(u => u.role === 'student' && (u.enrolledCourses ?? []).some(id => ids.has(id)));
  }, [users, myCourses]);

  const today = new Date().toISOString().split('T')[0];

  const todayAttendance = useMemo(() => {
    const ids = new Set(myCourses.map(c => c.id));
    return attendance.filter(a => a.date === today && ids.has(a.courseId));
  }, [attendance, myCourses, today]);

  const stats = [
    { title: 'My Courses',       value: myCourses.length,                                       icon: <BookOpen className="w-6 h-6 text-indigo-600" />, bgColor: 'bg-indigo-50' },
    { title: 'Total Students',   value: myStudents.length,                                       icon: <Users className="w-6 h-6 text-green-600" />,    bgColor: 'bg-green-50' },
    { title: "Today's Records",  value: todayAttendance.length,                                  icon: <CheckCircle className="w-6 h-6 text-blue-600" />, bgColor: 'bg-blue-50' },
    { title: 'Present Today',    value: todayAttendance.filter(a => a.status === 'present').length, icon: <Calendar className="w-6 h-6 text-purple-600" />, bgColor: 'bg-purple-50' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">
          {user?.department && <span>{user.department} · </span>}
          {user?.staffId && <span>{user.staffId}</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <Card key={stat.title}>
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myCourses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No courses assigned yet.</p>
              ) : (
                myCourses.map(course => {
                  const count = users.filter(u => u.role === 'student' && (u.enrolledCourses ?? []).includes(course.id)).length;
                  return (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.code}</p>
                        <p className="text-sm text-gray-500">Year {course.year ?? '—'} · {count} student{count !== 1 ? 's' : ''}</p>
                      </div>
                      <Link to={`/take-attendance?course=${course.id}`}>
                        <Button size="sm">Take Attendance</Button>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/take-attendance"><Button variant="outline" className="w-full justify-start gap-3"><CheckCircle className="w-5 h-5" /> Take Attendance</Button></Link>
              <Link to="/my-courses"><Button variant="outline" className="w-full justify-start gap-3"><BookOpen className="w-5 h-5" /> View My Courses</Button></Link>
              <Link to="/reports"><Button variant="outline" className="w-full justify-start gap-3"><Calendar className="w-5 h-5" /> View Reports</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}