import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { PasswordInput } from '../components/ui/password-input';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap, Loader2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // ✅ Use apiLogin instead of loginWithCredentials
  const { apiLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await apiLogin(email, password);

    if (result.success) {
      // ✅ Navigate based on role stored in AuthContext after login
      const stored = sessionStorage.getItem('auth_user');
      const user   = stored ? JSON.parse(stored) : null;
      if (user?.role === 'admin')        navigate('/admin-dashboard');
      else if (user?.role === 'lecturer') navigate('/lecturer-dashboard');
      else                                navigate('/student-dashboard');
    } else {
      setError(result.error ?? 'Invalid credentials. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--theme-primary, #4f46e5)' }}>
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">NUL Attendance System</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@nul.ls"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Signing in...</> : "Login"}
            </Button>
            <div className="text-center space-y-2">
              <div><Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot Password?</Link></div>
              <div><Link to="/register" className="text-sm text-indigo-600 hover:underline">Don't have an account? Register</Link></div>
            </div>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-md space-y-2">
            <p className="text-xs text-gray-600">Demo credentials:</p>
            <div className="text-xs space-y-1">
              <p><strong>Admin:</strong> admin@university.edu / admin123</p>
              <p><strong>Lecturer:</strong> s.johnson@university.edu / lecturer123</p>
              <p><strong>Student:</strong> alice@student.edu / student123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}