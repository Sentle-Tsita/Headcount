import { useMemo } from "react";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

export default function StudentDashboard() {
  const { user: authUser } = useAuth();
  const { users, courses, getAttendanceSummary, loading } = useData();

  const user = users.find(u => u.id === authUser?.id) ?? authUser;

  const summary = useMemo(
    () => (user ? getAttendanceSummary(user.id) : []),
    [user, getAttendanceSummary]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 text-sm">Unable to load user data. Please log in again.</p>
    </div>
  );

  const totalClasses  = summary.reduce((s, r) => s + r.total, 0);
  const totalPresent  = summary.reduce((s, r) => s + r.present, 0);
  const totalLate     = summary.reduce((s, r) => s + r.late, 0);
  const totalAbsent   = summary.reduce((s, r) => s + r.absent, 0);
  const overallPct    = totalClasses > 0
    ? Math.round(((totalPresent + (totalLate * 0.5)) / totalClasses) * 100)
    : 0;

  // ✅ Late counts as 0.5 towards attended count
  const totalAttended = Math.round(totalPresent + (totalLate * 0.5));

  const enrolledCourses       = user.enrolledCourses ?? [];
  const enrolledCourseDetails = courses.filter(c => enrolledCourses.includes(c.id));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name?.split(" ")[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user.studentId   && <span className="mr-3">ID: {user.studentId}</span>}
          {user.programme   && <span className="mr-3">{user.programme}</span>}
          {user.yearOfStudy && <span>Year {user.yearOfStudy}</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={20} />}    label="Enrolled Courses" value={enrolledCourses.length} color="blue" />
        <StatCard icon={<CheckCircle size={20} />} label="Classes Attended" value={totalAttended}          color="green" />
        <StatCard icon={<XCircle size={20} />}     label="Classes Missed"   value={totalAbsent}            color="red" />
        <StatCard icon={<TrendingUp size={20} />}  label="Attendance Rate"  value={`${overallPct}%`}       color="purple" />
      </div>

      {/* Enrolled courses list */}
      {enrolledCourseDetails.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">My Enrolled Courses</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {enrolledCourseDetails.map(course => (
              <div key={course.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{course.name}</p>
                  <p className="text-xs text-gray-400">{course.code} · {course.credits} credits</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Year {course.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance summary */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">My Attendance Summary</h2>
          <p className="text-xs text-gray-400 mt-0.5">Late attendance counts as 50% · Minimum required: 75%</p>
        </div>
        {summary.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No attendance records yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {summary.map(row => {
              const color = row.percentage >= 75 ? "green" : row.percentage >= 50 ? "yellow" : "red";
              return (
                <div key={row.courseId} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{row.courseName}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle size={11} /> {row.present} present</span>
                        <span className="flex items-center gap-1 text-red-500"><XCircle size={11} /> {row.absent} absent</span>
                        <span className="flex items-center gap-1 text-yellow-600"><Clock size={11} /> {row.late} late (×0.5)</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-lg font-bold ${color === "green" ? "text-green-600" : color === "yellow" ? "text-yellow-600" : "text-red-600"}`}>
                        {row.percentage}%
                      </span>
                      <p className="text-xs text-gray-400">{row.total} total</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${color === "green" ? "bg-green-500" : color === "yellow" ? "bg-yellow-400" : "bg-red-500"}`}
                      style={{ width: `${row.percentage}%` }} />
                  </div>
                  {row.percentage < 75 && (
                    <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle size={11} /> Below 75% — attendance improvement required
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number;
  color: "blue" | "green" | "red" | "purple";
}) {
  const colorMap = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    red:    "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${colorMap[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}