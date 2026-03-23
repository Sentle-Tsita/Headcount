import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, X, Building2, BookOpen } from "lucide-react";
import { useData } from "../contexts/DataContext";

export default function DepartmentsPage() {
  const {
    departments, programmes,
    addDepartment, updateDepartment, deleteDepartment,
    addProgramme, updateProgramme, deleteProgramme,
    courses, users,
  } = useData();

  const [modal, setModal]   = useState<"addDept" | "editDept" | "addProg" | "editProg" | null>(null);
  const [error, setError]   = useState("");
  const [deptName, setDeptName] = useState("");
  const [progName, setProgName] = useState("");
  const [progDeptId, setProgDeptId] = useState("");
  const [selectedId, setSelectedId] = useState("");

  // Stats per department
  const deptStats = useMemo(() => {
    const map: Record<string, { courses: number; students: number; programmes: number }> = {};
    departments.forEach(d => {
      map[d.id] = {
        courses:    courses.filter(c => c.departmentId === d.id).length,
        students:   users.filter(u => u.role === "student" && u.departmentId === d.id).length,
        programmes: programmes.filter(p => p.departmentId === d.id).length,
      };
    });
    return map;
  }, [departments, courses, users, programmes]);

  // ── Department handlers ──────────────────────────────────────

  const openAddDept = () => {
    setDeptName(""); setError(""); setModal("addDept");
  };

  const openEditDept = (id: string, name: string) => {
    setSelectedId(id); setDeptName(name); setError(""); setModal("editDept");
  };

  const handleSaveDept = async () => {
    if (!deptName.trim()) { setError("Department name is required."); return; }
    try {
      if (modal === "addDept") await addDepartment(deptName.trim());
      else await updateDepartment(selectedId, deptName.trim());
      setModal(null);
    } catch (e: any) {
      setError(e.message ?? "Failed to save department.");
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (!window.confirm(`Delete department "${name}"? This will fail if it has courses or users.`)) return;
    try {
      await deleteDepartment(id);
    } catch (e: any) {
      alert(e.message ?? "Cannot delete department.");
    }
  };

  // ── Programme handlers ───────────────────────────────────────

  const openAddProg = (deptId?: string) => {
    setProgName(""); setProgDeptId(deptId ?? ""); setError(""); setModal("addProg");
  };

  const openEditProg = (id: string, name: string, deptId: string) => {
    setSelectedId(id); setProgName(name); setProgDeptId(deptId); setError(""); setModal("editProg");
  };

  const handleSaveProg = async () => {
    if (!progName.trim())  { setError("Programme name is required."); return; }
    if (!progDeptId)       { setError("Please select a department."); return; }
    try {
      if (modal === "addProg") await addProgramme(progName.trim(), progDeptId);
      else await updateProgramme(selectedId, progName.trim(), progDeptId);
      setModal(null);
    } catch (e: any) {
      setError(e.message ?? "Failed to save programme.");
    }
  };

  const handleDeleteProg = async (id: string, name: string) => {
    if (!window.confirm(`Delete programme "${name}"?`)) return;
    try {
      await deleteProgramme(id);
    } catch (e: any) {
      alert(e.message ?? "Cannot delete programme.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments & Programmes</h1>
          <p className="text-sm text-gray-500">{departments.length} department{departments.length !== 1 ? "s" : ""} · {programmes.length} programme{programmes.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openAddProg()}
            className="flex items-center gap-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Programme
          </button>
          <button onClick={openAddDept}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      {/* ── Department cards ── */}
      <div className="space-y-4">
        {departments.map(dept => {
          const stats = deptStats[dept.id] ?? { courses: 0, students: 0, programmes: 0 };
          const deptProgrammes = programmes.filter(p => p.departmentId === dept.id);
          return (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Dept header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{dept.name}</p>
                    <p className="text-xs text-gray-400">
                      {stats.courses} course{stats.courses !== 1 ? "s" : ""} · {stats.students} student{stats.students !== 1 ? "s" : ""} · {stats.programmes} programme{stats.programmes !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openAddProg(dept.id)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
                    <Plus size={12} /> Programme
                  </button>
                  <button onClick={() => openEditDept(dept.id, dept.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteDept(dept.id, dept.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Programmes list */}
              {deptProgrammes.length === 0 ? (
                <p className="text-xs text-gray-400 px-5 py-3 italic">No programmes yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {deptProgrammes.map(prog => (
                    <div key={prog.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-indigo-400" />
                        <span className="text-sm text-gray-700">{prog.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditProg(prog.id, prog.name, prog.departmentId)}
                          className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDeleteProg(prog.id, prog.name)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit Department Modal ── */}
      {(modal === "addDept" || modal === "editDept") && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === "addDept" ? "Add Department" : "Edit Department"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department Name *</label>
                <input value={deptName} onChange={e => setDeptName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveDept} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Programme Modal ── */}
      {(modal === "addProg" || modal === "editProg") && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === "addProg" ? "Add Programme" : "Edit Programme"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Programme Name *</label>
                <input value={progName} onChange={e => setProgName(e.target.value)}
                  placeholder="e.g. BSc Computer Science"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department *</label>
                <select value={progDeptId} onChange={e => setProgDeptId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select department --</option>
                  {departments.filter(d => d.id !== "d4").map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveProg} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
