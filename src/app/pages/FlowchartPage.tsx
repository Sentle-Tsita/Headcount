import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowDown, ArrowRight, CheckCircle } from 'lucide-react';

export function FlowchartPage() {
  const flowSteps = [
    { id: 1, label: 'Login', description: 'User enters credentials' },
    { id: 2, label: 'Authentication', description: 'System validates credentials' },
    { id: 3, label: 'Role Check', description: 'Determine user role (Lecturer/Admin)' },
    { id: 4, label: 'Dashboard', description: 'Display role-specific dashboard' },
    { id: 5, label: 'Select Course', description: 'Choose course for attendance' },
    { id: 6, label: 'Record Attendance', description: 'Mark students Present/Absent' },
    { id: 7, label: 'Save', description: 'Store attendance records' },
    { id: 8, label: 'Generate Report', description: 'View attendance analytics' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">System Flowchart</h1>
        <p className="text-gray-600">Visual representation of the attendance system workflow.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NUL Attendance Management System Flow</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {flowSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center w-full max-w-md">
                <div className="w-full">
                  <div className="bg-indigo-600 text-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {step.id}
                      </div>
                      <h3 className="text-xl font-semibold">{step.label}</h3>
                    </div>
                    <p className="text-indigo-100 text-sm ml-11">{step.description}</p>
                  </div>

                  {step.id === 3 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                        <p className="font-semibold text-blue-900">Lecturer Path</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• View assigned courses</li>
                          <li>• Take attendance</li>
                          <li>• View reports</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                        <p className="font-semibold text-purple-900">Admin Path</p>
                        <ul className="text-sm text-purple-700 mt-2 space-y-1">
                          <li>• Manage students</li>
                          <li>• Manage courses</li>
                          <li>• Manage lecturers</li>
                          <li>• View reports</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {index < flowSteps.length - 1 && (
                  <div className="my-4">
                    <ArrowDown className="w-8 h-8 text-indigo-400" />
                  </div>
                )}

                {index === flowSteps.length - 1 && (
                  <div className="mt-6 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-semibold">Process Complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Role-based authentication (Lecturer/Admin)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Student management with CRUD operations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Course creation and lecturer assignment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Daily attendance tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Comprehensive reporting with filters</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span>CSV export functionality</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold text-sm mb-1">Users</p>
                <p className="text-xs text-gray-600">id, name, email, role, password</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold text-sm mb-1">Students</p>
                <p className="text-xs text-gray-600">student_id, name, course_id</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold text-sm mb-1">Courses</p>
                <p className="text-xs text-gray-600">course_id, name, code, lecturer_id</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold text-sm mb-1">Attendance</p>
                <p className="text-xs text-gray-600">attendance_id, student_id, course_id, date, status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
