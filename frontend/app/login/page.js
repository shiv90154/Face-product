'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight, X, Home } from 'lucide-react';
import { loginUser } from "../services/auth.services";
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setIsLoading(true);

  if (!email || !password) {
    setError("Please fill in all fields");
    setIsLoading(false);
    return;
  }

  try {
    const result = await loginUser({
      email,
      password,
    });

    console.log("Login Response:", result);

    if (result.accessToken) {
      localStorage.setItem(
        "accessToken",
        result.accessToken
      );

      router.push(redirect);
    } else {
      setError(result.message || "Login failed");
    }
  } catch (error) {
    console.error(error);
    setError("Something went wrong");
  } finally {
    setIsLoading(false);
  }
};


  const handleBack = () => router.back();
  const handleHome = () => router.push('/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, type: 'spring', damping: 25 }}
        className="w-full max-w-md mx-3 sm:mx-4 relative"
      >
        {/* Home button (top-left) */}
        <button
          onClick={handleHome}
          className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 z-10 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Home"
        >
          <Home size={20} className="text-gray-700" />
        </button>

        {/* Back button (top-right) */}
        <button
          onClick={handleBack}
          className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Close"
        >
          <X size={20} className="text-gray-700" />
        </button>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 sm:px-6 py-6 sm:py-8 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Email or Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    placeholder="john@example.com or username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-black transition hover:translate-x-0.5 inline-block"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs sm:text-sm p-2.5 sm:p-3 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-black hover:scale-[1.02] active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? 'Signing in...' : <>Sign In <LogIn size={16} className="transition-transform group-hover:translate-x-1" /></>}
                </span>
              </button>

              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="font-bold text-gray-900 hover:text-black transition-all hover:translate-x-0.5 inline-flex items-center gap-1 group"
                  >
                    Create account <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-gray-300 mt-3 sm:mt-4">
          Demo: demo@example.com / password
        </p>
      </motion.div>
    </div>
  );
}