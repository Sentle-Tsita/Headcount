import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { PasswordInput } from '../components/ui/password-input';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [step, setStep]                   = useState<'email' | 'reset'>('email');
  const [email, setEmail]                 = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

  const { users, updateUser } = useData();
  const navigate = useNavigate();

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      setError('Email not found. Please check and try again.');
      return;
    }
    setSuccess('Email found. Please enter your new password below.');
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      setError('Something went wrong. Please start over.');
      return;
    }
    updateUser(found.id, { password: newPassword });
    setSuccess('Password reset successfully! Redirecting to login…');
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {step === 'email' ? 'Enter your email to reset your password' : 'Enter your new password'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your.email@nul.ls"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {error   && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
              {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}
              <Button type="submit" className="w-full">Continue</Button>
              <div className="text-center">
                <Link to="/" className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput id="newPassword" placeholder="••••••••"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput id="confirmPassword" placeholder="••••••••"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              {error   && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
              {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}
              <Button type="submit" className="w-full">Reset Password</Button>
              <div className="text-center">
                <button type="button" onClick={() => setStep('email')}
                  className="text-sm text-indigo-600 hover:underline">
                  Back
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}