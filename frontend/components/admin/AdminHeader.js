'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Users,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminHeader({
  isScrolled,
  userCount,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) {
  const pathname = usePathname();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
          : 'bg-white shadow-md border-b border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
          >
            <Shield className="text-[#1a237e] h-6 w-6" />
            Admin Panel
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#1a237e]/5 to-[#1a237e]/10 px-3 py-1.5 rounded-full border border-[#1a237e]/20">
            <Users size={16} className="text-[#1a237e]" />
            <span className="text-sm font-semibold text-gray-700">{userCount}</span>
            <span className="text-xs text-gray-400">users</span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a237e] to-[#0d1757] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                A
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a237e] to-[#0d1757] flex items-center justify-center text-white font-bold text-sm">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Admin</p>
                        <p className="text-xs text-gray-500">Super Administrator</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-blue-500" />
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/payments"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <CreditCard size={16} className="text-indigo-500" />
                      Payment History
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}