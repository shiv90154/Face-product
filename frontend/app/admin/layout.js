'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  PlusCircle,
  ClipboardList,
  Users,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserCount } from '@/lib/api';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Add Product', href: '/admin/products/add', icon: PlusCircle },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const dropdownRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ─── Auth check ──────────────────────────────────────
  useEffect(() => {
    const admin = localStorage.getItem('adminLoggedIn');
    if (admin !== 'true') {
      router.push('/admin/login');
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  // ─── Fetch user count ────────────────────────────────
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const count = await getUserCount();
        setUserCount(count);
      } catch (error) {
        console.warn('Failed to fetch user count:', error);
        setUserCount(0);
      }
    };
    fetchUserCount();
  }, []);

  // ─── Scroll effect for header ─────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Click outside dropdown ──────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Lock body scroll on mobile sidebar ──────────────
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => document.body.style.overflow = 'unset';
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    window.dispatchEvent(new Event('admin-updated'));
    setProfileDropdownOpen(false);
    setSidebarOpen(false);
    router.push('/');
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1a237e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── Top Header ────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
            : 'bg-white shadow-md border-b border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand + toggle */}
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

          {/* Right: User count + Profile */}
          <div className="flex items-center gap-4">
            {/* User count badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#1a237e]/5 to-[#1a237e]/10 px-3 py-1.5 rounded-full border border-[#1a237e]/20">
              <Users size={16} className="text-[#1a237e]" />
              <span className="text-sm font-semibold text-gray-700">{userCount}</span>
              <span className="text-xs text-gray-400">users</span>
            </div>

            {/* Profile dropdown */}
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
                        onClick={handleLogout}
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

      {/* ─── Main content with sidebar ───────────────────── */}
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar (persistent) */}
        <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto z-40">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#1a237e] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-[1.02]'
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:scale-110'
                    }`}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-6 bg-white rounded-full"
                      transition={{ type: 'spring', duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
            <hr className="my-3 border-gray-200" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition group"
            >
              <LogOut size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
              Logout
            </button>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Your Store
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Mobile Sidebar (slide-in) */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col lg:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-lg font-bold text-gray-900">Admin Menu</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                          isActive
                            ? 'bg-[#1a237e]/10 text-[#1a237e]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    );
                  })}
                  <hr className="my-2 border-gray-200" />
                  <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700">
                    <Users size={18} className="text-[#1a237e]" />
                    <span>Total Users: <span className="font-bold">{userCount}</span></span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </nav>
                <div className="p-4 border-t text-xs text-gray-400 text-center">
                  Logged in as Admin
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}