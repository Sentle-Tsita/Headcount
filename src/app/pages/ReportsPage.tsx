import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

export function ReportsPage() {
  const { user } = useAuth();
  const { courses, users, attendance } = useData();

  // All students
  const allStudents = users.filter(u => u.role === 'student');

  // Courses this user can see
  const visibleCourses = user?.role === 'lecturer'
    ? courses.filter(c => (user.assignedCourses ?? []).includes(c.id))
    : courses;

  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Students enrolled in the selected course (or all if no course selected)
  const courseStudents = filterCourse !== 'all'
    ? allStudents.filter(s => (s.enrolledCourses ?? []).includes(filterCourse))
    : allStudents;

  // For a student role: only show themselves
  const studentsToShow = user?.role === 'student'
    ? allStudents.filter(s => s.id === user.id)
    : filterStudent !== 'all'
      ? courseStudents.filter(s => s.id === filterStudent)
      : courseStudents;

  const getStudentStats = (studentId: string, courseId?: string) => {
    const records = attendance.filter(a => {
      if (a.studentId !== studentId) return false;
      if (courseId && courseId !== 'all' && a.courseId !== courseId) return false;
      else if (filterCourse !== 'all' && !courseId && a.courseId !== filterCourse) return false;
      if (startDate && a.date < startDate) return false;
      if (endDate && a.date > endDate) return false;
      return true;
    });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    return { total, present, absent, late, percentage };
  };

  // Build rows: one row per student per enrolled course (filtered)
  const rows = studentsToShow.flatMap(student => {
    const enrolledInView = filterCourse !== 'all'
      ? [filterCourse]
      : (student.enrolledCourses ?? []);
    return enrolledInView.map(courseId => {
      const course = courses.find(c => c.id === courseId);
      const stats = getStudentStats(student.id, courseId);
      return { student, course, stats };
    });
  });

  const handleExport = () => {
    const csvContent = [
      ['Student ID', 'Name', 'Course', 'Total', 'Present', 'Absent', 'Late', 'Attendance %'].join(','),
      ...rows.map(({ student, course, stats }) =>
        [
          student.studentId ?? student.id,
          student.name,
          course?.name ?? 'N/A',
          stats.total,
          stats.present,
          stats.absent,
          stats.late,
          stats.percentage + '%',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Attendance Reports</h1>
          <p className="text-gray-600">View and analyse attendance data.</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters — hidden for students since they only see their own data */}
      {user?.role !== 'student' && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={filterCourse} onValueChange={v => { setFilterCourse(v); setFilterStudent('all'); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {visibleCourses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={filterStudent} onValueChange={setFilterStudent}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {courseStudents.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Attendance Summary</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-center">Late</TableHead>
                <TableHead className="text-center">Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(({ student, course, stats }, i) => {
                  const pct = parseFloat(stats.percentage);
                  return (
                    <TableRow key={`${student.id}-${course?.id}-${i}`}>
                      <TableCell className="font-medium">{student.studentId ?? student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{course?.name ?? 'N/A'}</TableCell>
                      <TableCell className="text-center">{stats.total}</TableCell>
                      <TableCell className="text-center text-green-600">{stats.present}</TableCell>
                      <TableCell className="text-center text-red-600">{stats.absent}</TableCell>
                      <TableCell className="text-center text-yellow-600">{stats.late}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          pct >= 75 ? 'bg-green-100 text-green-700'
                          : pct >= 50 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {stats.percentage}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}