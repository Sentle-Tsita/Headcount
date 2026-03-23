import { useState, useMemo } from "react";
import { Search, UserPlus, Edit2, Trash2, X, ChevronDown, BookOpen, Check, AlertCircle } from "lucide-react";
import { useData } from "../contexts/DataContext";
import type { User } from "../contexts/DataContext";

type LecturerFormKey = "name" | "email" | "password" | "staffId" | "phone";

export default function LecturersPage() {
  const {
    users, courses, departments,
    addUser, updateUser, deleteUser,
    assignLecturerToCourse, unassignLecturerFromCourse,
  } = useData();

  const lecturers = useMemo(() => users.filter(u => u.role === "lecturer"), [users]);

  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState<"add" | "edit" | "courses" | null>(null);
  const [selected, setSelected]     = useState<User | null>(null);
  const [error, setError]           = useState("");
  const [courseEdit, setCourseEdit] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", email: "", password: "lecturer123",
    staffId: "", departmentId: "", phone: "",
  });

  const filtered = lecturers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.staffId ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ name: "", email: "", password: "lecturer123", staffId: "", departmentId: "", phone: "" });
    setError("");
    setModal("add");
  };

  const openEdit = (lec: User) => {
    setSelected(lec);
    setForm({
      name: lec.name, email: lec.email, password: lec.password,
      staffId: lec.staffId ?? "", departmentId: lec.departmentId ?? "",
      phone: lec.phone ?? "",
    });
    setError("");
    setModal("edit");
  };

  const openCourses = (lec: User) => {
    setSelected(lec);
    setCourseEdit(lec.assignedCourses ?? []);
    setError("");
    setModal("courses");
  };

  const handleSave = () => {
    if (!form.name.trim())  { setError("Name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (form.staffId && !/^e\d{9}$/.test(form.staffId)) {
      setError("Staff ID must be eXXXXXXXXX (e + 9 digits)."); return;
    }
    if (!form.departmentId) { setError("Please select a department."); return; }

    const dept = departments.find(d => d.id === form.departmentId);
    const payload = {
      name: form.name, email: form.email, password: form.password,
      staffId: form.staffId, phone: form.phone,
      departmentId: form.departmentId, department: dept?.name,
    };

    if (modal === "add") {
      addUser({ ...payload, role: "lecturer", assignedCourses: [] });
    } else if (modal === "edit" && selected) {
      updateUser(selected.id, payload);
    }
    setModal(null);
  };

  const getAssignmentError = (lecDeptId: string | undefined, current: string[], adding: string): string | null => {
    if (!lecDeptId) return null;
    const candidate = courses.find(c => c.id === adding);
    if (!candidate) return null;
    if (candidate.departmentId !== lecDeptId) return "This course belongs to a different department.";
    if (current.length >= 4) return "A lecturer can teach at most 4 courses.";
    const yearCount = current.filter(id => courses.find(x => x.id === id)?.year === candidate.year).length;
    if (yearCount >= 2) return `At most 2 Year ${candidate.year} courses allowed.`;
    return null;
  };

  const handleToggleCourse = (courseId: string) => {
    if (courseEdit.includes(courseId)) {
      setCourseEdit(prev => prev.filter(id => id !== courseId));
      setError("");
      return;
    }
    const err = getAssignmentError(selected?.departmentId, courseEdit, courseId);
    if (err) { setError(err); return; }
    setError("");
    setCourseEdit(prev => [...prev, courseId]);
  };

  const handleSaveCourses = () => {
    if (!selected) return;
    const current = selected.assignedCourses ?? [];
    current.filter(id => !courseEdit.includes(id)).forEach(id => unassignLecturerFromCourse(selected.id, id));
    courseEdit.filter(id => !current.includes(id)).forEach(id => assignLecturerToCourse(selected.id, id));
    setModal(null);
  };

  const handleDelete = (lec: User) => {
    if (window.confirm(`Remove ${lec.name}?`)) deleteUser(lec.id);
  };

  const deptCourses = useMemo(() => {
    if (!selected?.departmentId) return [];
    return courses.filter(c => c.departmentId === selected.departmentId);
  }, [selected, courses]);

  const coursesByYear = useMemo(() => {
    const map: Record<number, typeof courses> = {};
    deptCourses.forEach(c => {
      const y = c.year ?? 0;
      if (!map[y]) map[y] = [];
      map[y].push(c);
    });
    return map;
  }, [deptCourses]);

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lecturers</h1>
          <p className="text-sm text-gray-500">{lecturers.length} lecturer{lecturers.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={16} /> Add Lecturer
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or staff ID…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Staff ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Courses</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No lecturers found.</td></tr>
              )}
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                        {l.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{l.staffId ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{l.email}</td>
                  <td className="px-4 py-3 text-gray-500">{l.department ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openCourses(l)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                      <BookOpen size={13} />
                      {l.assignedCourses?.length ?? 0}/4
                      <ChevronDown size={13} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(l)} title="Edit"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(l)} title="Delete"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === "add" ? "Add Lecturer" : "Edit Lecturer"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}

              {/* ✅ Typed key — no more as any */}
              {([
                { label: "Full Name *",            key: "name" as LecturerFormKey,     placeholder: "Dr. Sarah Johnson" },
                { label: "Email *",                key: "email" as LecturerFormKey,    placeholder: "s.johnson@university.edu" },
                { label: "Staff ID (eXXXXXXXXX)", key: "staffId" as LecturerFormKey,  placeholder: "e100000001" },
                { label: "Phone",                  key: "phone" as LecturerFormKey,    placeholder: "+266 5000 0001" },
                { label: "Password",               key: "password" as LecturerFormKey, placeholder: "lecturer123" },
              ]).map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department *</label>
                <select value={form.departmentId}
                  onChange={e => setForm(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Select department --</option>
                  {departments.filter(d => d.id !== "d4").map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Assignment Modal */}
      {modal === "courses" && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Assign Courses</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selected.name} · {selected.department} · {courseEdit.length}/4 courses
                </p>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>

            <div className="px-5 pt-3 space-y-2">
              <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                Max 4 courses total · Max 2 per year · Department courses only
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
            </div>

            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {Object.keys(coursesByYear).sort().map(yearKey => {
                const year = Number(yearKey);
                const yearCourses = coursesByYear[year];
                const yearAssigned = courseEdit.filter(id => courses.find(x => x.id === id)?.year === year).length;
                return (
                  <div key={year}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year {year}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${yearAssigned >= 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                        {yearAssigned}/2
                      </span>
                    </div>
                    <div className="space-y-2">
                      {yearCourses.map(course => {
                        const assigned = courseEdit.includes(course.id);
                        const wouldExceed = !assigned && getAssignmentError(selected.departmentId, courseEdit, course.id) !== null;
                        return (
                          <button key={course.id} type="button"
                            onClick={() => handleToggleCourse(course.id)}
                            disabled={wouldExceed}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                              assigned ? "border-indigo-500 bg-indigo-50"
                              : wouldExceed ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-indigo-300"
                            }`}>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{course.name}</p>
                              <p className="text-xs text-gray-500">{course.code} · {course.credits} credits</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${assigned ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`}>
                              {assigned && <Check size={12} className="text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {deptCourses.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No courses found for this department.</p>
              )}
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveCourses} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium">Save Assignments</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}