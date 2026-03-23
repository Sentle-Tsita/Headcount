import { useMemo, useState } from "react";
import { BookOpen, Users, Search, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

export default function MyCoursesPage() {
  const { user: authUser } = useAuth();
  const { users, courses } = useData();
  const [search, setSearch] = useState("");

  // Always read from DataContext for live data
  const user = users.find(u => u.id === authUser?.id) ?? authUser;
  if (!user) return null;

  const assigned = user.assignedCourses ?? [];

  const assignedCourses = useMemo(() =>
    courses.filter(c => assigned.includes(c.id)),
    [courses, assigned]
  );

  const filtered = assignedCourses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const enrolledCount = (courseId: string) =>
    users.filter(u => u.role === "student" && (u.enrolledCourses ?? []).includes(courseId)).length;

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.department} · Teaching <strong>{assigned.length}/4</strong> course{assigned.length !== 1 ? "s" : ""}
          </p>
        </div>
        {/* ✅ Visual indicator that this is read-only */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
          <Lock size={12} />
          Managed by admin
        </div>
      </div>

      {assigned.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No courses assigned yet.</p>
          <p className="text-xs mt-1">Contact your administrator to get courses assigned.</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search your courses…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map(course => {
              const count = enrolledCount(course.id);
              return (
                <div key={course.id} className="bg-white rounded-xl border-2 border-indigo-300 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{course.code}</span>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">Year {course.year}</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Teaching</span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{course.name}</p>
                  {course.description && (
                    <p className="text-xs text-gray-400 mt-1">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Users size={11} /> {count} student{count !== 1 ? "s" : ""} enrolled
                    </p>
                    {course.credits && (
                      <span className="text-xs text-gray-400">{course.credits} credits</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && search && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No courses match your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}