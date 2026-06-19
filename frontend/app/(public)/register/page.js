'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Mail, User, Lock, ArrowRight, X, Home, Phone } from 'lucide-react';
import { registerUser } from "../services/auth.services";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Lock body scroll when this page mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Password strength checker
    if (name === "password") {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    // Phone validation: allow optional '+' and then at least 10 digits
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number (10-15 digits, numbers only, optional +)');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const result = await registerUser({
        name: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      console.log(result);

      if (result.message === "User registered successfully") {
        router.push("/login");
      } else {
        setError(result.message);
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

  const getStrengthColor = () => {
    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];
    return colors[passwordStrength] || 'bg-gray-300';
  };

  const getStrengthText = () => {
    const texts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return texts[passwordStrength] || '';
  };

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
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 sm:px-6 py-6 sm:py-8 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Create Account</h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">Join us and start your journey</p>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Username */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Username *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    placeholder="johndoe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone (NEW) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                {formData.password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength + 1) * 20}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: <span className="font-semibold">{getStrengthText()}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                  <p className="text-xs text-green-500 mt-1">Passwords match</p>
                )}
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
                  {isLoading ? (
                    'Creating account...'
                  ) : (
                    <>
                      Create Account
                      <UserPlus size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>

              {/* Login link */}
              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-gray-900 hover:text-black transition-all hover:translate-x-0.5 inline-flex items-center gap-1 group"
                  >
                    Sign in
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}