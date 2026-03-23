import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { CalendarIcon, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function TakeAttendancePage() {
  const { user } = useAuth();
  const { users, courses, attendance, addAttendance, updateAttendance } = useData();
  const [searchParams] = useSearchParams();

  // Courses this lecturer is assigned to (or all courses for admin)
  const myCourses = useMemo(() =>
    user?.role === 'lecturer'
      ? courses.filter(c => (user.assignedCourses ?? []).includes(c.id))
      : courses,
    [courses, user]
  );

  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // map: studentUserId → 'present' | 'absent' | 'late'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  // Students enrolled in the selected course
  const courseStudents = useMemo(() =>
    selectedCourse
      ? users.filter(u => u.role === 'student' && (u.enrolledCourses ?? []).includes(selectedCourse))
      : [],
    [users, selectedCourse]
  );

  // Pre-fill from existing attendance records when course or date changes
  useEffect(() => {
    if (!selectedCourse) return;
    const existing = attendance.filter(
      a => a.courseId === selectedCourse && a.date === selectedDate
    );
    const map: Record<string, 'present' | 'absent' | 'late'> = {};
    courseStudents.forEach(s => {
      const record = existing.find(a => a.studentId === s.id);
      map[s.id] = record?.status ?? 'absent';
    });
    setAttendanceMap(map);
    setHasChanges(false);
    setSaved(false);
  }, [selectedCourse, selectedDate, courseStudents, attendance]);

  const handleToggle = (studentId: string) => {
    setAttendanceMap(prev => {
      const current = prev[studentId] ?? 'absent';
      const next = current === 'present' ? 'absent' : current === 'absent' ? 'late' : 'present';
      return { ...prev, [studentId]: next };
    });
    setHasChanges(true);
    setSaved(false);
  };

  const handleSetStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const map: Record<string, 'present' | 'absent' | 'late'> = {};
    courseStudents.forEach(s => { map[s.id] = status; });
    setAttendanceMap(map);
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    if (!selectedCourse) { toast.error('Please select a course'); return; }
    if (!user) return;

    courseStudents.forEach(student => {
      const status = attendanceMap[student.id] ?? 'absent';
      // Check if a record already exists for this student/course/date
      const existing = attendance.find(
        a => a.courseId === selectedCourse && a.studentId === student.id && a.date === selectedDate
      );
      if (existing) {
        updateAttendance(existing.id, { status });
      } else {
        addAttendance({
          courseId: selectedCourse,
          studentId: student.id,
          date: selectedDate,
          status,
          markedBy: user.id,
        });
      }
    });

    setHasChanges(false);
    setSaved(true);
    toast.success('Attendance saved successfully!');
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'present').length;
  const lateCount    = Object.values(attendanceMap).filter(s => s === 'late').length;
  const absentCount  = courseStudents.length - presentCount - lateCount;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Take Attendance</h1>
        <p className="text-gray-600">Record student attendance. Click a student's status to cycle: Absent → Late → Present.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Course selector */}
        <Card>
          <CardContent className="p-6">
            <Label className="mb-2 block">Select Course</Label>
            <Select value={selectedCourse} onValueChange={v => { setSelectedCourse(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {myCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Date picker */}
        <Card>
          <CardContent className="p-6">
            <Label className="mb-2 block">Select Date</Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Present</span>
              <span className="text-xl font-bold text-green-600">{presentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Late</span>
              <span className="text-xl font-bold text-yellow-600">{lateCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Absent</span>
              <span className="text-xl font-bold text-red-600">{absentCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedCourse && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <Button onClick={() => handleMarkAll('present')} variant="outline" size="sm">
              Mark All Present
            </Button>
            <Button onClick={() => handleMarkAll('absent')} variant="outline" size="sm">
              Mark All Absent
            </Button>
            <div className="flex-1" />
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
            <Button onClick={handleSave} className="gap-2" disabled={!hasChanges}>
              <Save className="w-4 h-4" /> Save Attendance
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Student List
                {courseStudents.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {courseStudents.length} student{courseStudents.length !== 1 ? 's' : ''}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courseStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No students enrolled in this course.
                </p>
              ) : (
                <div className="space-y-2">
                  {courseStudents.map(student => {
                    const status = attendanceMap[student.id] ?? 'absent';
                    return (
                      <div key={student.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.studentId} · {student.programme ?? student.department}
                          </p>
                        </div>
                        {/* Status toggle buttons */}
                        <div className="flex items-center gap-2">
                          {(['present', 'late', 'absent'] as const).map(s => (
                            <button key={s} type="button"
                              onClick={() => handleSetStatus(student.id, s)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                                status === s
                                  ? s === 'present' ? 'bg-green-500 text-white'
                                    : s === 'late'    ? 'bg-yellow-400 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                              }`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}