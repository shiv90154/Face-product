'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('🔍 [Login] Form submitted with:', { email, password });

    try {
      if (email === 'ankush2004admin@gmail.com' && password === '123456') {
        console.log('✅ [Login] Credentials correct – setting localStorage');

        // 1. Set localStorage
        localStorage.setItem('adminLoggedIn', 'true');

        // 2. Verify it was set
        const verify = localStorage.getItem('adminLoggedIn');
        console.log('🔍 [Login] After setting, value =', verify);

        // 3. Dispatch event for header
        window.dispatchEvent(new Event('admin-updated'));

        // 4. Toast
        toast.success('Welcome Admin!');

        // 5. Redirect with a small delay to ensure storage is written
        setTimeout(() => {
          console.log('🚀 [Login] Redirecting to dashboard...');
          window.location.href = '/admin/dashboard';
        }, 150);
      } else {
        console.warn('❌ [Login] Invalid credentials');
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('🔥 [Login] Error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a237e]/10 rounded-full mb-4">
            <Shield size={32} className="text-[#1a237e]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a237e] hover:bg-[#0d1757] text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6 border-t pt-4">
          Default: ankush2004admin@gmail.com / 123456
        </p>
      </div>
    </div>
  );
}