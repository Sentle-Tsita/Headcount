import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, BookOpen, UserPlus, Check, AlertCircle, Loader2 } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";

const API = "http://localhost:3001/api";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { courses, programmes, departments } = useData();
  const { login } = useAuth();

  const [step, setStep]       = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "student" as "student" | "lecturer" | "admin",
    phone: "", studentId: "", programmeId: "", yearOfStudy: "1",
    staffId: "", departmentId: "", adminCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    if (["programmeId", "yearOfStudy", "departmentId"].includes(e.target.name)) {
      setSelectedCourses([]);
    }
  };

  const selectedProgramme = useMemo(
    () => programmes.find(p => p.id === form.programmeId),
    [programmes, form.programmeId]
  );

  // ✅ For students: derive department from programme's first department
  const studentDepartmentId = useMemo(() => {
    if (!selectedProgramme) return null;
    // If programme belongs to multiple departments, use the first one
    return selectedProgramme.departmentIds[0] ?? null;
  }, [selectedProgramme]);

  const studentDepartment = useMemo(
    () => departments.find(d => d.id === studentDepartmentId),
    [departments, studentDepartmentId]
  );

  const availableCourses = useMemo(() => {
    if (form.role === "student") {
      if (!studentDepartmentId || !form.yearOfStudy) return [];
      return courses.filter(
        c => c.departmentId === studentDepartmentId && c.year === Number(form.yearOfStudy)
      );
    }
    if (form.role === "lecturer") {
      if (!form.departmentId) return [];
      return courses.filter(c => c.departmentId === form.departmentId);
    }
    return [];
  }, [form.role, form.yearOfStudy, form.departmentId, studentDepartmentId, courses]);

  const coursesByYear = useMemo(() => {
    const map: Record<number, typeof courses> = {};
    availableCourses.forEach(c => {
      const y = c.year ?? 0;
      if (!map[y]) map[y] = [];
      map[y].push(c);
    });
    return map;
  }, [availableCourses]);

  const getLecturerError = (current: string[], adding: string): string | null => {
    const candidate = courses.find(c => c.id === adding);
    if (!candidate) return null;
    if (current.length >= 4) return "A lecturer can teach at most 4 courses.";
    const yearCount = current.filter(id => courses.find(x => x.id === id)?.year === candidate.year).length;
    if (yearCount >= 2) return `At most 2 Year ${candidate.year} courses allowed.`;
    return null;
  };

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
      setError(""); return;
    }
    if (form.role === "lecturer") {
      const err = getLecturerError(selectedCourses, courseId);
      if (err) { setError(err); return; }
    }
    setError("");
    setSelectedCourses(prev => [...prev, courseId]);
  };

  const validateStep1 = (): string => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (form.role === "student") {
      if (!form.studentId.trim()) return "Student ID is required.";
      if (!/^s\d{9}$/.test(form.studentId)) return "Student ID must be sXXXXXXXXX (s + 9 digits).";
      if (!form.programmeId) return "Please select your programme.";
    }
    if (form.role === "lecturer") {
      if (!form.staffId.trim()) return "Staff ID is required.";
      if (!/^e\d{9}$/.test(form.staffId)) return "Staff ID must be eXXXXXXXXX (e + 9 digits).";
      if (!form.departmentId) return "Please select your department.";
    }
    if (form.role === "admin") {
      if (!form.staffId.trim()) return "Staff ID is required.";
      if (form.adminCode !== "NUL-ADMIN-2026") return "Invalid admin registration code.";
    }
    return "";
  };

  const handleStep1 = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    if (form.role === "admin") { handleRegister(); return; }
    setStep(2);
  };

  const handleRegister = async () => {
    if (form.role !== "admin" && selectedCourses.length === 0) {
      setError(`Please select at least one course to ${form.role === "student" ? "enroll in" : "teach"}.`);
      return;
    }

    const dept = form.role === "student"
      ? studentDepartment
      : departments.find(d => d.id === form.departmentId);

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          role: form.role, phone: form.phone,
          department: dept?.name, departmentId: dept?.id,
          ...(form.role === "student" && {
            studentId: form.studentId, programmeId: form.programmeId,
            programme: selectedProgramme?.name, yearOfStudy: Number(form.yearOfStudy),
          }),
          ...(form.role === "lecturer" && { staffId: form.staffId }),
          ...(form.role === "admin"    && { staffId: form.staffId }),
          courseIds: form.role !== "admin" ? selectedCourses : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); return; }

      login(data.user, data.token);

      if (form.role === "admin")        navigate("/admin-dashboard");
      else if (form.role === "lecturer") navigate("/lecturer-dashboard");
      else                               navigate("/student-dashboard");

    } catch {
      setError("Cannot connect to server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={24} />
            <h1 className="text-xl font-bold">NUL Attendance System</h1>
          </div>
          <p className="text-blue-100 text-sm">Create your account</p>
          {form.role !== "admin" && (
            <div className="flex items-center gap-2 mt-4">
              {[1, 2].map(s => (
                <div key={s} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${step >= s ? "bg-white text-blue-700" : "bg-blue-500 text-blue-100"}`}>
                  {step > s ? <Check size={12} /> : <span>{s}</span>}
                  {s === 1 ? "Personal Info" : form.role === "student" ? "Enroll Courses" : "Select Courses"}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am registering as</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["student", "lecturer", "admin"] as const).map(role => (
                    <button key={role} type="button"
                      onClick={() => { setForm(prev => ({ ...prev, role })); setSelectedCourses([]); setError(""); }}
                      className={`py-2 px-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        form.role === role ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>{role}</button>
                  ))}
                </div>
              </div>

              <Field label="Full Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Alice Mokoena" />
              <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+266 5000 0000" />

              {form.role === "student" && (
                <>
                  <Field label="Student ID * (sXXXXXXXXX)" name="studentId" value={form.studentId} onChange={handleChange} placeholder="s202312345" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Programme *</label>
                    <select name="programmeId" value={form.programmeId} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Select programme --</option>
                      {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {studentDepartment && (
                      <p className="text-xs text-blue-600 mt-1">Department: <strong>{studentDepartment.name}</strong></p>
                    )}
                    {selectedProgramme && selectedProgramme.departmentIds.length > 1 && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        This programme spans: {selectedProgramme.departments.map(d => d.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study *</label>
                    <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </>
              )}

              {form.role === "lecturer" && (
                <>
                  <Field label="Staff ID * (eXXXXXXXXX)" name="staffId" value={form.staffId} onChange={handleChange} placeholder="e100000001" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select name="departmentId" value={form.departmentId} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Select department --</option>
                      {departments.filter(d => d.id !== "d4").map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {form.role === "admin" && (
                <>
                  <Field label="Staff ID *" name="staffId" value={form.staffId} onChange={handleChange} placeholder="ADM002" />
                  <Field label="Admin Registration Code *" name="adminCode" value={form.adminCode} onChange={handleChange} placeholder="Provided by IT department" />
                  <p className="text-xs text-gray-400">Contact IT for the admin registration code.</p>
                </>
              )}

              <PasswordField label="Password *" name="password" value={form.password} onChange={handleChange}
                show={showPassword} onToggle={() => setShowPassword(v => !v)} placeholder="At least 6 characters" />
              <PasswordField label="Confirm Password *" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                show={showConfirm} onToggle={() => setShowConfirm(v => !v)} placeholder="Repeat your password" />

              <button onClick={handleStep1}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors">
                {form.role === "admin" ? "Register as Admin" : "Next: Select Courses →"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800 mb-1">
                  {form.role === "student" ? "Enroll in Courses" : "Select Courses to Teach"}
                </h2>
                {form.role === "student" && (
                  <p className="text-xs text-gray-500">
                    Showing <strong>{studentDepartment?.name}</strong> · <strong>Year {form.yearOfStudy}</strong> courses
                  </p>
                )}
                {form.role === "lecturer" && (
                  <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                    Max 4 courses total · Max 2 per year · {selectedCourses.length}/4 selected
                  </div>
                )}
              </div>

              {availableCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No courses found. Contact admin.</div>
              ) : form.role === "student" ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {availableCourses.map(course => {
                    const sel = selectedCourses.includes(course.id);
                    return (
                      <button key={course.id} type="button" onClick={() => toggleCourse(course.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${sel ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{course.name}</p>
                            <p className="text-xs text-gray-500">{course.code} · {course.credits} credits</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                            {sel && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {Object.keys(coursesByYear).sort().map(yearKey => {
                    const year = Number(yearKey);
                    const yearCourses = coursesByYear[year];
                    const yearSelected = selectedCourses.filter(id => courses.find(c => c.id === id)?.year === year).length;
                    return (
                      <div key={year}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year {year}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${yearSelected >= 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                            {yearSelected}/2
                          </span>
                        </div>
                        <div className="space-y-2">
                          {yearCourses.map(course => {
                            const sel = selectedCourses.includes(course.id);
                            const wouldExceed = !sel && getLecturerError(selectedCourses, course.id) !== null;
                            return (
                              <button key={course.id} type="button"
                                onClick={() => toggleCourse(course.id)} disabled={wouldExceed}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                                  sel ? "border-blue-500 bg-blue-50"
                                  : wouldExceed ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                  : "border-gray-200 hover:border-blue-300"
                                }`}>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{course.name}</p>
                                  <p className="text-xs text-gray-500">{course.code} · {course.credits} credits</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                                  {sel && <Check size={12} className="text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedCourses.length > 0 && (
                <p className="text-xs text-blue-600 font-medium">
                  {selectedCourses.length} course{selectedCourses.length !== 1 ? "s" : ""} selected
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setError(""); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
                <button onClick={handleRegister} disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : <><UserPlus size={16} /> Register</>}
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text" }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

function PasswordField({ label, name, value, onChange, show, onToggle, placeholder }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean; onToggle: () => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input name={name} type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="button" onClick={onToggle} tabIndex={-1}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}